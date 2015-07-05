/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BugJarModule')

//@Require('Class')
//@Require('bugmeta.BugMeta')
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

    var bugjar          = require('bugjar');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var BugMeta         = bugpack.require('bugmeta.BugMeta');
    var BuildBug        = bugpack.require('buildbug.BuildBug');
    var BuildModule     = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag  = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta         = BugMeta.context();
    var buildModule     = BuildModuleTag.buildModule;
    var buildTask       = BuildBug.buildTask;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var BugJarModule = Class.extend(BuildModule, {

        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('createBugJar', this.createBugJarTask, this);
            buildTask('deleteBugJar', this.deleteBugJarTask, this);
            buildTask('emptyBugJar', this.emptyBugJarTask, this);
            buildTask('fillBugJar', this.fillBugJarTask, this);
            buildTask('getBugJarFromShelf', this.getBugJarFromShelfTask, this);
            buildTask('putBugJarOnShelf', this.putBugJarOnShelfTask, this);
            buildTask('removeBugJarFromShelf', this.removeBugJarFromShelfTask, this);
            buildTask('createShelf', this.createShelfTask, this);
            buildTask('deleteShelf', this.deleteShelfTask, this);
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
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        createBugJarTask: function(buildProject, properties, callback) {
            var sourcePaths = properties.getProperty("sourcePaths");
            var bugjarJson = properties.getProperty("bugjarJson");
            var linkSources = properties.getProperty("linkSources");

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        deleteBugJarTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        emptyBugJarTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        fillBugJarTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        getBugJarFromShelfTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        putBugJarOnShelfTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        removeBugJarFromShelfTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        createShelfTask: function(buildProject, properties, callback) {

        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} properties
         * @param {function(Throwable=)} callback
         */
        deleteShelfTask: function(buildProject, properties, callback) {

        }

        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------


    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(BugJarModule).with(
        buildModule("bugjar")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BugJarModule', BugJarModule);
});
