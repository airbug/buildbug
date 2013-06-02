//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Require('bugflow.BugFlow')
//@Require('buildbug.BuildBugCli')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFlow =       bugpack.require('bugflow.BugFlow');
var BuildBugCli =   bugpack.require('buildbug.BuildBugCli');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var startTime = (new Date()).getTime();
var buildBugCli = new BuildBugCli();
$series([
    $task(function(flow) {
        buildBugCli.configure(function(error) {
            flow.complete(error);
        });
    }),
    $task(function(flow) {
        buildBugCli.run(process.argv, function(error) {
            flow.complete(error);
        });
    })
]).execute(function(error) {
    if (!error) {
        var endTime = (new Date()).getTime();
        console.log("buildbug ran successfully in " + (endTime - startTime) + " ms");
    } else {
        console.log(error);
        console.log(error.stack);
        console.log("buildbug encountered an error");
        process.exit(1);
    }
});
