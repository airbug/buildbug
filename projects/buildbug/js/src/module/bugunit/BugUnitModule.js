//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BugUnitModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('annotate.Annotate')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();
var bugunit = require('bugunit');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var TypeUtil =              bugpack.require('TypeUtil');
var Annotate =              bugpack.require('annotate.Annotate');
var BugFs =                 bugpack.require('bugfs.BugFs');
var Path =                  bugpack.require('bugfs.Path');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugUnitModule = Class.extend(BuildModule, {

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
        var bugUnitModule = this;
        buildTask('startNodeModuleTests', function(flow, buildProject, properties) {
            bugUnitModule.startNodeModuleTestsTask(properties, function(error) {
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
     *      modulePath: (string|Path)
     * }} properties,
     * @param {function(Error)} callback
     */
    startNodeModuleTestsTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var modulePath = props.getProperty("modulePath");
        var modulePathString = modulePath;

        if (Class.doesExtend(modulePath, Path)) {
            modulePathString = modulePath.getAbsolutePath();
        } else if (!TypeUtil.isString(modulePathString)) {
            callback(new Error("modulePath must be a Path or a string"));
        }
        bugunit.start(modulePathString, callback);
    }
});

annotate(BugUnitModule).with(
    buildModule("bugunit")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("buildbug.BugUnitModule", BugUnitModule);
