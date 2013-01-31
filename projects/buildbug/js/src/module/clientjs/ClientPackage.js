//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ClientPackage')

//@Require('Class')
//@Require('Obj')
//@Require('bugboil.BugBoil')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('buildbug.PackedClientPackage')


var bugpack = require('bugpack').context();
var fs = require('fs')
var fstream = require("fstream")
var glib = require('glib');
var path = require('path');
var tar = require('tar');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Obj =               bugpack.require('Obj');
var BugBoil =           bugpack.require('bugboil.BugBoil');
var BugFlow =           bugpack.require('bugflow.BugFlow');
var BugFs =             bugpack.require('bugfs.BugFs');
var Path =              bugpack.require('bugfs.Path');
var PackedClientPackage = bugpack.require('buildbug.PackedClientPackage');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachSeries = BugBoil.$foreachSeries;
var $parallel = BugFlow.$parallel;
var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ClientPackage = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(clientJson, baseBuildPathString) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.baseBuildPathString = baseBuildPathString;

        /**
         * @private
         * @type {Path}
         */
        this.buildPath = null;

        /**
         * @private
         * @type {{
         *      name: string,
         *      version: string,
         *      staticPath: string,
		 *		jsPath: string,
		 *		templatePath: string,
		 *		url: string
         * }}
         */
        this.clientJson = clientJson;

        /**
         * @private
         * @type {Path}
         */
        this.jsPath = null;

        /**
         * @private
         * @type {Path}
         */
        this.staticPath = null;
		
		//TODO
        /**   
         * @private
         * @type {Path}
         */
        this.templatePath = null;

    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Path}
     */
    getBuildPath: function() {
        return this.buildPath;
    },

    /**
     * @return {{
     *      name: string,
     *      version: string,
     *      staticPath: string,
	 *		jsPath: string,
	 *		templatePath: string,
	 *		url: string
     * }}
     */
    getClientJson: function() {
        return this.clientJson;
    },

    /**
     * @return {string}
     */
    getName: function() {
        return this.clientJson.name;
    },

    /**
     * @return {Path}
     */
    getJsPath: function() {
        return this.jsPath;
    },

    /**
     * @return {Path}
     */
    getStaticPath: function() {
        return this.staticPath;
    },

    /**
     * @return {Path}
     */
    getTemplatePath: function() {
        return this.templatePath;
    },

    /**
     * @return {string}
     */
    getURL: function() {
        return this.clientJSON.url;
    },

    /**
     * @return {string}
     */
    getVersion: function() {
        return this.packageJson.version;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *      sourcePaths: Array.<(string|Path)>,
     *      staticPaths: Array.<(string|Path)>,
     *      templatePath: (string|Path)
     * }} params
     * @param {function(Error)} callback
     */
    buildPackage: function(params, callback) {
        var _this = this;
        this.validateClientJson();

        var sourcePaths = params.sourcePaths;
        var staticPaths = params.staticPaths;
        var templatePath = params.tempatePath;

        this.createPackageBuildPaths();

        $series([
            $parallel([
	            $task(function(flow) {
					if (sourcePaths){
     	               $foreachSeries(sourcePaths, function(boil, sourcePath) {
	                        BugFs.copyDirectoryContents(sourcePath, _this.getJsPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
	                            boil.bubble(error);
	                        });
	                    }).execute(function(error) {
	                        flow.complete(error);
	                    });
					} else {
						flow.complete();
					}
                }),
                $task(function(flow) {
                    if (staticPaths) {
                        $foreachSeries(staticPaths, function(boil, staticPath) {
                            BugFs.copyDirectoryContents(staticPath, _this.getStaticPath(), true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                boil.bubble(error);
                            });
                        }).execute(function(error) {
                            flow.complete(error);
                        });
                    } else {
                        flow.complete();
                    }
                }),
                $task(function(flow) {
                    if (templatePath) {
	                    BugFs.copyFile(templatePath, _this.getTemplatePath(), Path.SyncMode.REPLACE, function(error) {
		                	flow.complete(error);
	                    });
                    } else {
	                    flow.complete();
                    }
                })
            ]),
            $task(function(flow) {
                _this.writeClientJson(function(error) {
                    flow.complete(error);
                });
            })
        ]).execute(callback);
    },

    /**
     * @param {string} distPath
     * @param {function(Error, PackedClientPackage)} callback
     */
    packPackage: function(distPath, callback) {
        var _this = this;
        var packedClientPackage = new PackedClientPackage(this, distPath);
        this.packClientPackage(function(error) {
            if (!error) {
                var clientPackageFilePath = process.cwd() + path.sep + packedClientPackage.getFileName();
                BugFs.move(clientPackageFilePath, distPath, Path.SyncMode.MERGE_REPLACE, function(error) {
                    if (!error) {
                        callback(null, packedClientPackage);
                    } else {
                        callback(error);
                    }
                });
            } else {
                callback(error);
            }
        });
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     */
    createPackageBuildPaths: function() {
        this.buildPath = BugFs.joinPaths([this.baseBuildPathString, this.getName(), this.getVersion()]);
        this.staticPath = this.buildPath.joinPaths(this.clientJSON.staticPath ? [this.clientJSON.staticPath] : ["static"]);
        this.jsPath = this.buildPath.joinPaths(this.clientJSON.jsPath ? [this.clientJSON.jsPath] : ["js"]);
        this.templatePath = this.buildPath.joinPaths(this.clientJSON.templatePath ? [this.clientJSON.templatePath] : ["template.js"]);
    },

    /**
     * @private
     * @param {function()} callback
     */
    packClientPackage: function(callback) {
        var packagePath = this.buildPath.getAbsolutePath();
		var gzip = zlib.createGzip();
		var inp = fstream.Reader({path: packagePath, type: "Directory"})		
		var out = fstream.Writer( this.getName() + '_' + this.getVersion() + '.tar.gz');
		inp.pipe(tar.Pack()).pipe(gzip).pipe(out)
			.on('end', function(){
				console.log("Packed up client package '" + packagePath + "'");
				callback();
			})
			.on('error', function(error){
				callback(error);
			});
    },

    /**
     * @private
     */
    validateClientJson: function() {
        if (!this.clientJson.name) {
            throw new Error("'name' is required in a client package's client.json");
        }

        //TODO BRN: Do a better job of validating the version.

        if (!this.clientJson.version) {
            throw new Error("'version' is required in a client package's client.json");
        }

		if (!this.clientJson.template) {
			throw new Error("'template' is required in a client package's client.json");
		}
    },

    /**
     * @private
     * @param {function(Error)} callback
     */
    writeClientJson: function(callback) {
        var clientJson = this.clientJson;
        var clientJsonPath = this.buildPath.joinPaths(['client.json']);
        BugFs.createFile(clientJsonPath, function(error) {
            if (!error) {
                BugFs.writeFile(clientJsonPath, JSON.stringify(clientJson, null, '\t'), callback);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientPackage', ClientPackage);
