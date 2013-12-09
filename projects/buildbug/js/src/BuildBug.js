//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildBug')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('bugflow.BugFlow')
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

var bugpack             = require('bugpack').context();
var child_process       = require('child_process');
var path                = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var Map                 = bugpack.require('Map');
var Obj                 = bugpack.require('Obj');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');
var BuildModuleScan     = bugpack.require('buildbug.BuildModuleScan');
var BuildParallel       = bugpack.require('buildbug.BuildParallel');
var BuildProject        = bugpack.require('buildbug.BuildProject');
var BuildSeries         = bugpack.require('buildbug.BuildSeries');
var BuildTarget         = bugpack.require('buildbug.BuildTarget');
var BuildTask           = bugpack.require('buildbug.BuildTask');
var TargetTask          = bugpack.require('buildbug.TargetTask');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


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
 * @param {string} buildPath
 * @param {string} targetName
 * @param {function(Error)} callback
 */
BuildBug.build = function(buildPath, targetName, callback) {
    var buildModuleScan = new BuildModuleScan(this.buildProject);
    buildModuleScan.scan();

    $series([
        $task(function(flow) {
            child_process.exec('npm link buildbug', {cwd: buildPath, env: process.env}, function (error, stdout, stderr) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            var propertiesPath = BugFs.joinPaths([buildPath, "buildbug.json"]);
            propertiesPath.exists(function(exists) {
                if (exists) {
                    propertiesPath.readFile('utf8', function(error, data) {
                        if (!error) {
                            var properties = JSON.parse(data);
                            BuildBug.buildProperties(properties);
                            flow.complete();
                        } else {
                            flow.error(error);
                        }
                    });
                } else {
                    flow.complete();
                }
            });
        }),
        $task(function(flow) {
            var buildFilePath = BugFs.joinPaths([buildPath, "buildbug.js"]);
            buildFilePath.exists(function(exists) {
                if (exists) {
                    BuildBug.loadModule(buildFilePath.getAbsolutePath(), function(throwable, context) {
                        if (!throwable) {
                            setTimeout(function() {
                                BuildBug.buildProject.startBuild(targetName, function(throwable) {
                                    flow.complete(throwable);
                                });
                            }, 0);
                        } else {
                            flow.error(throwable)
                        }
                    });
                } else {
                    flow.error(new Error("no buildbug.js file in this dir"));
                }
            });
        })
    ]).execute(callback);
};

/**
 * @param {string} filePath
 * @param {Object=} mocks
 */
BuildBug.loadModule = function(filePath, callback) {
    /*mocks = mocks || {};

    // this is necessary to allow relative path modules within loaded file
    // i.e. requiring ./some inside file /a/b.js needs to be resolved to /a/some
    var resolveModule = function(module) {
        if (module.charAt(0) !== '.') return module;
        return path.resolve(path.dirname(filePath), module);
    };

    var exports = {};
    var context = {
        require: function(name) {
            return mocks[name] || require(resolveModule(name));
        },
        console: console,
        exports: exports,
        module: {
            exports: exports
        }
    };

    vm.runInNewContext(BugFs.readFileSync(filePath, 'utf8'), context);
    return context;*/

    //TODO BRN: Try to figure out how we can use the above instead of

    require(filePath);
    callback();
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
