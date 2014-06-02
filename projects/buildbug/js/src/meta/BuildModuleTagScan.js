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

//@Export('buildbug.BuildModuleTagScan')

//@Require('Class')
//@Require('bugmeta.TagScan')
//@Require('buildbug.BuildModuleTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var TagScan          = bugpack.require('bugmeta.TagScan');
    var BuildModuleTag   = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {TagScan}
     */
    var BuildModuleTagScan = Class.extend(TagScan, {

        _name: "buildbug.BuildModuleTagScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {MetaContext} metaContext
         * @param {EntityManagerTagProcessor} processor
         */
        _constructor: function(metaContext, processor) {
            this._super(metaContext, processor, BuildModuleTag.TYPE);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleTagScan', BuildModuleTagScan);
});
