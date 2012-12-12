//-------------------------------------------------------------------------------
// Dependencies
//-------------------------------------------------------------------------------

//@Export('BuildSeries')

//@Require('Class')
//@Require('Flow')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('BuildSeries');

var BuildFlow = bugpack.require('BuildFlow');
var Class = bugpack.require('Class');
var Series = bugpack.require('Series');


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

bugpack.export(BuildSeries);
