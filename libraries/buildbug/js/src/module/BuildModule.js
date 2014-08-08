/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildModule')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var BuildModule = Class.extend(EventDispatcher, {

        _name: "buildbug.BuildModule",


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
             * @type {BuildProject}
             */
            this.buildProject       = null;

            /**
             * @private
             * @type {boolean}
             */
            this.enabled            = false;

            /**
             * @private
             * @type {(BuildModule.InitializeStates|string)}
             */
            this.initializeState    = BuildModule.InitializeStates.DEINITIALIZED;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {BuildProject}
         */
        geBuildProject: function() {
            return this.buildProject;
        },

        /**
         * @return {boolean}
         */
        getEnabled: function() {
            return this.enabled;
        },

        /**
         * @return {BuildModule.InitializeStates|string}
         */
        getInitializeState: function() {
            return this.initializeState;
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * @return {boolean}
         */
        isDeinitialized: function() {
            return this.initializeState === BuildModule.InitializeStates.DEINITIALIZED;
        },

        /**
         * @return {boolean}
         */
        isDeinitializing: function() {
            return this.initializeState === BuildModule.InitializeStates.DEINITIALIZING;
        },

        /**
         * @return {boolean}
         */
        isInitialized: function() {
            return this.initializeState === BuildModule.InitializeStates.INITIALIZED;
        },

        /**
         * @return {boolean}
         */
        isInitializing: function() {
            return this.initializeState === BuildModule.InitializeStates.INITIALIZING;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        deinitialize: function() {
            if (this.isInitialized()) {
                this.initializeState    = BuildModule.InitializeStates.DEINITIALIZING;
                var deinitializeComplete  = this.deinitializeModule();
                if (deinitializeComplete) {
                    this.deinitializeComplete();
                }
            }
        },

        /**
         * @param {BuildProject} buildProject
         */
        enable: function(buildProject) {
            if (!this.isEnabled()) {
                this.enabled = true;
                this.buildProject = buildProject;
                this.enableModule();
            }
        },

        /**
         *
         */
        initialize: function() {
            if (this.isDeinitialized()) {
                this.initializeState    = BuildModule.InitializeStates.INITIALIZING;
                var initializeComplete  = this.initializeModule();
                if (initializeComplete) {
                    this.initializeComplete();
                }
            }
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        deinitializeComplete: function() {
            if (!this.isInitialized()) {
                this.initializeState = BuildModule.InitializeStates.DEINITIALIZED;
                this.dispatchEvent(new Event(BuildModule.EventTypes.MODULE_DEINITIALIZED));
            }
        },

        /**
         * @protected
         * @return {boolean}
         */
        deinitializeModule: function() {
            // Override this function
            return true;
        },

        /**
         * @protected
         */
        enableModule: function() {
            // Override this function
        },

        /**
         * @protected
         */
        initializeComplete: function() {
            if (!this.isInitialized()) {
                this.initializeState = BuildModule.InitializeStates.INITIALIZED;
                this.dispatchEvent(new Event(BuildModule.EventTypes.MODULE_INITIALIZED));
            }
        },

        /**
         * @protected
         * @return {boolean}
         */
        initializeModule: function() {
            // Override this function
            return true;
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    BuildModule.EventTypes = {
        MODULE_DEINITIALIZED: "BuildModule:ModuleDeinitialized",
        MODULE_INITIALIZED: "BuildModule:ModuleInitialized"
    };

    /**
     * @static
     * @enum {string}
     */
    BuildModule.InitializeStates = {
        DEINITIALIZED: "BuildModule:Deinitialized",
        DEINITIALIZING: "BuildModule:Deinitializing",
        INITIALIZED: "BuildModule:Initialized",
        INITIALIZING: "BuildModule:Initializing"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModule', BuildModule);
});
