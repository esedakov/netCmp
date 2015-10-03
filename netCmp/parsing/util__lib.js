/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	variety of auxilary functions that facilitate work of parser
	Used by:	(any class)
	Dependencies:	(none)
**/

//==========inheritance==========
Object.prototype.inheriteFrom = function(parentClass) {
	//initialize array of arguments passed used by parent constructor
	var arrParClsArgs = [];
	//compose array of arguments passed for parent class constructor
	for( var i = 1; i < arguments.length; i++ ) {
		//add argument
		arrParClsArgs.push(arguments[i]);
	}
	//call parent constructor with composed arguments
	parentClass.apply(this, arrParClsArgs);
	//inherite from parent class
	this.prototype = Object.create(parentClass.prototype);
};
