/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildModuleTagScan')

//@Require('Class')
//@Require('bugmeta.TagClassTagScan')
//@Require('buildbug.BuildModuleTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var TagClassTagScan     = bugpack.require('bugmeta.TagClassTagScan');
    var BuildModuleTag      = bugpack.require('buildbug.BuildModuleTag');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {TagClassTagScan}
     */
    var BuildModuleTagScan = Class.extend(TagClassTagScan, {

        _name: "buildbug.BuildModuleTagScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {MetaContext} metaContext
         * @param {BuildModuleTagProcessor} processor
         */
        _constructor: function(metaContext, processor) {
            this._super(metaContext, processor, BuildModuleTag.getClass());
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('buildbug.BuildModuleTagScan', BuildModuleTagScan);
});
