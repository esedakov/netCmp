/**
	Developer:		Eduard Sedakov
	Date:			2015-10-27
	Description:	general object type that initializes required fields and methods that each type should have
	Used by:		parsing
	Dependencies:	util, type, obj_type, function_type, scope, COMMAND_TYPE
**/

//==========globals:==========

//==========statics:==========
//create or return existing type
//input(s):
//	n: (string) => type name
//	t: (obj_type) => reference to type object
//	s: (scope) => scope that will own this type 
//output(s):
//	(type) => new/existing type
objType.createType = function(n, t, s){
	//initialize returned type
	var retTy = null;
	//check if this is a base type and if it was already defined
	if( t !== OBJ_TYPE.CUSTOM && (n in type.__library) ){
		//assign a type
		retTy = type.__library[n];
		//determine if this type has any methods
		if( isEmptyCollection(retTy._methods) == false ){
			//then this is type was probably fully initialized, return it right away
			return retTy;
		}
	} else {	//otherwise, create a new type
		//create empty type object
		retTy = new type(n, t, s);
	}
	return retTy;
};

//class general object type
//input(s):
//	n: (string) => type name
//	t: (obj_type) => reference to type object
//	s: (scope) => scope that will own this type
//	fields: {
//		key: (string) field name
//		value: (type) reference to type object that defines this field
//	}
//	funcs: {
//		key: function_type
//		value: {
//			name: function name
//			args: Array[{
//				name: (text) argument name
//				type: (obj_type) argument type
//			}]
//		}
//	}
//output(s):
//	(type) => type object created
function objType(n, t, s, fields, funcs){
	//create empty type object
	this._typeObj = objType.createType(n, t, s);
	//assign fields
	this._typeObj._fields = fields;
	//check if constructor is not inside the functions arguments list
	if( !(FUNCTION_TYPE.CTOR.value in funcs) ){
		funcs[FUNCTION_TYPE.CTOR.value] = {
			"name": "create",
			"args": []
		};
	}
	//check if TO_STR is not inside the functions arguments list
	if( !(FUNCTION_TYPE.TO_STR.value in funcs) ){
		funcs[FUNCTION_TYPE.TO_STR.value] = {
			"name": "toString",
			"args": []
		};
	}
	//check if IS_EQ is not inside the functions arguments list
	if( !(FUNCTION_TYPE.IS_EQ.value in funcs) ){
		funcs[FUNCTION_TYPE.IS_EQ.value] = {
			"name":"isEqual",
			"args": [{"name":"obj", "type":this._typeObj}]
		};
	}
	//check if CLONE is not inside the functions arguments list
	if( !(FUNCTION_TYPE.CLONE.value in funcs) ){
		funcs[FUNCTION_TYPE.CLONE.value] = {
			"name":"clone",
			"args": []
		};
	}
	//loop thru functions
	$.each(
		funcs,	//hashmap of functions
		function(key, value){	//key: function type, value: func info
			//check if value is object containing function information
			if( typeof value == "object" && 
				"name" in value && "start" in value && "args" && value ){
				//initialize return type
				var funcRetType = null;
				//determine return type
				switch(key){
					case FUNCTION_TYPE.CTOR.value:
					case FUNCTION_TYPE.ADD.value:
					case FUNCTION_TYPE.SUB.value:
					case FUNCTION_TYPE.MUL.value:
					case FUNCTION_TYPE.DIV.value:
					case FUNCTION_TYPE.CLONE.value:
						//assign function's return type to be this type, itself
						funcRetType = this._typeObj;
						break;
					case FUNCTION_TYPE.TO_STR.value:
						//get text type
						var textType = objType.createType(
								OBJ_TEXT.TEXT.name, OBJ_TYPE.TEXT, s);
						//assign function's return type to be text
						funcRetType = textType;
						break;
					case FUNCTION_TYPE.IS_EQ.value:
						//get boolean type
						var boolType = objType.createType(
							OBJ_TYPE.BOOL.name, OBJ_TYPE.BOOL, s);
						//assign function's return type to be boolean
						funcRetType = boolType;
						break;
					case FUNCTION_TYPE.MAIN.value:
						//get integer type
						var intType = objType.createType(
							OBJ_TYPE.INT.name, OBJ_TYPE.INT);
						//assign function's return type to be integer
						funcRetType = intType;
						break;
				}	//end switch to determine return type
				//create a method with specified arguments (if any)
				var methodRef = this.createTypeMethod(
					value.name, 	//method's name
					key, 			//function's type
					funcRetType, 	//return value type
					value.args		//array of arguments info strucures
				);
			}	//end if object contains function information
		}	//end iterating function
	);	//end loop thru functions
	//return type object back to caller
	return this._typeObj;
};

//create blocks that define code for default ctor, which initializes all 
//type arguments  with default value (with their corresponding constructors)
//input(s):
//	s: (scope) function's scope where it should be created
//	fields: {
//		key: (string) field name
//		value: (type) reference to type object that defines this field
//	}
//output(s):
objType.prototype.createDefCtor = function(s, fields){
	//TODO
};

//create and subsequently add new method to the type
//input(s):
//	funcName: (string) => function name that should be unique within scope of this type
//	funcType: (function_type) => type of the function
//	retType: (obj_type) => type of object returned by this method
//	args: (Array<{name: (text) func-argument name, type: (obj_type) type of argument}>)
//output(s):
//	(functinoid) => function reference
objType.prototype.createTypeMethod =
	function(funcName, funcType, retType, args){
	//create method
	var func_obj = new functinoid(
		funcName,				//function name
		this._typeObj._scope,	//scope where type is declared
		funcType,				//type of function
		retType					//type of object returned
	);
	//attach new method to the type
	this._typeObj.addMethod(funcName, func_obj);
	//check that args is not a NULL
	if( args !== null ){
		//loop thru function arguments and for each create symbol and attach as field
		for( var elemIndex = 0; elemIndex < args.length; elemIndex++ ){
			//create symbol representing argument
			var argSymb = new symbol(
				args[elemIndex].name, 	//argument name
				args[elemIndex].type,	//argument type
				func_obj._scope);		//function's scope
			//attach argument to function's scope
			func_obj._scope.addSymbol(argSymb);
			//create POP command that should during execution of program retrieve argument's value
			var argPopCmd = func_obj._scope._current.createCommand(
				COMMAND_TYPE.POP,	//pop for retrieving argument's value
				[],					//POP has no arguments
				[argSymb]			//symbol linked to POP command
			);
		}
	}
	//return function reference
	return func_obj;
};