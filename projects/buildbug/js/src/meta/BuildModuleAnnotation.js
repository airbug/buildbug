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

//@Export('buildbug.BuildModuleAnnotation')

//@Require('Class')
//@Require('bugmeta.Annotation')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Annotation      = bugpack.require('bugmeta.Annotation');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Annotation}
     */
    var BuildModuleAnnotation = Class.extend(Annotation, {

        _name: "buildbug.BuildModuleAnnotation",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} buildModuleName
         */
        _constructor: function(buildModuleName) {

            this._super(BuildModuleAnnotation.TYPE);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {string}
             */
            this.buildModuleName = buildModuleName;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getName: function() {
            return this.buildModuleName;
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @const {string}
     */
    BuildModuleAnnotation.TYPE = "BuildModule";


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @param {string} buildModuleName
     * @return {BuildModuleAnnotation}
     */
    BuildModuleAnnotation.buildModule = function(buildModuleName) {
        return new BuildModuleAnnotation(buildModuleName);
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleAnnotation', BuildModuleAnnotation);
});
