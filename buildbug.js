//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug                = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject            = buildbug.buildProject;
var buildProperties         = buildbug.buildProperties;
var buildTarget             = buildbug.buildTarget;
var enableModule            = buildbug.enableModule;
var parallel                = buildbug.parallel;
var series                  = buildbug.series;
var targetTask              = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws                     = enableModule("aws");
var bugpack                 = enableModule('bugpack');
var bugunit                 = enableModule('bugunit');
var clientjs                = enableModule('clientjs');
var core                    = enableModule('core');
var nodejs                  = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var version             = "0.1.6";
var dependencies        = {
    "aws-sdk": "1.9.x",
    "bugpack-registry": "0.1.4",
    bugpack: "0.1.6",
    bugunit: "https://s3.amazonaws.com/deploy-airbug/bugunit-0.1.0.tgz",
    deploybug: "https://s3.amazonaws.com/deploy-airbug/deploybug-0.0.4.tgz",
    lintbug: "https://s3.amazonaws.com/deploy-airbug/lintbug-0.0.5.tgz",
    "uglify-js": "2.3.x",
    npm: "1.4.x",
    tar: "git://github.com/airbug/node-tar.git#master",
    fstream: "0.1.x"
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
            "../bugflow/projects/bugflow/js/src",
            "../bugfs/projects/bugfs/js/src",
            "../bugjs/projects/aws/js/src",
            "../bugjs/projects/bugcli/js/src",
            "../bugmeta/projects/bugmeta/js/src",
            "../bugtrace/projects/bugtrace/js/src",
            "./projects/buildbug/js/src"
        ],
        scriptPaths: [
            "../bugunit/projects/bugunit/js/scripts",
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
                "../bugflow/projects/bugflow/js/test",
                "../bugfs/projects/bugfs/js/test",
                "../bugjs/projects/bugcli/js/test",
                "../bugmeta/projects/bugmeta/js/test",
                "../bugtrace/projects/bugtrace/js/test",
                "./projects/buildbug/js/test"
            ]
        }
    }
});


//-------------------------------------------------------------------------------
// Declare BuildTasks
//-------------------------------------------------------------------------------

// Clean BuildTask
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local BuildTask
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        series([
            targetTask('createNodePackage', {
                properties: {
                    packageJson: buildProject.getProperty("buildbug.packageJson"),
                    sourcePaths: buildProject.getProperty("buildbug.sourcePaths").concat(
                        buildProject.getProperty("buildbug.unitTest.sourcePaths")
                    ),
                    scriptPaths: buildProject.getProperty("buildbug.scriptPaths").concat(
                        buildProject.getProperty("buildbug.unitTest.scriptPaths")
                    ),
                    testPaths: buildProject.getProperty("buildbug.unitTest.testPaths"),
                    binPaths: buildProject.getProperty("buildbug.binPaths")
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
                        modulePath: packedNodePackage.getFilePath(),
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


// Prod BuildTask
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        parallel([
            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperty("buildbug.packageJson"),
                        sourcePaths: buildProject.getProperty("buildbug.sourcePaths").concat(
                            buildProject.getProperty("buildbug.unitTest.sourcePaths")
                        ),
                        scriptPaths: buildProject.getProperty("buildbug.scriptPaths").concat(
                            buildProject.getProperty("buildbug.unitTest.scriptPaths")
                        ),
                        testPaths: buildProject.getProperty("buildbug.unitTest.testPaths"),
                        binPaths: buildProject.getProperty("buildbug.binPaths")
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
                        sourcePaths: buildProject.getProperty("buildbug.sourcePaths"),
                        scriptPaths: buildProject.getProperty("buildbug.scriptPaths"),
                        binPaths: buildProject.getProperty("buildbug.binPaths")
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
