//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ClientJsModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')
//@Require('buildbug.ClientPackage')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Map =                   bugpack.require('Map');
var Annotate =              bugpack.require('annotate.Annotate');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');
var ClientPackage =         bugpack.require('buildbug.ClientPackage');


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

        /**
         * @private
         * @type {Map.<string, ClientPackage>}
         */
        this.packageKeyToClientPackageMap = new Map();

        /**
         * @private
         * @type {Map.<string, PackedClientPackage>}
         */
        this.packageKeyToPackedClientPackageMap = new Map();

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
    },

    //-------------------------------------------------------------------------------
    // Build Task Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *   buildPath: string,
     *   clientJson: {
     *       name: string,
     *       version: string,
     *       staticPath: string,
     *       jsPath: string,
     *       template: string,
     *       url: string
     *   },
     *   sourcePaths: Array.<string>,
     *   staticPaths: Array.<string>

     * }} properties
     * @param {function(Error)} callback
     */
    createClientPackageTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var clientJson = props.getProperty("clientJson");
        var buildPath = props.getProperty("buildPath");
        var sourcePaths = props.getProperty("sourcePaths");
        var staticPaths = props.getProperty("staticPaths");
        var clientPackage = this.generateClientPackage(clientJson, buildPath);

        var params = {
            sourcePaths: sourcePaths,
            staticPaths: staticPaths,
        };
        clientPackage.buildPackage(params, callback);
    },

    /**
     * @param {{
     *   clientJson: {
     *       name: string,
     *       version: string,
     *       staticPath: string,
     *       jsPath: string,
     *       template: string,
     *       url: string
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
        var clientPackage = this.findClientPackage(packageName, packageVersion);

        var _this = this;

        if (clientPackage) {
            clientPackage.packPackage(distPath, function(error, packedClientPackage) {
                if (!error) {
                    var clientPackageKey = _this.generatePackageKey(packedClientPackage.getName(),
                        packedClientPackage.getVersion());
                    _this.packageKeyToPackedClientPackageMap.put(clientPackageKey, packedClientPackage);
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

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     */
    findClientPackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToClientPackageMap.get(packageKey);
    },

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     */
    findPackedClientPackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToPackedClientPackageMap.get(packageKey);
    },

    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   }} packageJson
     * @param {string} buildPath
     * @return {ClientPackage}
     */
    generateClientPackage: function(clientJson, buildPath) {
        var clientPackage = new ClientPackage(clientJson, buildPath);
        var packageKey = this.generatePackageKey(clientPackage.getName(), clientPackage.getVersion());
        this.packageKeyToClientPackageMap.put(packageKey, clientPackage);
        return clientPackage;
    },

    /**
     * @private
     * @param {string} packageName
     * @param {string} packageVersion
     */
    generatePackageKey: function(packageName, packageVersion) {
        return packageName + '_' + packageVersion;
    }
});

annotate(ClientJsModule).with(
    buildModule("clientjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientJsModule', ClientJsModule);
