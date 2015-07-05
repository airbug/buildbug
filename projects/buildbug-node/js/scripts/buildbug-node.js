/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * buildbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpackApi  = require("bugpack");


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

var bugpack     = bugpackApi.loadContextSync(module);
bugpack.loadExportSync("buildbug.BuildBug");


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BuildBug    = bugpack.require('buildbug.BuildBug');


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = BuildBug;
