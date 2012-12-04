//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildModuleScan')

//@Require('Annotate')
//@Require('Class')
//@Require('Obj')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('BuildModuleScan');

var Annotate = bugpack.require('Annotate');
var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');


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

bugpack.export(BuildModuleScan);
