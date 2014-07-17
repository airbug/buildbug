/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.TokenReplacer')

//@Require('Class')
//@Require('Obj')
//@Require('TypeUtil')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Obj         = bugpack.require('Obj');
    var TypeUtil    = bugpack.require('TypeUtil');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TokenReplacer = Class.extend(Obj, {

        _name: "buildbug.TokenReplacer",


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {(string|Array|Object)} value
         * @param {(PropertiesChain | Properties)} properties
         * @return {*}
         */
        replace: function(value, properties) {
            var _this = this;
            var output = value;
            if (TypeUtil.isString(value)) {
                var results = value.match(/{{([a-zA-z0-9\.-]*)}}/g);
                if (results) {
                    results.forEach(function(result) {
                        var parseResults = result.match(/{{([a-zA-z0-9\.-]*)}}/);
                        var propertyKey = parseResults[1];
                        var propertyValue = properties.getProperty(propertyKey);
                        if (propertyValue !== undefined) {
                            if (TypeUtil.isString(propertyValue) ||
                                TypeUtil.isNumber(propertyValue) ||
                                TypeUtil.isBoolean(propertyValue)) {
                                output = output.replace("{{" + propertyKey + "}}", propertyValue, "g");
                            }
                        }
                    });
                }
                if (value !== output) {
                    return this.replace(output, properties);
                } else {
                    return output;
                }
            } else if (TypeUtil.isObject(value)) {

                //TODO BRN: Need to protect against circular references

                Obj.forIn(value, function(propertyName, propertyValue) {
                    value[propertyName] = _this.replace(propertyValue, properties);
                });
            } else if (TypeUtil.isArray(value)) {

                //TODO BRN: Need to protect against circular references

                value.forEach(function(item, i) {
                    value[i] = _this.replace(item, properties);
                });
            }
            return output;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.TokenReplacer', TokenReplacer);
});
