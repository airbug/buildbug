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

//@Export('buildbug.BuildModuleTagProcessor')

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

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');
    var Set     = bugpack.require('Set');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildModuleTagProcessor = Class.extend(Obj, {

        _name: "buildbug.BuildModuleTagProcessor",


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
             * @type {Set.<BuildModuleTag>}
             */
            this.processedBuildModuleTagSet  = new Set();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @override
         * @param {BuildModuleTag} buildModuleTag
         */
        process: function(buildModuleTag) {
            this.processBuildModuleTag(buildModuleTag);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {BuildModuleTag} buildModuleTag
         */
        processBuildModuleTag: function(buildModuleTag) {
            if (!this.processedBuildModuleTagSet.contains(buildModuleTag)) {
                var buildModuleConstructor  = buildModuleTag.getTagReference();
                var buildModuleName         = buildModuleTag.getName();
                var buildModule             = /** @type {BuildModule} */(new buildModuleConstructor());
                this.buildProject.registerModule(buildModuleName, buildModule);
                this.processedBuildModuleTagSet.add(buildModuleTag);
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleTagProcessor', BuildModuleTagProcessor);
});
