//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('TargetTask')

//@Require('Class')
//@Require('bugflow.Task')
//@Require('buildbug.BuildFlow')
//@Require('buildbug.BuildProperties')
//@Require('buildbug.ExecuteTarget')


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
var ExecuteTarget   = bugpack.require('buildbug.ExecuteTarget');


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

        proto = proto ? proto : {};

        /**
         * @private
         * @type {function()}
         */
        this.targetTaskInitMethod = proto.init;

        /**
         * @private
         * @type {string}
         */
        this.targetTaskName = targetTaskName;

        /**
         * @private
         * @type {BuildProperties}
         */
        this.targetTaskProperties = new BuildProperties(proto.properties ? proto.properties : {});
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
     * @param {Object} propertiesObject
     */
    updateProperties: function(propertiesObject) {
        this.targetTaskProperties.updateProperties(propertiesObject);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.TargetTask', TargetTask);
