//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildBug')

//@Require('Annotate')
//@Require('BuildModule')
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
var BuildModule = bugpack.require('BuildModule');
var BuildProject = bugpack.require('BuildProject');
var BuildTask = bugpack.require('BuildTask');
var Class = bugpack.require('Class');
var Map = bugpack.require('Map');
var Obj = bugpack.require('Obj');


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
 * @param {string} taskName
 * @param {function()} taskFunction
 * @return {BuildTask}
 */
BuildBug.addTask = function(taskName, taskFunction) {
    var buildTask = new BuildTask(taskName, taskFunction);
    BuildBug.buildProject.addTask(buildTask);
    return buildTask;
};

/**
 * @param {string} taskName
 * @return {BuildTask}
 */
BuildBug.getTask = function(taskName) {
    return BuildBug.buildProject.getTask(taskName);
};

/**
 * @param {string} taskName
 */
BuildBug.defaultTask = function(taskName) {
    var buildTask = BuildBug.buildProject.getTask(taskName);
    BuildBug.buildProject.setDefaultTask(buildTask);
};

/**
 * @param {string} moduleName
 */
BuildBug.enableModule = function(moduleName) {
    BuildBug.buildProject.enableModule(moduleName);
};

/**
 * @param {Object} properties
 */
BuildBug.properties = function(properties) {
    BuildBug.buildProject.updateProperties(properties);
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @private
 * @param {string} moduleName
 * @param {Class} buildModuleClass
 */
BuildBug.registerModule = function(moduleName, buildModuleClass) {
    BuildBug.buildProject.registerModule(moduleName, buildModuleClass);
};

/**
 * @private
 */
BuildBug.bootstrap = function() {
    var buildModuleAnnotations = Annotate.getAnnotationsByType("BuildModule");
    if (buildModuleAnnotations) {
        buildModuleAnnotations.forEach(function(annotation) {
            var buildModuleClass = annotation.getReference();
            var buildModuleName = annotation.getName();
            BuildBug.registerModule(buildModuleClass, buildModuleName);
        });
    }

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
                    var targetTaskName = "";
                    if (process.argv.length >= 2) {
                        targetTaskName = process.argv[2];
                    }
                    var targetTask = BuildBug.getTask(targetTaskName);
                    if (targetTask) {
                        BuildBug.buildProject.setTargetTask(targetTask);
                    }
                    BuildBug.buildProject.startBuild();
                }, 0);


            } else {
                throw new Error("no buildbug.js file in this dir");
            }
        }
    );
};

BuildBug.bootstrap();


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(BuildBug);

// NOTE BRN: This file is the entry point for the node js module. So we also export this file as a node js module here
// so that users can simple 'require('buildbug') in their build scripts.

module.exports = BuildBug;
