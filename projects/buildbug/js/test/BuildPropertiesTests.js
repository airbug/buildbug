//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('buildbug.BuildProperties')
//@Require('bugmeta.BugMeta')
//@Require('bugunit-annotate.TestAnnotation')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BuildProperties     = bugpack.require('buildbug.BuildProperties');
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
var buildPropertiesSimpleTokenStringTest = {

    // Setup Test
    //-------------------------------------------------------------------------------

    setup: function() {
        var _this = this;
        this.testObject = {
            prop: "some value",
            token: "{{prop}}"
        };
        this.buildProperties = new BuildProperties(this.testObject);
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var value = this.buildProperties.getProperty("token");
        test.assertEqual(value, this.testObject.prop,
            "Assert that token property is equal to the 'prop' property");
    }
};
bugmeta.annotate(buildPropertiesSimpleTokenStringTest).with(
    test().name("BuildProperties - simple token string test")
);

/**
 *
 */
var buildPropertiesSimpleTokenNumberTest = {

    // Setup Test
    //-------------------------------------------------------------------------------

    setup: function() {
        var _this = this;
        this.testObject = {
            prop: 123,
            token: "{{prop}}"
        };
        this.buildProperties = new BuildProperties(this.testObject);
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var value = this.buildProperties.getProperty("token");
        test.assertEqual(value, this.testObject.prop.toString(),
            "Assert that 'token' property is equal to the 'prop' property in string form");
    }
};
bugmeta.annotate(buildPropertiesSimpleTokenNumberTest).with(
    test().name("BuildProperties - simple token number test")
);

/**
 *
 */
var buildPropertiesSimpleTokenBooleanTest = {

    // Setup Test
    //-------------------------------------------------------------------------------

    setup: function() {
        var _this = this;
        this.testObject = {
            prop: true,
            token: "{{prop}}"
        };
        this.buildProperties = new BuildProperties(this.testObject);
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var value = this.buildProperties.getProperty("token");
        test.assertEqual(value, this.testObject.prop.toString(),
            "Assert that 'token' property is equal to the 'prop' property in string form");
    }
};
bugmeta.annotate(buildPropertiesSimpleTokenBooleanTest).with(
    test().name("BuildProperties - simple token boolean test")
);

/**
 *
 */
var buildPropertiesSimpleTokenWithDashTest = {

    // Setup Test
    //-------------------------------------------------------------------------------

    setup: function() {
        var _this = this;
        this.testObject = {
            "prop-dash": "some value",
            token: "{{prop-dash}}"
        };
        this.buildProperties = new BuildProperties(this.testObject);
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var value = this.buildProperties.getProperty("token");
        test.assertEqual(value, this.testObject["prop-dash"],
            "Assert that 'token' property is equal to the 'prop-dash' property in string form");
    }
};
bugmeta.annotate(buildPropertiesSimpleTokenWithDashTest).with(
    test().name("BuildProperties - simple token with dash test")
);

/**
 *
 */
var buildPropertiesTokenObjectReplaceTest = {

    // Setup Test
    //-------------------------------------------------------------------------------

    setup: function() {
        this.testObject = {
            prop: "some value",
            tokenObject: {
                token: "{{prop}}"
            }
        };
        this.buildProperties = new BuildProperties(this.testObject);
    },


    // Run Test
    //-------------------------------------------------------------------------------

    test: function(test) {
        var value = this.buildProperties.getProperty("tokenObject");
        test.assertEqual(value.token, this.testObject.prop,
            "Assert that 'token' property of the tokenObject is equal to the 'prop' property");
    }
};
bugmeta.annotate(buildPropertiesTokenObjectReplaceTest).with(
    test().name("Token build properties test")
);