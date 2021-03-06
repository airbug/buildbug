/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildParallel')

//@Require('Class')
//@Require('Parallel')
//@Require('buildbug.BuildFlow')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------


    var Class       = bugpack.require('Class');
    var Parallel    = bugpack.require('Parallel');
    var BuildFlow   = bugpack.require('buildbug.BuildFlow');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildFlow}
     */
    var BuildParallel = Class.extend(BuildFlow, {

        _name: "buildbug.BuildParallel",


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
             * @type {Array.<BuildFlow>}
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
            return new Parallel(flowArray);
        }
    });


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildParallel', BuildParallel);
});
