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

//@Export('buildbug.DeployBugModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
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

    var deployBugClient         = require('deploybug');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var TypeUtil                = bugpack.require('TypeUtil');
    var BugFs                   = bugpack.require('bugfs.BugFs');
    var Path                    = bugpack.require('bugfs.Path');
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
    var DeployBugModule = Class.extend(BuildModule, {

        _name: "buildbug.DeployBugModule",


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('registerDeployBugPackage', this.registerDeployBugPackageTask, this);
            buildTask('updateDeployBugPackage', this.updateDeployBugPackageTask, this);
            buildTask('deployDeployBugPackage', this.deployDeployBugPackageTask, this);
            buildTask('startDeployBugPackage', this.startDeployBugPackageTask, this);
            buildTask('stopDeployBugPackage', this.stopDeployBugPackageTask, this);
            buildTask('restartDeployBugPackage', this.restartDeployBugPackageTask, this);
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
         * Available Propeties
         * {
         *  key: string,
         *  descriptionJSON: {
         *      key: string,
         *      packageURL: string,
         *      packageType: string,
         *      startScript: string
         *  },
         *  serverHostName: string,
         *  serverPort: (string|number)
         * }
         *
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        registerDeployBugPackageTask: function(buildProject, taskProperties, callback){
            var serverOptions = {
                serverHostName: taskProperties.getProperty("serverHostName"),
                serverPort: taskProperties.getProperty("serverPort")
            };
            var options = {
                key: taskProperties.getProperty("key"),
                descriptionJSON: taskProperties.getProperty("descriptionJSON")
            };
            deployBugClient.initialize(serverOptions, function(){
                console.log("deployBugClient initialized");
            });
            deployBugClient.registerPackage(options, function(error, data){
                callback(error, data);
            });
        },

        /**
         * Available Properties
         * {
         *      key: string,
         *      serverHostName: string,
         *      serverPort: (string, number)
         * }
         *
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        updateDeployBugPackageTask: function(buildProject, taskProperties, callback){
            var serverOptions = {
                serverHostName: taskProperties.getProperty("serverHostName"),
                serverPort: taskProperties.getProperty("serverPort")
            };
            var options = {
                key: taskProperties.getProperty("key"),
                descriptionJSON: taskProperties.getProperty("descriptionJSON")
            };
            deployBugClient.initialize(serverOptions, function(){
                console.log("deployBugClient initialized");
            });
            deployBugClient.updatePackage(options, function(error, data){
                callback(error, data);
            });
        },

        /**
         * Available Properties
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        deployDeployBugPackageTask: function(buildProject, taskProperties, callback) {

        },

        /**
         * Available Properties
         * {
         *      key: string,
         *      serverHostName: string,
         *      serverPort: (string, number)
         * }
         *
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        startDeployBugPackageTask: function(buildProject, taskProperties, callback){
            var serverOptions = {
                serverHostName: taskProperties.getProperty("serverHostName"),
                serverPort: taskProperties.getProperty("serverPort")
            };
            var options = {
                key: taskProperties.getProperty("key")
            };
            deployBugClient.initialize(serverOptions, function(){
                console.log("deployBugClient initialized");
            });
            deployBugClient.startPackage(options, function(error, data){
                callback(error, data);
            });
        },

        /**
         * Available Properties
         * {
         *      key: string,
         *      serverHostName: string,
         *      serverPort: (string, number)
         * }
         *
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        stopDeployBugPackageTask: function(buildProject, taskProperties, callback){
            var serverOptions = {
                serverHostName: taskProperties.getProperty("serverHostName"),
                serverPort: taskProperties.getProperty("serverPort")
            };
            var options = {
                key: taskProperties.getProperty("key")
            };
            deployBugClient.initialize(serverOptions, function(){
                console.log("deployBugClient initialized");
            });
            deployBugClient.stopPackage(options, function(error, data){
                callback(error, data);
            });
        },

        /**
         * Available Properties
         * {
         *      key: string,
         *      serverHostName: string,
         *      serverPort: (string, number)
         * }
         *
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        restartDeployBugPackageTask: function(buildProject, taskProperties, callback){
            var serverOptions = {
                serverHostName: taskProperties.getProperty("serverHostName"),
                serverPort: taskProperties.getProperty("serverPort")
            };
            var options = {
                key: taskProperties.getProperty("key")
            };
            deployBugClient.initialize(serverOptions, function(){
                console.log("deployBugClient initialized");
            });
            deployBugClient.restartPackage(options, function(error, data){
                callback(error, data);
            });
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.annotate(DeployBugModule).with(
        buildModule("deploybug")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("buildbug.DeployBugModule", DeployBugModule);
});
