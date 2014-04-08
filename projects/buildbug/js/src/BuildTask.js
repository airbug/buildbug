//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('buildbug.BuildTask')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var Obj         = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildTask = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(taskName, taskMethod, taskContext) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Object}
         */
        this.taskContext = taskContext;

        /**
         * @private
         * @type {function()}
         */
        this.taskMethod = taskMethod;

        /**
         * @private
         * @type {string}
         */
        this.taskName = taskName;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Object}
     */
    getTaskContext: function() {
        return this.taskContext;
    },

    /**
     * @return {function()}
     */
    getTaskMethod: function() {
        return this.taskMethod;
    },

    /**
     * @return {string}
     */
    getTaskName: function() {
        return this.taskName;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('buildbug.BuildTask', BuildTask);
