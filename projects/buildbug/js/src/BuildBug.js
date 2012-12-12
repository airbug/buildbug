//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildBug')

//@Require('Annotate')
//@Require('BuildProject')
//@Require('BuildTask')
//@Require('Class')
//@Require('Map')
//@Require('Obj')

var bugpack = require('bugpack');
var child_process = require('child_process');
var fs_extra = require('fs-extra');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('BuildBug');

var Annotate = bugpack.require('Annotate');
var BuildModuleScan = bugpack.require('BuildModuleScan');
var BuildParallel = bugpack.require('BuildParallel');
var BuildProject = bugpack.require('BuildProject');
var BuildSeries = bugpack.require('BuildSeries');
var BuildTarget = bugpack.require('BuildTarget');
var BuildTask = bugpack.require('BuildTask');
var Class = bugpack.require('Class');
var Map = bugpack.require('Map');
var Obj = bugpack.require('Obj');
var TargetTask = bugpack.require('TargetTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildBug = Class.extend(Obj, {});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @type {BuildProject}
 */
BuildBug.buildProject = new BuildProject();


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {Object} properties
 */
BuildBug.buildProperties = function(properties) {
    BuildBug.buildProject.updateProperties(properties);
};

/**
 * @param {string} targetName
 * @return {BuildTarget}
 */
BuildBug.buildTarget = function(targetName) {
    var buildTarget = new BuildTarget(targetName);
    BuildBug.buildProject.registerTarget(buildTarget);
    return buildTarget;
};

/**
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
 * @param {string} moduleName
 */
BuildBug.enableModule = function(moduleName) {
    BuildBug.buildProject.enableModule(moduleName);
};

/**
 * @param {string} targetName
 * @return {BuildTask}
 */
BuildBug.getTarget = function(targetName) {
    return BuildBug.buildProject.getTarget(targetName);
};

/**
 * @param {string} taskName
 * @return {BuildTask}
 */
BuildBug.getTask = function(taskName) {
    return BuildBug.buildProject.getTask(taskName);
};

/**
 * @param {Array<(function()|Task)>} tasksArray
 * @param {function()} callback
 * @return {BuildParallel}
 */
BuildBug.parallel = function(tasksArray, callback) {
    return new BuildParallel(tasksArray, callback);
};

/**
 * @param {Array<(function()|Task)>} tasksArray
 * @return {BuildSeries}
 */
BuildBug.series = function(tasksArray) {
    return new BuildSeries(tasksArray);
};

/**
 * @param {function()} taskName
 * @return {TargetTask}
 */
BuildBug.targetTask = function(taskName) {
    return new TargetTask(taskName);
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @private
 */
BuildBug.bootstrap = function() {
    var buildModuleScan = new BuildModuleScan(this.buildProject);
    buildModuleScan.scan();

    //TODO BRN: Clean up this code using FlowBug
    var currentDir = process.cwd();
    var child = child_process.exec('npm link buildbug', {cwd: currentDir, env: process.env},
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log(error);
                console.log(error.stack);
                process.exit(1);
                return;
            }

            if (fs_extra.existsSync(currentDir +  path.sep + "buildbug.js")) {
                require(currentDir +  path.sep + "buildbug.js");

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

bugpack.export(BuildBug);

// NOTE BRN: This file is the entry point for the node js module. So we also export this file as a node js module here
// so that users can simple 'require('buildbug') in their build scripts.

module.exports = BuildBug;
