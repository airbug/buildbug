//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildProject')

//@Require('Class')
//@Require('EventDispatcher')
//@Require('JsonUtil')
//@Require('Map')
//@Require('Set')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildTarget')
//@Require('buildbug.BuildTask')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var EventDispatcher =   bugpack.require('EventDispatcher');
var JsonUtil =          bugpack.require('JsonUtil');
var Map =               bugpack.require('Map');
var Set =               bugpack.require('Set');
var BuildModule =       bugpack.require('buildbug.BuildModule');
var BuildTarget =       bugpack.require('buildbug.BuildTarget');
var BuildTask =         bugpack.require('buildbug.BuildTask');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildProject = Class.extend(EventDispatcher, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Set<BuildModule>}
         */
        this.buildModuleSet = new Set();

        /**
         * @private
         * @type {Set<BuildTarget>}
         */
        this.buildTargetSet = new Set();

        /**
         * @private
         * @type {Set<BuildTask>}
         */
        this.buildTaskSet = new Set();

        /**
         * @private
         * @type {string}
         */
        this.homePath = process.cwd() + "/.buildbug";

        /**
         * @private
         * @type {Map<string, BuildModule>}
         */
        this.moduleNameToBuildModuleMap = new Map();

        /**
         * @private
         * @type {number}
         */
        this.numberEnabledModules = 0;

        /**
         * @private
         * @type {number}
         */
        this.numberInitializedModules = 0;

        /**
         * @private
         * @type {Object}
         */
        this.properties = {
            buildPath: this.homePath + "/build",
            distPath: this.homePath + "/dist"
        };

        /**
         * @private
         * @type {boolean}
         */
        this.started = false;

        /**
         * @private
         * @type {Map<string, BuildTarget>}
         */
        this.targetNameToBuildTargetMap = new Map();

        /**
         * @private
         * @type {Map<string, BuildTask>}
         */
        this.taskNameToBuildTaskMap = new Map();
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
     * @return {string}
     */
    getProperties: function() {
        return this.properties;
    },

    /**
     * @param {Object} properties
     */
    updateProperties: function(properties) {
        JsonUtil.munge(properties, this.properties);
    },

    /**
     * @return {boolean}
     */
    isStarted: function() {
        return this.started;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} moduleName
     * @return {BuildModule}
     */
    enableModule: function(moduleName) {
        if (this.moduleNameToBuildModuleMap.containsKey(moduleName)) {
            var buildModule = this.moduleNameToBuildModuleMap.get(moduleName);
            if (!buildModule.isEnabled()) {
                console.log("Enabling module '" + moduleName + "'");
                this.numberEnabledModules++;
                buildModule.setParentDispatcher(this);
                buildModule.enable(this);
                buildModule.initialize();
            }

            // NOTE BRN: It's very possible that a module might try to be enabled multiple times. Thus, we don't throw an
            // error here since that's expected behavior.

            return buildModule;
        } else {
            throw new Error("Build module by the name of '" + moduleName + "' does not exist");
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
            throw new Error("Build modules must extend the BuildModule class");
        }
        if (!this.moduleNameToBuildModuleMap.containsKey(moduleName)) {
            if (!this.buildModuleSet.contains(buildModule)) {
                console.log("Registering build module '" + moduleName + "'");
                this.moduleNameToBuildModuleMap.put(moduleName, buildModule);
                this.buildModuleSet.add(buildModule);
            } else {
                throw new Error("Each build module can only be registered once");
            }
        } else {
            throw new Error("Build module by the name of '" + moduleName + "' already exists");
        }
    },

    /**
     * @param {BuildTarget} buildTarget
     */
    registerTarget: function(buildTarget) {
        if (!Class.doesExtend(buildTarget, BuildTarget)) {
            throw new Error("Build targets must extend the BuildTarget class");
        }
        if (!this.targetNameToBuildTargetMap.containsKey(buildTarget.getName())) {
            if (!this.buildTargetSet.contains(buildTarget)) {
                console.log("Registering build target '" + buildTarget.getName() + "'");
                this.targetNameToBuildTargetMap.put(buildTarget.getName(), buildTarget);
                this.buildTargetSet.add(buildTarget);
            } else {
                throw new Error("Each build target can only be registered once");
            }
        } else {
            throw new Error("Target by the name of '" + buildTarget.getName() + "' already exists");
        }
    },

    /**
     * @param {BuildTask} buildTask
     */
    registerTask: function(buildTask) {
        if (!Class.doesExtend(buildTask, BuildTask)) {
            throw new Error("Build tasks must extend the BuildTask class");
        }
        if (!this.taskNameToBuildTaskMap.containsKey(buildTask.getName())) {
            if (!this.buildTaskSet.contains(buildTask)) {
                console.log("Registering build task '" + buildTask.getName() + "'");
                this.taskNameToBuildTaskMap.put(buildTask.getName(), buildTask);
                this.buildTaskSet.add(buildTask);
            } else {
                throw new Error("Each build task can only be registered once");
            }
        } else {
            throw new Error("Task by the name of '" + buildTask.getName() + "' already exists");
        }
    },

    /**
     *
     */
    startBuild: function() {
        if (!this.isStarted()) {
            this.started = true;
            var _this = this;
            this.buildModuleSet.forEach(function(buildModule) {
                if (buildModule.isEnabled()) {
                    if (buildModule.isInitialized()) {
                        _this.numberInitializedModules++;
                    } else {
                        buildModule.addEventListener(BuildModule.EventTypes.MODULE_INITIALIZED, function(event) {
                            _this.numberInitializedModules++;
                        });
                    }
                }
            });
            if (this.checkModulesReady()) {
                this.executeBuild();
            } else {
                this.addEventListener(BuildModule.EventTypes.MODULE_INITIALIZED, function(event) {
                    if (_this.checkModulesReady()) {
                        _this.executeBuild();
                    }
                });
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Protected Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    checkModulesReady: function() {
        return (this.numberInitializedModules === this.numberEnabledModules);
    },

    /**
     * @private
     */
    executeBuild: function() {
        console.log("Starting build");
        var targetName = null;
        var targetArray = [];
        if (process.argv.length >= 2) {
            targetName = process.argv[2];
        }
        if (targetName) {
            var specifiedTarget = this.getTarget(targetName);
            if (specifiedTarget) {
                targetArray.push(specifiedTarget);
            } else {
                throw new Error("No target found by the name '" + targetName + "'");
            }
        } else {
            targetArray = this.getDefaultTargets();
        }

        if (targetArray.length > 0) {
            this.executeTargets(targetArray);
        } else {
            throw new Error("No build target specified and no default targets found.");
        }
    },

    /**
     * @private
     * @param {Array<BuildTarget>} targetArray
     */
    executeTargets: function(targetArray) {
        var _this = this;
        targetArray.forEach(function(target) {
            target.execute(_this);
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildProject', BuildProject);
