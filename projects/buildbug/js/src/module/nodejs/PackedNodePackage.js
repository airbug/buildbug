//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('PackedNodePackage')

//@Require('Class')
//@Require('Obj')
//@Require('bugfs.BugFs')


var bugpack = require('bugpack').context();
var npm = require('npm');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');
var BugFs = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var PackedNodePackage = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(nodePackage, basePath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Path}
         */
        this.filePath = BugFs.path(basePath + path.sep + nodePackage.getName() + "-" +
            nodePackage.getVersion() + ".tgz");

        /**
         * @private
         * @type {string}
         */
        this.name = nodePackage.getName();

        /**
         * @private
         * @type {string}
         */
        this.version = nodePackage.getVersion();
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


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------


});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.PackedNodePackage', PackedNodePackage);
