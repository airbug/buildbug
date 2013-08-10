//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ExecuteTarget')

//@Require('Class')
//@Require('bugflow.Task')
//@Require('buildbug.BuildFlow')
//@Require('buildbug.BuildProperties')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Task            = bugpack.require('bugflow.Task');
var BuildFlow       = bugpack.require('buildbug.BuildFlow');
var BuildProperties = bugpack.require('buildbug.BuildProperties');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ExecuteTarget = Class.extend(Task, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(buildTask, taskProperties, taskInitMethod) {

        this._super(buildTask.getTaskMethod(), buildTask.getTaskContext());


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @prvate
         * @type {BuildTask}
         */
        this.buildTask = buildTask;

        /**
         * @private
         * @type {function()}
         */
        this.taskInitMethod = taskInitMethod;

        /**
         * @private
         * @type {BuildProperties}
         */
        this.taskProperties = taskProperties || new BuildProperties({});
    },


    //-------------------------------------------------------------------------------
    // Flow Extensions
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    completeFlow: function() {
        console.log("Completed task '" + this.buildTask.getTaskName() + "'");
        this._super();
    },

    /**
     * @param {Array<*>} args
     */
    executeFlow: function(args) {
        console.log("Running task '" + this.buildTask.getTaskName() + "'");
        var buildProject = args[0];
        if (this.taskInitMethod) {
            this.taskInitMethod(this, buildProject, this.taskProperties);
        }
        var finalProperties = this.generateProperties(buildProject);
        this.executeTargetTask(buildProject, finalProperties);
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Object} propertiesObject
     */
    updateProperties: function(propertiesObject) {
        this.taskProperties.updateProperties(propertiesObject);
        return this;
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {BuildProject} buildProject
     * @param {BuildProperties} finalProperties
     */
    executeTargetTask: function(buildProject, finalProperties) {
        var _this = this;
        this.taskMethod.call(this.taskContext, buildProject, finalProperties, function(error) {
            _this.complete(error);
        });
    },

    /**
     * @private
     * @param {BuildProject} buildProject
     * @return {BuildProperties}
     */
    generateProperties: function(buildProject) {
        var projectProperties = buildProject.getProperties();
        var finalProperties = new BuildProperties({});
        finalProperties.merge([this.taskProperties, projectProperties]);
        return finalProperties;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ExecuteTarget', ExecuteTarget);
