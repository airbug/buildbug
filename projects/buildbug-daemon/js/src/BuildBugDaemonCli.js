/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugDaemonCli')

//@Require('Class')
//@Require('Flows')
//@@Require('bugapp.ApplicationRunner')
//@Require('bugcli.BugCli')
//@Require('buildbug.BuildBugMaster')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path                        = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                       = bugpack.require('Class');
    var Flows                       = bugpack.require('Flows');
    var ApplicationRunner           = bugpack.require('bugapp.ApplicationRunner');
    var BugCli                      = bugpack.require('bugcli.BugCli');
    var BuildBugDaemonApplication   = bugpack.require('buildbug.BuildBugDaemonApplication');


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
     * @extends {BugCli}
     */
    var BuildBugCli = Class.extend(BugCli, {

        _name: "buildbug.BuildBugDaemonCli",


        //-------------------------------------------------------------------------------
        // BugCli Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        configure: function(callback) {
            var _this = this;
            $series([
                $task(function(flow) {
                    _this._super(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    _this.registerCliAction({
                        name: 'start',
                        default: true,
                        flags: [
                            'start'
                        ],
                        executeMethod: function(cliBuild, cliAction, callback) {
                            /** @type {CliOptionInstance} */
                            var debugOption     = cliBuild.getOption("debug");
                            /** @type {CliOptionInstance} */
                            var versionOption   = cliBuild.getOption("version");
                            /** @type {boolean} */
                            var debug           = false;

                            if (debugOption) {
                                debug = true;
                            }

                            if (versionOption) {
                                _this.findBuildBugVersion(callback);
                            } else {
                                _this.runBuildBugDaemonApplication({debug: debug}, callback);
                            }
                        }
                    });

                    _this.registerCliOption({
                        name: 'debug',
                        flags: [
                            '-d',
                            '--debug'
                        ]
                    });

                    _this.registerCliOption({
                        name: 'version',
                        flags: [
                            '-v',
                            '--version'
                        ]
                    });

                    flow.complete();
                })
            ]).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {function(Throwable, number=)} callback
         */
        findBuildBugVersion: function(callback) {
            BuildBugDaemonApplication.findBuildBugVersion(callback);
        },

        /**
         * @private
         * @param {{debug: boolean}} applicationOptions
         * @param {function(Throwable=)} callback
         */
        runBuildBugDaemonApplication: function(applicationOptions, callback) {
            var applicationRunner = new ApplicationRunner(BuildBugDaemonApplication.getClass(), applicationOptions);
            applicationRunner.run(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildBugDaemonCli', BuildBugDaemonCli);
});
