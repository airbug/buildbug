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

//@Export('buildbug.BuildModuleAnnotationProcessor')

//@Require('Class')
//@Require('Obj')
//@Require('Set')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Obj         = bugpack.require('Obj');
    var Set         = bugpack.require('Set');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildModuleAnnotationProcessor = Class.extend(Obj, {

        _name: "buildbug.BuildModuleAnnotationProcessor",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {BuildProject} buildProject
         */
        _constructor: function(buildProject) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BuildProject}
             */
            this.buildProject                       = buildProject;

            /**
             * @private
             * @type {Set.<BuildModuleAnnotation>}
             */
            this.processedBuildModuleAnnotationSet  = new Set();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @override
         * @param {BuildModuleAnnotation} buildModuleAnnotation
         */
        process: function(buildModuleAnnotation) {
            this.processBuildModuleAnnotation(buildModuleAnnotation);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {BuildModuleAnnotation} buildModuleAnnotation
         */
        processBuildModuleAnnotation: function(buildModuleAnnotation) {
            if (!this.processedBuildModuleAnnotationSet.contains(buildModuleAnnotation)) {
                var buildModuleConstructor  = buildModuleAnnotation.getAnnotationReference();
                var buildModuleName         = buildModuleAnnotation.getName();
                var buildModule             = /** @type {BuildModule} */(new buildModuleConstructor());
                this.buildProject.registerModule(buildModuleName, buildModule);
                this.processedBuildModuleAnnotationSet.add(buildModuleAnnotation);
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleAnnotationProcessor', BuildModuleAnnotationProcessor);
});
