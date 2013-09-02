//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('LintbugModule')
//@Autoload

//@Require('Class')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();
var fs                      = require('fs');
var npm                     = require('npm');
var lintbug                 = require('lintbug');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
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

var LintbugModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Lintbug}
         */
        this.lintbug = lintbug;
    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    runLintTasks: function(buildProject, properties, callback) {
        var targetPath  = properties.getProperty("targetPath");
        var ignores     = properties.getProperty("ignores");
        var lintTasks   = properties.getProperty("lintTasks");
        this.lintbug.lint(targetPath, ignores, lintTasks, callback);
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
