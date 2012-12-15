//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BugPackModule')
//@Autoload

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')

var bugpack = require('bugpack');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Annotate = bugpack.require('Annotate');
var BugFs = bugpack.require('BugFs');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');
var Path = bugpack.require('Path');
var TypeUtil = bugpack.require('TypeUtil');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


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
        var bugPack = this;
        buildTask('generateBugPackRegistry', function(flow, buildProject, properties) {
            bugPack.generateBugPackRegistryTask(properties, function(error) {
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
        var sourceRoot = props.sourceRoot;
        this.generateBugPackRegistry(sourceRoot, callback);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {(string|Path)} sourceRoot
     * @param {function(Error)} callback
     */
    generateBugPackRegistry: function(sourceRoot, callback) {
        var sourceRootPath = TypeUtil.isString(sourceRoot) ? new Path(sourceRoot) : sourceRoot;
        var _this = this;
        bugpack.buildRegistry(sourceRootPath.getAbsolutePath(), function(error, bugpackRegistry) {
            if (!error) {
                _this.writeBugpackRegistryJson(sourceRootPath, bugpackRegistry, callback);
            } else {
                callback(error);
            }
        });
    },

    /**
     * @private
     * @param {Path} outputDirPath
     * @param {Object} bugpackRegistryObject
     * @param {function(Error)} callback
     */
    writeBugpackRegistryJson: function(outputDirPath, bugpackRegistryObject, callback) {
        var bugpackRegistryPath = outputDirPath.getAbsolutePath() + path.sep + 'bugpack-registry.json';
        BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistryObject, null, '\t'), callback);
    }
});

annotate(BugPackModule).with(
    buildModule("bugpack")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(BugPackModule);
