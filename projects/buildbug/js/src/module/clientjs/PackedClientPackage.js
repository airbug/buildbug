//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('PackedClientPackage')

//@Require('Class')
//@Require('Obj')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
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

var PackedClientPackage = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(clientPackage, basePath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
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
