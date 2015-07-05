/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildProperties')

//@Require('Class')
//@Require('Properties')
//@Require('TypeUtil')
//@Require('buildbug.TokenReplacer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Properties      = bugpack.require('Properties');
    var TypeUtil        = bugpack.require('TypeUtil');
    var TokenReplacer   = bugpack.require('buildbug.TokenReplacer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Properties}
     */
    var BuildProperties = Class.extend(Properties, {

        _name: "buildbug.BuildProperties",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Object} propertiesObject
         */
        _constructor: function(propertiesObject) {

            this._super(propertiesObject);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {TokenReplacer}
             */
            this.tokenReplacer  = new TokenReplacer();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} propertyName
         * @return {*}
         */
        getProperty: function(propertyName) {
            var propertyValue = this._super(propertyName);
            if (TypeUtil.isString(propertyValue) || TypeUtil.isArray(propertyValue) || TypeUtil.isObject(propertyValue)) {
                var newValue = this.tokenReplacer.replace(propertyValue, this);
                while (newValue !== propertyValue) {
                    propertyValue = newValue;
                    newValue = this.tokenReplacer.replace(propertyValue, this);
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
});
