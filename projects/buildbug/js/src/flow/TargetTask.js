//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('TargetTask')

//@Require('Class')
//@Require('List')
//@Require('Task')


var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('TargetTask');

var BuildFlow = bugpack.require('BuildFlow');
var Class = bugpack.require('Class');
var ExecuteTarget = bugpack.require('ExecuteTarget');
var JsonUtil = bugpack.require('JsonUtil');
var Task = bugpack.require('Task');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var TargetTask = Class.extend(BuildFlow, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(targetTaskName, proto) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {function()}
         */
        this.targetTaskInitMethod = proto ? proto.init : null;

        /**
         * @private
         * @type {string}
         */
        this.targetTaskName = targetTaskName;

        /**
         * @private
         * @type {Object}
         */
        this.targetTaskProperties = proto ? proto.properties : {};
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {BuildProject} buildProject
     * @return {ExecuteTarget}
     */
    generateFlow: function(buildProject) {
        if (buildProject.hasTask(this.targetTaskName)) {
            var buildTask = buildProject.getTask(this.targetTaskName);
            return new ExecuteTarget(buildTask, this.targetTaskProperties, this.targetTaskInitMethod);
        } else {
            throw new Error("Cannot find build task by the name of '" + this.targetTaskName + "'");
        }
    },

    /**
     * @param {Object} properties
     */
    updateProperties: function(properties) {
        JsonUtil.munge(properties, this.targetTaskProperties);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(TargetTask);
