//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildModuleScan')

//@Require('Class')
//@Require('Obj')
//@Require('bugmeta.BugMeta')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Obj         = bugpack.require('Obj');
    var BugMeta     = bugpack.require('bugmeta.BugMeta');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BuildModuleScan = Class.extend(Obj, {

        _name: "buildbug.BuildModuleScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {BuildProject} buildProject
         */
        _constructor: function(buildProject) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BuildProject}
             */
            this.buildProject = buildProject;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        scan: function() {
            var _this                   = this;
            var bugmeta                 = BugMeta.context();
            var buildModuleAnnotations  = bugmeta.getAnnotationsByType("BuildModule");
            if (buildModuleAnnotations) {
                buildModuleAnnotations.forEach(function(annotation) {
                    var buildModuleConstructor  = annotation.getAnnotationReference();
                    var buildModuleName         = annotation.getName();
                    var buildModule             = new buildModuleConstructor();
                    _this.buildProject.registerModule(buildModuleName, buildModule);
                });
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleScan', BuildModuleScan);
});
