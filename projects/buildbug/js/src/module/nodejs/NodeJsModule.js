//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('NodeJsModule')

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('NodeJsModule', {autoload: true});

var Annotate = bugpack.require('Annotate');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');


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
        buildTask('createNodePackage', function(properties) {
            var _this = this;
            nodejs.createNodePackage(properties, function() {
                _this.complete();
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
    // Class Methods
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
     * @param {function()} callback
     */
    createNodePackage: function(properties, callback) {
        var _this = this;
        var props = this.generateProperties(properties);
        var packagePath = props.packagePath;
        this.validatePackageJson(props.packageJson);
        this.writePackageJson(packagePath, props.packageJson, function() {
            _this.packPackage(packagePath, function() {
                var packageFileName = props.packageJson.name + "-" + props.packageJson.version + ".tgz";
                var packageFilePath = process.cwd() + "/" + packageFileName;
                var packageDistPath = props.distPath + "/" + packageFileName;
                fs.rename(packageFilePath, packageDistPath, callback);
            });
        });
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

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
    },

    /**
     * @private
     * @param {string} packagePath
     * @param {function()} callback
     */
    packPackage: function(packagePath, callback) {
        npm.commands.pack([packagePath], function (err, data) {
            console.log("Packed up node package '" + packagePath + "'");
            callback();
        });
    },

    /**
     * @private
     * @param {Object} packageJson
     */
    validatePackageJson: function(packageJson) {
        if (!packageJson.name) {
            throw new Error("'name' is required in a node package's package.json");
        }

        if (!packageJson.version) {
            throw new Error("'version' is required in a node package's package.json");
        }
    },

    /**
     * @private
     * @param {string} packagePath
     * @param {Object} packageJson
     */
    writePackageJson: function(packagePath, packageJson, callback) {
        var packageJsonPath = packagePath + '/package.json';
        fs.writeFile(packageJsonPath, JSON.stringify(packageJson), callback);
    }
});

annotate(NodeJsModule).with(
    buildModule("nodejs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(NodeJsModule);
