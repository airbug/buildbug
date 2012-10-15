//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('AnnotateJsModule')

//@Require('Annotate')
//@Require('BuildModule')
//@Require('Class')


//-------------------------------------------------------------------------------
// Node JS
//-------------------------------------------------------------------------------

// NOTE BRN: This is a node js MODULE dependency, not an annotatejs class dependency. Any modules that are specifically
// required by this code still need to be included in the normal fashion.

// TODO BRN: This specific include would make more sense as the compiler being included in the source path of the
// buildbug project (included as a bugjar). We have to update annotatejs to be written in annotatejs before that's
// possible though

var AnnotateJS = require('annotatejs');


// NOTE BRN: This Annotate reference is dragged in by including the Annotate library in the compile from the annotatejs
// project.

var annotate = Annotate.annotate;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var AnnotateJsModule = Class.extend(BuildModule, {

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
         * @type {string}
         */
        this.buildPath = "";

        /**
         * @private
         * @type {ClientJsModule}
         */
        this.clientjs = null;

        /**
         * @private
         * @type {NodeJsModule}
         */
        this.nodejs = null;
    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    /**
     *
     */
    enable: function() {
        this._super();
        // NOTE BRN: This module requires both the nodejs module and the clientjs module to be enabled

        this.clientjs = this.buildProject.enableModule("clientjs");
        this.nodejs = this.buildProject.enableModule("nodejs");
    },

    /**
     * @return {boolean}
     */
    initialize: function() {
        this._super();
        return true;
    },


    //-------------------------------------------------------------------------------
    // Build Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *   packageJson: {
     *       name: string,
     *       version: string,
     *       main: string,
     *       dependencies: Object
     *   },
     *   sourcePaths: Array<string>
     * }} properties
     */
    createNodeJsPackage: function(properties) {
        var props = this.generateProperties(properties);
        var packageName = props.packageJson.name;
        var packagePath = props.buildPath + "/" + packageName;
        this.compileNodeJs(props.sourcePaths, packagePath);
        this.nodejs.createPackage(properties);
    },

    /**
     * @param {{
     *    sourcePaths: {Array<string>},
     *    clientJson: {
     *        name: string,
     *        version: string
     *    }
     * }} properties
     */
    createClientJsPackage: function(properties) {
        var props = this.generateProperties(properties);
        var clientName = props.clientJson.name;
        var clientFileName = clientName + ".js";
        var clientBuildPath = props.buildPath + "/" + clientName;
        this.compileClientJs(props.sourcePaths, clientBuildPath, clientFileName);
        this.clientjs.createPackage(properties);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Array<string>} sourcePaths
     * @param {string} outputPath
     */
    compileNodeJs: function(sourcePaths, outputPath) {
        AnnotateJS.compileNodeJs(sourcePaths, outputPath);
    },

    /**
     * @private
     * @param {Array<string>} sourcePaths
     * @param {string} outputPath
     * @param {string} outputFileName
     */
    compileClientJs: function(sourcePaths, outputPath, outputFileName) {
        AnnotateJS.compileClientJs(sourcePaths, outputPath, outputFileName);
    }
});

annotate(AnnotateJsModule).with('@BuildModule("annotatejs")');
