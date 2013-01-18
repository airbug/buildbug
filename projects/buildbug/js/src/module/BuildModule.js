//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildModule')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('JsonUtil')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Event = bugpack.require('Event');
var EventDispatcher = bugpack.require('EventDispatcher');
var JsonUtil = bugpack.require('JsonUtil');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildModule = Class.extend(EventDispatcher, {

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
         * @type {BuildProject}
         */
        this.buildProject = null;

        /**
         * @private
         * @type {boolean}
         */
        this.enabled = false;

        /**
         * @private
         * @type {boolean}
         */
        this.initialized = false;

        /**
         * @private
         * @type {boolean}
         */
        this.initailizing = false;

        /**
         * @private
         * @type {Object}
         */
        this.properties = {};
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getProperties: function() {
        return this.properties;
    },

    /**
     * @param {Object} properties
     */
    updateProperties: function(properties) {
        JsonUtil.munge(properties, this.properties);
    },

    /**
     * @return {boolean}
     */
    isEnabled: function() {
        return this.enabled;
    },

    /**
     * @return {boolean}
     */
    isInitialized: function() {
        return this.initialized;
    },

    /**
     * @return {boolean}
     */
    isInitializing: function() {
        return this.initailizing;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

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
     * @return {boolean}
     */
    initialize: function() {
        if (!this.isInitialized() && !this.isInitializing()) {
            this.initailizing = true;
            var initializeComplete = this.initializeModule();
            if (initializeComplete) {
                this.initializeComplete();
            }
        }
    },


    //-------------------------------------------------------------------------------
    // Protected Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        // Override this function
    },

    /**
     * @protected
     * @param {Object} properties
     * @return {Object}
     */
    generateProperties: function(properties) {
        var projectProperties = this.buildProject.getProperties();
        var moduleProperties = this.getProperties();
        return JsonUtil.merge(properties, moduleProperties, projectProperties);
    },

    /**
     * @protected
     */
    initializeComplete: function() {
        if (!this.initialized) {
            this.initialized = true;
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
// Static Variables
//-------------------------------------------------------------------------------

BuildModule.EventTypes = {
    MODULE_INITIALIZED: "BuildModule:ModuleInitialized"
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildModule', BuildModule);
