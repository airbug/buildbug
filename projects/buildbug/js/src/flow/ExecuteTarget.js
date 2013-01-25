//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ExecuteTarget')

//@Require('Class')
//@Require('Properties')
//@Require('bugflow.Task')
//@Require('buildbug.BuildFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var Properties =  bugpack.require('Properties');
var Task =      bugpack.require('bugflow.Task');
var BuildFlow = bugpack.require('buildbug.BuildFlow');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ExecuteTarget = Class.extend(Task, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(buildTask, taskProperties, taskInitMethod) {

        this._super(buildTask.getTaskMethod());


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
         * @type {Properties}
         */
        this.taskProperties = taskProperties || new Properties({});
    },


    //-------------------------------------------------------------------------------
    // Flow Extensions
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    completeFlow: function() {
        console.log("Completed task '" + this.buildTask.getName() + "'");
        this._super();
    },

    /**
     * @param {Array<*>} args
     */
    executeFlow: function(args) {
        console.log("Running task '" + this.buildTask.getName()) + "'";
        if (this.taskInitMethod) {
            var buildProject = args[0];
            this.taskInitMethod(this, buildProject, this.taskProperties);
        }
        this._super([buildProject, this.taskProperties]);
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
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ExecuteTarget', ExecuteTarget);
