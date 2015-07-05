/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.AwsModule')
//@Autoload

//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Map')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugaws.AwsConfig')
//@Require('bugaws.S3Api')
//@Require('bugaws.S3Bucket')
//@Require('bugfs.BugFs')
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

    var AWS             = require('aws-sdk');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Exception       = bugpack.require('Exception');
    var Flows           = bugpack.require('Flows');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var TypeUtil        = bugpack.require('TypeUtil');
    var AwsConfig       = bugpack.require('bugaws.AwsConfig');
    var S3Api           = bugpack.require('bugaws.S3Api');
    var S3Bucket        = bugpack.require('bugaws.S3Bucket');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var BugMeta         = bugpack.require('bugmeta.BugMeta');
    var BuildBug        = bugpack.require('buildbug.BuildBug');
    var BuildModule     = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag  = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta         = BugMeta.context();
    var buildModule     = BuildModuleTag.buildModule;
    var buildTask       = BuildBug.buildTask;
    var $if             = Flows.$if;
    var $task           = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var AwsModule = Class.extend(BuildModule, {

        _name: "buildbug.AwsModule",


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
             * @type {Map}
             */
            this.filePathToURLMap = null;
        },



        //-------------------------------------------------------------------------------
        // BuildModule Methods
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        s3EnsureBucketTask: function(buildProject, taskProperties, callback) {
            var awsConfig = this.generateAwsConfig(taskProperties);
            var bucket = taskProperties.getProperty("bucket");
            if (TypeUtil.isString(bucket) && bucket) {
                var s3Bucket = new S3Bucket({
                    name: taskProperties.getProperty("bucket")
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
                callback(new Exception("InvalidProperties", {}, "Bucket must be specified!"));
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        s3PutFileTask: function(buildProject, taskProperties, callback) {
            var _this = this;
            var awsConfig = this.generateAwsConfig(taskProperties);
            var filePath = BugFs.path(taskProperties.getProperty("file"));
            var s3Bucket = new S3Bucket({
                name: taskProperties.getProperty("bucket")
            });
            var options = taskProperties.getProperty("options");
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
                    flow.error(new Exception("NoSuchFile", {}, "Cannot find file '" + filePath.getAbsolutePath() + "'"));
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
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        s3PutDirectoryContentsTask: function(buildProject, taskProperties, callback) {
            var awsConfig       = this.generateAwsConfig(taskProperties);
            var directoryPath   = BugFs.path(taskProperties.getProperty("directory"));
            var s3Bucket        = new S3Bucket({
                name: taskProperties.getProperty("bucket")
            });
            var options         = taskProperties.getProperty("options");
            var s3Api           = new S3Api(awsConfig);
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
                    flow.error(new Exception("NoSuchDirectory", {}, "Cannot find directory '" + directoryPath.getAbsolutePath() + "'"));
                })
            ).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Public Methods
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
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {BuildPropertiesChain} taskProperties
         * @return {AwsConfig}
         */
        generateAwsConfig: function(taskProperties) {
            return new AwsConfig(taskProperties.getProperty("awsConfig"));
        },

        /**
         * @private
         * @param {(Path|string)} filePath
         * @param {string} url
         */
        registerURL: function(filePath, url) {
            if(!this.filePathToURLMap){
                this.filePathToURLMap = new Map();
            }
            this.filePathToURLMap.put(filePath, url);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(AwsModule).with(
        buildModule("aws")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.AwsModule', AwsModule);
});
