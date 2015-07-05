/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildPropertiesChain')

//@Require('Class')
//@Require('PropertiesChain')
//@Require('TypeUtil')
//@Require('buildbug.TokenReplacer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var PropertiesChain     = bugpack.require('PropertiesChain');
    var TypeUtil            = bugpack.require('TypeUtil');
    var TokenReplacer       = bugpack.require('buildbug.TokenReplacer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {PropertiesChain}
     */
    var BuildPropertiesChain = Class.extend(PropertiesChain, {

        _name: "buildbug.BuildPropertiesChain",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {(Array.<Properties> | List.<Properties>)} propertiesList
         */
        _constructor: function(propertiesList) {

            this._super(propertiesList);


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
         * @param {string} propertyQuery
         * @return {*}
         */
        getProperty: function(propertyQuery) {
            var propertyValue = this._super(propertyQuery);
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

    bugpack.export('buildbug.BuildPropertiesChain', BuildPropertiesChain);
});
