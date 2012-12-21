//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('NodeJsModule')
//@Autoload

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Annotate = bugpack.require('Annotate');
var BugFs = bugpack.require('BugFs');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');
var Map = bugpack.require('Map');
var NodePackage = bugpack.require('NodePackage');


//-------------------------------------------------------------------------------
// Node JS
//-------------------------------------------------------------------------------

var fs = require('fs');
var npm = require('npm');


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
         * @type {Map<string, NodePackage>}
         */
        this.packageNameToNodePackageMap = new Map();
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
    createNodePackageTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var sourcePaths = props.sourcePaths;
        var packageJson = props.packageJson;
        var buildPath = props.buildPath;
        var nodePackage = this.generateNodePackage(packageJson, buildPath);

        nodePackage.buildPackage(sourcePaths, callback);
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
        var props = this.generateProperties(properties);
        var packageName = props.packageName;
        var nodePackage = this.findNodePackage(packageName);
        var distPath = props.distPath;
        nodePackage.packPackage(distPath, callback);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} packageName
     */
    findNodePackage: function(packageName) {
        return this.packageNameToNodePackageMap.get(packageName);
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
        this.packageNameToNodePackageMap.put(nodePackage.getName(), nodePackage);
        return nodePackage;
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

bugpack.export(NodeJsModule);
