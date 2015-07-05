/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.CoreModule')
//@Autoload

//@Require('ArgumentBug')
//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('ICollection')
//@Require('List')
//@Require('Map')
//@Require('Set')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArgumentBug         = bugpack.require('ArgumentBug');
    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var Exception           = bugpack.require('Exception');
    var Flows               = bugpack.require('Flows');
    var ICollection         = bugpack.require('ICollection');
    var List                = bugpack.require('List');
    var Map                 = bugpack.require('Map');
    var Set                 = bugpack.require('Set');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var Path                = bugpack.require('bugfs.Path');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var BuildBug            = bugpack.require('buildbug.BuildBug');
    var BuildModule         = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag      = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var buildModule         = BuildModuleTag.buildModule;
    var buildTask           = BuildBug.buildTask;
    var $iterableParallel   = Flows.$iterableParallel;
    var $forEachParallel    = Flows.$forEachParallel;
    var $forEachSeries      = Flows.$forEachSeries;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var CoreModule = Class.extend(BuildModule, {

        _name: "buildbug.CoreModule",


        //-------------------------------------------------------------------------------
        // BuildModule Methods
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        cleanTask: function(buildProject, taskProperties, callback) {
            var buildPath = taskProperties.getProperty("buildPath");
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        concatTask: function(buildProject, taskProperties, callback) {
            var _this       = this;
            var throwable   = null;
            var sources     = null;
            var outputFile  = null;
            try {
                sources = this.validateAndConvertSourcesProperty(taskProperties.getProperty("sources"));
                outputFile = this.validateAndConvertOutputFileProperty(taskProperties.getProperty("outputFile"));
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        copyContentsTask: function(buildProject, taskProperties, callback) {
            var _this       = this;
            var throwable   = null;
            var fromPaths   = null;
            var intoPath    = null;

            //TODO BRN: We can add support for recursive flag if needed

            var recursive   = true;
            try {
                fromPaths       = this.validateAndConvertFromPathsProperty(taskProperties.getProperty("fromPaths"));
                intoPath        = this.validateAndConvertIntoPathProperty(taskProperties.getProperty("intoPath"));
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        copyTask: function(buildProject, taskProperties, callback) {
            var _this       = this;
            var throwable   = null;
            var fromPaths   = null;
            var intoPath    = null;

            //TODO BRN: We can add support for recursive flag if needed

            var recursive   = true;
            try {
                fromPaths       = this.validateAndConvertFromPathsProperty(taskProperties.getProperty("fromPaths"));
                intoPath        = this.validateAndConvertIntoPathProperty(taskProperties.getProperty("intoPath"));
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        replaceTokensTask: function(buildProject, taskProperties, callback) {
            var _this = this;
            var tokenObjects = taskProperties.getProperty("tokenObjects");

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
         * @return {List.<Path>}
         */
        generateListOfPaths: function(paths) {
            var _this = this;
            var files = new List();
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
         * @param {string} token
         * @param {string} replacementValue
         * @param {string | Path} filePath
         * @param {function(Throwable=)} callback
         */
        replaceTokenInFilePath: function(token, replacementValue, filePath, callback) {
            BugFs.readFile(filePath, 'utf8', function(throwable, data) {
                if (throwable) {
                    callback(throwable);
                } else {
                    var newFileString = data.replace(token, replacementValue);
                    BugFs.writeFile(filePath, newFileString, 'utf8', function(throwable) {
                        callback(throwable);
                    });
                }
            });
        },

        /**
         * @private
         * @param {string} token
         * @param {string} replacementValue
         * @param {string | Path} filePath
         * @param {function(Throwable=)} callback
         */
        replaceTokenInFilePathOrDirectory: function(token, replacementValue, filePath, callback) {
            var _this = this;
            if (BugFs.existsSync(filePath)) {
                if (BugFs.isFileSync(filePath)) {
                    _this.replaceTokenInFilePath(token, replacementValue, filePath, callback);
                } else {
                    var filePaths = BugFs.readDirectorySync(filePath);
                    $forEachParallel(filePaths, function(flow, filePath){
                        _this.replaceTokenInFilePathOrDirectory(token, replacementValue, filePath, function(throwable) {
                            flow.complete(throwable);
                        });
                    }).execute(callback);
                }
            } else {
                callback(new Exception("FileDoesNotExist", {}, "Cannot find filePath"));
            }
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
         * @return {List.<string>}
         * @throws {Bug}
         */
        validateAndConvertSourcesProperty: function(sourcesProperty) {
            /** @type {List.<Path>} */
            var sourcePathList = null;
            try {
                sourcePathList = this.generateListOfPaths(sourcesProperty);
            } catch(throwable) {
                throw new Bug("InvalidProperty", {}, "'concat' task: 'sources' property was not valid.", [throwable]);
            }
            return sourcePathList;
        },

        /**
         * @private
         * @param {string} result
         * @param {Path} outputFilePath
         * @param {function(Throwable=)} callback
         */
        writeResultToOutputFile: function(result, outputFilePath, callback) {
            $series([
                $task(function(flow) {
                    outputFilePath.createFile(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    outputFilePath.writeFile(result, function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(CoreModule).with(
        buildModule("core")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.CoreModule', CoreModule);
});
