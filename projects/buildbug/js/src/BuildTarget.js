//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildTarget')

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.Flow')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');
var Flow = bugpack.require('bugflow.Flow');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildTarget = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(name) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {BuildFlow}
         */
        this.buildTargetFlow = null;

        /**
         * @private
         * @type {string}
         */
        this.name = name;

        /**
         * @private
         * @type {boolean}
         */
        this._default = false;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @return {boolean}
     */
    isDefault: function() {
        return this._default;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {BuildFlow} buildTargetFlow
     * @return {BuildTarget}
     */
    buildFlow: function(buildTargetFlow) {
        this.buildTargetFlow = buildTargetFlow;
        return this;
    },

    /**
     * @param {BuildProject} buildProject
     */
    execute: function(buildProject) {
        var _this = this;
        if (this.buildTargetFlow) {
            console.log("Executing target " + this.name);
            var flow = this.buildTargetFlow.generateFlow(buildProject);
            flow.execute([buildProject], function(error) {

                //TODO BRN: Should we just exit the program here if there's an error or should we send this back up the chain further?

                if (error) {
                    console.log("An error occurred during the build.");
                    console.log(error);
                    console.log(error.stack);
                    process.exit(1);
                    return;
                } else {
                    console.log("Completed target " + _this.name);
                }
            });
        } else {
            throw new Error("You must specify a buildFlow for each build target. Do this by calling the buildFlow " +
                "method and passing in a BuildFlow");
        }
    },

    /**
     *
     */
    makeDefault: function() {
        this._default = true;
        return this;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildTarget', BuildTarget);
