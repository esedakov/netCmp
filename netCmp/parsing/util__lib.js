/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	variety of auxilary functions that facilitate work of parser
	Used by:	(any class)
	Dependencies:	util__sha256.js
**/

//==========inheritance==========
//inherite this class (referred by Object) from specified parent class
//input(s):
//	parentClass: (Object) => class to inherit from
//output(s): (none)
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

//==========hashing==========
//generate hashing string for specified object
//input(s):
//	obj: (Object) => object (of any type) that needs to be hashed
//output(s):
//	(string) => hash value
Object.prototype.hashCode = function() {
	Sha256.hash(JSON.stringify(this));
};
