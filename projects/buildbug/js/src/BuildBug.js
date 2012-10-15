//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildBug')

//@Require('Annotate')
//@Require('BuildModule')
//@Require('BuildProject')
//@Require('BuildTask')
//@Require('Class')
//@Require('Map')
//@Require('Obj')

// TODO BRN: Requiring these feels a bit like a hack. Seems like we should be able to have a compile time process
// identify other annotations and allow the compiler to drag necessary files in.

//@Require('AnnotateJsModule')
//@Require('ClientJsModule')
//@Require('NodeJsModule')


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildBug = Class.extend(Obj, {});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @private
 * @type {BuildProject}
 */
BuildBug.buildProject = new BuildProject();


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {string} taskName
 * @param {function()} taskFunction
 * @return {BuildTask}
 */
BuildBug.addTask = function(taskName, taskFunction) {
    var buildTask = new BuildTask(taskName, taskFunction);
    BuildBug.buildProject.addTask(buildTask);
    return buildTask;
};

/**
 * @param {string} taskName
 * @return {BuildTask}
 */
BuildBug.getTask = function(taskName) {
    return BuildBug.buildProject.getTask(taskName);
};

/**
 * @param {string} taskName
 */
BuildBug.defaultTask = function(taskName) {
    var buildTask = BuildBug.buildProject.getTask(taskName);
    BuildBug.buildProject.setDefaultTask(buildTask);
};

/**
 * @param {string} moduleName
 */
BuildBug.enableModule = function(moduleName) {
    BuildBug.buildProject.enableModule(moduleName);
};

/**
 * @param {Object} properties
 */
BuildBug.updateProperties = function(properties) {
    BuildBug.buildProject.updateProperties(properties);
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @private
 * @param {string} moduleName
 * @param {Class} buildModuleClass
 */
BuildBug.registerModule = function(moduleName, buildModuleClass) {
    BuildBug.buildProject.registerModule(moduleName, buildModuleClass);
};

/**
 * @private
 */
BuildBug.bootstrap = function() {
    Annotate.registerAnnotationProcessor('BuildModule', function(annotation) {
        BuildBug.registerModule(annotation.getParamList().getAt(0), annotation.getReference());
    });

    // NOTE BRN: By using a setTimeout here we allow the buildbug script to declare all of its tasks and perform all
    // of its setup before we begin executing the build.

    setTimeout(function() {
        var targetTaskName = "";
        if (process.argv.length >= 2) {
            targetTaskName = process.argv[2];
        }
        var targetTask = BuildBug.getTask(targetTaskName);
        if (targetTask) {
            BuildBug.buildProject.setTargetTask(targetTask);
        }
        BuildBug.buildProject.startBuild();
    }, 0);
};

BuildBug.bootstrap();
