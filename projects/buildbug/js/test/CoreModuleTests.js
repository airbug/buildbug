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

//@TestFile

//@Require('Set')
//@Require('buildbug.CoreModule')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Set                 = bugpack.require('Set');
    var CoreModule          = bugpack.require('buildbug.CoreModule');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var TestTag      = bugpack.require('bugunit.TestTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var test                = TestTag.test;


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     *
     */
    var coreModuleConcatSourcesWithNewLineTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testPathSet = new Set([
                {
                    readFile: function(encoding, callback) {
                        callback(undefined, "TEST1");
                    }
                },
                {
                    readFile: function(encoding, callback) {
                        callback(undefined, "TEST2");
                    }
                }
            ]);
            this.coreModule = new CoreModule();
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            this.coreModule.concatSources(this.testPathSet, function(error, finalSource) {
                test.assertEqual(finalSource, "TEST1\nTEST2",
                    "Assert that the final source has been concatenated with a new line");
            });
        }
    };
    bugmeta.tag(coreModuleConcatSourcesWithNewLineTest).with(
        test().name("CoreModule - concat sources with new line test")
    );

    /**
     *
     */
    var coreModuleReplaceTokenInFilePathOrDirectoryTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.token = "{{TOKEN}}";
            this.replacementValue = "newValue";
            this.filePath = "./thisPathDoesNotExist"
            this.coreModule = new CoreModule();
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            this.coreModule.replaceTokenInFilePathOrDirectory(this.token, this.replacementValue, this.filePath, function(error) {
                test.assertTrue(error,
                    "Assert that an error is passed back for a path that does not exist");
            });
        }
    };
    bugmeta.tag(coreModuleReplaceTokenInFilePathOrDirectoryTest).with(
        test().name("CoreModule - replace token in file path test")
    );
});
