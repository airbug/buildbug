/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugCli')

//@Require('Class')
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
    var BugCli          = bugpack.require('bugcli.BugCli');
    var BuildBugMaster  = bugpack.require('buildbug.BuildBugMaster');



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
             * @type {BuildBugMaster}
             */
            this.buildBugMaster     = new BuildBugMaster();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {BuildBugMaster}
         */
        getBuildBugMaster: function() {
            return this.buildBugMaster;
        },


        //-------------------------------------------------------------------------------
        // BugCli Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        doConfigure: function(callback) {
            var _this = this;

            this.action({
                command: "help",
                default: true,
                options: [
                    {
                        name: "version",
                        required: false,
                        flags: [
                            '-v',
                            '--version'
                        ]
                    }
                ],
                executeMethod: function(action, callback) {
                    /** @type {CliOptionInstance} */
                    var versionOption   = action.getOption("version");
                    if (versionOption) {
                        _this.getBuildBugMaster().findBuildbugVersion(function(throwable, version) {
                            if (!throwable) {
                                console.log("Buildbug version " + version);
                            }
                            callback(throwable);
                        })
                    } else {
                        console.log(_this.generateHelpText());
                        callback();
                    }
                }
            });

            this.action({
                command: 'build',
                options: [
                    {
                        name: "target",
                        required: false,
                        flags: [
                            '-t',
                            '--target'
                        ],
                        parameters: [
                            {
                                name: "targetNames"
                            }
                        ]
                    },
                    {
                        name: 'debug',
                        flags: [
                            '-d',
                            '--debug'
                        ]
                    }
                ],
                executeMethod: function(cliBuild, cliAction, callback) {
                    /** @type {CliOptionInstance} */
                    var targetOption    = cliBuild.getOption("target");
                    /** @type {CliOptionInstance} */
                    var debugOption     = cliBuild.getOption("debug");
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
                    buildBugMaster.build(buildPath, {targetNames: targetNames, debug: debug}, callback);
                }
            });

            callback();
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildBugCli', BuildBugCli);
});
