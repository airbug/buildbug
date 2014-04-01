//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BugPackModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('bugmeta.BugMeta')
//@Require('bugtrace.BugTrace')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();
var bugpack_registry        = require('bugpack-registry');
var path                    = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var TypeUtil                = bugpack.require('TypeUtil');
var BugFs                   = bugpack.require('bugfs.BugFs');
var Path                    = bugpack.require('bugfs.Path');
var BugMeta                 = bugpack.require('bugmeta.BugMeta');
var BugTrace                = bugpack.require('bugtrace.BugTrace');
var BuildBug                = bugpack.require('buildbug.BuildBug');
var BuildModule             = bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta                 = BugMeta.context();
var buildModule             = BuildModuleAnnotation.buildModule;
var buildTask               = BuildBug.buildTask;
var $traceWithError         = BugTrace.$traceWithError;


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
        buildTask('generateBugPackRegistry', this.generateBugPackRegistryTask, this);
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
     * Available Properties
     * {
     *   sourceRoot: [string]
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    generateBugPackRegistryTask: function(buildProject, properties, callback) {
        var sourceRoot = properties.getProperty("sourceRoot");
        var ignorePatterns = properties.getProperty("ignore");
        this.generateBugPackRegistry(sourceRoot, ignorePatterns, callback);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {(string|Path)} sourceRoot
     * @param {Array.<(string | RegExp>} ignorePatterns
     * @param {function(Error)} callback
     */
    generateBugPackRegistry: function(sourceRoot, ignorePatterns, callback) {
        var sourceRootPath = TypeUtil.isString(sourceRoot) ? new Path(sourceRoot) : sourceRoot;
        var _this = this;
        bugpack_registry.buildRegistry(sourceRootPath.getAbsolutePath(), ignorePatterns, $traceWithError(function(error, bugpackRegistry) {
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
     * @param {BugPackRegistry} bugpackRegistry
     * @param {function(Error)} callback
     */
    writeBugpackRegistryJson: function(outputDirPath, bugpackRegistry, callback) {
        var bugpackRegistryPath = outputDirPath.getAbsolutePath() + path.sep + 'bugpack-registry.json';
        BugFs.createFile(bugpackRegistryPath, function(error) {
            if (!error) {
                BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistry.toObject()), callback);
                //BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistry, null, '\t'), callback);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.annotate(BugPackModule).with(
    buildModule("bugpack")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BugPackModule', BugPackModule);
