//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('buildbug')

//@Export('ClientJsModule')
//@Autoload

//@Require('Class')
//@Require('annotate.Annotate')
//@Require('buildbug.BuildBug')
//@Require('buildbug.BuildModule')
//@Require('buildbug.BuildModuleAnnotation')


var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =                 bugpack.require('Class');
var Annotate =              bugpack.require('annotate.Annotate');
var BuildBug =              bugpack.require('buildbug.BuildBug');
var BuildModule =           bugpack.require('buildbug.BuildModule');
var BuildModuleAnnotation = bugpack.require('buildbug.BuildModuleAnnotation');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var annotate = Annotate.annotate;
var buildModule = BuildModuleAnnotation.buildModule;
var buildTask = BuildBug.buildTask;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ClientJsModule = Class.extend(BuildModule, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------


    },


    //-------------------------------------------------------------------------------
    // BuildModule Implementation
    //-------------------------------------------------------------------------------

    initializeModule: function() {
        this._super();
        return true;
    }


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------



    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

});

annotate(ClientJsModule).with(
    buildModule("clientjs")
);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.ClientJsModule', ClientJsModule);
