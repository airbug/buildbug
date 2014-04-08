//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildRunner')

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModuleScan')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var Obj                 = bugpack.require('Obj');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');
var BuildBug            = bugpack.require('buildbug.BuildBug');
var BuildModuleScan     = bugpack.require('buildbug.BuildModuleScan');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildRunner = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(targetPath, buildFilePath, buildOptions) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Path}
         */
        this.buildFilePath      = buildFilePath;

        /**
         * @private
         * @type {Object}
         */
        this.buildOptions       = buildOptions;

        /**
         * @private
         * @type {Path}
         */
        this.targetPath         = targetPath;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Throwable=)}  callback
     */
    runBuild: function(callback) {
        var _this = this;
        var buildProject    = BuildBug.generateBuildProject(this.targetPath);
        var buildModuleScan = new BuildModuleScan(buildProject);
        buildModuleScan.scan();

        $series([
            $task(function(flow) {
                _this.loadBuildProperties(function(throwable) {
                    flow.complete(throwable);
                });
            }),
            $task(function(flow) {
                _this.runBuildFile(_this.buildFilePath.getAbsolutePath(), function(throwable) {
                    if (!throwable) {
                        setTimeout(function() {
                            buildProject.startBuild(_this.buildOptions, function(throwable) {
                                flow.complete(throwable);
                            });
                        }, 0);
                    } else {
                        flow.error(throwable)
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
     * @param {function(Throwable=)} callback
     */
    loadBuildProperties: function(callback) {
        var _this = this;
        $task(function(flow) {
            var propertiesPath = BugFs.joinPaths([_this.targetPath, "buildbug.json"]);
            propertiesPath.exists(function(throwable, exists) {
                if (!throwable) {
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
                } else {
                    flow.error(throwable);
                }
            });
        }).execute(callback);
    },

    /**
     * @private
     * @param {string} buildFilePath
     * @param {function(Throwable=)} callback
     */
    runBuildFile: function(buildFilePath, callback) {
        require(buildFilePath);
        callback();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildRunner', BuildRunner);
