/**
	Developer:	Eduard Sedakov
	Date:		2015-10-07
	Description:	describe function definition
	Used by:	type, command, scope
	Dependencies:	argument, type__function, command, symbol, scope, type
**/

//==========globals:==========

//unique identifier used by symbol
functinoid.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
functinoid.reset = function() {
	functinoid.__nextId = 1;		//set to first available integer
};

//static calls:
functinoid.inheritFrom(argument);	//functinoid <- argument (value is child of argument)
functinoid.reset();

//class functinoid
//represent function defintion and associated code
//input(s):
//	name: (string) => function name unique within defined scope
//	scp: (scope) => reference to scope - global or defined type
//	func_type: (FUNCTION_TYPE) => type of function
//	ret_type: (type) => function return type
//output(s): (none)
function functinoid(name, scp, func_type, ret_type){
	//assign id
	this._id = functinoid.__nextId++;
	//assign name
	this._name = name;
	//assign scope info
	this._scope = scope.createFunctionScope(scp);
	//assign functinoid reference
	this._scope._funcDecl = this;
	//assign object type to which this function belongs (if null, then it is a global
	//scope function and does not belong to any type -- can be executed anywhere)
	this._func_type = func_type;
	//initialize array of arguments to empty
	//_args = Array<{name:<string>, type:<type>, cmd:<command>}>
	this._args = [];
	//assign return type
	this._return_type = ret_type;
	//initialize array of return commands to empty
	this._return_cmds = [];
	//call parent constructor
	this.ctorParent(argument, ARGUMENT_TYPE.FUNCTION);
};

//add function argument
//input(s):
//	name: (string) => argument name
//	type: (type) => argument object type
//	cmd: (command) => function argument to add
//output(s): (none)
functinoid.prototype.addArg = 
	function(name, type, cmd){
	//add argument to array that keeps track of defined function arguments
	this._args.push({"name": name, "type": type, "cmd": cmd});
};

//convert current functinoid object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
functinoid.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", name: " + this._name +
		", scope.id: " + this._scope._id +
		", func_type: " + this._func_type +
		", return_type: " + this._return_type +
		", args: " + arrToStr(this._args) +
		"}";
};

//get type name of this object (i.e. type)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
functinoid.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.FUNCTION;
};

//compare with another function (it is a simple comparison operator, just check ids)
//input(s):
//	anotherFunc: (type) type to compare against
//output(s):
//	(boolean) => {true} if this type is equal to {anotherFunc}; {false} if they are not equal
functinoid.prototype.isEqual =
	function(anotherFunc) {
	//make sure that {anotherType} is not null, so we can compare
	if( anotherFunc !== null ) {
		//ensure that {this} is of the same type as {anotherFunc}
		if( this.getTypeName() == anotherFunc.getTypeName() ) {
			//compare ids of both type objects
			return this._id == anotherFunc._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherFunc is null
	return false;
};
