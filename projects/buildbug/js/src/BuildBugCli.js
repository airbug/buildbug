//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildBugCli')

//@Require('Class')
//@Require('bugcli.BugCli')
//@Require('bugflow.BugFlow')
//@Require('buildbug.BuildBug')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var BugCli =    bugpack.require('bugcli.BugCli');
var BugFlow =   bugpack.require('bugflow.BugFlow');
var BuildBug =  bugpack.require('buildbug.BuildBug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildBugCli = Class.extend(BugCli, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Bugcli Extended Class Methods
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
                        console.log("Starting build");
                        /** @type {CliOptionInstance} */
                        var targetOption = cliBuild.getOption("target");
                        /** @type {string} */
                        var targetName = "";

                        if (targetOption) {
                            targetName = targetOption.getParameter("targetName");
                        }
                        var buildPath = process.cwd();
                        BuildBug.build(buildPath, targetName, callback);
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

                flow.complete();
            })
        ]).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildBugCli', BuildBugCli);
