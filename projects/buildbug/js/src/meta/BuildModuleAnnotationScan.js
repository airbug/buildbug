//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildModuleAnnotationScan')

//@Require('Class')
//@Require('bugmeta.AnnotationScan')
//@Require('buildbug.BuildModuleAnnotation')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var AnnotationScan          = bugpack.require('bugmeta.AnnotationScan');
    var BuildModuleAnnotation   = bugpack.require('buildbug.BuildModuleAnnotation');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {AnnotationScan}
     */
    var BuildModuleAnnotationScan = Class.extend(AnnotationScan, {

        _name: "buildbug.BuildModuleAnnotationScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {MetaContext} metaContext
         * @param {EntityManagerAnnotationProcessor} processor
         */
        _constructor: function(metaContext, processor) {
            this._super(metaContext, processor, BuildModuleAnnotation.TYPE);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleAnnotationScan', BuildModuleAnnotationScan);
});
