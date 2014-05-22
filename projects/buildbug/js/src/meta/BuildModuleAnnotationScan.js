/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


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
