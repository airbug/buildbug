//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('CoreModule')
//@Autoload

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('bugfs.BugFs')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Annotate =              bugpack.require('annotate.Annotate');
var BugFs =                 bugpack.require('bugfs.BugFs');
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

var CoreModule = Class.extend(BuildModule, {

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
        var core = this;
        buildTask('clean', function(task, buildProject, properties) {
            core.clean(properties, function(error) {
                task.complete(error);
            });
        });
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
        *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   }
     *   packagePath: string
     * }} properties,
     * @param {function()} callback
     */
    clean: function(properties, callback) {
        var props = this.generateProperties(properties);
        var buildPath = props.getProperty("buildPath");
        BugFs.deleteDirectory(buildPath, function(error) {
            callback(error);
        });
    }


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

});

annotate(CoreModule).with(
    buildModule("core")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.CoreModule', CoreModule);
