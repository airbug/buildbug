/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.ClientJsModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleTag')
//@Require('buildbug.ClientPackage')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Map             = bugpack.require('Map');
    var BugMeta         = bugpack.require('bugmeta.BugMeta');
    var BuildBug        = bugpack.require('buildbug.BuildBug');
    var BuildModule     = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag  = bugpack.require('buildbug.BuildModuleTag');
    var ClientPackage   = bugpack.require('buildbug.ClientPackage');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

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
    var ClientJsModule = Class.extend(BuildModule, {

        _name: "buildbug.ClientJsModule",


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
             * @type {Map.<string, ClientPackage>}
             */
            this.packageKeyToClientPackageMap = new Map();

            /**
             * @private
             * @type {Map.<string, PackedClientPackage>}
             */
            this.packageKeyToPackedClientPackageMap = new Map();

        },


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        enableModule: function() {
            this._super();
            buildTask('createClientPackage', this.createClientPackageTask, this);
            buildTask('packClientPackage', this.packClientPackageTask, this);
        },

        /**
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
         *   buildPath: string,
         *   clientJson: {
         *       name: string,
         *       version: string,
         *       staticPath: string,
         *       jsPath: string,
         *       template: string,
         *       url: string
         *   },
         *   sourcePaths: Array.<string>,
         *   staticPaths: Array.<string>

         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        createClientPackageTask: function(buildProject, taskProperties, callback) {
            var clientJson      = taskProperties.getProperty("clientJson");
            var buildPath       = taskProperties.getProperty("buildPath");
            var sourcePaths     = taskProperties.getProperty("sourcePaths");
            var staticPaths     = taskProperties.getProperty("staticPaths");
            var clientPackage   = this.generateClientPackage(clientJson, buildPath);

            var params = {
                sourcePaths: sourcePaths,
                staticPaths: staticPaths,
                clientJson: clientJson
            };
            clientPackage.buildPackage(params, callback);
        },

        /**
         * Available Properties
         * {
         *   clientJson: {
         *       name: string,
         *       version: string,
         *       staticPath: string,
         *       jsPath: string,
         *       template: string,
         *       url: string
         *   }
         *   packagePath: string
         * }
         * @param {BuildProject} buildProject
         * @param {BuildProperties} taskProperties
         * @param {function(Error)} callback
         */
        packClientPackageTask: function(buildProject, taskProperties, callback) {
            var packageName     = taskProperties.getProperty("packageName");
            var packageVersion  = taskProperties.getProperty("packageVersion");
            var distPath        = taskProperties.getProperty("distPath");
            var clientPackage   = this.findClientPackage(packageName, packageVersion);

            var _this = this;

            if (clientPackage) {
                clientPackage.packPackage(distPath, function(error, packedClientPackage) {
                    if (!error) {
                        var clientPackageKey = _this.generatePackageKey(packedClientPackage.getName(),
                            packedClientPackage.getVersion());
                        _this.packageKeyToPackedClientPackageMap.put(clientPackageKey, packedClientPackage);
                        callback(null);
                    } else {
                        callback(error);
                    }
                });
            } else {
                callback(new Error("Cannot pack package. Package '" + packageName + "' and version '" + packageVersion +
                    "' cannot be found."));
            }
        },

        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} packageName
         * @param {string} packageVersion
         */
        findClientPackage: function(packageName, packageVersion) {
            var packageKey = this.generatePackageKey(packageName, packageVersion);
            return this.packageKeyToClientPackageMap.get(packageKey);
        },

        /**
         * @param {string} packageName
         * @param {string} packageVersion
         */
        findPackedClientPackage: function(packageName, packageVersion) {
            var packageKey = this.generatePackageKey(packageName, packageVersion);
            return this.packageKeyToPackedClientPackageMap.get(packageKey);
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
         * @return {ClientPackage}
         */
        generateClientPackage: function(clientJson, buildPath) {
            var clientPackage = new ClientPackage(clientJson, buildPath);
            var packageKey = this.generatePackageKey(clientPackage.getName(), clientPackage.getVersion());
            this.packageKeyToClientPackageMap.put(packageKey, clientPackage);
            return clientPackage;
        },

        /**
         * @private
         * @param {string} packageName
         * @param {string} packageVersion
         */
        generatePackageKey: function(packageName, packageVersion) {
            return packageName + '_' + packageVersion;
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(ClientJsModule).with(
        buildModule("clientjs")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.ClientJsModule', ClientJsModule);
});
