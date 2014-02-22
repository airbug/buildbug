//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('CoreModule')
//@Autoload

//@Require('ArgumentBug')
//@Require('Bug')
//@Require('Class')
//@Require('ICollection')
//@Require('Map')
//@Require('Set')
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

var ArgumentBug             = bugpack.require('ArgumentBug');
var Bug                     = bugpack.require('Bug');
var Class                   = bugpack.require('Class');
var ICollection             = bugpack.require('ICollection');
var Map                     = bugpack.require('Map');
var Set                     = bugpack.require('Set');
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
var $iterableParallel       = BugFlow.$iterableParallel;
var $forEachParallel        = BugFlow.$forEachParallel;
var $forEachSeries          = BugFlow.$forEachSeries;
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
        buildTask('copy', this.copyTask, this);
        buildTask('copyContents', this.copyContentsTask, this);
        buildTask('replaceTokens', this.replaceTokensTask, this)
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
     * @param {function(Throwable=)} callback
     */
    cleanTask: function(buildProject, properties, callback) {
        var buildPath = properties.getProperty("buildPath");
        BugFs.deleteDirectory(buildPath, function(throwable) {
            callback(throwable);
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
     * @param {function(Throwable=)} callback
     */
    concatTask: function(buildProject, properties, callback) {
        var _this       = this;
        var throwable   = null;
        var sources     = null;
        var outputFile  = null;
        try {
            sources = this.validateAndConvertSourcesProperty(properties.getProperty("sources"));
            outputFile = this.validateAndConvertOutputFileProperty(properties.getProperty("outputFile"));
        } catch(thrown) {
            throwable = thrown;
        }

        if (!throwable) {
            var result = "";
            $series([
                $task(function(flow) {
                    _this.concatSources(sources, function(throwable, _result) {
                        if (!throwable) {
                            result = _result;
                        }
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.writeResultToOutputFile(result, outputFile, function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        } else {
            callback(throwable);
        }
    },

    /**
     * Available Properties
     * {
     *      fromPaths: (string | Path | Array.<(string | Path)>)
     *      intoPath: (string |Path)
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
     */
    copyContentsTask: function(buildProject, properties, callback) {
        var _this       = this;
        var throwable   = null;
        var fromPaths   = null;
        var intoPath    = null;

        //TODO BRN: We can add support for recursive flag if needed

        var recursive   = true;
        try {
            fromPaths       = this.validateAndConvertFromPathsProperty(properties.getProperty("fromPaths"));
            intoPath        = this.validateAndConvertIntoPathProperty(properties.getProperty("intoPath"));
        } catch(thrown) {
            throwable = thrown;
        }

        if (!throwable) {
            $series([
                $task(function(flow) {
                    _this.copyContentsOfPaths(fromPaths, intoPath, recursive, function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        } else {
            callback(throwable);
        }
    },

    /**
     * Available Properties
     * {
     *      fromPaths: (string | Path | Array.<(string | Path)>)
     *      intoPath: (string |Path)
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
     */
    copyTask: function(buildProject, properties, callback) {
        var _this       = this;
        var throwable   = null;
        var fromPaths   = null;
        var intoPath    = null;

        //TODO BRN: We can add support for recursive flag if needed

        var recursive   = true;
        try {
            fromPaths       = this.validateAndConvertFromPathsProperty(properties.getProperty("fromPaths"));
            intoPath        = this.validateAndConvertIntoPathProperty(properties.getProperty("intoPath"));
        } catch(thrown) {
            throwable = thrown;
        }

        if (!throwable) {
            $series([
                $task(function(flow) {
                    _this.copyPaths(fromPaths, intoPath, recursive, function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        } else {
            callback(throwable);
        }
    },

    /**
     * Available Properties
     * {
     *      variable: (string)
     *      replacementValue: (string)
     *      filePaths: (Array.<string | Path>)
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Throwable=)} callback
     */
    replaceTokensTask: function(buildProject, properties, callback) {
        var _this = this;
        var tokenObjects = properties.getProperty("tokenObjects");

        $forEachSeries(tokenObjects, function(flow, tokenObject){
            $forEachParallel(tokenObject.filePaths, function(flow, filePath){
                _this.replaceTokenInFilePathOrDirectory(tokenObject.token, tokenObject.replacementValue, filePath, function(error){
                    flow.complete(error);
                });
            }).execute(function(error){
                    flow.complete(error);
            });
        }).execute(function(error){
            callback(error);
        });
    },

    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {ISet.<Path>} sourcePathSet
     * @param {function(Throwable, string=)} callback
     */
    concatSources: function(sourcePathSet, callback) {
        var sourceMap = new Map();
        $iterableParallel(sourcePathSet, function(flow, sourcePath) {
            sourcePath.readFile('utf8', function(throwable, data) {
                if (!throwable) {
                    sourceMap.put(sourcePath, data);
                    flow.complete();
                } else {
                    flow.error(throwable);
                }
            });
        }).execute(function(throwable) {
            if (!throwable) {
                var finalSource = "";
                var first = true;
                sourcePathSet.forEach(function(sourcePath) {
                    if (first) {
                        first = false;
                    } else {
                        finalSource += "\n";
                    }
                    finalSource += sourceMap.get(sourcePath);
                });
                callback(null, finalSource);
            } else {
                callback(throwable);
            }
        });
    },

    /**
     * @param {ISet.<Path>} fromPathSet
     * @param {Path} intoPath
     * @param {boolean} recursive
     * @param {function(Throwable=)} callback
     */
    copyPaths: function(fromPathSet, intoPath, recursive, callback) {
        $iterableParallel(fromPathSet, function(flow, fromPath) {
            BugFs.copy(fromPath, intoPath, true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                flow.complete(throwable);
            });
        }).execute(callback);
    },

    /**
     * @param {ISet.<Path>} fromPathSet
     * @param {Path} intoPath
     * @param {boolean} recursive
     * @param {function(Throwable=)} callback
     */
    copyContentsOfPaths: function(fromPathSet, intoPath, recursive, callback) {
        $iterableParallel(fromPathSet, function(flow, fromPath) {
            BugFs.copyContents(fromPath, intoPath, true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                flow.complete(throwable);
            });
        }).execute(callback);
    },

    /**
     * @private
     * @param {(string | Path)} path
     * @return {Path}
     */
    generatePath: function(path) {
        var result = BugFs.path(path);
        if (result) {
            return result;
        }
        throw new ArgumentBug(ArgumentBug.ILLEGAL, "path", path, "parameter must be be a string or Path.");
    },

    /**
     * @private
     * @param {(string | Path | Array.<(string | Path)> | ICollection.<(string | Path)>)} paths
     * @return {Set.<Path>}
     */
    generateSetOfPaths: function(paths) {
        var _this = this;
        var files = new Set();
        if (Class.doesImplement(paths, ICollection) || TypeUtil.isArray(paths)) {
            paths.forEach(function(path) {
                files.add(_this.generatePath(path));
            });
        } else {
            files.add(this.generatePath(paths));
        }
        return files;
    },

    /**
     * @private
     * @param {(string | Path | Array.<(string | Path)> | ICollection.<(string | Path)>)} fromPathsProperty
     * @return {Set.<Path>}
     * @throws {Bug}
     */
    validateAndConvertFromPathsProperty: function(fromPathsProperty) {
        /** @type {Set.<Path>} */
        var fromPathsSet = null;
        try {
            fromPathsSet = this.generateSetOfPaths(fromPathsProperty);
        } catch(throwable) {
            throw new Bug("InvalidProperty", {}, "'copy' task: 'fromPaths' property was not valid.", [throwable]);
        }
        return fromPathsSet;
    },

    /**
     * @private
     * @param {(string | Path)} intoPathProperty
     * @return {Path}
     * @throws {Bug}
     */
    validateAndConvertIntoPathProperty: function(intoPathProperty) {
        /** @type {Path} */
        var intoPath = null;
        try {
            intoPath = this.generatePath(intoPathProperty);
        } catch(throwable) {
            throw new Bug("InvalidProperty", {}, "'copy' task: 'intoPath' property was not valid.", [throwable]);
        }
        return intoPath;
    },

    /**
     * @private
     * @param {(string | Path)} outputFileProperty
     * @return {Path}
     * @throws {Bug}
     */
    validateAndConvertOutputFileProperty: function(outputFileProperty) {
        /** @type {Path} */
        var outputFilePath = null;
        try {
            outputFilePath = this.generatePath(outputFileProperty);
        } catch(throwable) {
            throw new Bug("InvalidProperty", {}, "'concat' task: 'outputFile' property was not valid.", [throwable]);
        }
        return outputFilePath;
    },

    /**
     * @private
     * @param {(string | Path | Array.<(string | Path)> | ICollection.<(string | Path)>)} sourcesProperty
     * @return {Set.<string>}
     * @throws {Bug}
     */
    validateAndConvertSourcesProperty: function(sourcesProperty) {
        /** @type {Set.<Path>} */
        var sourcePathSet = null;
        try {
            sourcePathSet = this.generateSetOfPaths(sourcesProperty);
        } catch(throwable) {
            throw new Bug("InvalidProperty", {}, "'concat' task: 'sources' property was not valid.", [throwable]);
        }
        return sourcePathSet;
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
    },

    /**
     * @param {string} token
     * @param {string} replacementValue
     * @param {string | Path} filePath
     * @param {function(Error} callback
     */
    replaceTokenInFilePathOrDirectory: function(token, replacementValue, filePath, callback){
        var _this = this;
        if(BugFs.existsSync(filePath)){
            if(BugFs.isFileSync(filePath)){
                _this.replaceTokenInFilePath(token, replacementValue, filePath, function(error){
                    callback(error);
                });
            } else {
                var filePaths = BugFs.readDirectorySync(filePath);
                $forEachParallel(filePaths, function(flow, filePath){
                    _this.replaceTokenInFilePathOrDirectory(token, replacementValue, filePath, function(error){
                        flow.complete(error);
                    });
                }).execute(function(error){
                        callback(error);
                    });
            }
        } else {
            callback(new Error("Invalid file path:", filePath));
        }
    },

    /**
     * @param {string} token
     * @param {string} replacementValue
     * @param {string | Path} filePath
     * @param {function(Error} callback
     */
    replaceTokenInFilePath: function(token, replacementValue, filePath, callback){
        BugFs.readFile(filePath, 'utf8', function(error, data){
            if(error){
                callback(error);
            } else {
                var newFileString = data.replace(token, replacementValue);
                BugFs.writeFile(filePath, newFileString, 'utf8', function(error){
                    callback(error);
                });
            }
        });
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
