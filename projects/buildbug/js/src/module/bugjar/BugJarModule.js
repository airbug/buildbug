//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BugJarModule')

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();
var bugjar = require('bugjar');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                     bugpack.require('Class');
var Annotate =                  bugpack.require('annotate.Annotate');
var BuildBug =                  bugpack.require('buildbug.BuildBug');
var BuildModule =               bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation =     bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


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
        var bugPack = this;
        buildTask('createBugJar', function(flow, buildProject, properties) {
            bugPack.createBugJarTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('deleteBugJar', function(flow, buildProject, properties) {
            bugPack.deleteBugJarTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('emptyBugJar', function(flow, buildProject, properties) {
            bugPack.emptyBugJarTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('fillBugJar', function(flow, buildProject, properties) {
            bugPack.fillBugJarTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('getBugJarFromShelf', function(flow, buildProject, properties) {
            bugPack.getBugJarFromShelfTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('putBugJarOnShelf', function(flow, buildProject, properties) {
            bugPack.putBugJarOnShelfTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('removeBugJarFromShelf', function(flow, buildProject, properties) {
            bugPack.removeBugJarFromShelfTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('createShelf', function(flow, buildProject, properties) {
            bugPack.createShelfTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('deleteShelf', function(flow, buildProject, properties) {
            bugPack.deleteShelfTask(properties, function(error) {
                flow.complete(error);
            });
        });
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
     * @param {{
     *   bugjarJson: {
     *       name: string,
     *       version: string,
     *       dependencies: Object
     *   },
     *   sourcePaths: Array.<string>
     * }} properties,
     * @param {function(Error)} callback
     */
    createBugJarTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var sourcePaths = props.sourcePaths;
        var bugjarJson = props.bugjarJson;
        var linkSources = props.linkSources;

        nodePackage.buildPackage(sourcePaths, callback);
    }


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------


});

annotate(BugJarModule).with(
    buildModule("bugjar")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BugJarModule', BugJarModule);
