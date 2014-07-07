/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.TargetTask')

//@Require('Class')
//@Require('bugflow.Task')
//@Require('buildbug.BuildFlow')
//@Require('buildbug.BuildProperties')
//@Require('buildbug.ExecuteTarget')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

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

    /**
     * @class
     * @extends {BuildFlow}
     */
    var TargetTask = Class.extend(BuildFlow, {

        _name: "buildbug.TargetTask",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} targetTaskName
         * @param {Object} proto
         */
        _constructor: function(targetTaskName, proto) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
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
        // Public Methods
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
});
