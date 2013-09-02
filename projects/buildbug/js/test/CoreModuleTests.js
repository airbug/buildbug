//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('buildbug.CoreModule')
//@Require('bugmeta.BugMeta')
//@Require('bugunit-annotate.TestAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var CoreModule          = bugpack.require('buildbug.CoreModule');
var BugMeta             = bugpack.require('bugmeta.BugMeta');
var TestAnnotation      = bugpack.require('bugunit-annotate.TestAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var bugmeta             = BugMeta.context();
var test                = TestAnnotation.test;


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
        var _this = this;
        this.testPaths = [
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
        ];
        this.coreModule = new CoreModule();
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var _this = this;
        this.coreModule.concatSources(this.testPaths, function(error, finalSource) {
            test.assertEqual(finalSource, "TEST1\nTEST2",
                "Assert that the final source has been concatenated with a new line");
        });
    }
};
bugmeta.annotate(coreModuleConcatSourcesWithNewLineTest).with(
    test().name("CoreModule - concat sources with new line test")
);
