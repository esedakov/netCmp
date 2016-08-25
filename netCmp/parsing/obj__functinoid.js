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

//determine function type from the given name
//input(s):
//	funcName: (text) => textual representation of function name
//output(s):
//	(FUNCTION_TYPE) => type of function
functinoid.detFuncType = function(funcName){
	//initialize variable for function type to be user-defined (i.e. custom)
	var ft = FUNCTION_TYPE.CUSTOM;
	//depending on the function name, assign different type
	switch(funcName){
		case "__constructor__":
			ft = FUNCTION_TYPE.CUSTOM_CTOR;
		case "__create__":
			ft = FUNCTION_TYPE.CTOR;
			break;
		case "__add__":
			ft = FUNCTION_TYPE.ADD;
			break;
		case "__sub__":
			ft = FUNCTION_TYPE.SUB;
			break;
		case "__mul__":
			ft = FUNCTION_TYPE.MUL;
			break;
		case "__div__":
			ft = FUNCTION_TYPE.DIV;
			break;
		case "__mod__":
			ft = FUNCTION_TYPE.MOD;
			break;
		case "__tostring__":
			ft = FUNCTION_TYPE.TO_STR;
			break;
		case "__isequal__":
			ft = FUNCTION_TYPE.IS_EQ;
			break;
		case "__isless__":
			ft = FUNCTION_TYPE.IS_LESS;
			break;
		case "__isgreater__":
			ft = FUNCTION_TYPE.IS_GREATER;
		break;
		case "__clone__":
			ft = FUNCTION_TYPE.CLONE;
			break;
		case "__length__":
			ft = FUNCTION_TYPE.LENGTH;
			break;
		case "__get__":
			ft = FUNCTION_TYPE.GET;
			break;
		case "__insert__":
			ft = FUNCTION_TYPE.INSERT;
			break;
		case "__remove__":
			ft = FUNCTION_TYPE.REMOVE;
			break;
		case "__index__":
			ft = FUNCTION_TYPE.INDEX;
			break;
		case "__main__":
			ft = FUNCTION_TYPE.MAIN;
			break;
		default:
			//ES 2016-01-20: if it is not one of the special function types
			//	then it has to be CUSTOM type, so do nothing (do not error)
			//throw new Error("unkown function type - 483647234886924");
	}
	//return type to the caller
	return ft;
};	//end function 'detFuncType'

//determine name for the fundamental functinoid type
//input(s):
//	t: (FUNCTION_TYPE) => type of functinoid for which to determine function name
//output(s):
//	(text) => function name
functinoid.detFuncName = function(t){
	//depending on the function type
	switch(t.value){
		case FUNCTION_TYPE.CUSTOM_CTOR.value:
			return "__constructor__";
		case FUNCTION_TYPE.CTOR.value:
			return "__create__";
		case FUNCTION_TYPE.ADD.value:
			return "__add__";
		case FUNCTION_TYPE.SUB.value:
			return "__sub__";
		case FUNCTION_TYPE.MUL.value:
			return "__mul__";
		case FUNCTION_TYPE.DIV.value:
			return "__div__";
		case FUNCTION_TYPE.TO_STR.value:
			return "__tostring__";
		case FUNCTION_TYPE.IS_EQ.value:
			return "__isequal__";
		case FUNCTION_TYPE.IS_LESS.value:
			return "__isless__";
		case FUNCTION_TYPE.IS_GREATER.value:
			return "__isgreater__";
		case FUNCTION_TYPE.CLONE.value:
			return "__clone__";
		case FUNCTION_TYPE.MAIN.value:
			return "__main__";
		case FUNCTION_TYPE.MOD.value:
			return "__mod__";
		case FUNCTION_TYPE.LENGTH.value:
			return "__length__";
		case FUNCTION_TYPE.GET.value:
			return "__get__";
		case FUNCTION_TYPE.INSERT.value:
			return "__insert__";
		case FUNCTION_TYPE.REMOVE.value:
			return "__remove__";
		case FUNCTION_TYPE.INDEX.value:
			return "__index__";
	}
	throw new Error("unkown functinoid type - 1298321847749837483");
};	//end function 'detFuncName'

//ES 2016-08-24 (b_code_error_handling): convert operator to function name
//input(s):
//	t: (COMMAND_TYPE) command type for comparison operator
//output(s):
//	(text) => function name
functinoid.detFuncNameFromCmdTypeOp = function(t){
	//depending on command type
	switch(t.value){
		case COMMAND_TYPE.ADD.value:
			return "__add__";
		case COMMAND_TYPE.SUB.value:
			return "__sub__";
		case COMMAND_TYPE.MUL.value:
			return "__mul__";
		case COMMAND_TYPE.DIV.value:
			return "__div__";
		case COMMAND_TYPE.MOD.value:
			return "__mod__";
		case COMMAND_TYPE.BEQ.value:
			return "__isequal__";
		case COMMAND_TYPE.BGT.value:
			return "__isgreater__";
		case COMMAND_TYPE.BLE.value:
			return "__isless__";
		case COMMAND_TYPE.BLT.value:
			return "__isless__";
		case COMMAND_TYPE.BNE.value:
			return "__isequal__";
		case COMMAND_TYPE.BGE.value:
			return "__isgreater__";
		default:
			return null;
	}
};	//ES 2016-08-24 (b_code_error_handling): end method 'detFuncNameFromCmdTypeOp'

//static calls:
//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
//be invoked as a stand-alone function. The former approach that allowed function to
//be declared inside any object scope, was affecting jointJS, specifically viewport
//constructor was throwing a error.
//functinoid.inheritFrom(argument);	//functinoid <- argument (value is child of argument)
inheritFrom(functinoid, argument);
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
	//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
	//be invoked as a stand-alone function. The former approach that allowed function to
	//be declared inside any object scope, was affecting jointJS, specifically viewport
	//constructor was throwing a error.
	//this.ctorParent(argument, ARGUMENT_TYPE.FUNCTION);
	ctorParent(this, argument, ARGUMENT_TYPE.FUNCTION);
};

//add function argument
//input(s):
//	name: (string) => argument name
//	t: (type) => (ES 2015-10-01 (b_parsing_types): changed argument name) argument object type
//	cmd: (command) => function argument to add
//output(s): (none)
functinoid.prototype.addArg = 
	//ES 2015-11-01 (b_parsing_types): changed argument name because it's name
	//	collides with the class name 'type'
	function(name, t, cmd){
	//add argument to array that keeps track of defined function arguments
	//ES 2015-11-01 (b_parsing_types): changed argument name because it's name
	//	collides with the class name 'type'
	this._args.push({"name": name, "type": t, "cmd": cmd});
};

//create argument in function of this type
//input(s):
//	n: (text) argument name
//	t: (type) argument type
//output(s): (none)
functinoid.prototype.createFuncArgument = function(n, t){
	//create symbol for current argument
	var tmpCurArgSymb = new symbol(
		n,				//function's argument name
		t,				//function's argument type
		this._scope	//function's scope
	);
	//add symbol to function's scope
	this._scope.addSymbol(tmpCurArgSymb);
	//create POP command for current argument
	var c = this._scope._current.createCommand(
		COMMAND_TYPE.POP,		//pop command
		[],						//POP takes no arguments
		[tmpCurArgSymb]			//symbol representing this argument
	);
	//add argument to the function
	this.addArg(n, t, c);
};	//end function 'createFuncArgument'

//get function's argument
//input(s):
//	name: (string) => argument name
//	t: (type) => argument's object type
//output(s):
//	(command) => POP command that retrieved function argument
//	null => if such aegument was not found
functinoid.prototype.getArg =
	function(name, t){
	//loop thru array of arguments
	for( var index = 0; index < this._args.length; index++ ){
		//check name and type of currently iterated argument
		if( this._args[index].name == name && 
			this._args[index].type == t ){
			//found proper argument
			return this._args[index].cmd;
		}
	}
	//failed to find argument, return null
	return null;
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
