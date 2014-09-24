/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugCli')

//@Require('Class')
//@Require('Flows')
//@Require('bugcli.BugCli')
//@Require('buildbug.BuildBugMaster')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path            = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Flows           = bugpack.require('Flows');
    var BugCli          = bugpack.require('bugcli.BugCli');
    var BuildBugMaster  = bugpack.require('buildbug.BuildBugMaster');


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
     * @extends {BugCli}
     */
    var BuildBugCli = Class.extend(BugCli, {

        _name: "buildbug.BuildBugCli",


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
                        name: 'build',
                        default: true,
                        flags: [
                            'build'
                        ],
                        executeMethod: function(cliBuild, cliAction, callback) {
                            /** @type {CliOptionInstance} */
                            var targetOption    = cliBuild.getOption("target");
                            /** @type {CliOptionInstance} */
                            var debugOption     = cliBuild.getOption("debug");
                            /** @type {CliOptionInstance} */
                            var versionOption   = cliBuild.getOption("version");
                            /** @type {Array.<string>} */
                            var targetNames     = [];
                            /** @type {boolean} */
                            var debug           = false;

                            if (targetOption) {
                                var targetNamesString = targetOption.getParameter("targetNames");
                                targetNames = targetNamesString.split(",");
                            }
                            if (debugOption) {
                                debug = true;
                            }
                            var buildPath       = process.cwd();
                            var buildBugMaster  = new BuildBugMaster();
                            if (versionOption) {
                                buildBugMaster.findBuildbugVersion(function(throwable, version) {
                                    if (!throwable) {
                                        console.log("Buildbug version " + version);
                                    }
                                    callback(throwable);
                                })
                            } else {
                                buildBugMaster.build(buildPath, {targetNames: targetNames, debug: debug}, callback);
                            }
                        }
                    });

                    _this.registerCliOption({
                        name: 'target',
                        flags: [
                            '-t',
                            '--target'
                        ],
                        parameters: [
                            {
                                name: "targetNames"
                            }
                        ]
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
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildBugCli', BuildBugCli);
});
