//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('AwsModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('aws.AwsConfig')
//@Require('aws.S3Api')
//@Require('aws.S3Bucket')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var AWS                     = require('aws-sdk');
var bugpack                 = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Map                     = bugpack.require('Map');
var Obj                     = bugpack.require('Obj');
var TypeUtil                = bugpack.require('TypeUtil');
var AwsConfig               = bugpack.require('aws.AwsConfig');
var S3Api                   = bugpack.require('aws.S3Api');
var S3Bucket                = bugpack.require('aws.S3Bucket');
var BugFlow                 = bugpack.require('bugflow.BugFlow');
var BugFs                   = bugpack.require('bugfs.BugFs');
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
var $if                     = BugFlow.$if;
var $series                 = BugFlow.$series;
var $task                   = BugFlow.$task;


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
        buildTask('s3EnsureBucket', this.s3EnsureBucketTask, this);
        buildTask('s3PutFile', this.s3PutFileTask, this);
        buildTask('s3PutDirectoryContents', this.s3PutDirectoryContentsTask, this);
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
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    s3EnsureBucketTask: function(buildProject, properties, callback) {
        var awsConfig = new AwsConfig(properties.getProperty("awsConfig"));
        var bucket = properties.getProperty("bucket");
        if (TypeUtil.isString(bucket) && bucket) {
            var s3Bucket = new S3Bucket({
                name: properties.getProperty("bucket")
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
        } else {
            callback(new Error("Bucket must be specified!"));
        }
    },

    /**
     * Available Properties
     * {
     *     awsConfig: {
     *        accessKeyId: string,
     *        region: string,
     *        secretAccessKey: string
     *     },
     *     file: string,
     *     bucket: string,
     *     options: Object
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    s3PutFileTask: function(buildProject, properties, callback) {
        var _this = this;
        var awsConfig = new AwsConfig(properties.getProperty("awsConfig"));
        var filePath = BugFs.path(properties.getProperty("file"));
        var s3Bucket = new S3Bucket({
            name: properties.getProperty("bucket")
        });
        var options = properties.getProperty("options");
        var s3Api = new S3Api(awsConfig);
        $if (function(flow) {
                filePath.exists(function(throwable, exists) {
                    if (!throwable) {
                        flow.assert(exists);
                    } else {
                        flow.error(throwable);
                    }
                });
            },
            $task(function(flow) {
                s3Api.putFile(filePath, filePath.getName(), null, s3Bucket, options, function(error, s3Object) {
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

    /**
     * Available Properties
     * {
     *     awsConfig: {
     *        accessKeyId: string,
     *        region: string,
     *        secretAccessKey: string
     *     },
     *     files: Array.<string>,
     *     bucket: string,
     *     base: string,
     *     options: Object
     * }
     * @param {BuildProject} buildProject
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    s3PutDirectoryContentsTask: function(buildProject, properties, callback) {
        var awsConfig = new AwsConfig(properties.getProperty("awsConfig"));
        var directoryPath = BugFs.path(properties.getProperty("directory"));
        var s3Bucket = new S3Bucket({
            name: properties.getProperty("bucket")
        });
        var options = properties.getProperty("options");
        var s3Api = new S3Api(awsConfig);
        $if (function(flow) {
                directoryPath.exists(function(throwable, exists) {
                    if (!throwable) {
                        flow.assert(exists);
                    } else {
                        flow.error(throwable);
                    }
                });
            },
            $task(function(flow) {
                s3Api.putDirectory(directoryPath, s3Bucket, options, function(error, s3Object) {
                    if (!error) {
                        console.log("Successfully uploaded file to S3 '" + s3Api.getObjectURL(s3Object, s3Bucket) + "'");
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            })
        ).$else(
                $task(function(flow) {
                    flow.error(new Error("Cannot find directory '" + directoryPath.getAbsolutePath() + "'"));
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
        if (this.filePathToURLMap) {
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


//-------------------------------------------------------------------------------
// BugMeta
//-------------------------------------------------------------------------------

bugmeta.annotate(AwsModule).with(
    buildModule("aws")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.AwsModule', AwsModule);
