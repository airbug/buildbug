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

//@Export('buildbug.BugUnitModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('bugmeta.BugMeta')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var bugunit                     = require('bugunit');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                       = bugpack.require('Class');
    var TypeUtil                    = bugpack.require('TypeUtil');
    var BugMeta                     = bugpack.require('bugmeta.BugMeta');
    var BugFs                       = bugpack.require('bugfs.BugFs');
    var Path                        = bugpack.require('bugfs.Path');
    var BuildBug                    = bugpack.require('buildbug.BuildBug');
    var BuildModule                 = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag       = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta                     = BugMeta.context();
    var buildModule                 = BuildModuleTag.buildModule;
    var buildTask                   = BuildBug.buildTask;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var BugUnitModule = Class.extend(BuildModule, {

        _name: "buildbug.BugUnitModule",


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('startNodeModuleTests', this.startNodeModuleTestsTask, this);
        },

        /**
         * @protected
         * @return {boolean}
         */
        initializeModule: function() {
            this._super();
            return true;
        },


        //-------------------------------------------------------------------------------
        // Build Task Methods
        //-------------------------------------------------------------------------------

        /**
         * Available Properties
         * {
         *      modulePath: (string|Path)
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        startNodeModuleTestsTask: function(buildProject, taskProperties, callback) {
            var modulePath          = taskProperties.getProperty("modulePath");
            var checkCoverage       = taskProperties.getProperty("checkCoverage") || false;
            var modulePathString    = modulePath;

            if (Class.doesExtend(modulePath, Path)) {
                modulePathString = modulePath.getAbsolutePath();
            } else if (!TypeUtil.isString(modulePathString)) {
                callback(new Error("modulePath must be a Path or a string"));
            }
            var options = {
                checkCoverage: checkCoverage
            };
            bugunit.start(modulePathString, options, callback);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(BugUnitModule).with(
        buildModule("bugunit")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("buildbug.BugUnitModule", BugUnitModule);
});
