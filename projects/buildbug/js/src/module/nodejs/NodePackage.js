/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.NodePackage')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.PackedNodePackage')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var npm                 = require('npm');
    var path                = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var Exception           = bugpack.require('Exception');
    var Obj                 = bugpack.require('Obj');
    var BugFlow             = bugpack.require('bugflow.BugFlow');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var Path                = bugpack.require('bugfs.Path');
    var PackedNodePackage   = bugpack.require('buildbug.PackedNodePackage');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries      = BugFlow.$forEachSeries;
    var $parallel           = BugFlow.$parallel;
    var $series             = BugFlow.$series;
    var $task               = BugFlow.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var NodePackage = Class.extend(Obj, {

        _name: "buildbug.NodePackage",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {{
         *      author: string,
         *      bugs: Object,
         *      dependencies: Object
         *      description: string,
         *      licenses: Array.<Object>,
         *      main: string,
         *      name: string,
         *      repository: Object,
         *      version: string
         * }} packageJson
         * @param {string} baseBuildPathString
         */
        _constructor: function(packageJson, baseBuildPathString) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {string}
             */
            this.baseBuildPathString    = baseBuildPathString;

            /**
             * @private
             * @type {Path}
             */
            this.binPath                = null;

            /**
             * @private
             * @type {Path}
             */
            this.buildPath              = null;

            /**
             * @private
             * @type {Path}
             */
            this.libPath                = null;

            /**
             * @private
             * @type {Path}
             */
            this.resourcesPath          = null;

            /**
             * @private
             * @type {Path}
             */
            this.scriptsPath            = null;

            /**
             * @private
             * @type {Path}
             */
            this.staticPath             = null;

            /**
             * @private
             * @type {Path}
             */
            this.testPath               = null;

            /**
             * @private
             * @type {{
             *      author: string,
             *      bugs: Object,
             *      dependencies: Object
             *      description: string,
             *      licenses: Array.<Object>,
             *      main: string,
             *      name: string,
             *      repository: Object,
             *      version: string
             * }}
             */
            this.packageJson            = packageJson;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Path}
         */
        getBinPath: function() {
            return this.binPath;
        },

        /**
         * @return {Path}
         */
        getBuildPath: function() {
            return this.buildPath;
        },

        /**
         * @return {Path}
         */
        getLibPath: function() {
            return this.libPath;
        },

        /**
         * @return {{
         *      author: string,
         *      bugs: Object,
         *      dependencies: Object
         *      description: string,
         *      licenses: Array.<Object>,
         *      main: string,
         *      name: string,
         *      repository: Object,
         *      version: string
         * }}
         */
        getPackageJson: function() {
            return this.packageJson;
        },

        /**
         * @return {string}
         */
        getName: function() {
            return this.packageJson.name;
        },

        /**
         * @return {string}
         */
        getResourcesPath: function() {
            return this.resourcesPath;
        },

        /**
         * @return {Path}
         */
        getScriptsPath: function() {
            return this.scriptsPath;
        },

        /**
         * @return {Path}
         */
        getStaticPath: function() {
            return this.staticPath;
        },

        /**
         * @return {Path}
         */
        getTestPath: function() {
            return this.testPath;
        },

        /**
         * @return {string}
         */
        getVersion: function() {
            return this.packageJson.version;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {{
         *   binPaths: Array.<string>,
         *   buildPath: string,
         *   packageJson: {
         *       name: string,
         *       version: string,
         *       main: string,
         *       dependencies: Object
         *   },
         *   readmePath: string,
         *   resourcePaths: Array.<string>,
         *   scriptPaths: Array.<string>,
         *   sourcePaths: Array.<string>,
         *   staticPaths: Array.<string>,
         *   testPaths: Array.<string>
         * }} params
         * @param {function(Throwable=)} callback
         */
        buildPackage: function(params, callback) {
            var _this = this;
            this.validatePackageJson();

            var sourcePaths     = params.sourcePaths;
            var testPaths       = params.testPaths;
            var scriptPaths     = params.scriptPaths;
            var binPaths        = params.binPaths;
            var staticPaths     = params.staticPaths;
            var resourcePaths   = params.resourcePaths;
            var readmePath      = params.readmePath;

            this.createPackageBuildPaths();

            $series([
                $parallel([
                    $task(function(flow) {
                        if (binPaths) {
                            $forEachSeries(binPaths, function(flow, binPath) {
                                BugFs.copyContents(binPath, _this.getBinPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }).execute(function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        $forEachSeries(sourcePaths, function(flow, sourcePath) {
                            BugFs.copyContents(sourcePath, _this.getLibPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                flow.complete(throwable);
                            });
                        }).execute(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        if (testPaths) {
                            $forEachSeries(testPaths, function(flow, testPath) {
                                BugFs.copyContents(testPath, _this.getTestPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }).execute(function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        if (scriptPaths) {
                            $forEachSeries(scriptPaths, function(flow, scriptPath) {
                                BugFs.copyContents(scriptPath, _this.getScriptsPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }).execute(function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        if (staticPaths) {
                            $forEachSeries(staticPaths, function(flow, staticPath) {
                                BugFs.copyContents(staticPath, _this.getStaticPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }).execute(function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        if (resourcePaths) {
                            $forEachSeries(resourcePaths, function(flow, resourcePath) {
                                BugFs.copyContents(resourcePath, _this.getResourcesPath(), true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }).execute(function(throwable) {
                                    flow.complete(throwable);
                                });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        if (readmePath) {
                            BugFs.copyFile(readmePath, _this.getBuildPath(), Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.complete();
                        }
                    })
                ]),
                $task(function(flow) {
                    _this.writePackageJson(function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        },

        /**
         * @param {Object} params
         * @param {function(Throwable, PackedNodePackage=)} callback
         */
        packPackage: function(params, callback) {
            var _this = this;
            var distPath = params.distPath;
            var packedNodePackage = new PackedNodePackage(this, distPath);
            this.packNodePackage(function(throwable) {
                if (!throwable) {
                    var npmPackageFilePath = process.cwd() + path.sep + packedNodePackage.getFileName();
                    BugFs.move(npmPackageFilePath, distPath, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                        if (!throwable) {
                            callback(null, packedNodePackage);
                        } else {
                            callback(throwable);
                        }
                    });
                } else {
                    callback(throwable);
                }
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        createPackageBuildPaths: function() {
            this.buildPath = BugFs.joinPaths([this.baseBuildPathString, this.getName(), this.getVersion()]);
            this.binPath = this.buildPath.joinPaths(["bin"]);
            this.libPath = this.buildPath.joinPaths(["lib"]);
            this.testPath = this.buildPath.joinPaths(["test"]);
            this.scriptsPath = this.buildPath.joinPaths(["scripts"]);
            this.staticPath = this.buildPath.joinPaths(["static"]);
            this.resourcesPath = this.buildPath.joinPaths(["resources"]);
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        packNodePackage: function(callback) {
            var packagePath = this.buildPath.getAbsolutePath();
            npm.commands.pack([packagePath], function (error, data) {
                if (!error) {
                    callback();
                } else {
                    callback(new Exception("NpmError", {}, "Error occurred in NPM", [error]));
                }
            });
        },

        /**
         * @private
         */
        validatePackageJson: function() {
            if (!this.packageJson.name) {
                throw new Bug("PackageJsonInvalid", {}, "'name' is required in a node package's package.json");
            }

            //TODO BRN: Do a better job of validating the version.

            if (!this.packageJson.version) {
                throw Bug("PackageJsonInvalid", {}, "'version' is required in a node package's package.json");
            }
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        writePackageJson: function(callback) {
            var packageJson = this.packageJson;
            var packageJsonPath = this.buildPath.joinPaths(['package.json']);
            BugFs.createFile(packageJsonPath, function(throwable) {
                if (!throwable) {
                    BugFs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'), callback);
                } else {
                    callback(throwable);
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.NodePackage', NodePackage);
});
