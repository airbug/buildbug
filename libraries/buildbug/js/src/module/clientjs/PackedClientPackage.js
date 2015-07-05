/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.PackedClientPackage')

//@Require('Class')
//@Require('Obj')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path    = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');
    var BugFs   = bugpack.require('bugfs.BugFs');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var PackedClientPackage = Class.extend(Obj, {

        _name: "buildbug.PackedClientPackage",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {ClientPackage} clientPackage
         * @param {string} basePath
         */
        _constructor: function(clientPackage, basePath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Path}
             */
            this.filePath = BugFs.path(basePath + path.sep + clientPackage.getName() + "-" +
                clientPackage.getVersion() + ".tgz");

            /**
             * @private
             * @type {string}
             */
            this.name = clientPackage.getName();

            /**
             * @private
             * @type {string}
             */
            this.version = clientPackage.getVersion();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getFileName: function() {
            return this.filePath.getName();
        },

        /**
         * @return {Path}
         */
        getFilePath: function() {
            return this.filePath;
        },

        /**
         * @return {string}
         */
        getName: function() {
            return this.name;
        },

        /**
         * @return {string}
         */
        getVersion: function() {
            return this.version;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.PackedClientPackage', PackedClientPackage);
});
