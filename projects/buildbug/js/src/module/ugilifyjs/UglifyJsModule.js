//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.UglifyJsModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('bugflow.BugFlow')
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
var uglify_js               = require("uglify-js");


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var TypeUtil                = bugpack.require('TypeUtil');
var BugFlow                 = bugpack.require('bugflow.BugFlow');
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
var $series                 = BugFlow.$series;
var $task                   = BugFlow.$task;
var $traceWithError         = BugTrace.$traceWithError;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var UglifyJsModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
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
        buildTask('uglifyjsMinify', this.uglifyjsMinifyTask, this);
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
     *      !outputFile: (string|Path)
     *      !sources: (string|Path|Array.<(string|Path)>)
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    uglifyjsMinifyTask: function(buildProject, properties, callback) {
        var error = null;
        var sources = properties.getProperty("sources");
        var outputFile = properties.getProperty("outputFile");
        var result = "";

        try {
            sources = this.validateAndConvertSources(sources);
            outputFile = this.validateAndConvertOutputFile(outputFile);
            result = this.minifySources(sources);
        } catch(err) {
           error = err;
        }

        if (!error) {
            this.writeResultToOutputFile(result, outputFile, callback);
        } else {
            callback(error);
        }
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Array.<(string|Path)>} sources
     * @return {string}
     */
    minifySources: function(sources) {
        var result = uglify_js.minify(sources);
        return result.code;
    },

    /**
     * @private
     * @param {(string|Path)} outputFile
     * @return {Path}
     * @throws {Error}
     */
    validateAndConvertOutputFile: function(outputFile) {
        if (!TypeUtil.isString(outputFile) && !Class.doesExtend(outputFile, Path)) {
            throw new Error("uglifyjsMinify task expects 'outputFile' to be a string or Path. Instead found " +
                "'" + outputFile + "'");
        }
        return BugFs.path(outputFile);
    },

    /**
     * @private
     * @param {Array.<(string|Path)>} sources
     * @return {Array.<string>}
     * @throws {Error}
     */
    validateAndConvertSources: function(sources) {
        var files = [];
        if (TypeUtil.isArray(sources)) {
            sources.forEach(function(source) {
                if (Class.doesExtend(source, Path)) {
                    files.push(source.getAbsolutePath());
                } else if (TypeUtil.isString(source)) {
                    files.push(BugFs.path(source).getAbsolutePath());
                } else {
                    throw new Error("uglifyjsMinify task expects 'sources' array to contain strings or " +
                        "Paths. Instead found '" + source + "'");
                }
            });
        } else if (TypeUtil.isString(sources)) {
            files.push(BugFs.path(sources).getAbsolutePath());
        } else if (Class.doesExtend(sources, Path)) {
            files.push(sources.getAbsolutePath());
        } else {
            throw new Error("uglifyjsMinify task expects 'sources' to be an array of strings and " +
                "Paths or a string. Instead found '" + sources + "'");
        }
        return files;
    },

    /**
     * @private
     * @param {string} result
     * @param {Path} outputFilePath
     * @param {function(Error)} callback
     */
    writeResultToOutputFile: function(result, outputFilePath, callback) {
        $series([
            $task(function(flow) {
                outputFilePath.createFile(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                outputFilePath.writeFile(result, function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.annotate(UglifyJsModule).with(
    buildModule("uglifyjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.UglifyJsModule', UglifyJsModule);
