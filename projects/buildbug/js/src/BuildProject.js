//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildProject')

//@Require('Class')
//@Require('EventDispatcher')
//@Require('Map')
//@Require('Properties')
//@Require('Set')
//@Require('bugflow.BugFlow')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildTarget')
//@Require('buildbug.BuildTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var EventDispatcher =   bugpack.require('EventDispatcher');
var Map =               bugpack.require('Map');
var Properties =        bugpack.require('Properties');
var Set =               bugpack.require('Set');
var BugFlow =           bugpack.require('bugflow.BugFlow');
var BuildModule =       bugpack.require('buildbug.BuildModule');
var BuildTarget =       bugpack.require('buildbug.BuildTarget');
var BuildTask =         bugpack.require('buildbug.BuildTask');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachParallel = BugFlow.$foreachParallel;


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
         * @type {Properties}
         */
        this.properties = new Properties({
            buildPath: this.homePath + "/build",
            distPath: this.homePath + "/dist"
        });

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
     * @return {Properties}
     */
    getProperties: function() {
        return this.properties;
    },

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
                buildModule.setParentPropagator(this);
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
        if (!this.taskNameToBuildTaskMap.containsKey(buildTask.getTaskName())) {
            if (!this.buildTaskSet.contains(buildTask)) {
                console.log("Registering build task '" + buildTask.getTaskName() + "'");
                this.taskNameToBuildTaskMap.put(buildTask.getTaskName(), buildTask);
                this.buildTaskSet.add(buildTask);
            } else {
                throw new Error("Each build task can only be registered once");
            }
        } else {
            throw new Error("Task by the name of '" + buildTask.getTaskName() + "' already exists");
        }
    },

    /**
     * @param {string} targetName
     * @param {function(Error)} callback
     */
    startBuild: function(targetName, callback) {
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
                this.executeBuild(targetName, callback);
            } else {
                this.addEventListener(BuildModule.EventTypes.MODULE_INITIALIZED, function(event) {
                    if (_this.checkModulesReady()) {
                        _this.executeBuild(targetName, callback);
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
     * @param {string} targetName
     * @param {function(Error)} callback
     */
    executeBuild: function(targetName, callback) {
        console.log("Starting build");
        var error = null;
        var targetArray = [];
        if (targetName) {
            var specifiedTarget = this.getTarget(targetName);
            if (specifiedTarget) {
                targetArray.push(specifiedTarget);
            } else {
                error = new Error("No target found by the name '" + targetName + "'");
            }
        } else {
            targetArray = this.getDefaultTargets();
        }

        if (!error) {
            if (targetArray.length > 0) {
                this.executeTargets(targetArray, callback);
            } else {
                callback(new Error("No build target specified and no default targets found."));
            }
        } else {
            callback(error);
        }
    },

    /**
     * @private
     * @param {Array<BuildTarget>} targetArray
     * @param {function(Error)} callback
     */
    executeTargets: function(targetArray, callback) {
        var _this = this;
        $foreachParallel(targetArray, function(flow, target) {
            target.execute(_this, function(error) {
                flow.complete(error);
            });
        }).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildProject', BuildProject);
