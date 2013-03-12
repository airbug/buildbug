//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('AwsModule')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var AWS = require('aws-sdk');
var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Obj =                   bugpack.require('Obj');
var Map =                   bugpack.require('Map');
var TypeUtil =              bugpack.require('TypeUtil');
var Annotate =              bugpack.require('annotate.Annotate');
var AwsConfig =             bugpack.require('aws.AwsConfig');
var S3Api =                 bugpack.require('aws.S3Api');
var S3Bucket =              bugpack.require('aws.S3Bucket');
var BugFlow =               bugpack.require('bugflow.BugFlow');
var BugFs =                 bugpack.require('bugfs.BugFs');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;

var $if = BugFlow.$if;
var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var AwsModule = Class.extend(BuildModule, {

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
         * @type {Map}
         */
        this.filePathToURLMap = null;
    },



    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();
        var awsModule = this;
        buildTask('s3EnsureBucket', function(flow, buildProject, properties) {
            awsModule.s3EnsureBucketTask(properties, function(error) {
                flow.complete(error);
            });
        });
        buildTask('s3PutFile', function(flow, buildProject, properties) {
            awsModule.s3PutFileTask(properties, function(error) {
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
     * Available Properties
     * {
     *   awsConfig: {
     *       accessKeyId: string,
     *       region: string,
     *       secretAccessKey: string
     *   },
     *   sourcePaths: Array.<string>,
     *   bucket: string
     * }
     *
     * @param {Properties} properties
     * @param {function(Error)} callback
     */
    s3EnsureBucketTask: function(properties, callback) {
        var props = this.generateProperties(properties);
        var awsConfig = new AwsConfig(props.getProperty("awsConfig"));
        var s3Bucket = new S3Bucket({
            name: props.getProperty("bucket")
        });
        var s3Api = new S3Api(awsConfig);
        s3Api.ensureBucket(s3Bucket, function(error) {
            if (!error) {
                console.log("Ensured bucket '" + s3Bucket.getName() + "' exists");
                callback();
            } else {
                callback(error);
            }
        });
    },

    /**
     * Available Properties
     * {
     *     awsConfig: {
     *        accessKeyId: string,
     *        region: string,
     *        secretAccessKey: string
     *     },
     *     sourcePaths: Array.<string>
     * }
     *
     * @param {Properties} properties
     * @param {function(Error)} callback
     */
    s3PutFileTask: function(properties, callback) {
        var _this = this;
        var props = this.generateProperties(properties);
        var awsConfig = new AwsConfig(props.getProperty("awsConfig"));
        var filePath = BugFs.path(props.getProperty("file"));
        var s3Bucket = new S3Bucket({
            name: props.getProperty("bucket")
        });
        var options = props.getProperty("options");
        var s3Api = new S3Api(awsConfig);
        $if (function(flow) {
                filePath.exists(function(exists) {
                    flow.assert(exists);
                });
            },
            $task(function(flow) {
                s3Api.putFile(filePath, s3Bucket, options, function(error, s3Object) {
                    if (!error) {
                        console.log("Successfully uploaded file to S3 '" + s3Api.getObjectURL(s3Object, s3Bucket) + "'");
                        _this.registerURL(filePath, s3Api.getObjectURL(s3Object, s3Bucket));
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            })
        ).$else(
            $task(function(flow) {
                flow.error(new Error("Cannot find file '" + filePath.getAbsolutePath() + "'"));
            })
        ).execute(callback);
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} filePath
     * @return {string}
     */
    getURL: function(filePath){
        if(this.filePathToURLMap){
            return this.filePathToURLMap.get(filePath);
        }
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {(Path|string)} filePath
     */
    registerURL: function(filePath, url){
        if(!this.filePathToURLMap){
            this.filePathToURLMap = new Map();
        }
        this.filePathToURLMap.put(filePath, url);
    }
});
annotate(AwsModule).with(
    buildModule("aws")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.AwsModule', AwsModule);
