//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BugJarModule')

//@Require('Class')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();
var bugjar                  = require('bugjar');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var BugMeta                 = bugpack.require('bugmeta.BugMeta');
var BuildBug                = bugpack.require('buildbug.BuildBug');
var BuildModule             = bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta                 = BugMeta.context();
var buildModule             = BuildModuleAnnotation.buildModule;
var buildTask               = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugJarModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();
        buildTask('createBugJar', this.createBugJarTask, this);
        buildTask('deleteBugJar', this.deleteBugJarTask, this);
        buildTask('emptyBugJar', this.emptyBugJarTask, this);
        buildTask('fillBugJar', this.fillBugJarTask, this);
        buildTask('getBugJarFromShelf', this.getBugJarFromShelfTask, this);
        buildTask('putBugJarOnShelf', this.putBugJarOnShelfTask, this);
        buildTask('removeBugJarFromShelf', this.removeBugJarFromShelfTask, this);
        buildTask('createShelf', this.createShelfTask, this);
        buildTask('deleteShelf', this.deleteShelfTask, this);
    },

    /**
     * @protected
     * @return {boolean}
     */
    initializeModule: function() {
        this._super();
        return true;
    },


    //-------------------------------------------------------------------------------
    // Build Task Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    createBugJarTask: function(buildProject, properties, callback) {
        var sourcePaths = properties.getProperty("sourcePaths");
        var bugjarJson = properties.getProperty("bugjarJson");
        var linkSources = properties.getProperty("linkSources");

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    deleteBugJarTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    emptyBugJarTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    fillBugJarTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    getBugJarFromShelfTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    putBugJarOnShelfTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    removeBugJarFromShelfTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    createShelfTask: function(buildProject, properties, callback) {

    },

    /**
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    deleteShelfTask: function(buildProject, properties, callback) {

    }

    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------


});


//-------------------------------------------------------------------------------
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.annotate(BugJarModule).with(
    buildModule("bugjar")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BugJarModule', BugJarModule);
