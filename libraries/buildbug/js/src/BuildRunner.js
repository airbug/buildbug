/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildRunner')

//@Require('Class')
//@Require('Flows')
//@Require('Obj')
//@Require('bugfs.BugFs')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModuleTagProcessor')
//@Require('buildbug.BuildModuleTagScan')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                       = bugpack.require('Class');
    var Flows                       = bugpack.require('Flows');
    var Obj                         = bugpack.require('Obj');
    var BugFs                       = bugpack.require('bugfs.BugFs');
    var BugMeta                     = bugpack.require('bugmeta.BugMeta');
    var BuildBug                    = bugpack.require('buildbug.BuildBug');
    var BuildModuleTagProcessor     = bugpack.require('buildbug.BuildModuleTagProcessor');
    var BuildModuleTagScan          = bugpack.require('buildbug.BuildModuleTagScan');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series                     = Flows.$series;
    var $task                       = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildRunner = Class.extend(Obj, {

        _name: "buildbug.BuildRunner",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} targetPath
         * @param {Path} buildFilePath
         * @param {{
         *      debug: boolean=,
         *      targetNames: Array.<string>=
         * }} buildOptions
         */
        _constructor: function(targetPath, buildFilePath, buildOptions) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Path}
             */
            this.buildFilePath      = buildFilePath;

            /**
             * @private
             * @type {{
             *      debug: boolean=,
             *      targetNames: Array.<string>=
             * }}
             */
            this.buildOptions       = buildOptions;

            /**
             * @private
             * @type {Path}
             */
            this.targetPath         = targetPath;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)}  callback
         */
        runBuild: function(callback) {
            var _this = this;
            var buildProject                = BuildBug.generateBuildProject(this.targetPath);
            var buildModuleTagScan   = new BuildModuleTagScan(BugMeta.context(), new BuildModuleTagProcessor(buildProject));
            buildModuleTagScan.scanAll();

            $series([
                $task(function(flow) {
                    _this.loadBuildProperties(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.runBuildFile(_this.buildFilePath.getAbsolutePath(), function(throwable) {
                        if (!throwable) {
                            setTimeout(function() {
                                buildProject.startBuild(_this.buildOptions, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }, 0);
                        } else {
                            flow.error(throwable)
                        }
                    });
                })
            ]).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        loadBuildProperties: function(callback) {
            var _this = this;
            $task(function(flow) {
                var propertiesPath = BugFs.joinPaths([_this.targetPath, "buildbug.json"]);
                propertiesPath.exists(function(throwable, exists) {
                    if (!throwable) {
                        if (exists) {
                            propertiesPath.readFile('utf8', function(error, data) {
                                if (!error) {
                                    var properties = JSON.parse(data);
                                    BuildBug.buildProperties(properties);
                                    flow.complete();
                                } else {
                                    flow.error(error);
                                }
                            });
                        } else {
                            flow.complete();
                        }
                    } else {
                        flow.error(throwable);
                    }
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {string} buildFilePath
         * @param {function(Throwable=)} callback
         */
        runBuildFile: function(buildFilePath, callback) {
            require(buildFilePath);
            callback();
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildRunner', BuildRunner);
});
