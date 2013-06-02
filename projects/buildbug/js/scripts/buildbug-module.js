//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BuildBug = bugpack.require('buildbug.BuildBug');


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

// NOTE BRN: This file is the entry point for the node js module. So we also export this file as a node js module here
// so that users can simple 'require('buildbug') in their build scripts.

module.exports = BuildBug;
