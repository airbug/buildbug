//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

bugpack.declare('buildbug-boot');

var BuildBug = bugpack.require('BuildBug');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

BuildBug.bootstrap();


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = BuildBug;
