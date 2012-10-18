//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('ClientJsModule')

//@Require('Annotate')
//@Require('BuildModule')
//@Require('Class')


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var annotation = Annotate.annotation;


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

annotate(ClientJsModule).with(annotation("BuildModule").params("clientjs"));
