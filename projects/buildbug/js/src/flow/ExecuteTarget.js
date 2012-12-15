//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('ExecuteTarget')

//@Require('Class')
//@Require('List')
//@Require('Task')


var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('ExecuteTarget');

var BuildFlow = bugpack.require('BuildFlow');
var Class = bugpack.require('Class');
var JsonUtil = bugpack.require('JsonUtil');
var Task = bugpack.require('Task');


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

bugpack.export(ExecuteTarget);
