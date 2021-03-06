/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.ExecuteTarget')

//@Require('Class')
//@Require('Task')
//@Require('buildbug.BuildFlow')
//@Require('buildbug.BuildProperties')
//@Require('buildbug.BuildPropertiesChain')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Task                    = bugpack.require('Task');
    var BuildFlow               = bugpack.require('buildbug.BuildFlow');
    var BuildProperties         = bugpack.require('buildbug.BuildProperties');
    var BuildPropertiesChain    = bugpack.require('buildbug.BuildPropertiesChain');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Task}
     */
    var ExecuteTarget = Class.extend(Task, {

        _name: "buildbug.ExecuteTarget",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {BuildTask} buildTask
         * @param {BuildProperties} taskProperties
         * @param {function()} taskInitMethod
         */
        _constructor: function(buildTask, taskProperties, taskInitMethod) {

            this._super(buildTask.getTaskMethod(), buildTask.getTaskContext());


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @prvate
             * @type {BuildTask}
             */
            this.buildTask          = buildTask;

            /**
             * @private
             * @type {function(Task, BuildProject, BuildProperties)}
             */
            this.taskInitMethod     = taskInitMethod;

            /**
             * @private
             * @type {BuildProperties}
             */
            this.taskProperties     = taskProperties || new BuildProperties({});
        },


        //-------------------------------------------------------------------------------
        // Flow Methods
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
            var propertiesChain = this.generateBuildPropertiesChain(buildProject);
            this.executeTargetTask(buildProject, propertiesChain);
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Object} propertiesObject
         */
        updateProperties: function(propertiesObject) {
            this.taskProperties.updateProperties(propertiesObject);
            return this;
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {BuildProject} buildProject
         * @param {PropertiesChain} taskProperties
         */
        executeTargetTask: function(buildProject, taskProperties) {
            var _this = this;
            this.getTaskMethod().call(this.getTaskContext(), buildProject, taskProperties, function(error) {
                _this.complete(error);
            });
        },

        /**
         * @private
         * @param {BuildProject} buildProject
         * @return {BuildPropertiesChain}
         */
        generateBuildPropertiesChain: function(buildProject) {
            return new BuildPropertiesChain([this.taskProperties, buildProject.getProperties()]);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.ExecuteTarget', ExecuteTarget);
});
