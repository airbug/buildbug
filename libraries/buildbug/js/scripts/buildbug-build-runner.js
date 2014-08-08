/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require("bugpack").loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["buildbug.BuildRunner", "bugfs.BugFs"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var BugFs           = bugpack.require('bugfs.BugFs');
                var BuildRunner     = bugpack.require('buildbug.BuildRunner');


                //-------------------------------------------------------------------------------
                // Script
                //-------------------------------------------------------------------------------

                var targetPath      = BugFs.path(process.env.targetPath);
                var buildFilePath   = BugFs.path(process.env.buildFilePath);
                var buildOptions    = JSON.parse(process.env.buildOptions);
                var buildRunner     = new BuildRunner(targetPath, buildFilePath, buildOptions);
                buildRunner.runBuild(function(throwable) {
                    if (throwable) {
                        throw throwable;
                    }
                });
            } else {
                console.error(error);
                process.exit(1);
            }
        });
    } else {
        console.error(error);
        process.exit(1);
    }
});
