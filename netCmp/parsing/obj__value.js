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
	value.inheriteFrom(argument);	//value <- argument (value is child of argument)
};

//static calls:
value.reset();

//==========inheritance==========


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
	value.__library[this._value.hashCode()] = this;
};

//create or return existing value object
//input(s):
//	constValue: (Object) => constant value
//output(s):
//	(value) => reference to value object
value.createValue = function(constValue) {
	//generate hash string for constValue
	var hash_str = constValue.hashCode();
	//check if value exists already for this constant
	if( hashStr in value.__library ) {
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
	//make sure that {anotherType} is not null, so we can compare
	if( anotherVal !== null ) {
		//ensure that {this} is of the same type as {anotherType}
		if( this.getTypeName() == anotherVal.getTypeName() ) {
			//compare ids of both type objects
			return this._id == anotherType._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherVal is null
	return false;
};
