/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.UglifyJsModule')
//@Autoload

//@Require('ArgumentBug')
//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('ObjectUtil')
//@Require('Tracer')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
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

    var uglify_js           = require("uglify-js");


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArgumentBug         = bugpack.require('ArgumentBug');
    var Class               = bugpack.require('Class');
    var Exception           = bugpack.require('Exception');
    var Flows               = bugpack.require('Flows');
    var ObjectUtil          = bugpack.require('ObjectUtil');
    var Tracer              = bugpack.require('Tracer');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var Path                = bugpack.require('bugfs.Path');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var BuildBug            = bugpack.require('buildbug.BuildBug');
    var BuildModule         = bugpack.require('buildbug.BuildModule');
    var BuildModuleTag      = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var buildModule         = BuildModuleTag.buildModule;
    var buildTask           = BuildBug.buildTask;
    var $series             = Flows.$series;
    var $task               = Flows.$task;
    var $traceWithError     = Tracer.$traceWithError;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BuildModule}
     */
    var UglifyJsModule = Class.extend(BuildModule, {

        _name: "buildbug.UglifyJsModule",


        //-------------------------------------------------------------------------------
        // BuildModule Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        enableModule: function() {
            this._super();
            buildTask('uglifyjsMinify', this.uglifyjsMinifyTask, this);
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
         *      !outputFile: (string|Path)
         *      !sources: (string|Path|Array.<(string|Path)>)
         * }
         * @param {BuildProject} buildProject
         * @param {BuildPropertiesChain} taskProperties
         * @param {function(Throwable=)} callback
         */
        uglifyjsMinifyTask: function(buildProject, taskProperties, callback) {
            var error       = null;
            var sources     = taskProperties.getProperty("sources");
            var outputFile  = taskProperties.getProperty("outputFile");
            var result      = "";

            try {
                sources         = this.validateAndConvertSources(sources);
                outputFile      = this.validateAndConvertOutputFile(outputFile);
                result          = this.minifySources(sources);
            } catch(err) {
                error = err;
            }

            if (!error) {
                this.writeResultToOutputFile(result, outputFile, callback);
            } else {
                callback(error);
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Array.<(string|Path)>} sources
         * @return {string}
         */
        minifySources: function(sources) {
            var result = null;
            try {
                result = uglify_js.minify(sources);
            } catch(error) {
                if (ObjectUtil.toConstructorName(error) === "JS_Parse_Error") {
                    throw new Exception("UglifyJSParseError", {},
                            error.message + " (line: " + error.line + ", col: " + error.col + ", pos: " + error.pos + ")");
                } else {
                    throw error;
                }
            }
            return result.code;
        },

        /**
         * @private
         * @param {(string|Path)} outputFile
         * @return {Path}
         * @throws {Error}
         */
        validateAndConvertOutputFile: function(outputFile) {
            if (!TypeUtil.isString(outputFile) && !Class.doesExtend(outputFile, Path)) {
                throw new ArgumentBug(ArgumentBug.ILLEGAL, "outputFile", outputFile,
                    "uglifyjsMinify task expects 'outputFile' to be a string or Path.");
            }
            return BugFs.path(outputFile);
        },

        /**
         * @private
         * @param {Array.<(string|Path)>} sources
         * @return {Array.<string>}
         * @throws {Error}
         */
        validateAndConvertSources: function(sources) {
            var files = [];
            if (TypeUtil.isArray(sources)) {
                sources.forEach(function(source) {
                    if (Class.doesExtend(source, Path)) {
                        files.push(source.getAbsolutePath());
                    } else if (TypeUtil.isString(source)) {
                        files.push(BugFs.path(source).getAbsolutePath());
                    } else {
                        throw new ArgumentBug(ArgumentBug.ILLEGAL, "sources", sources,
                            "uglifyjsMinify task expects 'sources' parameter to contain strings or Paths");
                    }
                });
            } else if (TypeUtil.isString(sources)) {
                files.push(BugFs.path(sources).getAbsolutePath());
            } else if (Class.doesExtend(sources, Path)) {
                files.push(sources.getAbsolutePath());
            } else {
                throw new ArgumentBug(ArgumentBug.ILLEGAL, "sources", sources,
                    "uglifyjsMinify task expects 'sources' to be an array of strings and Paths or a string.");
            }
            return files;
        },

        /**
         * @private
         * @param {string} result
         * @param {Path} outputFilePath
         * @param {function(Error)} callback
         */
        writeResultToOutputFile: function(result, outputFilePath, callback) {
            $series([
                $task(function(flow) {
                    outputFilePath.createFile(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    outputFilePath.writeFile(result, function(error) {
                        flow.complete(error);
                    });
                })
            ]).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(UglifyJsModule).with(
        buildModule("uglifyjs")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.UglifyJsModule', UglifyJsModule);
});
