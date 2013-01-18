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

    initializeModule: function() {
        this._super();
        return true;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} packagePath
     * @param {Object} clientJson
     */
    createPackage: function(packagePath, clientJson) {
        this.validateClientJson(clientJson);
        this.writeClientJson(packagePath, clientJson);
        this.packPackage(packagePath);
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
    packPackage: function(packagePath) {
        //TODO BRN:
    },

    /**
     * @private
     * @param {Object} clientJson
     */
    validateClientJson: function(clientJson) {
        if (!clientJson.name) {
            throw new Error("'name' is required in a client package's client.json");
        }
    },

    /**
     * @private
     * @param {string} packagePath
     * @param {Object} clientJson
     */
    writeClientJson: function(packagePath, clientJson) {
        var clientJsonPath = packagePath + '/client.json';
        fs.writeFileSync(clientJsonPath, JSON.stringify(clientJson));
    }
});

annotate(ClientJsModule).with(
    buildModule("clientjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientJsModule', ClientJsModule);
