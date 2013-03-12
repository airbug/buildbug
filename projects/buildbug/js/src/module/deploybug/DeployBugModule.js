//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('DeployBugModule')
//@Autoload

//@Require('Class')
//@Require('TypeUtil')
//@Require('annotate.Annotate')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var deployBugClient = require('deploybug');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var TypeUtil =              bugpack.require('TypeUtil');
var Annotate =              bugpack.require('annotate.Annotate');
var BugFs =                 bugpack.require('bugfs.BugFs');
var Path =                  bugpack.require('bugfs.Path');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------


    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();
        var deployBugModule = this;
        buildTask('registerDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.registerPackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
        buildTask('updateDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.updatePackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
        buildTask('deployDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.deployPackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
        buildTask('startDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.startPackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
        buildTask('stopDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.stopPackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
        buildTask('restartDeployBugPackage', function(flow, buildProject, properties){
            deployBugModule.deployPackageTask(properties, function(error, data){
                console.log(data);
                flow.complete(error);
            });
        });
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
     * @params{{
     *  key: string,
     *  descriptionJSON: {
     *      key: string,
     *      packageURL: string,
     *      packageType: string,
     *      startScript: string
     *  },
     *  serverHostName: string,
     *  serverPort: (string|number)
     * }} properties
     * @param {function(Error)} callback
     */
    registerPackageTask: function(properties, callback){
        //NOTE: SUNG It isn't intuitive that properties needs to be formatted using generateProperties 
        //NOTE: SUNG and that getters should be used to access the properties inside
        var props = this.generateProperties(properties);
        var serverOptions = {
            serverHostName: props.getProperty("serverHostName"),
            serverPort: props.getProperty("serverPort")
        };
        var options = {
            key: props.getProperty("key"),
            descriptionJSON: props.getProperty("descriptionJSON")
        };
        console.log("RegisterPackageTask", "\n ServerOptions:", serverOptions, "\n options:", options)
        deployBugClient.initialize(serverOptions, function(){
            console.log("deployBugClient initialized");
        });
        deployBugClient.registerPackage(options, function(error, data){
            callback(error, data);
        });
    },

    /**
     * @param {{
     *      key: string,
     *      serverHostName: string,
     *      serverPort: (string, number)
     * }} properties
     * @param {function(Error)} callback
     */
    updatePackageTask: function(properties, callback){
        var props = this.generateProperties(properties);
        var serverOptions = {
            serverHostName: props.getProperty("serverHostName"),
            serverPort: props.getProperty("serverPort")
        };
        var options = {
            key: props.getProperty("key"),
            descriptionJSON: props.getProperty("descriptionJSON")
        };
        deployBugClient.initialize(serverOptions, function(){
            console.log("deployBugClient initialized");
        });
        deployBugClient.updatePackage(options, function(error, data){
            callback(error, data);
        });
    },

    // registerOrUpdateDeployBugPackageTask: function(properties, callback){
    //     registerd()  notRegistered()
    // },

    /**
     * @param {{
     *      key: string,
     *      serverHostName: string,
     *      serverPort: (string, number)
     * }} properties
     * @param {function(Error)} callback
     */
    startPackageTask: function(properties, callback){
        var props = this.generateProperties(properties);
        var serverOptions = {
            serverHostName: props.getProperty("serverHostName"),
            serverPort: props.getProperty("serverPort")
        };
        var options = {
            key: props.getProperty("key")
        };
        deployBugClient.initialize(serverOptions, function(){
            console.log("deployBugClient initialized");
        });
        deployBugClient.startPackage(options, function(error, data){
            callback(error, data);
        });
    },

    /**
     * @param {{
     *      key: string,
     *      serverHostName: string,
     *      serverPort: (string, number)
     * }} properties
     * @param {function(Error)} callback
     */
    stopPackageTask: function(properties, callback){
        var props = this.generateProperties(properties);
        var serverOptions = {
            serverHostName: props.getProperty("serverHostName"),
            serverPort: props.getProperty("serverPort")
        };
        var options = {
            key: props.getProperty("key")
        };
        deployBugClient.initialize(serverOptions, function(){
            console.log("deployBugClient initialized");
        });
        deployBugClient.stopPackage(options, function(error, data){
            callback(error, data);
        });
    },

    /**
     * @param {{
     *      key: string,
     *      serverHostName: string,
     *      serverPort: (string, number)
     * }} properties
     * @param {function(Error)} callback
     */
    restartPackageTask: function(properties, callback){
        var props = this.generateProperties(properties);
        var serverOptions = {
            serverHostName: props.getProperty("serverHostName"),
            serverPort: props.getProperty("serverPort")
        };
        var options = {
            key: props.getProperty("key")
        };
        deployBugClient.initialize(serverOptions, function(){
            console.log("deployBugClient initialized");
        });
        deployBugClient.restartPackage(options, function(error, data){
            callback(error, data);
        });
    }
});

annotate(DeployBugModule).with(
    buildModule("deploybug")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("buildbug.DeployBugModule", DeployBugModule);
