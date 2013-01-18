//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('TargetTask')

//@Require('Class')
//@Require('JsonUtil')
//@Require('bugflow.Task')
//@Require('buildbug.BuildFlow')
//@Require('buildbug.ExecuteTarget');

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =         bugpack.require('Class');
var JsonUtil =      bugpack.require('JsonUtil');
var Task =          bugpack.require('bugflow.Task');
var BuildFlow =     bugpack.require('buildbug.BuildFlow');
var ExecuteTarget = bugpack.require('buildbug.ExecuteTarget');


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

bugpack.export('buildbug.TargetTask', TargetTask);
