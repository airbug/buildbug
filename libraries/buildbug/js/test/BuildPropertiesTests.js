/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('TypeUtil')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')
//@Require('buildbug.BuildProperties')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var TypeUtil            = bugpack.require('TypeUtil');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var TestTag             = bugpack.require('bugunit.TestTag');
    var BuildProperties     = bugpack.require('buildbug.BuildProperties');


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
            test.assertTrue(TypeUtil.isObject(value),
                "Assert that the 'tokenObject' is an object");
            test.assertEqual(value.token, this.testObject.prop,
                "Assert that 'token' property of the tokenObject is equal to the 'prop' property");
        }
    };

    /**
     *
     */
    var buildPropertiesTokenObjectDuplicateNameReplaceTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testObject = {
                name: "some value",
                static: {
                    buildPath: "/static/{{name}}",
                    name: "some other value"
                }
            };
            this.buildProperties = new BuildProperties(this.testObject);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            var value = this.buildProperties.getProperty("static.buildPath");
            test.assertTrue(TypeUtil.isString(value),
                "Assert that the value is a string");
            test.assertEqual(value, "/static/some value",
                "Assert that correct 'name' property was used to replace the {{name}} token");
        }
    };

    /**
     *
     */
    var buildPropertiesTokenArrayReplaceTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testObject = {
                prop: "some value",
                tokenArray: [
                    "{{prop}}"
                ]
            };
            this.buildProperties = new BuildProperties(this.testObject);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            var value = this.buildProperties.getProperty("tokenArray");
            test.assertTrue(TypeUtil.isArray(value),
                "Assert that the 'tokenArray' is an array");
            test.assertEqual(value[0], this.testObject.prop,
                "Assert that index 0 of the tokenArray is equal to the 'prop' property");
        }
    };




    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(buildPropertiesSimpleTokenStringTest).with(
        test().name("BuildProperties - simple token string test")
    );
    bugmeta.tag(buildPropertiesSimpleTokenNumberTest).with(
        test().name("BuildProperties - simple token number test")
    );
    bugmeta.tag(buildPropertiesSimpleTokenBooleanTest).with(
        test().name("BuildProperties - simple token boolean test")
    );
    bugmeta.tag(buildPropertiesSimpleTokenWithDashTest).with(
        test().name("BuildProperties - simple token with dash test")
    );
    bugmeta.tag(buildPropertiesTokenObjectReplaceTest).with(
        test().name("BuildProperties - token object replace test")
    );
    bugmeta.tag(buildPropertiesTokenObjectDuplicateNameReplaceTest).with(
        test().name("BuildProperties - token object duplicate property name replace test")
    );
    bugmeta.tag(buildPropertiesTokenArrayReplaceTest).with(
        test().name("BuildProperties - token array replace test")
    );
});
