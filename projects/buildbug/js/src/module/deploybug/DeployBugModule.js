//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('DeployBugModule')
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
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    registerDeployBugPackageTask: function(buildProject, properties, callback){
        var serverOptions = {
            serverHostName: properties.getProperty("serverHostName"),
            serverPort: properties.getProperty("serverPort")
        };
        var options = {
            key: properties.getProperty("key"),
            descriptionJSON: properties.getProperty("descriptionJSON")
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
     * Available Properties
     * {
     *      key: string,
     *      serverHostName: string,
     *      serverPort: (string, number)
     * }
     *
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    updateDeployBugPackageTask: function(buildProject, properties, callback){
        var serverOptions = {
            serverHostName: properties.getProperty("serverHostName"),
            serverPort: properties.getProperty("serverPort")
        };
        var options = {
            key: properties.getProperty("key"),
            descriptionJSON: properties.getProperty("descriptionJSON")
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    deployDeployBugPackageTask: function(buildProject, properties, callback) {
        
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    startDeployBugPackageTask: function(buildProject, properties, callback){
        var serverOptions = {
            serverHostName: properties.getProperty("serverHostName"),
            serverPort: properties.getProperty("serverPort")
        };
        var options = {
            key: properties.getProperty("key")
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    stopDeployBugPackageTask: function(buildProject, properties, callback){
        var serverOptions = {
            serverHostName: properties.getProperty("serverHostName"),
            serverPort: properties.getProperty("serverPort")
        };
        var options = {
            key: properties.getProperty("key")
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    restartDeployBugPackageTask: function(buildProject, properties, callback){
        var serverOptions = {
            serverHostName: properties.getProperty("serverHostName"),
            serverPort: properties.getProperty("serverPort")
        };
        var options = {
            key: properties.getProperty("key")
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
