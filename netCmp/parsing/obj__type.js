/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	describe type to be used to define other objects
	Used by:	(any derived type class), symbol, functinoid, value
	Dependencies:	obj_type, scope, command, argument
**/

//==========globals:==========

//store all created types in this library:
//	key: type name (string)
//	value: reference to this type object
type.__library = {};

//unique identifier used by type
type.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
type.reset = function() {
	type.__library = {};	//set to empty hash map
	type.__nextId = 1;	//set to first available integer
};

//static calls:
type.inheritFrom(argument);		//type <- argument (type is child of argument)
type.reset();

//class "type" declaration:
//class represents type - supported by default (int, real, text, boolean) and
//	those that are created by the user in the program. The later should have
//	unique names, since types are referenced by the name, so if they collide
//	then only one will be stored (the other is going to be lost)
//input(s):
//	name: (string) => name of the type
//	t: (obj_type) => type of the type... (see type__obj.js)
//	scp: (scope) => reference to the scope where this type was defined
//output(s): (none)
function type(name, t, scp){
	//assign id
	this._id = type.__nextId++;
	//assign name
	this._name = name;
	//assign type
	this._type = t;
	//create and assign object definition scope
	this._scope = scope.createObjectScope(scp);
	//data members, represented by hash-map:
	//	key: (string) => field name (has to be unique within scope of object among fields)
	//	value: {type: (type) field type, cmd: (command) => init command (if any)}
	this._fields = {};
	//functions, represented by hash-map:
	//	key: (string) function name (has to be unique within scope of object among methods)
	//	value: (functinoid) => reference to the function object
	this._methods = {};
	//add to library
	type.__library[name] = this;
	//call parent constructor
	this.ctorParent(argument, ARGUMENT_TYPE.OBJECT);
	//TODO: create and add operators: CTOR, CLONE, IS_EQ, ...
};

//check if field has been defined in this type
//input(s):
//	name: (string) field name
//output(s):
//	(boolean) => {true} if field with specified name already exists, {false} if does not exist
type.prototype.isFieldExist =
	function (name) {
	//check if there is a key in "_fields" that is equal to {name}
	return name in this._fields;
};

//check if function/method has been defined in this type
//input(s):
//	name: (string) function name
//output(s):
//	(boolean) => {true} if method with specified name already exists, {false} if does not exist
type.prototype.isMethodExist =
	function (name) {
	//check if there is a key in "_methods" that is equal to {name}
	return name in this._methods;
};

//add field data member to this type definition
//input(s):
//	name: (string) => name of the new field
//	t: (type) => type of the new field
//	ctorCmd: (command) => command that initializes this field (if any)
//output(s): (none)
type.prototype.addField =
	function(name, t, ctorCmd) {
	//ensure thay field does not already exists in this type
	if( !this.isFieldExist( name ) ) {
		//add record for this field
		this._fields[name] = {type: t, cmd: ctorCmd};
	}
};

//add function to this type declaration
//input(s):
//	name: function name
//	funcDecl: reference to the functinoid
//output(s): (none)
type.prototype.addMethod =
	function(name, funcDecl) {
	//ensure that function declaration does not already exist in this type
	if( !this.isMethodExist( name ) ){
		//add record for this method
		this._methods[name] = funcDecl;
	}
};

//convert current type object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
type.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", name: " + this._name +
		", type: " + this._type.name +
		", scope.id: " + (this._scope === null ? "(undefined)" : this._scope._id) +
		", fields: " + hashMapToStr(this._fields) +
		", methods: " + hashMapToStr(this._methods) +
		"}";
};

//get type name of this object (i.e. type)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
type.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.value;
};

//compare with another type (it is a simple comparison operator, just check ids)
//input(s):
//	anotherType: (type) type to compare against
//output(s):
//	(boolean) => {true} if this type is equal to {anotherType}; {false} if they are not equal
type.prototype.isEqual =
	function(anotherType) {
	//make sure that {anotherType} is not null, so we can compare
	if( anotherType !== null ) {
		//ensure that {this} is of the same type as {anotherType}
		if( this.getTypeName() == anotherType.getTypeName() ) {
			//compare ids of both type objects
			return this._id == anotherType._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherType is null
	return false;
};
