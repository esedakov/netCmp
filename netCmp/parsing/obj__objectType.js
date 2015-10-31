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
//		value: {
//			type: (type) reference to type object that defines this field.
//			cmd: (command) command that initializes this field (if any)
//		}
//	}
//	funcs: {
//		key: function_type
//		value: functinoid object
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
		//create default cosntructor
		createDefCtor(fields);
	}
	//check if TO_STR is not inside the functions arguments list
	if( !(FUNCTION_TYPE.TO_STR.value in funcs) ){
		//create to string method
		createToString();
	}
	//check if IS_EQ is not inside the functions arguments list
	if( !(FUNCTION_TYPE.TO_STR.value in funcs) ){
		//create to string method
		createIsEq();
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
		function(key, value){	//key: function type, value: functinoid reference
			//add functinoid to type's method list
			this._typeObj._methods[value._name] = value;
			//specify type's scope as a parent for this function AND add function's
			//scope to the type
			this._typeObj.addScope(value._scope);
		}	//end iterating function
	);	//end loop thru functions
	//return type object back to caller
	return this._typeObj;
};	//end ctor function 'objType'

//create block(s) that define code for 'isEq' method, which determines whether
//	two given objects (of the same type) are equal or not
//input(s):
//	s: (scope) function's scope where it should be created
//	fields: {
//		key: (string) field name
//		value: (type) reference to type object that defines this field
//	}
//output(s):
//	(block) => function isEq
objType.prototype.createIsEq = function(){
	//create function for default constructor
	var methodRef = this.createTypeMethod(
		FUNCTION_TYPE.IS_EQ.name, 		//method's name
		FUNCTION_TYPE.IS_EQ.value,		//function's type
		objType.createType(
			OBJ_TEXT.BOOL.name, 	//type name
			OBJ_TYPE.BOOL, 			//type is BOOL
			this._typeObj._scope	//scope
		),								//return type is boolean
		[
			{"this", this._typeObj},//this instance of object
			{"obj", this._typeObj}	//another object to compare against
		]								//array of arguments info strucures
	);
	//create block for main body of isEq method
	var blk = methodRef._scope.createBlock(true);
	//call an external function (written in JS) to perform a comparison
	//the reason it has to be done in JS, is because all types (including
	//the fundamental such integer, real, array, ...) are need to be init
	//using this function and they would not be able to, since this 
	//function requires basic types (at least) to be already initialized
	var cmdExt = blk.createCommand(
		//make a call to JS function (that is why it is external)
		COMMAND_TYPE.EXTERNAL,
		[
			methodRef._args[0], 	//it -> this
			methodRef._args[1]		//other -> obj
		],
		[]		//no symbols attached to this command
	);
	//create return command that returns a boolean result of isEqual function
	var retCmd = blk.createCommand(
		COMMAND_TYPE.RETURN,	//command for returning a value
		[
			cmdExt				//EXTERNAL command that contains (if any) 
								//result of external function call
		],
		[]						//no symbols associated with this return command
	);
	//add return command to function's return list
	methodRef._return_cmds.push(retCmd);
	return methodRef;
};	//end function 'createIsEq'

//function that is called via EXTERNAL command from interpreted code to perform
//comparison of two given objects (it that refers to this object) and other (that
//should be compared against).
//input(s):
//	it: (command) command that represents <this> object
//	other: (command) command that represents another object to compare with <this>
//output(s):
//	set (in the way I am not sure yet) boolean result of EXTERNAL command
function isEqual(it, other){
	/*pseudo-code:
		isEqual(it, other) {
			var fieldNameLst = new Array([...]);
			var i = 0, max = fieldNameList.length();
			while( i < max ){
				var curFieldName = fieldNameList[i];
				if( it.[curFieldName] != other.[curFieldName] ){
					return false;
				}
			}
			return true;
		}
	*/
	//TODO: this function is best to do after or at the time of making interpreter
};

//create block(s) that define code for toString method, which converts
//this type (its fields) to a string
//input(s): (none)
//	}
//output(s):
//	(block) => function toString
objType.prototype.createToString = function(){
	//create function for default constructor
	var methodRef = this.createTypeMethod(
		FUNCTION_TYPE.TO_STR.name, 		//method's name
		FUNCTION_TYPE.TO_STR.value,		//function's type
		objType.createType(
			OBJ_TEXT.TEXT.name, 	//type name
			OBJ_TYPE.TEXT, 			//type is TEXT
			this._typeObj._scope	//scope
		),								//return type is text
		[
			{"this", this._typeObj}	//this instance of object
		]								//array of arguments info strucures
	);
	//create block for main body of toString method
	var blk = methodRef._scope.createBlock(true);
	//create constant that textually represents this object
	var cmdTextRep = blk.createCommand(
		COMMAND_TYPE.NULL,		//create constant string value
		[
			value.createValue("object of type " + this._typeObj._name)
		],
		[]						//no symbols associated with this constant
	);
	//create return command that returns a constant
	var retCmd = blk.createCommand(
		COMMAND_TYPE.RETURN,	//command for returning a value
		[
			cmdTextRep			//constant command that represents this obejct textually
		],
		[]						//no symbols associated with this return command
	);
	//add return command to function's return list
	methodRef._return_cmds.push(retCmd);
	return methodRef;
};	//end function 'createToString'

//create block(s) that define code for default ctor, which initializes all 
//type arguments  with default value (with their corresponding constructors)
//input(s):
//	fields: {
//		key: (string) field name
//		value: {
//			type: (type) reference to type object that defines this field
//			cmd: (command) command that initializes this field (optional)
//		}
//	}
//output(s):
//	(functinoid) => function that represents default constructor
objType.prototype.createDefCtor = function(fields){
	//create function for default constructor
	var methodRef = this.createTypeMethod(
		FUNCTION_TYPE.CTOR.name, 		//method's name
		FUNCTION_TYPE.CTOR.value,		//function's type
		objType.createType(
			OBJ_TEXT.VOID.name, 	//type name
			OBJ_TYPE.VOID, 			//type is TEXT
			this._typeObj._scope	//scope
		),								//return value type
		[]								//array of arguments info strucures
	);
	//create block for default ctor
	var blk = methodRef._scope.createBlock(true);
	//loop thru fields
	$.each(
		fields,
		//iterating function to loop thru fields
		function(key, val){	//key => name, val => {type, cmd} (cmd is optional)
			//create symbol representing currently iterated field
			var symbField = new symbol(
				key,					//name of the field
				val.type,				//field's type
				this._typeObj._scope	//scope for the type object
			);
			//add symbol to type's scope
			this._typeObj._scope.addSymbol(symbField);
			//check if initializing command is not given
			if( !("cmd" in val) || val.cmd == null ){
				//determine type of command to use for initialization
				var cmdType = COMMAND_TYPE.NULL;
				//determine argument for such command
				var cmdArgVal = null;
				//depending on the type of initialized field
				switch(val.type){
					case OBJ_TYPE.VOID.value:
						throw new Error("cannot instantiate void type");
						break;
					case OBJ_TYPE.INT.value:
						//assign integer 0
						cmdArgVal = 0;
						break;
					case OBJ_TYPE.REAL.value:
						//assign floating point 0.0f
						cmdArgVal = 0.0;
						break;
					case OBJ_TYPE.TEXT.value:
						//assign empty string
						cmdArgVal = "";
						break;
					case OBJ_TYPE.BOOL.value:
						//assign false
						cmdArgVal = false;
						break;
					case OBJ_TYPE.ARRAY.value:
					case OBJ_TYPE.HASH.value:
						//need to invoke ctor for Array or hashmap
						cmdType = COMMAND_TYPE.CALL;
						//Commants only: no arguments needed, so leave cmdArgVal as null
						break;
					case OBJ_TYPE.CUSTOM.value:
						//if default ctor is defined, then use it to initialize field
						if( 
							//need to check if ctor is defined for custom type
							(FUNCTION_TYPE.CTOR.name in val.type._methods) &&

							//if it is defined, check if it is default ctor, i.e. ctor
							//that does not need any arguments
							(val.type._methods[FUNCTION_TYPE.CTOR.name]._args.length == 0)
						) {
							//call its constructor to initialize field with no
							//arguments specified
							cmdType = COMMAND_TYPE.CALL;
						} else {	//otherwise, set field to NULL
							//Comments only: do not use any arguments, since we do not 
							//know how this type should be initialized
						}
						break;
				}	//end switch to determine type of initialized field
				//create command
				blk.createCommand(

					//determined command type
					cmdType,

					//array of arguments
					(cmdArgVal == null ? [] : [value.createValue(cmdArgVal)]),

					//array of symbols that represents initialized field
					[symbField]
				);
			} else {	//if command is given, then add it to the function
				//add command to the block
				blk.addCommand(val.cmd);
				//attach symbol to this command
				val.cmd.addSymbol(symbField);
			}	//end if command is not given
		};	//end iterating function
	);	//end $.each to loop thru fields
	return methodRef;
};	//end function 'createDefCtor'

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
			//add argument to the function
			func_obj.addArg(
				args[elemIndex].name,
				args[elemIndex].type,
				argPopCmd
			);
		}
	}
	//return function reference
	return func_obj;
};