//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Require('buildbug.BuildRunner')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BuildRunner     = bugpack.require('buildbug.BuildRunner');
var BugFs           = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Bootstrap
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