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

//@Export('buildbug.PackedNodePackage')

//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var npm         = require('npm');
    var path        = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Exception   = bugpack.require('Exception');
    var Obj         = bugpack.require('Obj');
    var BugFs       = bugpack.require('bugfs.BugFs');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var PackedNodePackage = Class.extend(Obj, {

        _name: "buildbug.PackedNodePackage",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {NodePackage} nodePackage
         * @param {string} basePath
         */
        _constructor: function(nodePackage, basePath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Path}
             */
            this.filePath   = BugFs.path(basePath + path.sep + nodePackage.getName() + "-" +
                nodePackage.getVersion() + ".tgz");

            /**
             * @private
             * @type {string}
             */
            this.name       = nodePackage.getName();

            /**
             * @private
             * @type {string}
             */
            this.version    = nodePackage.getVersion();
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
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        publishPackage: function(callback) {
            var packedPackagePath = this.filePath.getAbsolutePath();
            npm.commands.publish([packedPackagePath], function (error, data) {
                if (!error) {
                    callback();
                } else {
                    callback(new Exception("NpmError", {}, "Error occurred in NPM", [error]));
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.PackedNodePackage', PackedNodePackage);
});
