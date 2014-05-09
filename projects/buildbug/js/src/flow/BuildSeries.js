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

//@Export('buildbug.BuildSeries')

//@Require('Class')
//@Require('bugflow.Series')
//@Require('buildbug.BuildFlow')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Series          = bugpack.require('bugflow.Series');
    var BuildFlow       = bugpack.require('buildbug.BuildFlow');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildFlow}
     */
    var BuildSeries = Class.extend(BuildFlow, {

        _name: "buildbug.BuildSeries",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Array.<BuildFlow>} buildFlowArray
         */
        _constructor: function(buildFlowArray) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {*}
             */
            this.buildFlowArray = buildFlowArray;
        },


        //-------------------------------------------------------------------------------
        // BuildFlow Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {BuildProject} buildProject
         * @return {Flow}
         */
        generateFlow: function(buildProject) {
            var flowArray = [];
            this.buildFlowArray.forEach(function(buildFlow) {
                flowArray.push(buildFlow.generateFlow(buildProject));
            });
            return new Series(flowArray);
        }
    });


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildSeries', BuildSeries);
});
