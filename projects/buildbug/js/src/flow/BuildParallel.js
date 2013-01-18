//-------------------------------------------------------------------------------
// Dependencies
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildParallel')

//@Require('Class')
//@Require('bugflow.Parallel')
//@Require('buildbug.BuildFlow')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------


var Class = bugpack.require('Class');
var Parallel = bugpack.require('bugflow.Parallel');
var BuildFlow = bugpack.require('buildbug.BuildFlow');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildParallel = Class.extend(BuildFlow, {

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
        return new Parallel(flowArray);
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildParallel', BuildParallel);
