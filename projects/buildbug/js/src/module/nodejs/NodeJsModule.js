//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('NodeJsModule')
//@Autoload

//@Require('Class')
//@Require('Exception')
//@Require('Map')
//@Require('bugfs.BugFs')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')
//@Require('buildbug.NodePackage')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();
var fs                      = require('fs');
var npm                     = require('npm');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Exception               = bugpack.require('Exception');
var Map                     = bugpack.require('Map');
var BugFs                   = bugpack.require('bugfs.BugFs');
var BugMeta                 = bugpack.require('bugmeta.BugMeta');
var BuildBug                = bugpack.require('buildbug.BuildBug');
var BuildModule             = bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');
var NodePackage             = bugpack.require('buildbug.NodePackage');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta                 = BugMeta.context();
var buildModule             = BuildModuleAnnotation.buildModule;
var buildTask               = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {BuildModule}
 */
var NodeJsModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.npmLoaded                          = false;

        /**
         * @private
         * @type {Map.<string, NodePackage>}
         */
        this.packageKeyToNodePackageMap         = new Map();

        /**
         * @private
         * @type {Map.<string, PackedNodePackage>}
         */
        this.packageKeyToPackedNodePackageMap   = new Map();
    },


    //-------------------------------------------------------------------------------
    // BuildModule Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();
        buildTask('createNodePackage', this.createNodePackageTask, this);
        buildTask('packNodePackage', this.packNodePackageTask, this);
        buildTask('publishNodePackage', this.publishNodePackageTask, this);
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
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
     */
    createNodePackageTask: function(buildProject, properties, callback) {
        var sourcePaths     = properties.getProperty("sourcePaths");
        var testPaths       = properties.getProperty("testPaths");
        var scriptPaths     = properties.getProperty("scriptPaths");
        var binPaths        = properties.getProperty("binPaths");
        var staticPaths     = properties.getProperty("staticPaths");
        var resourcePaths   = properties.getProperty("resourcePaths");
        var packageJson     = properties.getProperty("packageJson");
        var buildPath       = properties.getProperty("buildPath");

        var nodePackage     = this.generateNodePackage(packageJson, buildPath);
        var params          = {
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
     *   packageName: string,
     *   packageVersion: string,
     *   distPath: string
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
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
            nodePackage.packPackage(params, function(throwable, packedNodePackage) {
                if (!throwable) {
                    console.log("Packed up node package '" + packedNodePackage.getFilePath() + "'");
                    var nodePackageKey = _this.generatePackageKey(packedNodePackage.getName(),
                        packedNodePackage.getVersion());
                    _this.packageKeyToPackedNodePackageMap.put(nodePackageKey, packedNodePackage);
                    callback(null);
                } else {
                    callback(throwable);
                }
            });
        } else {
            callback(new Exception("IllegalState", {}, "Cannot pack package. Package '" + packageName + "' and version '" + packageVersion +
                "' cannot be found."));
        }
    },

    /**
     * Available Properties
     * {
     *   packageName: string,
     *   packageVersion: string,
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
     */
    publishNodePackageTask: function(buildProject, properties, callback) {
        var _this               = this;
        var packageName         = properties.getProperty("packageName");
        var packageVersion      = properties.getProperty("packageVersion");
        var packageNodePackage  = this.findPackedNodePackage(packageName, packageVersion);

        if (packageNodePackage) {
            packageNodePackage.publishPackage(function(throwable) {
                console.log("Published node package " + packageNodePackage.getName() + "@" + packageNodePackage.getVersion());
                if (!throwable) {
                    callback();
                } else {
                    callback(throwable);
                }
            });
        } else {
            callback(new Exception("IllegalState", {}, "Cannot publish package. A packed package '" + packageName + "' and version '" + packageVersion +
                "' cannot be found."));
        }
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     * @return {NodePackage}
     */
    findNodePackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToNodePackageMap.get(packageKey);
    },

    /**
     * @param {string} packageName
     * @param {string} packageVersion
     * @return {PackedNodePackage}
     */
    findPackedNodePackage: function(packageName, packageVersion) {
        var packageKey = this.generatePackageKey(packageName, packageVersion);
        return this.packageKeyToPackedNodePackageMap.get(packageKey);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
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
                    process.exit(1);
                    return;
                }
                _this.initializeComplete();
            });
        }
    }
});


//-------------------------------------------------------------------------------
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.annotate(NodeJsModule).with(
    buildModule("nodejs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.NodeJsModule', NodeJsModule);
