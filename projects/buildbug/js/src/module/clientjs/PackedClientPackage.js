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
