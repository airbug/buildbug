//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ExecuteTarget')

//@Require('Class')
//@Require('JsonUtil')
//@Require('bugflow.Task')
//@Require(''buildbug.BuildFlow')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var JsonUtil = bugpack.require('JsonUtil');
var Task = bugpack.require('bugflow.Task');
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
         * @type {Object}
         */
        this.taskProperties = taskProperties || {};
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
     * @param {Object} properties
     */
    updateProperties: function(properties) {
        JsonUtil.munge(properties, this.taskProperties);
        return this;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ExecuteTarget', ExecuteTarget);
