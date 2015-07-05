/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildTask')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildTask = Class.extend(Obj, {

        _name: "buildbug.BuildTask",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} taskName
         * @param {function()} taskMethod
         * @param {Object} taskContext
         */
        _constructor: function(taskName, taskMethod, taskContext) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Object}
             */
            this.taskContext = taskContext;

            /**
             * @private
             * @type {function()}
             */
            this.taskMethod = taskMethod;

            /**
             * @private
             * @type {string}
             */
            this.taskName = taskName;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Object}
         */
        getTaskContext: function() {
            return this.taskContext;
        },

        /**
         * @return {function()}
         */
        getTaskMethod: function() {
            return this.taskMethod;
        },

        /**
         * @return {string}
         */
        getTaskName: function() {
            return this.taskName;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildTask', BuildTask);
});
