/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
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

                var BuildRunner     = bugpack.require('buildbug.BuildRunner');
                var BugFs           = bugpack.require('bugfs.BugFs');


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
