//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBugCli')

//@Require('Class')
//@Require('bugcli.BugCli')
//@Require('bugflow.BugFlow')
//@Require('buildbug.BuildBugMaster')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();
var path                = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var BugCli              = bugpack.require('bugcli.BugCli');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BuildBugMaster      = bugpack.require('buildbug.BuildBugMaster');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildBugCli = Class.extend(BugCli, {

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
                        /** @type {string} */
                        var targetName      = "";
                        /** @type {boolean} */
                        var debug           = false;

                        if (targetOption) {
                            targetName = targetOption.getParameter("targetName");
                        }
                        if (debugOption) {
                            debug = true;
                        }
                        var buildPath       = process.cwd();
                        var buildBugMaster  = new BuildBugMaster();
                        buildBugMaster.build(buildPath, {targetName: targetName, debug: debug}, callback);
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
                            name: "targetName"
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

                flow.complete();
            })
        ]).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildBugCli', BuildBugCli);
