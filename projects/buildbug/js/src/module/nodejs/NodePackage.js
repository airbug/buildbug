//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('NodePackage')

//@Require('BugFs')
//@Require('Class')
//@Require('Obj')


var bugpack = require('bugpack');
var npm = require('npm');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugBoil = bugpack.require('BugBoil');
var BugFlow = bugpack.require('BugFlow');
var BugFs = bugpack.require('BugFs');
var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');
var Path = bugpack.require('Path');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachSeries = BugBoil.$foreachSeries;
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
        this.buildPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.libPath = null;

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
    getBuildPath: function() {
        return this.buildPath;
    },

    /**
     * @return {string}
     */
    getDistFileName: function() {
        return this.packageJson.name + "-" + this.packageJson.version + ".tgz";
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
     * @return {string}
     */
    getVersion: function() {
        return this.packageJson.version;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array<(string|Path)>} sourcePaths
     * @param {function(Error)} callback
     */
    buildPackage: function(sourcePaths, callback) {
        var _this = this;
        this.validatePackageJson();
        $series([
            $task(function(flow) {
                _this.createPackageBuildPaths(function(error) {
                    flow.complete(error);
                });
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
                _this.writePackageJson(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },

    /**
     * @param {string} distPath
     * @param {function(Error)} callback
     */
    packPackage: function(distPath, callback) {
        var _this = this;
        this.packNodePackage(function(error) {
            if (!error) {
                var npmPackageFilePath = process.cwd() + path.sep + _this.getDistFileName();
                BugFs.move(npmPackageFilePath, distPath, Path.SyncMode.MERGE_REPLACE, callback);
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
     * @param {Array<string>} sourcePathsArray
     * @param {string} outputDirPath
     */
    copySourcePathsToDir: function(sourcePathsArray, outputDirPath) {
        var _this = this;
        sourcePathsArray.forEach(function(sourcePath) {
            var sourceFilePathsArray = _this.scanDirectoryForSourceFilesSync(sourcePath);
            sourceFilePathsArray.forEach(function(sourceFilePath) {
                var relativePath = path.relative(sourcePath, sourceFilePath);
                var outputFilePath = outputDirPath + "/" + relativePath;
                BugFs.copySync(sourceFilePath, outputFilePath, true, Path.SyncMode.MERGE_REPLACE);
            });
        });
    },

    /**
     * @private
     * @param {function(Error)
     */
    createPackageBuildPaths: function(callback) {
        var _this = this;
        this.buildPath = new Path(this.baseBuildPathString + path.sep + this.getName() + path.sep + this.getVersion());
        this.libPath = new Path(this.buildPath.getAbsolutePath() + path.sep + "lib");
        $series([
            $task(function(flow) {
                BugFs.createDirectory(_this.getBuildPath(), function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                BugFs.createDirectory(_this.getLibPath(), function(error) {
                    flow.complete(error);
                });
            })
        ]).execute([], callback);
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
     * @param {string} directoryPathString
     * @return {Array<string>}
     */
    scanDirectoryForSourceFilesSync: function(directoryPathString) {
        var filePathArray = [];
        var fileStringArray = fs.readdirSync(directoryPathString);
        for (var i = 0, size = fileStringArray.length; i < size; i++) {
            var pathString = directoryPathString + path.sep + fileStringArray[i];
            var stat = fs.statSync(pathString);
            if (stat.isDirectory()) {
                var childFilePathArray = this.scanDirectoryForSourceFilesSync(pathString);
                filePathArray = filePathArray.concat(childFilePathArray);
            } else if (stat.isFile()) {
                if (pathString.lastIndexOf('.js') === pathString.length - 3) {
                    filePathArray.push(pathString);
                }
            }
        }
        return filePathArray;
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
        var packagePath = this.buildPath.getAbsolutePath();
        var packageJson = this.packageJson;
        var packageJsonPath = packagePath + path.sep + 'package.json';
        BugFs.createFile(packageJsonPath, function(error) {
            if (!error) {
                BugFs.writeFile(packageJsonPath, JSON.stringify(packageJson), callback);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(NodePackage);
