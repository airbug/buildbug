//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('CoreModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('TypeUtil')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Map                     = bugpack.require('Map');
var TypeUtil                = bugpack.require('TypeUtil');
var BugFlow                 = bugpack.require('bugflow.BugFlow');
var BugFs                   = bugpack.require('bugfs.BugFs');
var Path                    = bugpack.require('bugfs.Path');
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
var $forEachParallel        = BugFlow.$forEachParallel;
var $series                 = BugFlow.$series;
var $task                   = BugFlow.$task;


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
        // Properties
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
        buildTask('clean', this.cleanTask, this);
        buildTask('concat', this.concatTask, this);
    },


    //-------------------------------------------------------------------------------
    // Build Task Methods
    //-------------------------------------------------------------------------------

    /**
     * Available Properties
     * {
     *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   }
     *   packagePath: string
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    cleanTask: function(buildProject, properties, callback) {
        var buildPath = properties.getProperty("buildPath");
        BugFs.deleteDirectory(buildPath, function(error) {
            callback(error);
        });
    },

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
    concatTask: function(buildProject, properties, callback) {
        var _this = this;
        var error = null;
        var sources = properties.getProperty("sources");
        var outputFile = properties.getProperty("outputFile");

        try {
            sources = this.validateAndConvertSources(sources);
            outputFile = this.validateAndConvertOutputFile(outputFile);
        } catch(err) {
            error = err;
        }

        if (!error) {
            var result = "";
            $series([
                $task(function(flow) {
                    _this.concatSources(sources, function(error, _result) {
                        if (!error) {
                            result = _result;
                        }
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    _this.writeResultToOutputFile(result, outputFile, function(error) {
                        flow.complete(error);
                    });
                })
            ]).execute(callback);
        } else {
            callback(error);
        }
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Array.<Path>} sourcePaths
     * @param {function(Error, string)}
     */
    concatSources: function(sourcePaths, callback) {
        var sourceMap = new Map();
        $forEachParallel(sourcePaths, function(flow, sourcePath) {
            sourcePath.readFile('utf8', function(error, data) {
                if (!error) {
                    sourceMap.put(sourcePath, data);
                    flow.complete();
                } else {
                    flow.error(error);
                }
            });
        }).execute(function(error) {
            if (!error) {
                var finalSource = "";
                var first = true;
                sourcePaths.forEach(function(sourcePath) {
                    if (first) {
                        first = false;
                    } else {
                        finalSource += "\n";
                    }
                    finalSource += sourceMap.get(sourcePath);
                });
                callback(undefined, finalSource);
            } else {
                callback(error);
            }
        });
    },

    /**
     * @private
     * @param {(string|Path)} outputFile
     * @return {Path}
     * @throws {Error}
     */
    validateAndConvertOutputFile: function(outputFile) {
        if (!TypeUtil.isString(outputFile) && !Class.doesExtend(outputFile, Path)) {
            throw new Error("concat task expects 'outputFile' to be a string or Path. Instead found " +
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
                    files.push(source);
                } else if (TypeUtil.isString(source)) {
                    files.push(BugFs.path(source));
                } else {
                    throw new Error("concat task expects 'sources' to be an array of strings and " +
                        "Paths. Instead found '" + source + "'");
                }
            });
        } else if (TypeUtil.isString(sources)) {
            files.push(BugFs.path(sources));
        } else if (Class.doesExtend(sources, Path)) {
            files.push(sources);
        } else {
            throw new Error("concat task expects 'sources' to be an array of strings and " +
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

bugmeta.annotate(CoreModule).with(
    buildModule("core")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.CoreModule', CoreModule);
