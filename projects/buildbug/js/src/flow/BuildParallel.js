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

//@Export('buildbug.BuildParallel')

//@Require('Class')
//@Require('bugflow.Parallel')
//@Require('buildbug.BuildFlow')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------


    var Class       = bugpack.require('Class');
    var Parallel    = bugpack.require('bugflow.Parallel');
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
