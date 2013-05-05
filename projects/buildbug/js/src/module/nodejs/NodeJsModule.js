//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('NodeJsModule')
//@Autoload

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();
var fs = require('fs');
var npm = require('npm');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Map =                   bugpack.require('Map');
var Annotate =              bugpack.require('annotate.Annotate');
var BugFs =                 bugpack.require('bugfs.BugFs');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');
var NodePackage =           bugpack.require('buildbug.NodePackage');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var NodeJsModule = Class.extend(BuildModule, {

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
         * @type {boolean}
         */
        this.npmLoaded = false;

        /**
         * @private
         * @type {Map.<string, NodePackage>}
         */
        this.packageKeyToNodePackageMap = new Map();

        /**
         * @private
         * @type {Map.<string, PackedNodePackage>}
         */
        this.packageKeyToPackedNodePackageMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();
        buildTask('createNodePackage', this.createNodePackageTask, this);
        buildTask('packNodePackage', this.packNodePackageTask, this);
    },

    /**
     * @protected
     * @return {boolean}
     */
    initializeModule: function() {
        this._super();
        this.loadNPM();
        return false;
    },


    //-------------------------------------------------------------------------------
    // Build Task Methods
    //-------------------------------------------------------------------------------

    /**
     * Available Properties
     * {
     *   sourcePaths: Array.<string>,
     *   testPaths: Array.<string>,
     *   scriptPaths: Array.<string>,
     *   binPaths: Array.<string>,
     *   staticPaths: Array.<string>,
     *   resourcePaths: Array.<string>,
     *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   },
     *   buildPath: string
     * }
     * @param {BuildProject} buildProject
     * @param {Properties} properties
     * @param {function(Error)} callback
     */
    createNodePackageTask: function(buildProject, properties, callback) {
        var sourcePaths = properties.getProperty("sourcePaths");
        var testPaths = properties.getProperty("testPaths");
        var scriptPaths = properties.getProperty("scriptPaths");
        var binPaths = properties.getProperty("binPaths");
        var staticPaths = properties.getProperty("staticPaths");
        var resourcePaths = properties.getProperty("resourcePaths");
        var packageJson = properties.getProperty("packageJson");
        var buildPath = properties.getProperty("buildPath");

        var nodePackage = this.generateNodePackage(packageJson, buildPath);

        var params = {
            sourcePaths: sourcePaths,
            testPaths: testPaths,
            scriptPaths: scriptPaths,
            binPaths: binPaths,
            staticPaths: staticPaths,
            resourcePaths: resourcePaths
        };
        nodePackage.buildPackage(params, callback);
    },

    /**
     * Available Properties
     * {
     *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   }
     *   packagePath: string
     * }
     * @param {BuildProject} buildProject
     * @param {Properties} properties
     * @param {function(Error)} callback
     */
    packNodePackageTask: function(buildProject, properties, callback) {
        var _this = this;
        var packageName = properties.getProperty("packageName");
        var packageVersion = properties.getProperty("packageVersion");
        var nodePackage = this.findNodePackage(packageName, packageVersion);
        var params = {
            distPath: properties.getProperty("distPath")
        };

        if (nodePackage) {
            nodePackage.packPackage(params, function(error, packedNodePackage) {
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

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     */
    findNodePackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToNodePackageMap.get(packageKey);
    },

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     */
    findPackedNodePackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToPackedNodePackageMap.get(packageKey);
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
     * @return {NodePackage}
     */
    generateNodePackage: function(packageJson, buildPath) {
        var nodePackage = new NodePackage(packageJson, buildPath);
        var packageKey = this.generatePackageKey(nodePackage.getName(), nodePackage.getVersion());
        this.packageKeyToNodePackageMap.put(packageKey, nodePackage);
        return nodePackage;
    },

    /**
     * @private
     * @param {string} packageName
     * @param {string} packageVersion
     */
    generatePackageKey: function(packageName, packageVersion) {
        return packageName + '_' + packageVersion;
    },

    /**
     * @private
     */
    loadNPM: function() {
        var _this = this;
        if (!this.npmLoaded) {
            this.npmLoaded = true;
            npm.load({}, function (err) {
                if (err) {
                    console.log(err);
                    console.log(err.stack);
                    process.exit(1);
                    return;
                }
                _this.initializeComplete();
            });
        }
    }
});

annotate(NodeJsModule).with(
    buildModule("nodejs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.NodeJsModule', NodeJsModule);
