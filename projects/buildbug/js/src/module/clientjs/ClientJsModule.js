//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ClientJsModule')
//@Autoload

//@Require('Class')
//@Require('Map')
//@Require('bugmeta.BugMeta')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')
//@Require('buildbug.ClientPackage')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Map                     = bugpack.require('Map');
var BugMeta                 = bugpack.require('bugmeta.BugMeta');
var BuildBug                = bugpack.require('buildbug.BuildBug');
var BuildModule             = bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');
var ClientPackage           = bugpack.require('buildbug.ClientPackage');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta                 = BugMeta.context();
var buildModule             = BuildModuleAnnotation.buildModule;
var buildTask               = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ClientJsModule = Class.extend(BuildModule, {

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
    // BuildModule Implementation
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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    createClientPackageTask: function(buildProject, properties, callback) {
        var clientJson = properties.getProperty("clientJson");
        var buildPath = properties.getProperty("buildPath");
        var sourcePaths = properties.getProperty("sourcePaths");
        var staticPaths = properties.getProperty("staticPaths");
        var clientPackage = this.generateClientPackage(clientJson, buildPath);

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
     * @param {BuildProperties} properties
     * @param {function(Error)} callback
     */
    packClientPackageTask: function(buildProject, properties, callback) {
        var packageName = properties.getProperty("packageName");
        var packageVersion = properties.getProperty("packageVersion");
        var distPath = properties.getProperty("distPath");
        var clientPackage = this.findClientPackage(packageName, packageVersion);

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
    // Class Methods
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
    // Private Class Methods
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

bugmeta.annotate(ClientJsModule).with(
    buildModule("clientjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientJsModule', ClientJsModule);
