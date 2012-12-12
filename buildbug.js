//TODO BRN: For now we are including the .buildbug folder in git so that we can simulate what it is like when using
// buildbug to build a project. Later though, we should exclude .buildbug from git since it would all be dynamically
// generated by the buildbug system. If this idea seems strange in this project it's because we're planning to use
// buildbug to build buildbug

var bugpack = require('bugpack');
var fs = require('fs');
var fs_extra = require('fs-extra');
var npm = require('npm');
var path = require('path');
var util = require('util');

npm.load({}, function (err) {
    if (err) {
        console.log(err);
        console.log(err.stack);
        process.exit(1);
        return;
    }

    var outputDirPath = './.buildbug/build/buildbug';
    var outputLibPath = outputDirPath + path.sep + 'lib';
    var sourcePaths = [
        '../bugjs/projects/bugjs/js/src',
        '../bugjs/projects/annotate/js/src',
        '../bugjs/projects/bugboil/js/src',
        '../bugjs/projects/bugflow/js/src',
        '../bugjs/projects/bugfs/js/src',
        './projects/buildbug/js/src'
    ];
    var libDirPath = './projects/buildbug/lib';
    var resourceDirPath = './projects/buildbug/resources';

    copySourcePathsToDir(sourcePaths, outputLibPath);

    copyDirContentsToDir(resourceDirPath, outputDirPath, function(err) {
        if (err) {
            throw err;
        }
        bugpack.buildRegistry(path.resolve(process.cwd(), outputDirPath), function(err, bugpackRegistry) {
            if (err) {
                throw err;
            }

            writeBugpackRegistryJson(outputDirPath, bugpackRegistry);
            writePackageJson(outputDirPath, {
                name: "buildbug",
                version: "0.0.1",
                main: "./lib/buildbug_boot.js",
                bin: "bin/buildbug",
                dependencies: {
                    bugpack: 'git+ssh://git@github.com:bneisler/bugpack.git#master',
                    "fs-extra": '0.3.x',
                    npm: '1.1.x'
                }
            });
            createNodePackage(outputDirPath);
        });
    });
});

function writeBugpackRegistryJson(outputDirPath, bugpackRegistryObject) {
    var bugpackRegistryPath = outputDirPath + '/bugpack-registry.json';
    fs.writeFileSync(bugpackRegistryPath, JSON.stringify(bugpackRegistryObject, null, '\t'));
}

function writePackageJson(outputDirPath, packageJson) {
    var packageJsonPath = outputDirPath + '/package.json';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
}

function copyDirContentsToDir(fromDir, toDir, callback) {
    var numberComplete = 0;
    var pathPartStringArray = fs.readdirSync(fromDir);
    for (var i = 0, size = pathPartStringArray.length; i < size; i++) {
        var fromPathString = fromDir + path.sep + pathPartStringArray[i];
        var toPathString = toDir + path.sep + pathPartStringArray[i];
        fs_extra.copy(fromPathString, toPathString, function(err) {
            if (err) {
                console.log(err);
                callback(err);
            }
            numberComplete++;
            if (numberComplete === pathPartStringArray.length) {
                callback();
            }
        });
    }
}

function copySourcePathsToDir(sourcePathsArray, outputDirPath) {
    sourcePathsArray.forEach(function(sourcePath) {
        var sourceFilePathsArray = scanDirectoryForSourceFiles(sourcePath);
        sourceFilePathsArray.forEach(function(sourceFilePath) {
            var relativePath = path.relative(sourcePath, sourceFilePath);
            var outputFilePath = outputDirPath + "/" + relativePath;
            copyFileSync(sourceFilePath, outputFilePath);
        });
    });
}

function copyFileSync(srcFile, destFile) {
    if (!fs.existsSync(srcFile)) {
        throw new Error("Source file '" + srcFile + "' does not exist");
    }
    var destDir = path.dirname(destFile);
    if (!fs.existsSync(destDir)) {
        fs_extra.mkdirsSync(destDir);
    }

    var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
    BUF_LENGTH = 64 * 1024;
    buff = new Buffer(BUF_LENGTH);
    fdr = fs.openSync(srcFile, 'r');
    fdw = fs.openSync(destFile, 'w');
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, buff, 0, bytesRead);
        pos += bytesRead;
    }
    fs.closeSync(fdr);
    return fs.closeSync(fdw);
}

function createNodePackage(packageDirPath) {
    npm.commands.pack([packageDirPath], function (err, data) {
        console.log("Packed up node package '" + packageDirPath + "'");
    });
}

function scanDirectoryForSourceFiles(directoryPathString) {
    var filePathArray = [];
    var fileStringArray = fs.readdirSync(directoryPathString);
    for (var i = 0, size = fileStringArray.length; i < size; i++) {
        var pathString = directoryPathString + "/" + fileStringArray[i];
        var stat = fs.statSync(pathString);
        if (stat.isDirectory()) {
            var childFilePathArray = scanDirectoryForSourceFiles(pathString);
            filePathArray = filePathArray.concat(childFilePathArray);
        } else if (stat.isFile()) {
            if (pathString.lastIndexOf('.js') === pathString.length - 3) {
                filePathArray.push(pathString);
            }
        }
    }
    return filePathArray;
}
