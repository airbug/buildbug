//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('AwsModule')
//@Autoload

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')

var AWS = require('aws-sdk');
var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Annotate = bugpack.require('Annotate');
var AwsConfig = bugpack.require('AwsConfig');
var BugFlow = bugpack.require('BugFlow');
var BugFs = bugpack.require('BugFs');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');
var JsonUtil = bugpack.require('JsonUtil');
var Obj = bugpack.require('Obj');
var TypeUtil = bugpack.require('TypeUtil');


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
         * @type {AwsConfig}
         */
        this.awsConfig = null;

        /**
         * @private
         * @type {AWS.S3}
         */
        this.s3 = null;
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
     * @param {{
        *   awsConfig: {
     *       accessKeyId: string,
     *       region: string,
     *       secretAccessKey: string
     *   },
     *   sourcePaths: Array.<string>
     * }} properties,
     * @param {function(Error)} callback
     */
    s3EnsureBucketTask: function(properties, callback) {
        var _this = this;
        var props = this.generateProperties(properties);
        var awsConfig = props.awsConfig;
        var bucket = props.bucket;

        this.processAwsConfig(awsConfig);
        $if (function(flow) {
                _this.doesBucketExist(bucket, function(exists) {
                    flow.assert(!exists);
                });
            },
            $task(function(flow) {
                _this.createBucket({Bucket: bucket}, function(error, data) {
                    flow.complete(error, data);
                });
            })
        ).execute(callback);
    },

    /**
     * @param {{
     *   awsConfig: {
     *       accessKeyId: string,
     *       region: string,
     *       secretAccessKey: string
     *   },
     *   sourcePaths: Array.<string>
     * }} properties,
     * @param {function(Error)} callback
     */
    s3PutFileTask: function(properties, callback) {
        var _this = this;
        var props = this.generateProperties(properties);
        var awsConfig = props.awsConfig;
        var filePath = TypeUtil.isString(props.file) ? BugFs.path(props.file) : props.file;
        var bucket = props.bucket;
        var options = props.options;

        this.processAwsConfig(awsConfig);

        $if (function(flow) {
                filePath.exists(function(exists) {
                    flow.assert(exists);
                });
            },
            $task(function(flow) {
                _this.s3PutFile(filePath, bucket, options, function(error) {
                    flow.complete(error);
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
     * @param {string} bucket
     * @param {function(boolean)} callback
     */
    canAccessBucket: function(bucket, callback) {
        if (!TypeUtil.isString(bucket)) {
            throw new Error("'bucket' must be a string");
        }
        this.headBucket({Bucket: bucket}, function(err, data) {
            if (err) {
                //TODO BRN: What other codes?
                console.log(err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    /**
     * @param {string} bucket
     * @param {function(boolean)} callback
     */
    doesBucketExist: function(bucket, callback) {
        if (!TypeUtil.isString(bucket)) {
            throw new Error("'bucket' must be a string");
        }
        this.headBucket({Bucket: bucket}, function(err, data) {
            if (err) {
                if (err.code === 'NotFound') {
                    callback(false);
                } else {
                    //TODO BRN: What other codes?
                    console.log(err);
                    throw new Error("Something else happened.");
                }
            } else {
                callback(true);
            }
        });
    },

    /**
     * @param {Path} filePath
     * @param {string} bucket
     * @param options
     * @param {function(Error)} callback
     */
    s3PutFile: function(filePath, bucket, options, callback) {
        var _this = this;
        var fileData = null;

        $if (function(flow) {
                _this.canAccessBucket(bucket, function(canAccess) {
                    flow.assert(canAccess);
                });
            },
            $series([
                $task(function(flow) {
                    filePath.readFile('utf8', function(error, data) {
                        if (!error) {
                            fileData = data;
                            flow.complete();
                        } else {
                            flow.error(error);
                        }
                    });
                }),
                $task(function(flow) {
                    var params = {
                        Body: fileData,
                        Key: filePath.getName(),
                        Bucket: bucket
                    };
                    if (options) {
                        JsonUtil.munge(options, params);
                    }
                    _this.putObject(params, function(error, response) {
                        //TEST
                        console.log(response);

                        flow.complete(error);
                    });
                })
            ])
        ).$else(
            $task(function(flow) {
                flow.error(new Error("Cannot access bucket '" + bucket + "'"));
            })
        ).execute(callback);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{
        *       accessKeyId: string,
     *       region: string,
     *       secretAccessKey: string
     * }} configObject
     */
    processAwsConfig: function(configObject) {
        var awsConfig = new AwsConfig(configObject);
        if (!Obj.equals(this.awsConfig, awsConfig)) {
            this.awsConfig = awsConfig;
            AWS.config.update(this.awsConfig.getConfigObject());

            // NOTE BRN: We have to instantiate these objects AFTER the config has been updated. Otherwise the
            // credentials are not passed to the instantiated objects.

            this.s3 = new AWS.S3()
        }
    },


    // SDK Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {{
     *      Bucket: string
     * }} params
     * @param {function(Error, data} callback
     */
    createBucket: function(params, callback) {
        this.s3.client.createBucket(params, callback)
    },

    /**
     * @private
     * @param {{
     *      Bucket: string
     * }} params
     * @param {function(Object, Object)} callback
     */
    headBucket: function(params, callback) {
        this.s3.client.headBucket(params, callback);
    },

    /**
     * @private
     * @param {{
     *      Bucket: string,
     *      Key: string,
     *      CacheControl: ?string, Can be used to specify caching behavior along the request/reply chain.
     *      ContentDisposition: ?string, Specifies presentational information for the object.
     *      ContentEncoding: ?string, Specifies what content encodings have been applied to the object and thus what decoding mechanisms must be applied to obtain the media-type referenced by the Content-Type header field.
     *      ContentType: ?string, A standard MIME type describing the format of the object data.
     *      Expires: ?Date, The date and time at which the object is no longer cacheable.
     *      WebsiteRedirectLocation: ?string, If the bucket is configured as a website, redirects requests for this object to another object in the same bucket or to an external URL. Amazon S3 stores the value of this header in the object metadata.
     *      Body: ?string,
     *      StorageClass: ?string, The type of storage to use for the object. Defaults to 'STANDARD'.
     *      ACL: ?string, The canned ACL to apply to the object.
     *      GrantRead: ?string, Allows grantee to read the object data and its metadata.
     *      GrantReadACP: ?string, Allows grantee to read the object ACL.
     *      GrantWriteACP: ?string, Allows grantee to write the ACL for the applicable object.
     *      GrantFullControl: ?string, Gives the grantee READ, READ_ACP, and WRITE_ACP permissions on the object.
     *      ServerSideEncryption: ?string, The Server-side encryption algorithm used when storing this object in S3.
     *      Metadata: Object<String> A map of metadata to store with the object in S3.params
     * }}
     * @param {function(Object, Object)} callback
     */
    putObject: function(params, callback) {
        this.s3.client.putObject(params, callback);
    }
});

annotate(AwsModule).with(
    buildModule("aws")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(AwsModule);
