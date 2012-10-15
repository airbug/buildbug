//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('NodeJsModule')

//@Require('Annotate')
//@Require('BuildModule')
//@Require('Class')


var fs = require('fs');
var npm = require('npm');

// NOTE BRN: Simplifying the annotate reference.

var annotate = Annotate.annotate;


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

    initialize: function() {
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
     *   },
     *   sourcePaths: Array<string>
     * }} properties
     */
    createPackage: function(properties) {
        var props = this.generateProperties(properties);
        this.validatePackageJson(props.packageJson);
        var packageName = props.packageJson.name;
        var packagePath = props.buildPath + "/" + packageName;
        this.writePackageJson(packagePath, props.packageJson);
        this.packPackage(packagePath, function() {
            var packageFileName = props.packageJson.name + "-" + props.packageJson.version + ".tgz";
            var packageFilePath = process.cwd() + "/" + packageFileName;
            var packageDistPath = props.distPath + "/" + packageFileName;
            fs.rename(packageFilePath, packageDistPath);
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
    writePackageJson: function(packagePath, packageJson) {
        var packageJsonPath = packagePath + '/package.json';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
    }
});

annotate(NodeJsModule).with('@BuildModule("nodejs")');
