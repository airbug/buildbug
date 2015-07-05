/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.ClientPackage')

//@Require('Class')
//@Require('Flows')
//@Require('Obj')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.PackedClientPackage')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var fstream                 = require("fstream");
    var path                    = require('path');
    var tar                     = require('tar');
    var zlib                    = require('zlib');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Flows                   = bugpack.require('Flows');
    var Obj                     = bugpack.require('Obj');
    var BugFs                   = bugpack.require('bugfs.BugFs');
    var Path                    = bugpack.require('bugfs.Path');
    var PackedClientPackage     = bugpack.require('buildbug.PackedClientPackage');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries          = Flows.$forEachSeries;
    var $parallel               = Flows.$parallel;
    var $series                 = Flows.$series;
    var $task                   = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var ClientPackage = Class.extend(Obj, {

        _name: "buildbug.ClientPackage",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {{
         *      name: string,
         *      version: string,
         *      staticPath: string,
         *      jsPath: string,
         *      template: string,
         *      url: string
         * }} clientJson
         * @param {string} baseBuildPathString
         */
        _constructor: function(clientJson, baseBuildPathString) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
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
             * @type {{
             *      name: string,
             *      version: string,
             *      staticPath: string,
             *      jsPath: string,
             *      template: string,
             *      url: string
             * }}
             */
            this.clientJson = clientJson;

            /**
             * @private
             * @type {Path}
             */
            this.jsPath = null;

            /**
             * @private
             * @type {Path}
             */
            this.staticPath = null;
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
         *      name: string,
         *      version: string,
         *      staticPath: string,
         *      jsPath: string,
         *      template: string,
         *      url: string
         * }}
         */
        getClientJson: function() {
            return this.clientJson;
        },

        /**
         * @return {string}
         */
        getName: function() {
            return this.clientJson.name;
        },

        /**
         * @return {Path}
         */
        getJsPath: function() {
            return this.jsPath;
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
        getTemplate: function() {
            return this.clientJson.template;
        },

        /**
         * @return {string}
         */
        getURL: function() {
            return this.clientJson.url;
        },

        /**
         * @return {string}
         */
        getVersion: function() {
            return this.clientJson.version;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {{
         *      sourcePaths: Array.<(string|Path)>,
         *      staticPaths: Array.<(string|Path)>,
         * }} params
         * @param {function(Error)} callback
         */
        buildPackage: function(params, callback) {
            var _this = this;
            this.validateClientJson();

            var sourcePaths = params.sourcePaths;
            var staticPaths = params.staticPaths;

            this.createPackageBuildPaths();

            $series([
                $parallel([
                    $task(function(flow) {
                        if (sourcePaths) {
                           $forEachSeries(sourcePaths, function(flow, sourcePath) {
                                BugFs.copyDirectoryContents(sourcePath, _this.getJsPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                    flow.complete(error);
                                });
                            }).execute(function(error) {
                                flow.complete(error);
                            });
                        } else {
                            flow.complete();
                        }
                    }),
                    $task(function(flow) {
                        if (staticPaths) {
                            $forEachSeries(staticPaths, function(flow, staticPath) {
                                BugFs.copyDirectoryContents(staticPath, _this.getStaticPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                    flow.complete(error);
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
                    _this.validateTemplateExists(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    _this.writeClientJson(function(error) {
                        flow.complete(error);
                    });
                })
            ]).execute(callback);
        },

        /**
         * @param {string} distPath
         * @param {function(Error, PackedClientPackage)} callback
         */
        packPackage: function(distPath, callback) {
            var _this = this;
            var packedClientPackage = new PackedClientPackage(this, distPath);
            this.packClientPackage(function(error) {
                if (!error) {
                    var clientPackageFilePath = process.cwd() + path.sep + packedClientPackage.getFileName();
                    BugFs.move(clientPackageFilePath, distPath, Path.SyncMode.MERGE_REPLACE, function(error) {
                        if (!error) {
                            callback(null, packedClientPackage);
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
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        createPackageBuildPaths: function() {
            this.buildPath = BugFs.joinPaths([this.baseBuildPathString, this.getName(), this.getVersion()]);
            this.staticPath = this.buildPath.joinPaths(this.clientJson.staticPath ? [this.clientJson.staticPath] : ["static"]);
            this.jsPath = this.buildPath.joinPaths(this.clientJson.jsPath ? [this.clientJson.jsPath] : ["js"]);
        },

        /**
         * @private
         * @param {function()} callback
         */
        packClientPackage: function(callback) {
            var packagePath = this.buildPath.getAbsolutePath();
            var inp = fstream.Reader({path: packagePath, type: "Directory"});
            var out = fstream.Writer( this.getName() + '-' + this.getVersion() + '.tgz');
            inp.pipe(tar.Pack()).pipe(zlib.createGzip())
                .on('end', function(){
                    console.log("Packed up client package '" + packagePath + "'");
                    callback();
                })
                .on('error', function(error){
                    callback(error);
                })
                .pipe(out);
        },

        /**
         * @private
         */
        validateClientJson: function() {
            if (!this.clientJson.name) {
                throw new Error("'name' is required in a client package's client.json");
            }

            //TODO BRN: Do a better job of validating the version.

            if (!this.clientJson.version) {
                throw new Error("'version' is required in a client package's client.json");
            }

            if (!this.clientJson.template) {
                throw new Error("'template' is required in a client package's client.json");
            }
        },


        /**
         * @private
         * @param {function(Error)} callback
         */
        validateTemplateExists: function(callback) {
            var template = this.buildPath.joinPaths([this.getTemplate()])
            if (!BugFs.existsSync(template)) {
                callback(new Error("'template' does not exist"));
            } else {
                callback();
            }
        },

        /**
         * @private
         * @param {function(Error)} callback
         */
        writeClientJson: function(callback) {
            var clientJson = this.clientJson;
            var clientJsonPath = this.buildPath.joinPaths(['client.json']);
            BugFs.createFile(clientJsonPath, function(error) {
                if (!error) {
                    BugFs.writeFile(clientJsonPath, JSON.stringify(clientJson, null, '\t'), callback);
                } else {
                    callback(error);
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.ClientPackage', ClientPackage);
});
