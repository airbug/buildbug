/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugHelperConfig')

//@Require('Class')
//@Require('Config')
//@Require('TypeUtil')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Config      = bugpack.require('Config');
    var TypeUtil    = bugpack.require('TypeUtil');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Config}
     */
    var BuildBugHelperConfig = Class.extend(Config, {

        _name: "buildbug.BuildBugHelperConfig",


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string} appVersion
         */
        getAppVersion: function() {
            return this.getProperty("appVersion");
        },

        /**
         * @param {string} appVersion
         */
        setAppVersion: function(appVersion) {
            this.setProperty("appVersion", appVersion);
        },


        /**
         * @return {boolean}
         */
        getDebug: function() {
            return this.getProperty("debug");
        },

        /**
         * @param {boolean} debug
         */
        setDebug: function(debug) {
            this.setProperty("debug", debug);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("buildbug.BuildBugHelperConfig", BuildBugHelperConfig);
});
