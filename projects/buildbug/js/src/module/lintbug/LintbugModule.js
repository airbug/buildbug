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

//@Export('buildbug.LintbugModule')
//@Autoload

//@Require('Class')
//@Require('Exception')
//@Require('TypeUtil')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var fs                      = require('fs');
    var npm                     = require('npm');
    var lintbug                 = require('lintbug');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Exception               = bugpack.require('Exception');
    var TypeUtil                = bugpack.require('TypeUtil');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var BuildBug                = bugpack.require('buildbug.BuildBug');
    var BuildModule             = bugpack.require('buildbug.BuildModule');
    var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta                 = BugMeta.context();
    var buildModule             = BuildModuleAnnotation.buildModule;
    var buildTask               = BuildBug.buildTask;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var LintbugModule = Class.extend(BuildModule, {

        _name: "buildbug.LintbugModule",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Lintbug}
             */
            this.lintbug = lintbug;
        },


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('lint', this.runLintTasks, this);
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
         *   targetPath: (string | Path),
         *   ignores: Array.<string>,
         *   lintTasks: Array.<string>
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        runLintTasks: function(buildProject, taskProperties, callback) {
            var targetPaths = taskProperties.getProperty("targetPaths");
            var ignores     = taskProperties.getProperty("ignores");
            var lintTasks   = taskProperties.getProperty("lintTasks");

            if (TypeUtil.isArray(targetPaths) && targetPaths.length >= 1) {
                if (TypeUtil.isArray(lintTasks) && lintTasks.length >= 1) {
                    this.lintbug.lint(targetPaths, ignores, lintTasks, callback);
                } else {
                    callback(new Exception("IllegalProperties", {}, "task property 'lintTasks' must be an array and must not be empty."));
                }
            } else {
                callback(new Exception("IllegalProperties", {}, "task property 'targetPaths' must be an array and must not be empty. Instead found " + targetPaths));
            }
        },


        //-------------------------------------------------------------------------------
        // Class Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} taskName
         * @param {string} taskMethod
         * @return {LintTask}
         */
        lintTask: function(taskName, taskMethod) {
            return this.lintbug.lintTask(taskName, taskMethod);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.annotate(LintbugModule).with(
        buildModule("lintbug")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.LintbugModule', LintbugModule);
});
