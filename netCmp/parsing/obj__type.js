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
//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
//be invoked as a stand-alone function. The former approach that allowed function to
//be declared inside any object scope, was affecting jointJS, specifically viewport
//constructor was throwing a error.
//type.inheritFrom(argument);		//type <- argument (type is child of argument)
inheritFrom(type, argument);
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
	//parent type
	this._parentType = null;
	//create and assign object definition scope
	this._scope = scope.createObjectScope(scp, name, this);
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
	//if this type uses templates, then parser would design a separate type specifier for
	//	each used combination of templates. In this case there would be two kinds of type
	//	spccifier. I would call them as a BASE and as DERIVED. Base type is the one where
	//	template types are not yet determined, i.e. not linked to specific types. This type
	//	is created first and contains all data and method fields. On the contrary, derived
	//	type has associated templates with specific types; it also does not have any data
	//	and method fields defined, instead it refers to base type to get those fields.
	//if _baseType is null AND it has templates, then this is a base type
	this._baseType = null;
	//hashmap array of template type and associated type specifier. Note that base type 
	//	does not have any information for hashmap values, since it lacks template 
	//	associations info
	this._templateNameArray = [];	//{name, type}
	//call parent constructor
	//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
	//be invoked as a stand-alone function. The former approach that allowed function to
	//be declared inside any object scope, was affecting jointJS, specifically viewport
	//constructor was throwing a error.
	//this.ctorParent(argument, ARGUMENT_TYPE.OBJECT);
	ctorParent(this, argument, ARGUMENT_TYPE.OBJECT);
	//TODO: create and add operators: CTOR, CLONE, IS_EQ, ...
};

//create DERIVED templated type
//input(s):
//	baseTy: (type) base type specifier
//	tmplTyArr: (Array<type>) template type association array. It has to specify associated
//		types in the order that base type requires.
//output(s):
//	(type) => derived templated type
type.createDerivedTmplType = function(baseTy, tmplTyArr){
	//first of check that this base type actually is valid type object
	if( baseTy === null && baseTy.getTypeName() !== RES_ENT_TYPE.value ){
		//not a valid type object, throw a parsing error
		throw new Error("63786528563876");
	}
	//check if template type array has different size then the base template array
	if( tmplTyArr.length != baseTy._templateNameArray.length ){
		//derived template type has wrong number of templates; this is a user code bug
		return null;
	}
	//compose type name that includes information about templated types
	var tyTmplName = baseTy._name + '<';
	//loop thru template array and append templated type names
	for(var i = 0; i < tmplTyArr.length; i++ ){
		//append template type
		tyTmplName += tmplTyArr[i]._name + (i > 0 ? "," : "");
	}
	//check if this type already exists
	if( tyTmplName in type.__library ){
		//if it exists, return type
		return type.__library[tyTmplName];
	}
	//create derived type object
	var derTyObj = new type(tyTmplName, baseTy._type, baseTy._scope);
	//assign base type
	derTyObj._baseType = baseTy;
	//loop thru templates
	for( var k = 0; k < tmplTyArr.length; k++ ){
		//assign template element
		derTyObj._templateNameArray[k].type = tmplTyArr[k];
	}
	//return newly created derived template type
	return derTyObj;
};	//end function 'createDerivedTmplType'

//is this type uses templates
//input(s): (none)
//output(s):
//	(boolean) => does this type uses templates
type.prototype.isTmplType = function(){
	//check if array of templates is non-empty
	return this._templateNameArray.length > 0;
};	//end function 'isTmplType'

//is this a base templated type
//input(s): (none)
//output(s):
//	(boolean) => is this a base templated type
type.prototype.isTmplBaseType = function(){
	//is this type has no base type and has at least one template
	return this._baseType == null && this._templateNameArray.length > 0;
};	//end function 'isBaseType'

//is this is a derived templated type
//input(s): (none)
//output(s):
//	(boolean) => is this a derived templated type
type.prototype.isTmplDerivedType = function(){
	//is this type has base and has at least one template
	return this._baseType !== null && this._templateNameArray.length > 0;
};	//end function 'isTmplDerivedType'

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
		//specify type's scope as a parent for this function AND add function's
		//scope to the type
		this._scope.addScope(funcDecl._scope);
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
