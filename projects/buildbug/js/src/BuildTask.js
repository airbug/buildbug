//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildTask')

//@Require('Class')
//@Require('List')
//@Require('Obj')


var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('BuildTask');

var Class = bugpack.require('Class');
var List = bugpack.require('List');
var Task = bugpack.require('Task');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildTask = Class.extend(Task, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(name, taskMethod, callback) {

        this._super(taskMethod, callback);


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.name = name;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getName: function() {
        return this.name;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Object} taskExecutionContext
     */
    execute: function(taskExecutionContext) {
        console.log("Executing task " + this.name);

        console.log("Completed task " + this.name);
    },

    /**
     * @param {string} taskName
     */
    dependsOn: function(taskName) {
        if (!this.dependentTaskNames.contains(taskName)) {
            this.dependentTaskNames.add(taskName);

            //TODO BRN: Validate that there are no circular dependencies.

        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(BuildTask);
