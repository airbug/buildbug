//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildProject')

//@Require('BuildModule')
//@Require('BuildTask')
//@Require('Class')
//@Require('EventDispatcher')
//@Require('JsonUtil')
//@Require('Map')
//@Require('Set')


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
         * @type {string}
         */
        this.homePath = process.cwd() + "/.buildbug";

        /**
         * @private
         * @type {Set<Class>}
         */
        this.buildModuleClassSet = new Set();

        /**
         * @private
         * @type {Map<Class, BuildModule>}
         */
        this.buildModuleClassToEnabledBuildModuleMap = new Map();

        /**
         * @private
         * @type {BuildTask}
         */
        this.defaultTask = null;

        /**
         * @private
         * @type {Set<Class>}
         */
        this.enabledBuildModuleClassSet = new Set();

        /**
         * @private
         * @type {Map<string, Class>}
         */
        this.moduleNameToBuildModuleClassMap = new Map();

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
         * @type {BuildTask}
         */
        this.targetTask = null;

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
     * @return {BuildTask}
     */
    getDefaultTask: function() {
        return this.defaultTask;
    },

    /**
     * @param {BuildTask} buildTask
     */
    setDefaultTask: function(buildTask) {
        this.defaultTask = buildTask;
    },

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
     * @return {BuildTask}
     */
    getTargetTask: function() {
        return this.targetTask;
    },

    /**
     * @param {BuildTask} targetTask
     */
    setTargetTask: function(targetTask) {
        this.targetTask = targetTask;
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
     * @param {BuildTask} buildTask
     */
    addTask: function(buildTask) {
        this.taskNameToBuildTaskMap.put(buildTask.getName(), buildTask);
    },

    /**
     * @param {string} taskName
     * @return {BuildTask}
     */
    getTask: function(taskName) {
        return this.taskNameToBuildTaskMap.get(taskName);
    },

    /**
     * @param {Class} buildModuleClass
     */
    registerModule: function(moduleName, buildModuleClass) {
        if (!this.moduleNameToBuildModuleClassMap.containsKey(moduleName)) {
            if (!this.buildModuleClassSet.contains(buildModuleClass)) {
                this.moduleNameToBuildModuleClassMap.put(moduleName, buildModuleClass);
                this.buildModuleClassSet.add(buildModuleClass);
            } else {
                throw new Error("Each build module can only be registered once");
            }
        } else {
            throw new Error("Build module by the name of '" + moduleName + "' already exists");
        }
    },

    /**
     * @param {string} moduleName
     * @return {BuildModule}
     */
    enableModule: function(moduleName) {
        if (this.moduleNameToBuildModuleClassMap.containsKey(moduleName)) {
            var buildModuleClass = this.moduleNameToBuildModuleClassMap.get(moduleName);
            if (!this.enabledBuildModuleClassSet.contains(buildModuleClass)) {
                this.enabledBuildModuleClassSet.add(buildModuleClass);
                var buildModule = new buildModuleClass();
                if (!Class.doesExtend(buildModule, BuildModule)) {
                    throw new Error("Build modules must extend the BuildModule class");
                }
                this.buildModuleClassToEnabledBuildModuleMap.put(buildModuleClass, buildModule);
                buildModule.setParentDispatcher(this);
                buildModule.enableModule(this);
                buildModule.initializeModule();
            }

            // NOTE BRN: It's very possible that a module might try to be enabled multiple times. Thus, we don't throw an
            // error here since that's expected behavior.

            return this.buildModuleClassToEnabledBuildModuleMap.get(buildModuleClass);
        } else {
            throw new Error("Build module by the name of '" + moduleName + "' does not exist");
        }
    },

    /**
     *
     */
    startBuild: function() {
        if (!this.isStarted()) {
            this.started = true;
            var _this = this;
            this.buildModuleClassToEnabledBuildModuleMap.forEach(function(buildModule) {
                if (buildModule.isInitialized()) {
                    _this.numberInitializedModules++;
                } else {
                    buildModule.addEventListener(BuildModule.EventTypes.MODULE_INITIALIZED, function(event) {
                        _this.numberInitializedModules++;
                    });
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

    /**
     * @param {Object} properties
     */
    updateProperties: function(properties) {
        JsonUtil.merge(properties, this.properties);
    },


    //-------------------------------------------------------------------------------
    // Protected Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    checkModulesReady: function() {
        if (this.numberInitializedModules === this.buildModuleClassToEnabledBuildModuleMap.getCount()) {
            return true;
        }
        return false;
    },

    /**
     * @private
     */
    executeBuild: function() {
        var firstTask = this.targetTask ? this.targetTask : this.defaultTask;
        if (firstTask) {
            this.executeTask(firstTask);
        } else {
            throw new Error("No build task specified for execution.");
        }
    },

    /**
     * @private
     * @param {BuildTask} buildTask
     */
    executeTask: function(buildTask) {

        // TODO BRN: This check doesn't seem quite right. This would prevent a task from being able to be run more than once
        // which would be problematic if you were, for instance, wanting to run more than one compile.

        if (!buildTask.hasExecuted()) {
            var _this = this;
            var dependentTaskNames = buildTask.getDependentTaskNames();
            dependentTaskNames.forEach(function(dependentTaskName) {
                var dependentTask = this.getTask(dependentTaskName);
                _this.executeTask(dependentTask);
            });
            buildTask.execute(this.getTaskExecutionContext());
        }
    },

    /**
     * @private
     * @return {Object}
     */
    getTaskExecutionContext: function() {

        //TODO BRN: This could be sped up if we cached this method

        var taskExecutionContext = {};
        var _this = this;

        //TEST
        console.log("getTaskExecutionContext - this.moduleNameToBuildModuleClassMap.getCount():" + this.moduleNameToBuildModuleClassMap.getCount());

        this.moduleNameToBuildModuleClassMap.getKeyArray().forEach(function(moduleName) {

            //TEST
            console.log("moduleName:" + moduleName);

            var buildModuleClass = _this.moduleNameToBuildModuleClassMap.get(moduleName);
            var buildModule = _this.buildModuleClassToEnabledBuildModuleMap.get(buildModuleClass);
            if (buildModule.isEnabled()) {
                taskExecutionContext[moduleName] = buildModule;
            }
        });

        //TEST
        console.log(taskExecutionContext);

        return taskExecutionContext;
    }
});
