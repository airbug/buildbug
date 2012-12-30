//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('PackedNodePackage')

//@Require('BugFs')
//@Require('Class')
//@Require('Obj')


var bugpack = require('bugpack');
var npm = require('npm');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs = bugpack.require('BugFs');
var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');


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

bugpack.export(PackedNodePackage);
