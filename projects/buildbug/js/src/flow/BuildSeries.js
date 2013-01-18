//-------------------------------------------------------------------------------
// Dependencies
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildSeries')

//@Require('Class')
//@Require('bugflow.Series')
//@Require('buildbug.BuildFlow')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Series = bugpack.require('bugflow.Series');
var BuildFlow = bugpack.require('buildbug.BuildFlow');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildSeries = Class.extend(BuildFlow, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(buildFlowArray) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {*}
         */
        this.buildFlowArray = buildFlowArray;
    },


    //-------------------------------------------------------------------------------
    // BuildFlow Extensions
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
