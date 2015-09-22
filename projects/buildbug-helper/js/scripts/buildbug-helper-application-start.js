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
        bugpack.loadExports(["bugapp.ApplicationRunner", "buildbug.BuildBugHelperApplication"], function(error) {
            if (!error) {


                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var ApplicationRunner               = bugpack.require("bugapp.ApplicationRunner");
                var BuildBugHelperApplication       = bugpack.require("buildbug.BuildBugHelperApplication");


                //-------------------------------------------------------------------------------
                // Script
                //-------------------------------------------------------------------------------

                var applicationRunner = new ApplicationRunner(BuildBugHelperApplication.getClass(), {});
                applicationRunner.run(function(throwable) {
                    if (throwable) {
                        console.log(throwable.message);
                        console.log(throwable.stack);
                        console.log("application encountered an error");
                        process.exit(1);
                    } else {
                        process.exit();
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
