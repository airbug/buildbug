/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildSeries')

//@Require('Class')
//@Require('Series')
//@Require('buildbug.BuildFlow')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Series      = bugpack.require('Series');
    var BuildFlow   = bugpack.require('buildbug.BuildFlow');


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
