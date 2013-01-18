//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('AnnotateJsModule')
//@Autoload

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Annotate = bugpack.require('annotate.Annotate');
var BuildBug = bugpack.require('buildbug.BuildBug');
var BuildModule = bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');



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

        /*asyncTask('compileNodeApp', function(task, properties) {
            this.compileNodeApp(properties, function() {
                task.complete();
            });
        });

        asyncTask('compileClientApp', function(task, properties) {
            this.compileClientApp(properties, function() {
                task.complete();
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

bugpack.export('buildbug.AnnotateJsModule', AnnotateJsModule);
