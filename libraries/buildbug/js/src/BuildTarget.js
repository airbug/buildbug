/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildTarget')

//@Require('Class')
//@Require('Flow')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Flow    = bugpack.require('Flow');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildTarget = Class.extend(Obj, {

        _name: "buildbug.BuildTarget",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} name
         */
        _constructor: function(name) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BuildFlow}
             */
            this.buildTargetFlow    = null;

            /**
             * @private
             * @type {string}
             */
            this.name               = name;

            /**
             * @private
             * @type {boolean}
             */
            this._default           = false;
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
        // Public Methods
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
         * @param {function(Error)} callback
         */
        execute: function(buildProject, callback) {
            var _this = this;
            if (this.buildTargetFlow) {
                console.log("Executing target " + this.name);
                var flow = this.buildTargetFlow.generateFlow(buildProject);
                flow.execute([buildProject], function(error) {
                    if (error) {
                        console.log("An error occurred while executing target '" + _this.name + "'");
                    } else {
                        console.log("Completed target " + _this.name);
                    }
                    callback(error);
                });
            } else {
                callback(new Error("You must specify a buildFlow for each build target. Do this by calling the buildFlow " +
                    "method and passing in a BuildFlow"));
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
});
