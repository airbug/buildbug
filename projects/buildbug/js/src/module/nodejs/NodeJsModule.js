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

//@Export('buildbug.NodeJsModule')
//@Autoload

//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Map')
//@Require('bugfs.BugFs')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleTag')
//@Require('buildbug.NodePackage')
//@Require('npm.Npm')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var fs              = require('fs');
    var npm             = require('npm');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Exception       = bugpack.require('Exception');
    var Flows           = bugpack.require('Flows');
    var Map             = bugpack.require('Map');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var BugMeta         = bugpack.require('bugmeta.BugMeta');
    var BuildBug        = bugpack.require('buildbug.BuildBug');
    var BuildModule     = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag  = bugpack.require('buildbug.BuildModuleTag');
    var NodePackage     = bugpack.require('buildbug.NodePackage');
    var Npm             = bugpack.require('npm.Npm');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forInParallel  = Flows.$forInParallel;
    var $series         = Flows.$series;
    var $task           = Flows.$task;
    var bugmeta         = BugMeta.context();
    var buildModule     = BuildModuleTag.buildModule;
    var buildTask       = BuildBug.buildTask;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var NodeJsModule = Class.extend(BuildModule, {

        _name: "buildbug.NodeJsModule",


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
             * @type {Npm}
             */
            this.npm                                = new Npm();

            /**
             * @private
             * @type {boolean}
             */
            this.npmLoaded                          = false;

            /**
             * @private
             * @type {Map.<string, NodePackage>}
             */
            this.packageKeyToNodePackageMap         = new Map();

            /**
             * @private
             * @type {Map.<string, PackedNodePackage>}
             */
            this.packageKeyToPackedNodePackageMap   = new Map();
        },


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('createNodePackage', this.createNodePackageTask, this);
            buildTask('packNodePackage', this.packNodePackageTask, this);
            buildTask('publishNodePackage', this.publishNodePackageTask, this);
            buildTask('npmAddUser', this.npmAddUserTask, this);
            buildTask('npmConfigSet', this.npmConfigSetTask, this);
            buildTask('npmInstall', this.npmInstallTask, this);
        },

        /**
         * @protected
         * @return {boolean}
         */
        initializeModule: function() {
            this._super();
            this.loadNPM();
            return false;
        },


        //-------------------------------------------------------------------------------
        // Build Task Methods
        //-------------------------------------------------------------------------------

        /**
         * Available Properties
         * {
         *   buildPath: string,
         *   packageJson: {
         *       name: string,
         *       version: string,
         *       main: string,
         *       dependencies: Object
         *   },
         *   packagePaths: Object.<string, Array.<string>>
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        createNodePackageTask: function(buildProject, taskProperties, callback) {
            var packageJson     = taskProperties.getProperty("packageJson");
            var packagePaths    = taskProperties.getProperty("packagePaths");
            var buildPath       = buildProject.getProperty("buildPath");
            var nodePackage     = this.generateNodePackage(packageJson, buildPath);
            nodePackage.buildPackage(packagePaths, callback);
        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        npmAddUserTask: function(buildProject, taskProperties, callback) {
            this.npmAddUser(callback);
        },

        /**
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        npmConfigSetTask: function(buildProject, taskProperties, callback) {
            var config  = taskProperties.getProperty("config");
            this.npmConfigSet(config, callback);
        },

        /**
         *  Available Properties
         * {
         *   installPath: (string | Path),
         *   module: string
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        npmInstallTask: function(buildProject, taskProperties, callback) {
            var installPath = taskProperties.getProperty("installPath") || process.cwd();
            var module      = taskProperties.getProperty("module");
            this.npmInstall(installPath, module, function(throwable, data) {
                if (!throwable) {
                    console.log("Module installed to '" + data.installedPath + "'");
                }
                callback(throwable);
            });
        },

        /**
         * Available Properties
         * {
         *   packageName: string,
         *   packageVersion: string,
         *   distPath: string
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        packNodePackageTask: function(buildProject, taskProperties, callback) {
            var _this           = this;
            var packageName     = taskProperties.getProperty("packageName");
            var packageVersion  = taskProperties.getProperty("packageVersion");
            var nodePackage     = this.findNodePackage(packageName, packageVersion);
            var params = {
                distPath: taskProperties.getProperty("distPath")
            };

            if (nodePackage) {
                nodePackage.packPackage(params, function(throwable, packedNodePackage) {
                    if (!throwable) {
                        console.log("Packed up node package '" + packedNodePackage.getFilePath().getAbsolutePath() + "'");
                        var nodePackageKey = _this.generatePackageKey(packedNodePackage.getName(),
                            packedNodePackage.getVersion());
                        _this.packageKeyToPackedNodePackageMap.put(nodePackageKey, packedNodePackage);
                        callback(null);
                    } else {
                        callback(throwable);
                    }
                });
            } else {
                callback(new Exception("IllegalState", {}, "Cannot pack package. Package '" + packageName + "' and version '" + packageVersion +
                    "' cannot be found."));
            }
        },

        /**
         * Available Properties
         * {
         *   packageName: string,
         *   packageVersion: string,
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        publishNodePackageTask: function(buildProject, taskProperties, callback) {
            var _this               = this;
            var packageName         = taskProperties.getProperty("packageName");
            var packageVersion      = taskProperties.getProperty("packageVersion");
            var packageNodePackage  = this.findPackedNodePackage(packageName, packageVersion);

            if (packageNodePackage) {
                packageNodePackage.publishPackage(function(throwable) {
                    console.log("Published node package " + packageNodePackage.getName() + "@" + packageNodePackage.getVersion());
                    if (!throwable) {
                        callback();
                    } else {
                        callback(throwable);
                    }
                });
            } else {
                callback(new Exception("IllegalState", {}, "Cannot publish package. A packed package '" + packageName + "' and version '" + packageVersion +
                    "' cannot be found."));
            }
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} packageName
         * @param {string} packageVersion
         * @return {NodePackage}
         */
        findNodePackage: function(packageName, packageVersion) {
            var packageKey = this.generatePackageKey(packageName, packageVersion);
            return this.packageKeyToNodePackageMap.get(packageKey);
        },

        /**
         * @param {string} packageName
         * @param {string} packageVersion
         * @return {PackedNodePackage}
         */
        findPackedNodePackage: function(packageName, packageVersion) {
            var packageKey = this.generatePackageKey(packageName, packageVersion);
            return this.packageKeyToPackedNodePackageMap.get(packageKey);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {{
         *       name: string,
         *       version: string,
         *       main: string,
         *       dependencies: Object
         *   }} packageJson
         * @param {string} buildPath
         * @return {NodePackage}
         */
        generateNodePackage: function(packageJson, buildPath) {
            var nodePackage = new NodePackage(packageJson, buildPath);
            var packageKey = this.generatePackageKey(nodePackage.getName(), nodePackage.getVersion());
            this.packageKeyToNodePackageMap.put(packageKey, nodePackage);
            return nodePackage;
        },

        /**
         * @private
         * @param {string} packageName
         * @param {string} packageVersion
         */
        generatePackageKey: function(packageName, packageVersion) {
            return packageName + '_' + packageVersion;
        },

        /**
         * @private
         */
        loadNPM: function() {
            var _this = this;
            if (!this.npmLoaded) {
                this.npmLoaded = true;
                npm.load({}, function (err) {
                    if (err) {
                        process.exit(1);
                        return;
                    }
                    _this.initializeComplete();
                });
            }
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        npmAddUser: function(callback) {
            var registry    = npm.registry;
            var uri         = npm.config.get("registry");
            var username    = npm.config.get("username");
            var password    = npm.config.get("_password");
            var email       = npm.config.get("email");
            registry.adduser(uri, username, password, email, function(error) {
                if (!error) {
                    registry.username = username;
                    registry.password = password;
                    registry.email = email;
                    npm.config.set("username", username, "user");
                    npm.config.set("_password", password, "user");
                    npm.config.set("email", email, "user");
                    npm.config.del("_token", "user");
                    npm.config.save("user", callback);
                } else {
                    callback(error);
                }
            });
        },

        /**
         * @private
         * @param {Object} configObject
         * @param {function(Throwable=)} callback
         */
        npmConfigSet: function(configObject, callback) {
            $forInParallel(configObject, function(flow, key, value) {
                npm.commands.config(["set", key, value], function(error, data) {
                    if (!error) {
                        callback();
                    } else {
                        callback(new Exception("NpmError", {}, "Error occurred in NPM", [error]));
                    }
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {(string | Path)} installPath
         * @param {string} module
         * @param {function(Throwable, {}=)} callback
         */
        npmInstall: function(installPath, module, callback) {
            var _this   = this;
            var data    = null;
            $series([
                $task(function(flow) {
                    _this.npm.createInstallDir(installPath, function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.npm.installNodeModule(module, installPath, function(throwable, returnedData) {
                        if (!throwable) {
                            data = returnedData;
                            flow.complete();
                        } else {
                            flow.error(throwable);
                        }
                    });
                }),
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, data);
                } else {
                    callback(throwable);
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(NodeJsModule).with(
        buildModule("nodejs")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.NodeJsModule', NodeJsModule);
});
