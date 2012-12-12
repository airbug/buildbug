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

bugpack.declare('NodePackage');

var BugFlow = bugpack.require('BugFlow');
var BugFs = bugpack.require('BugFs');
var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var series = BugFlow.series;
var task = BugFlow.task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var NodePackage = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(packageJson, baseBuildPath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.baseBuildPath = baseBuildPath;

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
     * @return {string}
     */
    getBuildPath: function() {
        return this.baseBuildPath + path.sep + this.getName() + path.sep + this.getVersion();
    },

    /**
     * @return {string}
     */
    getDistFileName: function() {
        return this.packageJson.name + "-" + this.packageJson.version + ".tgz";
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
     * @param {Array<string>} sourcePaths
     * @param {function(Error)} callback
     */
    buildPackage: function(sourcePaths, callback) {
        var _this = this;
        this.validatePackageJson();
        series([
            task(function(_task) {
                _this.generateBuildPath(function(error) {
                    if (!error) {
                        _task.complete();
                    } else {
                        _task.error(error);
                    }
                });
            }),
            task(function(_task) {
                // TODO BRN: copy all source files in source paths to the package lib path
            }),
            task(function(_task) {
                _this.writePackageJson(function(error) {
                    if (!error) {
                        _task.complete();
                    } else {
                        _task.error(error);
                    }
                });
            })
        ]).execute(function(error) {
            callback(error);
        });
    },

    /**
     * @param {string} distPath
     * @param {function(Error)} callback
     */
    packPackage: function(distPath, callback) {
        this.packNodePackage(distPath, function(error) {
            if (!error) {
                var npmPackageFilePath = process.cwd() + "/" + this.getDistFileName();
                BugFs.move(npmPackageFilePath, distPath, callback);
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
                BugFs.copySync(sourceFilePath, outputFilePath);
            });
        });
    },

    /**
     * @private
     * @param {function(Error)} callback
     */
    generateBuildPath: function(callback) {
        BugFs.createDirectory(this.getBuildPath(), callback);
    },

    /**
     * @private
     * @param {string} distPath
     * @param {function()} callback
     */
    packNodePackage: function(distPath, callback) {
        npm.commands.pack([packagePath], function (err, data) {
            console.log("Packed up node package '" + packagePath + "'");
            callback();
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
        var packagePath = this.buildPath;
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
