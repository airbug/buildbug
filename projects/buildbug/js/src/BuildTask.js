//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BuildTask')

//@Require('Class')
//@Require('List')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BuildTask = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(name, method) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {List<string>}
         */
        this.dependentTaskNames = new List();

        /**
         * @private
         * @type {boolean}
         */
        this.executed = false;

        /**
         * @private
         * @type {function()}
         */
        this.method = method;

        /**
         * @private
         * @type {string}
         */
        this.name = name;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {List<string>}
     */
    getDependentTaskNames: function() {
        return this.dependentTaskNames;
    },

    /**
     * @return {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @return {boolean}
     */
    hasExecuted: function() {
        return this.executed;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Object} taskExecutionContext
     */
    execute: function(taskExecutionContext) {
        if (!this.executed) {
            console.log("Executing task " + this.name);
            this.method.call(taskExecutionContext);
            console.log("Completed task " + this.name);
            this.executed = true;
        }
    },

    /**
     * @param {string} taskName
     */
    dependsOn: function(taskName) {
        if (!this.dependentTaskNames.contains(taskName)) {
            this.dependentTaskNames.add(taskName);

            //TODO BRN: Validate that there are no circular dependencies.

        }
    }
});
