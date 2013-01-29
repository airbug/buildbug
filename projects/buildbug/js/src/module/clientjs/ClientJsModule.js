//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ClientJsModule')
//@Autoload

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Annotate =              bugpack.require('annotate.Annotate');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ClientJsModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------


    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    enableModule: function() {
        this._super();
        var _this = this;
        buildTask('createClientPackage', function(flow, buildProject, properties) {
            _this.createClientPackageTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('packClientPackage', function(flow, buildProject, properties) {
            _this.packClientPackageTask(properties, function(error) {
                flow.complete(error);
            });
        });
    },

    initializeModule: function() {
        this._super();
        return true;
    }

    //-------------------------------------------------------------------------------
    // Build Task Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
        *   sourcePaths: Array.<string>,
     *   testPaths: Array.<string>,
     *   scriptPaths: Array.<string>,
     *   binPaths: Array.<string>,
     *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   },
     *   buildPath: string
     * }} properties
     * @param {function(Error)} callback
     */
    createClientPackageTask: function(properties, callback) {
        var props = this.generateProperties(properties);


        var sourcePaths = props.getProperty("sourcePaths");
        var staticPaths = props.getProperty("staticPaths");
        var clientJson = props.getProperty("clientJson");
        var buildPath = props.getProperty("buildPath");
        var clientPackage = this.generateClientPackage(clientJson, buildPath);

        var params = {
            sourcePaths: sourcePaths,
            staticPaths: staticPaths
        };
        nodePackage.buildPackage(params, callback);
    },

    /**
     * @param {{
        *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   }
     *   packagePath: string
     * }} properties,
     * @param {function(Error)} callback
     */
    packClientPackageTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var packageName = props.getProperty("packageName");
        var packageVersion = props.getProperty("packageVersion");
        var distPath = props.getProperty("distPath");
        var nodePackage = this.findNodePackage(packageName, packageVersion);

        var _this = this;

        if (nodePackage) {
            nodePackage.packPackage(distPath, function(error, packedNodePackage) {
                if (!error) {
                    var nodePackageKey = _this.generatePackageKey(packedNodePackage.getName(),
                        packedNodePackage.getVersion());
                    _this.packageKeyToPackedNodePackageMap.put(nodePackageKey, packedNodePackage);
                    callback(null);
                } else {
                    callback(error);
                }
            });
        } else {
            callback(new Error("Cannot pack package. Package '" + packageName + "' and version '" + packageVersion +
                "' cannot be found."));
        }
    },

    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------



    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

});

annotate(ClientJsModule).with(
    buildModule("clientjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientJsModule', ClientJsModule);
