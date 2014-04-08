//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require("bugpack");


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

bugpack.loadContext(module, function(error, bugpack) {
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
