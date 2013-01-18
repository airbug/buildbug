//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('BuildModuleScan')

//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');
var Annotate = bugpack.require('annotate.Annotate');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildModuleScan = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(buildProject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {BuildProject}
         */
        this.buildProject = buildProject;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    scan: function() {
        var _this = this;
        var buildModuleAnnotations = Annotate.getAnnotationsByType("BuildModule");
        if (buildModuleAnnotations) {
            buildModuleAnnotations.forEach(function(annotation) {
                var buildModuleClass = annotation.getReference();
                var buildModuleName = annotation.getName();
                var buildModule = new buildModuleClass();
                _this.buildProject.registerModule(buildModuleName, buildModule);
            });
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildModuleScan', BuildModuleScan);
