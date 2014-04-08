//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildProperties')

//@Require('Class')
//@Require('Obj')
//@Require('Properties')
//@Require('Proxy')
//@Require('TypeUtil')
//@Require('buildbug.TokenReplacer')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var Properties      = bugpack.require('Properties');
var Proxy           = bugpack.require('Proxy');
var TypeUtil        = bugpack.require('TypeUtil');
var TokenReplacer   = bugpack.require('buildbug.TokenReplacer');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildProperties = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(propertiesObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Properties}
         */
        this.properties     = new Properties(propertiesObject);

        /**
         * @private
         * @type {TokenReplacer}
         */
        this.tokenReplacer  = new TokenReplacer();

        Proxy.proxy(this, this.properties, [
            "getPropertiesObject",
            "merge",
            "updateProperties",
            "updateProperty",
            "setProperty"
        ]);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} propertyName
     * @return {*}
     */
    getProperty: function(propertyName) {
        var propertyValue = this.properties.getProperty(propertyName);
        if (TypeUtil.isString(propertyValue) || TypeUtil.isArray(propertyValue) || TypeUtil.isObject(propertyValue)) {
            var newValue = this.tokenReplacer.replace(propertyValue, this.properties);
            while (newValue !== propertyValue) {
                propertyValue = newValue;
                newValue = this.tokenReplacer.replace(propertyValue, this.properties);
            }
            propertyValue = newValue;
        }
        return propertyValue;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildProperties', BuildProperties);
