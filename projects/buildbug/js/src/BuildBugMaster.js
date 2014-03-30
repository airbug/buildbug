//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildBugMaster')

//@Require('Class')
//@Require('Exception')
//@Require('Map')
//@Require('Obj')
//@Require('StringUtil')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();
var child_process       = require('child_process');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var Exception           = bugpack.require('Exception');
var Map                 = bugpack.require('Map');
var Obj                 = bugpack.require('Obj');
var StringUtil          = bugpack.require('StringUtil');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var BuildBugMaster = Class.extend(Obj, {

    /**
     * @param {string} targetPathString
     * @param {Object} buildOptions
     * @param {function(Error)} callback
     */
    build: function(targetPathString, buildOptions, callback) {
        var _this       = this;
        var targetPath  = BugFs.path(targetPathString);
        $series([
            $task(function(flow) {
                _this.setupBuild(targetPath, function(throwable) {
                    flow.complete(throwable);
                });
            }),
            $task(function(flow) {
                var buildFilePath = BugFs.joinPaths([targetPath, "buildbug.js"]);
                buildFilePath.exists(function(throwable, exists) {
                    if (!throwable) {
                        if (exists) {
                            _this.startBuild(targetPath, buildFilePath, buildOptions, function(throwable) {
                                flow.complete(throwable);
                            });
                        } else {
                            flow.error(new Exception("BuildError", {}, "no buildbug.js file in this dir"));
                        }
                    } else {
                        flow.error(throwable);
                    }
                });
            })
        ]).execute(callback);
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Path} targetPath
     * @param {function(Throwable=)} callback
     */
    setupBuild: function(targetPath, callback) {
        child_process.exec('npm link buildbug', {cwd: targetPath.getAbsolutePath(), env: process.env}, function (error, stdout, stderr) {
            if (!error) {
                callback();
            } else {
                callback(new Exception("BuildError", {}, "Error occurred while linking buildbug module", [error]));
            }
        });
    },


    /**
     * @private
     * @param {Path} targetPath
     * @param {Path} buildFilePath
     * @param {Object} buildOptions
     * @param {function(Throwable=)} callback
     */
    startBuild: function(targetPath, buildFilePath, buildOptions, callback) {
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

        $task(function(flow) {
            var runnerPath      = BugFs.joinPaths([targetPath, "node_modules/buildbug/scripts/buildbug-build-runner.js"]);
            var env = Obj.merge(process.env, {
                targetPath: targetPath.getAbsolutePath(),
                buildFilePath: buildFilePath.getAbsolutePath(),
                buildOptions: JSON.stringify(buildOptions)
            });
            var childProcess = child_process.spawn('node', [runnerPath.getAbsolutePath()], {
                cwd: targetPath.getAbsolutePath(),
                env: env
            });
            childProcess.stdout.setEncoding('utf8');
            childProcess.stdout.on('data', function (data) {
                console.log(StringUtil.trim(data));
            });
            childProcess.stderr.setEncoding('utf8');
            childProcess.stderr.on('data', function (data) {
                console.log(StringUtil.trim(data));
            });
            childProcess.on('close', function (code) {
                if (code !== 0) {
                    flow.error(new Exception("BuildError", {}, "Buildbug completed with an error"));
                } else {
                    flow.complete();
                }
            });
        }).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildBugMaster', BuildBugMaster);