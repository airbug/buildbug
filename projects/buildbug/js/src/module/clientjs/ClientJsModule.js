//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('ClientJsModule')

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')


var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('ClientJsModule', {autoload: true});

var Annotate = bugpack.require('Annotate');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var asyncTask = BuildBug.asyncTask;
var buildModule = BuildModuleAnnotation.buildModule;


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

    initialize: function() {
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

bugpack.export(ClientJsModule);
