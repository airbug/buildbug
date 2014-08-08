/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BugPackModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('Tracer')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
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

    var bugpack_registry    = require('bugpack-registry');
    var path                = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Map                 = bugpack.require('Map');
    var Tracer              = bugpack.require('Tracer');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var Path                = bugpack.require('bugfs.Path');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var BuildBug            = bugpack.require('buildbug.BuildBug');
    var BuildModule         = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag      = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var buildModule         = BuildModuleTag.buildModule;
    var buildTask           = BuildBug.buildTask;
    var $traceWithError     = Tracer.$traceWithError;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var BugPackModule = Class.extend(BuildModule, {

        _name: "buildbug.BugPackModule",


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

            //TODO BRN: upgrade buildbug to use bugioc and inject this module instead of setting it like this
            /**
             * @private
             * @type {BugPackRegistryBuilder}
             */
            this.bugpackRegistryModule          = bugpack_registry;

            /**
             * @private
             * @type {Map.<string, BugPackRegistry>}
             */
            this.nameToBugPackRegistryMap       = new Map();
        },


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @return {boolean}
         */
        deinitializeModule: function() {
            this._super();
            var _this = this;
            this.bugpackRegistryModule.deinitialize(function(throwable) {
                if (!throwable) {
                    _this.deinitializeComplete();
                } else {
                    throw throwable;
                }
            });
            return false;
        },

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('generateBugPackRegistry', this.generateBugPackRegistryTask, this);
        },

        /**
         * @protected
         * @return {boolean}
         */
        initializeModule: function() {
            this._super();
            var _this = this;
            this.bugpackRegistryModule.initialize(function(throwable) {
                if (!throwable) {
                    _this.initializeComplete();
                } else {
                    throw throwable;
                }
            });
            return false;
        },


        //-------------------------------------------------------------------------------
        // Build Task Methods
        //-------------------------------------------------------------------------------

        /**
         * Available Properties
         * {
         *   sourceRoot: [string]
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        generateBugPackRegistryTask: function(buildProject, taskProperties, callback) {
            var sourceRoot      = taskProperties.getProperty("sourceRoot");
            var ignorePatterns  = taskProperties.getProperty("ignore");
            var name            = taskProperties.getProperty("name");
            this.generateBugPackRegistry(sourceRoot, ignorePatterns, name, callback);
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} name
         * @return {BugPackRegistry}
         */
        findBugPackRegistry: function(name) {
            return this.nameToBugPackRegistryMap.get(name);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {(string|Path)} sourceRoot
         * @param {Array.<(string | RegExp)>} ignorePatterns
         * @param {string} name
         * @param {function(Throwable=)} callback
         */
        generateBugPackRegistry: function(sourceRoot, ignorePatterns, name, callback) {
            var _this           = this;
            var sourceRootPath  = TypeUtil.isString(sourceRoot) ? new Path(sourceRoot) : sourceRoot;
            this.bugpackRegistryModule.buildRegistry(sourceRootPath.getAbsolutePath(), ignorePatterns, $traceWithError(function(error, bugPackRegistry) {
                if (!error) {
                    name = name || bugPackRegistry.getRegistryRootPath();
                    _this.nameToBugPackRegistryMap.put(name, bugPackRegistry);
                    _this.writeBugpackRegistryJson(sourceRootPath, bugPackRegistry, callback);
                } else {
                    callback(error);
                }
            }));
        },

        /**
         * @private
         * @param {Path} outputDirPath
         * @param {BugPackRegistry} bugpackRegistry
         * @param {function(Throwable=)} callback
         */
        writeBugpackRegistryJson: function(outputDirPath, bugpackRegistry, callback) {
            var bugpackRegistryPath = outputDirPath.getAbsolutePath() + path.sep + 'bugpack-registry.json';
            BugFs.createFile(bugpackRegistryPath, function(error) {
                if (!error) {
                    BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistry.toObject()), callback);
                    //BugFs.writeFile(bugpackRegistryPath, JSON.stringify(bugpackRegistry, null, '\t'), callback);
                } else {
                    callback(error);
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(BugPackModule).with(
        buildModule("bugpack")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BugPackModule', BugPackModule);
});
