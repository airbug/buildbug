//TODO BRN: Still figuring out if installing node modules is the responsibility of buildbug or installbug. Perhaps
// installbug is really only used for installing binaries such as node itself and redis?
afterNpmModuleInstalled(function() {
    var npm = require('npm');

    var requiredPackages = [
        {name: "fs-extra", install: "fs-extra"},
        {name: "bugpack", install: "https://s3.amazonaws.com/node_modules/bugpack-0.0.2.tgz"}
        //{name: 'bugpack', install: 'git+ssh://git@github.com:airbug/bugpack.git#master'}
    ];

    npm.load({}, function (err) {
        if (err) {
            console.log(err);
            console.log(err.stack);
            process.exit(1);
            return;
        }

        //TEST
        console.log("npm.root:" + npm.root + " npm.dir:" + npm.dir);

        requiredPackages.forEach(function(requiredPackage) {
            console.log("Installing " + requiredPackage.name);
            npm.commands.install([requiredPackage.install], function (err, data) {
                console.log("Finished installing " + requiredPackage.name);
            });
        });
    });
});

function afterNpmModuleInstalled(func) {
    try {
        var npm = require('npm');
        func();
    } catch(e) {
        var child_process = require('child_process');
        console.log("Installing npm module");
        var child = child_process.exec('npm install npm',
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('Error installing npm module: ' + error);
                } else {
                    func();
                }
            }
        );
    }
}



