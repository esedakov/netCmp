/**
	Developer:	Eduard Sedakov
	Date:		2015-10-03
	Description:	represent constant value(s)
	Used by:	commmand, symbol, argument
	Dependencies:	argument
**/

//==========globals:==========

//store all created constant values in this library:
//	key: sha-256 hashing string taken from constant value
//	value: reference to this object (i.e. instance of value)
value.__library = {};

//unique identifier used by type
value.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
value.reset = function() {
	value.__library = {};		//set to empty hash map
	value.__nextId = 1;		//set to first available integer
};

//static calls:
//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
//be invoked as a stand-alone function. The former approach that allowed function to
//be declared inside any object scope, was affecting visualizer, specifically viewport
//constructor was throwing a error.
//value.inheritFrom(argument);		//value <- argument (value is child of argument)
inheritFrom(value, argument);
value.reset();


//class "value" declaration:
//class represents constant value
//input(s):
//	constVal: (Object) => constant value
//output(s): (none)
function value(constVal) {
	//assign id
	this._id = value.__nextId++;
	//assign constant value
	this._value = constVal;
	//add this object to library
	//ES 2015-11-29 (Issue 1, b_vis): changed the way 'hashCode' function declared.
	//Because, the former approach that declared this function inside global Object
	//scope was interferring with visualizer library, i.e. causing JS error when running
	//viewport constructor.
	value.__library[hashCode(this._value)] = this;
	//call parent constructor
	//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
	//be invoked as a stand-alone function. The former approach that allowed function to
	//be declared inside any object scope, was affecting visualizer, specifically viewport
	//constructor was throwing a error.
	//this.ctorParent(argument, ARGUMENT_TYPE.CONSTANT);
	ctorParent(this, argument, ARGUMENT_TYPE.CONSTANT);
};

//create or return existing value object
//input(s):
//	constValue: (Object) => constant value
//output(s):
//	(value) => reference to value object
value.createValue = function(constValue) {
	//generate hash string for constValue
	//ES 2015-11-29 (Issue 1, b_vis): changed the way 'hashCode' function declared.
	//Because, the former approach that declared this function inside global Object
	//scope was interferring with visualizer library, i.e. causing JS error when running
	//viewport constructor.
	var hash_str = hashCode(constValue);
	//check if value exists already for this constant
	if( hash_str in value.__library ) {
		//return existing value reference
		return value.__library[hash_str];
	}
	//return created instance
	return new value(constValue);
};

//convert current type object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
value.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", value: " + JSON.stringify(this._value) +
		"}";
};

//get type name of this object (i.e. type)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
value.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.VALUE;
};

//compare with another value (it is a simple comparison operator, just check ids)
//input(s):
//	anotherType: (type) type to compare against
//output(s):
//	(boolean) => {true} if this type is equal to {anotherType}; {false} if they are not equal
value.prototype.isEqual =
	function(anotherVal) {
	//make sure that {anotherVal} is not null, so we can compare
	if( anotherVal !== null ) {
		//ensure that {this} is of the same type as {anotherVal}
		if( this.getTypeName() == anotherVal.getTypeName() ) {
			//compare ids of both value objects
			return this._id == anotherVal._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherVal is null
	return false;
};
