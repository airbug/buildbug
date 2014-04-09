//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildScript')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();
var child_process       = require('child_process');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Bug                 = bugpack.require('Bug');
var Class               = bugpack.require('Class');
var Exception           = bugpack.require('Exception');
var Obj                 = bugpack.require('Obj');
var TypeUtil            = bugpack.require('TypeUtil');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $forEachParallel    = BugFlow.$forEachParallel;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var BuildScript = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {{
     *      dependencies: Array.<string>,
     *      script: (function() | string)
     * }} scriptObject
     */
    _constructor: function(scriptObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {BuildProject}
         */
        this.buildProject   = null;

        /**
         * @private
         * @type {Array.<string>}
         */
        this.dependencies   = scriptObject.dependencies;

        /**
         * @private
         * @type {(function() | string)}
         */
        this.script         = scriptObject.script;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {BuildProject}
     */
    getBuildProject: function() {
        return this.buildProject;
    },

    /**
     * @param {BuildProject} buildProject
     */
    setBuildProject: function(buildProject) {
        this.buildProject = buildProject;
    },

    /**
     * @return {Array.<string>}
     */
    getDependencies: function() {
        return this.dependencies;
    },

    /**
     * @return {(function() | string)}
     */
    getScript: function() {
        return this.script
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    runScript: function() {
        if (TypeUtil.isString(this.script)) {
            var scriptPath = BugFs.path(this.script);
            if (!scriptPath.isGivenPathAbsolute()) {
                scriptPath = BugFs.joinPaths([this.buildProject.getTargetPath(), scriptPath]);
            }
            require(scriptPath.getAbsolutePath());
        } else if (TypeUtil.isFunction(this.script)) {
            this.script();
        } else {
            throw new Bug("IllegalState", {}, "script property has not been set for buildScript");
        }
    },

    /**
     * @param {function(Throwable=)} callback
     */
    setupScript: function(callback) {
        var _this = this;
        $forEachParallel(this.dependencies, function(flow, dependency) {
            child_process.exec('npm install ' + dependency, {cwd: _this.buildProject.getTargetPath().getAbsolutePath(), env: process.env}, function (error, stdout, stderr) {
                if (!error) {
                    flow.complete();
                } else {
                    flow.error(new Exception("BuildError", {}, "Error occurred while linking buildbug module", [error]));
                }
            });
        }).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildScript', BuildScript);
