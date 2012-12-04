//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('AnnotateJsModule')

//@Require('Annotate')
//@Require('BuildBug')
//@Require('BuildModule')
//@Require('BuildModuleAnnotation')
//@Require('Class')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('AnnotateJsModule', {autoload: true});

var Annotate = bugpack.require('Annotate');
var BuildBug = bugpack.require('BuildBug');
var BuildModule = bugpack.require('BuildModule');
var BuildModuleAnnotation = bugpack.require('BuildModuleAnnotation');
var Class = bugpack.require('Class');


//-------------------------------------------------------------------------------
// Node JS
//-------------------------------------------------------------------------------

// NOTE BRN: This is a node js MODULE dependency, not an annotatejs class dependency. Any modules that are specifically
// required by this code still need to be included in the normal fashion.

// TODO BRN: This specific include would make more sense as the compiler being included in the source path of the
// buildbug project (included as a bugjar). We have to update annotatejs to be written in annotatejs before that's
// possible though

//var AnnotateJS = require('annotatejs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var AnnotateJsModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @protected
     */
    enableModule: function() {
        this._super();

        /*asyncTask('compileNodeApp', function(properties) {
            var _this = this;
            this.compileNodeApp(properties, function() {
                _this.complete();
            });
        });

        asyncTask('compileClientApp', function(properties) {
            var _this = this;
            this.compileClientApp(properties, function() {
                _this.complete();
            });
        });*/
    },


    //-------------------------------------------------------------------------------
    // Build Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *   packageName: string,
     *   sourcePaths: Array<string>
     * }} properties
     * @param {function()} callback
     */
    compileNodeApp: function(properties, callback) {
        var props = this.generateProperties(properties);
        var sourcePaths = props.sourcePaths;
        var packageName = props.packageName;
        var packagePath = props.buildPath + "/" + packageName;
        AnnotateJS.compileNodeJs(sourcePaths, packagePath, callback);
    },

    /**
     * @param {{
     *    sourcePaths: {Array<string>},
     *    clientJson: {
     *        name: string,
     *        version: string
     *    }
     * }} properties
     * @param {function()} callback
     */
    compileClientApp: function(properties, callback) {
        var props = this.generateProperties(properties);
        var sourcePaths = props.sourcePaths;
        var clientName = props.clientName;
        var clientFileName = clientName + ".js";
        var clientBuildPath = props.buildPath + "/" + clientName;
        AnnotateJS.compileClientJs(sourcePaths, clientBuildPath, clientFileName, callback);
    }
});

annotate(AnnotateJsModule).with(
    buildModule("annotatejs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(AnnotateJsModule);
