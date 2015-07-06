/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildBug')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('bugfs.BugFs')
//@Require('buildbug.BuildParallel')
//@Require('buildbug.BuildProject')
//@Require('buildbug.BuildScript')
//@Require('buildbug.BuildSeries')
//@Require('buildbug.BuildTarget')
//@Require('buildbug.BuildTask')
//@Require('buildbug.TargetTask')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var child_process   = require('child_process');
    var path            = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var BuildParallel   = bugpack.require('buildbug.BuildParallel');
    var BuildProject    = bugpack.require('buildbug.BuildProject');
    var BuildScript     = bugpack.require('buildbug.BuildScript');
    var BuildSeries     = bugpack.require('buildbug.BuildSeries');
    var BuildTarget     = bugpack.require('buildbug.BuildTarget');
    var BuildTask       = bugpack.require('buildbug.BuildTask');
    var TargetTask      = bugpack.require('buildbug.TargetTask');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildBug = Class.extend(Obj, {
        _name: "buildbug.BuildBug"
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BuildProject}
     */
    BuildBug.buildProject = null;


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
     * @param {Object} scriptObject
     * @return {BuildScript}
     */
    BuildBug.buildScript = function(scriptObject) {
        var buildScript = new BuildScript(scriptObject);
        BuildBug.buildProject.registerScript(buildScript);
        return buildScript;
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
     * @param {Object} taskContext
     * @return {BuildTask}
     */
    BuildBug.buildTask = function(taskName, taskFunction, taskContext) {
        var buildTask = new BuildTask(taskName, taskFunction, taskContext);
        BuildBug.buildProject.registerTask(buildTask);
        return buildTask;
    };

    /**
     * @static
     * @param {string} moduleName
     * @param {Object} moduleConfig
     * @return {BuildModule}
     */
    BuildBug.enableModule = function(moduleName, moduleConfig) {
        return BuildBug.buildProject.enableModule(moduleName, moduleConfig);
    };

    /**
     * @param {Path} targetPath
     * @return {BuildProject}
     */
    BuildBug.generateBuildProject = function(targetPath) {
        BuildBug.buildProject = new BuildProject(targetPath);
        return BuildBug.buildProject;
    };

    /**
     * @static
     * @param {string} targetName
     * @return {BuildTarget}
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
     * @param {string} moduleName
     * @param {BuildModule} buildModule
     */
    BuildBug.registerModule = function(moduleName, buildModule) {
        BuildBug.buildProject.registerModule(moduleName, buildModule);
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
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildBug', BuildBug);
});
