//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BugPackModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('annotate.Annotate')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('bugtrace.BugTrace')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var bugpack_registry = require('bugpack-registry');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var TypeUtil =              bugpack.require('TypeUtil');
var Annotate =              bugpack.require('annotate.Annotate');
var BugFs =                 bugpack.require('bugfs.BugFs');
var Path =                  bugpack.require('bugfs.Path');
var BugTrace =              bugpack.require('bugtrace.BugTrace');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;
var $traceWithError = BugTrace.$traceWithError;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugPackModule = Class.extend(BuildModule, {

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
        var bugPackModule = this;
        buildTask('generateBugPackRegistry', function(flow, buildProject, properties) {
            bugPackModule.generateBugPackRegistryTask(properties, function(error) {
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
     *   sourceRoot: [string]
     * }} properties,
     * @param {function(Error)} callback
     */
    generateBugPackRegistryTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var sourceRoot = props.getProperty("sourceRoot");
        var ignore = props.getProperty("ignore");
        this.generateBugPackRegistry(sourceRoot, ignore, callback);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {(string|Path)} sourceRoot
     * @param {function(Error)} callback
     */
    generateBugPackRegistry: function(sourceRoot, ignore, callback) {
        var sourceRootPath = TypeUtil.isString(sourceRoot) ? new Path(sourceRoot) : sourceRoot;
        var _this = this;
        bugpack_registry.buildRegistry(sourceRootPath.getAbsolutePath(), ignore, $traceWithError(function(error, bugpackRegistry) {
            if (!error) {
                _this.writeBugpackRegistryJson(sourceRootPath, bugpackRegistry, callback);
            } else {
                callback(error);
            }
        }));
    },

    /**
     * @private
     * @param {Path} outputDirPath
     * @param {Object} bugpackRegistryObject
     * @param {function(Error)} callback
     */
    writeBugpackRegistryJson: function(outputDirPath, bugpackRegistryObject, callback) {
        var bugpackRegistryPath = outputDirPath.getAbsolutePath() + path.sep + 'bugpack-registry.json';
        BugFs.createFile(bugpackRegistryPath, function(error) {
            if (!error) {
                BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistryObject, null, '\t'), callback);
            } else {
                callback(error);
            }
        });
    }
});

annotate(BugPackModule).with(
    buildModule("bugpack")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BugPackModule', BugPackModule);
