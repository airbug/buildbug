/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildProject')

//@Require('Bug')
//@Require('Class')
//@Require('EventDispatcher')
//@Require('Flows')
//@Require('Map')
//@Require('Set')
//@Require('TypeUtil')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildProperties')
//@Require('buildbug.BuildScript')
//@Require('buildbug.BuildTarget')
//@Require('buildbug.BuildTask')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Flows               = bugpack.require('Flows');
    var Map                 = bugpack.require('Map');
    var Set                 = bugpack.require('Set');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BuildModule         = bugpack.require('buildbug.BuildModule');
    var BuildProperties     = bugpack.require('buildbug.BuildProperties');
    var BuildScript         = bugpack.require('buildbug.BuildScript');
    var BuildTarget         = bugpack.require('buildbug.BuildTarget');
    var BuildTask           = bugpack.require('buildbug.BuildTask');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries      = Flows.$forEachSeries;
    var $iterableParallel   = Flows.$iterableParallel;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var BuildProject = Class.extend(EventDispatcher, {

        _name: "buildbug.BuildProject",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} targetPath
         */
        _constructor: function(targetPath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Set.<BuildModule>}
             */
            this.buildModuleSet                 = new Set();

            /**
             * @private
             * @type {Set.<BuildScript>}
             */
            this.buildScriptSet                 = new Set();

            /**
             * @private
             * @type {Set.<BuildTarget>}
             */
            this.buildTargetSet                 = new Set();

            /**
             * @private
             * @type {Set.<BuildTask>}
             */
            this.buildTaskSet                   = new Set();

            /**
             * @private
             * @type {string}
             */
            this.homePath                       = targetPath.getAbsolutePath() + "/.buildbug";

            /**
             * @private
             * @type {Map<string, BuildModule>}
             */
            this.moduleNameToBuildModuleMap     = new Map();

            /**
             * @private
             * @type {number}
             */
            this.numberEnabledModules           = 0;

            /**
             * @private
             * @type {number}
             */
            this.numberInitializedModules       = 0;

            /**
             * @private
             * @type {BuildProperties}
             */
            this.properties                     = new BuildProperties({
                buildPath: this.homePath + "/build",
                distPath: this.homePath + "/dist"
            });

            /**
             * @private
             * @type {boolean}
             */
            this.started                        = false;

            /**
             * @private
             * @type {Map<string, BuildTarget>}
             */
            this.targetNameToBuildTargetMap     = new Map();

            /**
             * @private
             * @type {Path}
             */
            this.targetPath                     = targetPath;

            /**
             * @private
             * @type {Map<string, BuildTask>}
             */
            this.taskNameToBuildTaskMap         = new Map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getHomePath: function() {
            return this.homePath;
        },

        /**
         * @return {BuildProperties}
         */
        getProperties: function() {
            return this.properties;
        },

        /**
         * @return {Path}
         */
        getTargetPath: function() {
            return this.targetPath;
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} propertyName
         * @return {*}
         */
        getProperty: function(propertyName) {
            return this.properties.getProperty(propertyName);
        },

        /**
         * @param {Object} propertiesObject
         */
        updateProperties: function(propertiesObject) {
            this.properties.updateProperties(propertiesObject);
        },

        /**
         * @return {boolean}
         */
        isStarted: function() {
            return this.started;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} moduleName
         * @param {Object} moduleConfig
         * @return {BuildModule}
         */
        enableModule: function(moduleName, moduleConfig) {
            if (this.moduleNameToBuildModuleMap.containsKey(moduleName)) {
                var buildModule = this.moduleNameToBuildModuleMap.get(moduleName);
                if (!buildModule.isEnabled()) {
                    console.log("Enabling module '" + moduleName + "'");
                    this.numberEnabledModules++;
                    buildModule.setParentPropagator(this);
                    buildModule.enable(this, moduleConfig);
                }

                // NOTE BRN: It's very possible that a module might try to be enabled multiple times. Thus, we don't throw an
                // error here since that's expected behavior.

                return buildModule;
            } else {
                throw new Bug("IllegalState", {}, "Build module by the name of '" + moduleName + "' does not exist");
            }
        },

        /**
         * @return {Array<BuildTarget>}
         */
        getDefaultTargets: function() {
            var defaultTargetArray = [];
            this.buildTargetSet.forEach(function(buildTarget) {
                if (buildTarget.isDefault()) {
                    defaultTargetArray.push(buildTarget);
                }
            });
            return defaultTargetArray;
        },

        /**
         * @param {string} targetName
         * @return {BuildTarget}
         */
        getTarget: function(targetName) {
            return this.targetNameToBuildTargetMap.get(targetName);
        },

        /**
         * @param {string} taskName
         * @return {BuildTask}
         */
        getTask: function(taskName) {
            return this.taskNameToBuildTaskMap.get(taskName);
        },

        /**
         * @param {string} taskName
         * @return {boolean}
         */
        hasTask: function(taskName) {
            return this.taskNameToBuildTaskMap.containsKey(taskName);
        },

        /**
         * @param {string} moduleName
         * @param {BuildModule} buildModule
         */
        registerModule: function(moduleName, buildModule) {
            if (!Class.doesExtend(buildModule, BuildModule)) {
                throw new Bug("IllegalArgument", {}, "Build modules must extend the BuildModule class");
            }
            if (!this.moduleNameToBuildModuleMap.containsKey(moduleName)) {
                if (!this.buildModuleSet.contains(buildModule)) {
                    console.log("Registering build module '" + moduleName + "'");
                    this.moduleNameToBuildModuleMap.put(moduleName, buildModule);
                    this.buildModuleSet.add(buildModule);
                } else {
                    throw new Bug("IllegalState", {}, "Each build module can only be registered once");
                }
            } else {
                throw new Bug("IllegalState", {}, "Build module by the name of '" + moduleName + "' already exists");
            }
        },

        /**
         * @param {BuildScript} buildScript
         */
        registerScript: function(buildScript) {
            if (!Class.doesExtend(buildScript, BuildScript)) {
                throw new Bug("IllegalArgument", {}, "Build scripts must extend the BuildScript class");
            }
            if (!this.buildScriptSet.contains(buildScript)) {
                buildScript.setBuildProject(this);
                this.buildScriptSet.add(buildScript);
            } else {
                throw new Bug("IllegalState", {}, "Each build script can only be registered once");
            }
        },

        /**
         * @param {BuildTarget} buildTarget
         */
        registerTarget: function(buildTarget) {
            if (!Class.doesExtend(buildTarget, BuildTarget)) {
                throw new Bug("IllegalArgument", {}, "Build targets must extend the BuildTarget class");
            }
            if (!this.targetNameToBuildTargetMap.containsKey(buildTarget.getName())) {
                if (!this.buildTargetSet.contains(buildTarget)) {
                    console.log("Registering build target '" + buildTarget.getName() + "'");
                    this.targetNameToBuildTargetMap.put(buildTarget.getName(), buildTarget);
                    this.buildTargetSet.add(buildTarget);
                } else {
                    throw new Bug("IllegalState", {}, "Each build target can only be registered once");
                }
            } else {
                throw new Bug("IllegalState", {}, "Target by the name of '" + buildTarget.getName() + "' already exists");
            }
        },

        /**
         * @param {BuildTask} buildTask
         */
        registerTask: function(buildTask) {
            if (!Class.doesExtend(buildTask, BuildTask)) {
                throw new Bug("IllegalArgument", {}, "Build tasks must extend the BuildTask class");
            }
            if (!this.taskNameToBuildTaskMap.containsKey(buildTask.getTaskName())) {
                if (!this.buildTaskSet.contains(buildTask)) {
                    console.log("Registering build task '" + buildTask.getTaskName() + "'");
                    this.taskNameToBuildTaskMap.put(buildTask.getTaskName(), buildTask);
                    this.buildTaskSet.add(buildTask);
                } else {
                    throw new Bug("IllegalState", {}, "Each build task can only be registered once");
                }
            } else {
                throw new Bug("IllegalState", {}, "Task by the name of '" + buildTask.getTaskName() + "' already exists");
            }
        },

        /**
         * @param {{
         *      targetNames: Array.<string>=,
         *      debug: boolean=
         * }} buildOptions
         * @param {function(Throwable=)} callback
         */
        startBuild: function(buildOptions, callback) {
            var _this = this;
            if (!this.isStarted()) {
                this.started = true;
                $series([
                    $task(function(flow) {
                        _this.initializeBuild(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        _this.executeBuild(buildOptions, function(throwable) {
                            flow.complete(throwable);
                        });
                    })
                ]).execute(callback);
            } else {
                callback(new Bug("IllegalState", {}, "Build already started"));
            }
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {{
         *      targetNames: Array.<string>=,
         *      debug: boolean=
         * }} buildOptions
         * @param {function(Throwable=)} callback
         */
        executeBuild: function(buildOptions, callback) {
            console.log("Executing build");
            var _this           = this;
            var targetNames      = buildOptions.targetNames || [];
            var debug           = TypeUtil.isBoolean(buildOptions.debug) ? buildOptions.debug : false;
            var error           = null;
            var targetArray     = [];
            if (targetNames.length > 0) {
                targetNames.forEach(function(targetName) {
                var specifiedTarget = _this.getTarget(targetName);
                    if (specifiedTarget) {
                        targetArray.push(specifiedTarget);
                    } else {
                        error = new Bug("IllegalState", {}, "No target found by the name '" + targetName + "'");
                    }
                })
            } else {
                targetArray = this.getDefaultTargets();
            }

            if (!error) {
                if (targetArray.length > 0) {
                    $series([
                        $task(function(flow) {
                            _this.executeTargets(targetArray, function(throwable) {
                                flow.complete(throwable);
                            });
                        }),
                        $task(function(flow) {
                            _this.deinitializeBuildModules(function(throwable) {
                                flow.complete(throwable);
                            });
                        })
                    ]).execute(callback);
                } else {
                    callback(new Bug("IllegalState", {}, "No build target specified and no default targets found."));
                }
            } else {
                callback(error);
            }
        },

        /**
         * @protected
         * @param callback
         */
        initializeBuild: function(callback) {
            console.log("Initializing build");
            var _this = this;
            $series([
                $task(function(flow) {
                    _this.initializeBuildModules(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.initializeBuildScripts(function(throwable) {
                        flow.complete(throwable);
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
        deinitializeBuildModules: function(callback) {
            $iterableParallel(this.buildModuleSet, function(flow, buildModule) {
                if (buildModule.isEnabled()) {
                    if (buildModule.isDeinitialized()) {
                        flow.complete();
                    } else {
                        buildModule.addEventListener(BuildModule.EventTypes.MODULE_DEINITIALIZED, function (event) {
                            flow.complete();
                        });
                        if (!buildModule.isDeinitialized()) {
                            buildModule.deinitialize();
                        }
                    }
                } else {
                    flow.complete();
                }
            }).execute(callback);
        },

        /**
         * @private
         * @param {Array<BuildTarget>} targetArray
         * @param {function(Throwable=)} callback
         */
        executeTargets: function(targetArray, callback) {
            var _this = this;
            $forEachSeries(targetArray, function(flow, target) {
                target.execute(_this, function(error) {
                    flow.complete(error);
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        initializeBuildModules: function(callback) {
            $iterableParallel(this.buildModuleSet, function(flow, buildModule) {
                if (buildModule.isEnabled()) {
                    if (buildModule.isInitialized()) {
                        flow.complete();
                    } else {
                        buildModule.addEventListener(BuildModule.EventTypes.MODULE_INITIALIZED, function(event) {
                            flow.complete();
                        });
                        if (!buildModule.isInitializing()) {
                            buildModule.initialize();
                        }
                    }
                } else {
                    flow.complete();
                }
            }).execute(callback);
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        initializeBuildScripts: function(callback) {
            $iterableParallel(this.buildScriptSet, function(flow, buildScript) {
                $series([
                    $task(function(flow) {
                        buildScript.setupScript(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        buildScript.runScript();
                        flow.complete();
                    })
                ]).execute(function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildProject', BuildProject);
});
