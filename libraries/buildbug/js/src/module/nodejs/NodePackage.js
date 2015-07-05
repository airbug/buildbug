/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.NodePackage')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Obj')
//@Require('TypeUtil')
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
    var Flows               = bugpack.require('Flows');
    var Obj                 = bugpack.require('Obj');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var Path                = bugpack.require('bugfs.Path');
    var PackedNodePackage   = bugpack.require('buildbug.PackedNodePackage');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries      = Flows.$forEachSeries;
    var $forInSeries        = Flows.$forInSeries;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


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
            this.buildPath              = null;

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
        getBuildPath: function() {
            return this.buildPath;
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
        getVersion: function() {
            return this.packageJson.version;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Object.<string, (Array.<string> | string)> } packagePaths
         * @param {function(Throwable=)} callback
         */
        buildPackage: function(packagePaths, callback) {
            var _this = this;
            this.validatePackageJson();
            this.createPackageBuildPaths();

            $series([
                $task(function(flow) {
                    $forInSeries(packagePaths, function(flow, packagePath, sourcePaths) {
                        if (!packagePath) {
                            return flow.complete(new Exception("IllegalArgument", {}, "Package path must be specified"));
                        }
                        if (TypeUtil.isString(sourcePaths)) {
                            sourcePaths = [sourcePaths];
                        }
                        if (!TypeUtil.isArray(sourcePaths)) {
                            return flow.complete(new Exception("IllegalArgument", {}, "sourcePaths must be an array"));
                        }
                        packagePath = _this.buildPath.joinPaths([packagePath]);
                        $forEachSeries(sourcePaths, function(flow, sourcePath) {
                            BugFs.copyContents(sourcePath, packagePath, true, Path.SyncMode.MERGE_REPLACE, function(throwable) {
                                flow.complete(throwable);
                            });
                        }).execute(function(throwable) {
                            flow.complete(throwable);
                        });
                    }).execute(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
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
