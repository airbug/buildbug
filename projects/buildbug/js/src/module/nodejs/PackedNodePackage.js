//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('PackedNodePackage')

//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context();
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
