//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug        = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject    = buildbug.buildProject;
var buildProperties = buildbug.buildProperties;
var buildTarget     = buildbug.buildTarget;
var enableModule    = buildbug.enableModule;
var parallel        = buildbug.parallel;
var series          = buildbug.series;
var targetTask      = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws             = enableModule("aws");
var bugpack         = enableModule('bugpack');
var bugunit         = enableModule('bugunit');
var clientjs        = enableModule('clientjs');
var core            = enableModule('core');
var nodejs          = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    buildbug: {
        packageJson: {
            name: "buildbug",
            version: "0.0.19",
            main: "./scripts/buildbug-module.js",
            bin: "bin/buildbug",
            dependencies: {
                "aws-sdk": "1.9.x",
                //bugjar: 'https://s3.amazonaws.com/bugjars/bugjar-0.0.1.tgz',
                "bugpack-registry": 'https://s3.amazonaws.com/airbug/bugpack-registry-0.0.5.tgz',
                bugpack: 'https://s3.amazonaws.com/airbug/bugpack-0.0.5.tgz',
                bugunit: 'https://s3.amazonaws.com/airbug/bugunit-0.0.10.tgz',
                deploybug: 'https://s3.amazonaws.com/airbug/deploybug-0.0.4.tgz',
                lintbug: 'https://s3.amazonaws.com/airbug/lintbug-0.0.2.tgz',
                "uglify-js": "2.3.x",
                npm: '1.3.x',
                tar: 'git://github.com/airbug/node-tar.git#master',
                fstream: '0.1.x'
            }
        },
        sourcePaths: [
            "../bugjs/projects/aws/js/src",
            //"../bugjs/projects/buganno/js/src",
            "../bugjs/projects/bugmeta/js/src",
            "../bugjs/projects/bugcli/js/src",
            "../bugjs/projects/bugflow/js/src",
            "../bugjs/projects/bugfs/js/src",
            "../bugjs/projects/bugjs/js/src",
            "../bugjs/projects/bugtrace/js/src",
            "../bugunit/projects/bugdouble/js/src",
            "../bugunit/projects/bugunit/js/src",
            "./projects/buildbug/js/src"
        ],
        scriptPaths: [
            "../bugunit/projects/bugunit/js/scripts",
            "./projects/buildbug/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugcli/js/test",
            "../bugjs/projects/bugflow/js/test",
            "../bugjs/projects/bugjs/js/test",
            "./projects/buildbug/js/test"
        ],
        binPaths: [
            "./projects/buildbug/bin"
        ]
    }
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean Flow
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local Flow
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        targetTask('createNodePackage', {
            properties: {
                packageJson: buildProject.getProperty("buildbug.packageJson"),
                sourcePaths: buildProject.getProperty("buildbug.sourcePaths"),
                scriptPaths: buildProject.getProperty("buildbug.scriptPaths"),
                testPaths: buildProject.getProperty("buildbug.testPaths"),
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
                    modulePath: packedNodePackage.getFilePath()
                });
            }
        }),
        targetTask("s3EnsureBucket", {
            properties: {
                bucket: buildProject.getProperty("local-bucket")
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("buildbug.packageJson.name"),
                    buildProject.getProperty("buildbug.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: 'public-read'
                    }
                });
            },
            properties: {
                bucket: buildProject.getProperty("local-bucket")
            }
        })
    ])
).makeDefault();


// Prod Flow
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask("createNodePackage", {
            properties: {
                packageJson: buildProject.getProperty("buildbug.packageJson"),
                sourcePaths: buildProject.getProperty("buildbug.sourcePaths"),
                scriptPaths: buildProject.getProperty("buildbug.scriptPaths"),
                testPaths: buildProject.getProperty("buildbug.testPaths"),
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
                    modulePath: packedNodePackage.getFilePath()
                });
            }
        }),
        targetTask("s3EnsureBucket", {
            properties: {
                bucket: "airbug"
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("buildbug.packageJson.name"),
                    buildProject.getProperty("buildbug.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: "public-read"
                    }
                });
            },
            properties: {
                bucket: "airbug"
            }
        })
    ])
);
