//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('AwsConfig')

//@Require('Class')
//@Require('Obj')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var AwsConfig = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(configObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        configObject.region = configObject.region ? configObject.region : 'us-east-1';

        /**
         * @private
         * @type {{
         *      accessKeyId: string,
         *      region: string,
         *      secretAccessKey: string
         * }}
         */
        this.configObject = configObject;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getAccessKeyId: function() {
        return this.configObject.accessKeyId;
    },

    /**
     * @return {{
     *      accessKeyId: string,
     *      region: string,
     *      secretAccessKey: string
     * }}
     */
    getConfigObject: function() {
        return this.configObject;
    },

    /**
     * @return {string}
     */
    getRegion: function() {
        return this.configObject.region;
    },

    /**
     * @return {string}
     */
    getSecretAccessKey: function() {
        return this.configObject.secretAccessKey;
    },


    //-------------------------------------------------------------------------------
    // Object Implementation
    //-------------------------------------------------------------------------------

    /**
     * @param {*} value
     * @return {boolean}
     */
    equals: function(value) {
        if (Class.doesExtend(value, AwsConfig)) {
            return (Obj.equals(value.getAccessKeyId(), this.getAccessKeyId()) &&
                Obj.equals(value.getRegion(), this.getRegion()) &&
                Obj.equals(value.getSecretAccessKey(), this.getSecretAccessKey()));
        }
        return false;
    },

    /**
     * @return {number}
     */
    hashCode: function() {
        if (!this._hashCode) {
            this._hashCode = Obj.hashCode("[AwsConfig]" + Obj.hashCode(this.getAccessKeyId()) + "_" +
                Obj.hashCode(this.getRegion()) + Obj.hashCode(this.getSecretAccessKey()));
        }
        return this._hashCode;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(AwsConfig);
