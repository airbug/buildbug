/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug            = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject        = buildbug.buildProject;
var buildProperties     = buildbug.buildProperties;
var buildScript         = buildbug.buildScript;
var buildTarget         = buildbug.buildTarget;
var enableModule        = buildbug.enableModule;
var parallel            = buildbug.parallel;
var series              = buildbug.series;
var targetTask          = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws                 = enableModule("aws");
var bugpack             = enableModule('bugpack');
var bugunit             = enableModule('bugunit');
var clientjs            = enableModule('clientjs');
var core                = enableModule('core');
var lintbug             = enableModule("lintbug");
var nodejs              = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var version             = "0.1.12";
var dependencies        = {
    "aws-sdk": "2.0.8",
    "bugpack-registry": "0.1.7",
    bugpack: "0.1.14",
    bugunit: "https://s3.amazonaws.com/deploy-airbug/bugunit-0.1.3.tgz",
    deploybug: "https://s3.amazonaws.com/deploy-airbug/deploybug-0.0.4.tgz",
    lintbug: "https://s3.amazonaws.com/deploy-airbug/lintbug-0.0.8.tgz",
    "uglify-js": "2.4.15",
    npm: "1.4.21",
    tar: "0.1.20",
    fstream: "0.1.28"
};


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    buildbug: {
        packageJson: {
            name: "buildbug",
            version: version,
            private: true,
            main: "./scripts/buildbug-module.js",
            bin: "bin/buildbug",
            dependencies: dependencies
        },
        sourcePaths: [
            "../bugcore/projects/bugcore/js/src",
            "../bugfs/projects/bugfs/js/src",
            "../bugjs/projects/aws/js/src",
            "../bugjs/projects/bugcli/js/src",
            "../bugjs/projects/npm/js/src",
            "../bugmeta/projects/bugmeta/js/src",
            "./projects/buildbug/js/src"
        ],
        scriptPaths: [
            "./projects/buildbug/js/scripts"
        ],
        binPaths: [
            "./projects/buildbug/bin"
        ],
        unitTest: {
            packageJson: {
                name: "buildbug-test",
                version: version,
                private: true,
                main: "./scripts/buildbug-module.js",
                bin: "bin/buildbug",
                dependencies: dependencies
            },
            sourcePaths: [
                "../buganno/projects/buganno/js/src",
                "../bugjs/projects/bugyarn/js/src",
                "../bugunit/projects/bugdouble/js/src",
                "../bugunit/projects/bugunit/js/src"
            ],
            scriptPaths: [
                "../buganno/projects/buganno/js/scripts",
                "../bugunit/projects/bugunit/js/scripts"
            ],
            testPaths: [
                "../bugcore/projects/bugcore/js/test",
                "../bugfs/projects/bugfs/js/test",
                "../bugjs/projects/bugcli/js/test",
                "../bugmeta/projects/bugmeta/js/test",
                "./projects/buildbug/js/test"
            ]
        }
    },
    lint: {
        targetPaths: [
            "."
        ],
        ignorePatterns: [
            ".*\\.buildbug$",
            ".*\\.bugunit$",
            ".*\\.git$",
            ".*node_modules$"
        ]
    }
});


//-------------------------------------------------------------------------------
// Declare BuildTargets
//-------------------------------------------------------------------------------

// Clean BuildTarget
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local BuildTarget
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        targetTask('lint', {
            properties: {
                targetPaths: buildProject.getProperty("lint.targetPaths"),
                ignores: buildProject.getProperty("lint.ignorePatterns"),
                lintTasks: [
                    "cleanupExtraSpacingAtEndOfLines",
                    "ensureNewLineEnding",
                    "indentEqualSignsForPreClassVars",
                    "orderBugpackRequires",
                    "orderRequireAnnotations",
                    "updateCopyright"
                ]
            }
        }),
        series([
            targetTask('createNodePackage', {
                properties: {
                    packageJson: buildProject.getProperty("buildbug.packageJson"),
                    packagePaths: {
                        "./bin": buildProject.getProperty("buildbug.binPaths"),
                        "./lib": buildProject.getProperty("buildbug.sourcePaths").concat(
                            buildProject.getProperty("buildbug.unitTest.sourcePaths")
                        ),
                        "./scripts": buildProject.getProperty("buildbug.scriptPaths").concat(
                            buildProject.getProperty("buildbug.unitTest.scriptPaths")
                        ),
                        "./tests": buildProject.getProperty("buildbug.unitTest.testPaths")
                    }
                }
            }),
            targetTask('generateBugPackRegistry', {
                init: function(task, buildProject, properties) {
                    var nodePackage = nodejs.findNodePackage(
                        buildProject.getProperty("buildbug.packageJson.name"),
                        buildProject.getProperty("buildbug.packageJson.version")
                    );
                    task.updateProperties({
                        sourceRoot: nodePackage.getBuildPath()
                    });
                }
            }),
            targetTask('packNodePackage', {
                properties: {
                    packageName: buildProject.getProperty("buildbug.packageJson.name"),
                    packageVersion: buildProject.getProperty("buildbug.packageJson.version")
                }
            }),
            targetTask('startNodeModuleTests', {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(
                        buildProject.getProperty("buildbug.packageJson.name"),
                        buildProject.getProperty("buildbug.packageJson.version")
                    );
                    task.updateProperties({
                        modulePath: packedNodePackage.getFilePath()
                        //checkCoverage: true
                    });
                }
            }),
            targetTask("s3PutFile", {
                init: function(task, buildProject) {
                    var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("buildbug.packageJson.name"),
                        buildProject.getProperty("buildbug.packageJson.version"));
                    task.updateProperties({
                        file: packedNodePackage.getFilePath(),
                        options: {

                            //TODO BRN: In order to protect this file we need to limit the access to this artifact and provide some sort of http auth access so that the artifacts are retrievable via npm install. This would need to be done in a server wrapper.

                            acl: 'public-read'
                        }
                    });
                },
                properties: {
                    bucket: "{{local-bucket}}"
                }
            })
        ])
    ])
).makeDefault();


// Prod BuildTarget
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask('lint', {
            properties: {
                targetPaths: buildProject.getProperty("lint.targetPaths"),
                ignores: buildProject.getProperty("lint.ignorePatterns"),
                lintTasks: [
                    "cleanupExtraSpacingAtEndOfLines",
                    "ensureNewLineEnding",
                    "indentEqualSignsForPreClassVars",
                    "orderBugpackRequires",
                    "orderRequireAnnotations",
                    "updateCopyright"
                ]
            }
        }),
        parallel([
            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperty("buildbug.packageJson"),
                        packagePaths: {
                            "./bin": buildProject.getProperty("buildbug.binPaths"),
                            "./lib": buildProject.getProperty("buildbug.sourcePaths").concat(
                                buildProject.getProperty("buildbug.unitTest.sourcePaths")
                            ),
                            "./scripts": buildProject.getProperty("buildbug.scriptPaths").concat(
                                buildProject.getProperty("buildbug.unitTest.scriptPaths")
                            ),
                            "./tests": buildProject.getProperty("buildbug.unitTest.testPaths")
                        }
                    }
                }),
                targetTask("generateBugPackRegistry", {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("buildbug.packageJson.name"),
                            buildProject.getProperty("buildbug.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask("packNodePackage", {
                    properties: {
                        packageName: buildProject.getProperty("buildbug.packageJson.name"),
                        packageVersion: buildProject.getProperty("buildbug.packageJson.version")
                    }
                }),
                targetTask("startNodeModuleTests", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("buildbug.packageJson.name"),
                            buildProject.getProperty("buildbug.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath(),
                            checkCoverage: true
                        });
                    }
                })
            ]),

            // Create production package

            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperty("buildbug.packageJson"),
                        packagePaths: {
                            "./bin": buildProject.getProperty("buildbug.binPaths"),
                            "./lib": buildProject.getProperty("buildbug.sourcePaths"),
                            "./scripts": buildProject.getProperty("buildbug.scriptPaths")
                        }
                    }
                }),
                targetTask("generateBugPackRegistry", {
                    init: function(task, buildProject) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("buildbug.packageJson.name"),
                            buildProject.getProperty("buildbug.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask("packNodePackage", {
                    properties: {
                        packageName: buildProject.getProperty("buildbug.packageJson.name"),
                        packageVersion: buildProject.getProperty("buildbug.packageJson.version")
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("buildbug.packageJson.name"),
                            buildProject.getProperty("buildbug.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {

                                //TODO BRN: In order to protect this file we need to limit the access to this artifact and provide some sort of http auth access so that the artifacts are retrievable via npm install. This would need to be done in a server wrapper.

                                acl: "public-read",
                                encrypt: true
                            }
                        });
                    },
                    properties: {
                        bucket: "{{prod-deploy-bucket}}"
                    }
                })
            ])
        ])
    ])
);


//-------------------------------------------------------------------------------
// Build Scripts
//-------------------------------------------------------------------------------

buildScript({
    dependencies: [
        "bugcore",
        "bugflow",
        "bugfs"
    ],
    script: "./lintbug.js"
});
