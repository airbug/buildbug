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
        var nodejs = this;
        buildTask('createNodePackage', function(flow, buildProject, properties) {
            nodejs.createNodePackageTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('packNodePackage', function(flow, buildProject, properties) {
            nodejs.packNodePackageTask(properties, function(error) {
                flow.complete(error);
            });
        });
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
    createNodePackageTask: function(properties, callback) {
        var props = this.generateProperties(properties);

        var sourcePaths = props.getProperty("sourcePaths");
        var testPaths = props.getProperty("testPaths");
        var scriptPaths = props.getProperty("scriptPaths");
        var binPaths = props.getProperty("binPaths");
        var packageJson = props.getProperty("packageJson");
        var buildPath = props.getProperty("buildPath");

        var nodePackage = this.generateNodePackage(packageJson, buildPath);

        var params = {
            sourcePaths: sourcePaths,
            testPaths: testPaths,
            scriptPaths: scriptPaths,
            binPaths: binPaths
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
    packNodePackageTask: function(properties, callback) {
        var _this = this;
        var props = this.generateProperties(properties);
        var packageName = props.getProperty("packageName");
        var packageVersion = props.getProperty("packageVersion");

        var nodePackage = this.findNodePackage(packageName, packageVersion);
        var params = {
            distPath: props.getProperty("distPath")
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
