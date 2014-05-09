/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
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
