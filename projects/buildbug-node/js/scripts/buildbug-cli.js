/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require("bugpack").loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["Flows", "buildbug.BuildBugCli"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var Flows           = bugpack.require('Flows');
                var BuildBugCli     = bugpack.require('buildbug.BuildBugCli');


                //-------------------------------------------------------------------------------
                // Simplify References
                //-------------------------------------------------------------------------------

                var $series         = Flows.$series;
                var $task           = Flows.$task;


                //-------------------------------------------------------------------------------
                // Script
                //-------------------------------------------------------------------------------

                var startTime = (new Date()).getTime();
                var buildBugCli = new BuildBugCli();
                $series([
                    $task(function(flow) {
                        buildBugCli.configure(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        buildBugCli.run(process.argv, function(throwable) {
                            flow.complete(throwable);
                        });
                    })
                ]).execute(function(throwable) {
                    if (!throwable) {
                        var endTime = (new Date()).getTime();
                        console.log("buildbug ran successfully in " + (endTime - startTime) + " ms");
                    } else {
                        console.log(throwable.message);
                        console.log(throwable.stack);
                        console.log("buildbug encountered an error");
                        process.exit(1);
                    }
                });

            } else {
                console.log(error.message);
                console.log(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(error.message);
        console.log(error.stack);
        process.exit(1);
    }
});
