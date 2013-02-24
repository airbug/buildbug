//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('NodePackage')

//@Require('Class')
//@Require('Obj')
//@Require('bugboil.BugBoil')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.PackedNodePackage')


var bugpack = require('bugpack').context();
var npm = require('npm');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Obj =               bugpack.require('Obj');
var BugBoil =           bugpack.require('bugboil.BugBoil');
var BugFlow =           bugpack.require('bugflow.BugFlow');
var BugFs =             bugpack.require('bugfs.BugFs');
var Path =              bugpack.require('bugfs.Path');
var PackedNodePackage = bugpack.require('buildbug.PackedNodePackage');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachSeries = BugBoil.$foreachSeries;
var $parallel = BugFlow.$parallel;
var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var NodePackage = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(packageJson, baseBuildPathString) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.baseBuildPathString = baseBuildPathString;

        /**
         * @private
         * @type {Path}
         */
        this.binPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.buildPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.libPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.scriptsPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.testPath = null;

        /**
         * @private
         * @type {{
         *      name: string,
         *      version: string,
         *      main: string,
         *      dependencies: Object
         * }}
         */
        this.packageJson = packageJson;
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
     *      name: string,
     *      version: string,
     *      main: string,
     *      dependencies: Object
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
     * @return {Path}
     */
    getScriptsPath: function() {
        return this.scriptsPath;
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
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      sourcePaths: Array.<(string|Path)>,
     *      testPaths: Array.<(string|Path)>,
     *      scriptPaths: Array.<(string|Path)>}
     * }} params
     * @param {function(Error)} callback
     */
    buildPackage: function(params, callback) {
        var _this = this;
        this.validatePackageJson();

        var sourcePaths = params.sourcePaths;
        var testPaths = params.testPaths;
        var scriptPaths = params.scriptPaths;
        var binPaths = params.binPaths;

        this.createPackageBuildPaths();

        $series([
            $parallel([
                $task(function(flow) {
                    if (binPaths) {
                        $foreachSeries(binPaths, function(boil, binPath) {
                            BugFs.copyDirectoryContents(binPath, _this.getBinPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                boil.bubble(error);
                            });
                        }).execute(function(error) {
                            flow.complete(error);
                        });
                    } else {
                        flow.complete();
                    }
                }),
                $task(function(flow) {
                    $foreachSeries(sourcePaths, function(boil, sourcePath) {
                        BugFs.copyDirectoryContents(sourcePath, _this.getLibPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                            boil.bubble(error);
                        });
                    }).execute(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    if (testPaths) {
                        $foreachSeries(testPaths, function(boil, testPath) {
                            BugFs.copyDirectoryContents(testPath, _this.getTestPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                boil.bubble(error);
                            });
                        }).execute(function(error) {
                            flow.complete(error);
                        });
                    } else {
                        flow.complete();
                    }
                }),
                $task(function(flow) {
                    if (scriptPaths) {
                        $foreachSeries(scriptPaths, function(boil, scriptPath) {
                            BugFs.copyDirectoryContents(scriptPath, _this.getScriptsPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                boil.bubble(error);
                            });
                        }).execute(function(error) {
                            flow.complete(error);
                        });
                    } else {
                        flow.complete();
                    }
                })
            ]),
            $task(function(flow) {
                _this.writePackageJson(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },

    /**
     * @param {Object} params
     * @param {function(Error, PackedNodePackage)} callback
     */
    packPackage: function(params, callback) {
        var _this = this;
        var distPath = params.distPath;
        var packedNodePackage = new PackedNodePackage(this, distPath);
        this.packNodePackage(function(error) {
            if (!error) {
                var npmPackageFilePath = process.cwd() + path.sep + packedNodePackage.getFileName();
                BugFs.move(npmPackageFilePath, distPath, Path.SyncMode.MERGE_REPLACE, function(error) {
                    if (!error) {
                        callback(null, packedNodePackage);
                    } else {
                        callback(error);
                    }
                });
            } else {
                callback(error);
            }
        });
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
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
    },

    /**
     * @private
     * @param {function()} callback
     */
    packNodePackage: function(callback) {
        var packagePath = this.buildPath.getAbsolutePath();
        npm.commands.pack([packagePath], function (error, data) {
            if (!error) {
                console.log("Packed up node package '" + packagePath + "'");
                callback();
            } else {
                callback(error);
            }
        });
    },

    /**
     * @private
     */
    validatePackageJson: function() {
        if (!this.packageJson.name) {
            throw new Error("'name' is required in a node package's package.json");
        }

        //TODO BRN: Do a better job of validating the version.

        if (!this.packageJson.version) {
            throw new Error("'version' is required in a node package's package.json");
        }
    },

    /**
     * @private
     * @param {function(Error)} callback
     */
    writePackageJson: function(callback) {
        var packageJson = this.packageJson;
        var packageJsonPath = this.buildPath.joinPaths(['package.json']);
        BugFs.createFile(packageJsonPath, function(error) {
            if (!error) {
                BugFs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'), callback);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.NodePackage', NodePackage);
