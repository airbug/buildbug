/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugMaster')

//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Map')
//@Require('Obj')
//@Require('ObjectUtil')
//@Require('StringUtil')
//@Require('bugfs.BugFs')
//@Require('bugnpm.Npm')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var child_process   = require('child_process');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Exception       = bugpack.require('Exception');
    var Flows           = bugpack.require('Flows');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var ObjectUtil      = bugpack.require('ObjectUtil');
    var StringUtil      = bugpack.require('StringUtil');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var Npm             = bugpack.require('bugnpm.Npm');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series         = Flows.$series;
    var $task           = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildBugMaster = Class.extend(Obj, {

        _name: "buildbug.BuildBugMaster",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {{}}
             */
            this.buildbugModuleData = null;

            /**
             * @private
             * @type {Npm}
             */
            this.npm                = new Npm();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} targetPathString
         * @param {{
         *      debug: boolean=,
         *      targetNames: Array.<string>=
         * }} buildOptions
         * @param {function(Error)} callback
         */
        build: function(targetPathString, buildOptions, callback) {
            var _this       = this;
            var targetPath  = BugFs.path(targetPathString);
            $series([
                $task(function(flow) {
                    _this.setupBuild(targetPath, function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    var buildFilePath = BugFs.joinPaths([targetPath, "buildbug.js"]);
                    buildFilePath.exists(function(throwable, exists) {
                        if (!throwable) {
                            if (exists) {
                                _this.startBuild(targetPath, buildFilePath, buildOptions, function(throwable) {
                                    flow.complete(throwable);
                                });
                            } else {
                                flow.error(new Exception("BuildError", {}, "no buildbug.js file in this dir"));
                            }
                        } else {
                            flow.error(throwable);
                        }
                    });
                })
            ]).execute(callback);
        },

        /**
         * @param {function(Throwable, number=)} callback
         */
        findBuildbugVersion: function(callback) {
            var _this = this;
            var buildbugModulePath = BugFs.resolvePaths([__dirname + "/.."]);
            $series([
                $task(function(flow) {
                    _this.npm.getModuleData(buildbugModulePath, function(throwable, moduleData) {
                        if (!throwable) {
                            _this.buildbugModuleData = moduleData;
                        }
                        flow.complete(throwable);
                    });
                })
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, _this.buildbugModuleData.version);
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
         * @param {Path} targetPath
         * @param {function(Throwable=)} callback
         */
        setupBuild: function(targetPath, callback) {
            child_process.exec('npm link buildbug', {cwd: targetPath.getAbsolutePath(), env: process.env}, function (error, stdout, stderr) {
                if (!error) {
                    callback();
                } else {
                    callback(new Exception("BuildError", {}, "Error occurred while linking buildbug module", [error]));
                }
            });
        },


        /**
         * @private
         * @param {Path} targetPath
         * @param {Path} buildFilePath
         * @param {{
         *      debug: boolean=,
         *      targetNames: Array.<string>=
         * }} buildOptions
         * @param {function(Throwable=)} callback
         */
        startBuild: function(targetPath, buildFilePath, buildOptions, callback) {
            /*mocks = mocks || {};

             // this is necessary to allow relative path modules within loaded file
             // i.e. requiring ./some inside file /a/b.js needs to be resolved to /a/some
             var resolveModule = function(module) {
             if (module.charAt(0) !== '.') return module;
             return path.resolve(path.dirname(filePath), module);
             };

             var exports = {};
             var context = {
             require: function(name) {
             return mocks[name] || require(resolveModule(name));
             },
             console: console,
             exports: exports,
             module: {
             exports: exports
             }
             };

             vm.runInNewContext(BugFs.readFileSync(filePath, 'utf8'), context);
             return context;*/

            $task(function(flow) {
                var runnerPath      = BugFs.joinPaths([targetPath, "node_modules/buildbug/scripts/buildbug-build-runner.js"]);
                var env = ObjectUtil.merge(process.env, {
                    targetPath: targetPath.getAbsolutePath(),
                    buildFilePath: buildFilePath.getAbsolutePath(),
                    buildOptions: JSON.stringify(buildOptions)
                });
                var childProcess = child_process.spawn('node', [runnerPath.getAbsolutePath()], {
                    cwd: targetPath.getAbsolutePath(),
                    env: env
                });
                childProcess.stdout.setEncoding('utf8');
                childProcess.stdout.on('data', function (data) {
                    console.log(StringUtil.trim(data));
                });
                childProcess.stderr.setEncoding('utf8');
                childProcess.stderr.on('data', function (data) {
                    console.log(StringUtil.trim(data));
                });
                childProcess.on('close', function (code) {
                    if (code !== 0) {
                        flow.error(new Exception("BuildError", {}, "Buildbug completed with an error"));
                    } else {
                        flow.complete();
                    }
                });
            }).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildBugMaster', BuildBugMaster);
});
