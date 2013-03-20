//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildBug')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('bugfs.BugFs')
//@Require('buildbug.BuildModuleScan')
//@Require('buildbug.BuildParallel')
//@Require('buildbug.BuildProject')
//@Require('buildbug.BuildSeries')
//@Require('buildbug.BuildTarget')
//@Require('buildbug.BuildTask')
//@Require('buildbug.TargetTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var child_process = require('child_process');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Map =               bugpack.require('Map');
var Obj =               bugpack.require('Obj');
var BugFs =             bugpack.require('bugfs.BugFs');
var BuildModuleScan =   bugpack.require('buildbug.BuildModuleScan');
var BuildParallel =     bugpack.require('buildbug.BuildParallel');
var BuildProject =      bugpack.require('buildbug.BuildProject');
var BuildSeries =       bugpack.require('buildbug.BuildSeries');
var BuildTarget =       bugpack.require('buildbug.BuildTarget');
var BuildTask =         bugpack.require('buildbug.BuildTask');
var TargetTask =        bugpack.require('buildbug.TargetTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildBug = Class.extend(Obj, {});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 * @type {BuildProject}
 */
BuildBug.buildProject = new BuildProject();


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {Object} propertiesObject
 */
BuildBug.buildProperties = function(propertiesObject) {
    BuildBug.buildProject.updateProperties(propertiesObject);
};

/**
 * @static
 * @param {string} targetName
 * @return {BuildTarget}
 */
BuildBug.buildTarget = function(targetName) {
    var buildTarget = new BuildTarget(targetName);
    BuildBug.buildProject.registerTarget(buildTarget);
    return buildTarget;
};

/**
 * @static
 * @param {string} taskName
 * @param {function()} taskFunction
 * @return {BuildTask}
 */
BuildBug.buildTask = function(taskName, taskFunction) {
    var buildTask = new BuildTask(taskName, taskFunction);
    BuildBug.buildProject.registerTask(buildTask);
    return buildTask;
};

/**
 * @static
 * @param {string} moduleName
 * @return {BuildModule}
 */
BuildBug.enableModule = function(moduleName) {
    return BuildBug.buildProject.enableModule(moduleName);
};

/**
 * @static
 * @param {string} targetName
 * @return {BuildTask}
 */
BuildBug.getTarget = function(targetName) {
    return BuildBug.buildProject.getTarget(targetName);
};

/**
 * @static
 * @param {string} taskName
 * @return {BuildTask}
 */
BuildBug.getTask = function(taskName) {
    return BuildBug.buildProject.getTask(taskName);
};

/**
 * @static
 * @param {Array<(function()|Task)>} tasksArray
 * @param {function()} callback
 * @return {BuildParallel}
 */
BuildBug.parallel = function(tasksArray, callback) {
    return new BuildParallel(tasksArray, callback);
};

/**
 * @static
 * @param {Array<(function()|Task)>} tasksArray
 * @return {BuildSeries}
 */
BuildBug.series = function(tasksArray) {
    return new BuildSeries(tasksArray);
};

/**
 * @static
 * @param {function()} taskName
 * @param {Object} proto
 * @return {TargetTask}
 */
BuildBug.targetTask = function(taskName, proto) {
    return new TargetTask(taskName, proto);
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @private
 */
BuildBug.bootstrap = function() {
    var buildModuleScan = new BuildModuleScan(this.buildProject);
    buildModuleScan.scan();

    //TODO BRN: Clean up this code using FlowBug
    var currentDir = process.cwd();
    var child = child_process.exec('npm link buildbug', {cwd: currentDir, env: process.env},
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                console.log(error);
                console.log(error.stack);
                process.exit(1);
                return;
            }

            var propertiesPathString = currentDir + path.sep + "buildbug.json";
            if (BugFs.existsSync(propertiesPathString)) {
                var propertiesJson = BugFs.readFileSync(propertiesPathString, 'utf8');
                var properties = JSON.parse(propertiesJson);
                BuildBug.buildProperties(properties);
            }

            var buildFilePathString = currentDir +  path.sep + "buildbug.js";
            if (BugFs.existsSync(buildFilePathString)) {
                require(buildFilePathString);

                // NOTE BRN: By using a setTimeout here we allow the buildbug script to declare all of its tasks and perform all
                // of its setup before we begin executing the build.

                setTimeout(function() {
                    BuildBug.buildProject.startBuild();
                }, 0);
            } else {
                throw new Error("no buildbug.js file in this dir");
            }
        }
    );
};

/**
 * @static
 * @private
 * @param {string} moduleName
 * @param {BuildModule} buildModule
 */
BuildBug.registerModule = function(moduleName, buildModule) {
    BuildBug.buildProject.registerModule(moduleName, buildModule);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildBug', BuildBug);
