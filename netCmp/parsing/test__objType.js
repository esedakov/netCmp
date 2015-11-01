/**
	Developer:	Eduard Sedakov
	Date:		2015-10-30
	Description:	test file for object type creation
	Used by:	(testing)
	Dependencies:	program, scope, objType, obj_type, function_type, command_type
**/

//check creation of simplest type, i.e. do not use any createXXXX functions to
//	offer deault implementation of ctor, toString, isEq, and clone. Instead
//	provide fake fields inside 'funcs' attribute for objType constructor to
//	bypass code that creates default methods. This should in a way resemble
//	type VOID which does not need any methods, so it can setup fake values
//	for all required type methods.
//input(s): (none)
//output(s): (none)
function test__createSimplestType(){
	//create program and global scope
	var g_scp = util__createGlobScp();
	//create set of fake functions
	var fakeFuncs = {};
	//create single function and assign it to all required function types
	var dummyFunc = new functinoid(
		"dummyFunc",
		g_scp,
		FUNCTION_TYPE.CUSTOM,
		objType.createType(
			OBJ_TYPE.VOID.name,
			OBJ_TYPE.VOID,
			g_scp
		)
	);
	//assign dummy function to all function types, below
	fakeFuncs[FUNCTION_TYPE.CTOR.value] = dummyFunc;
	fakeFuncs[FUNCTION_TYPE.TO_STR.value] = dummyFunc;
	fakeFuncs[FUNCTION_TYPE.IS_EQ.value] = dummyFunc;
	fakeFuncs[FUNCTION_TYPE.CLONE.value] = dummyFunc;
	//create simple type
	var simpleType = new objType(
		"simplest",			//type name
		OBJ_TYPE.CUSTOM,	//it is custom type
		g_scp,				//declare inside global scope
		{},					//it is simplest type, so no data fields as well
		fakeFuncs			//fake function set
	);	//end create simplest type
};	//end function to test creating simplest type

//test creating standard type that mimics integer. Use all default methods to test
//	their operation and also have one data field and one simple custom function
//	that retrieves this data field.
//input(s): (none)
//output(s): (none)
function test__createIntLikeType(){
	//create program and global scope
	var g_scp = util__createGlobScp();
	//create integer like type
	var intType = objType.createType(
		OBJ_TYPE.INT.name,
		OBJ_TYPE.INT,
		g_scp
	);
	//create integer-like type
	var intLikeType = new objType(
		"intLike",			//type name
		OBJ_TYPE.CUSTOM,	//integer (alike) type - custom kind
		g_scp,
		{
			"_intVal" : {
				"type" : intType
			}	//provide no default command for initializing this field
		},
		{}	//use all default methods
	);
	//setup new method's name
	var getIntFuncName = "getInt";
	//create a custom function (getter) that retrieves internal field '_intVal'
	var getIntValFunc = objType.createTypeMethod(
		getIntFuncName,					//name of function
		FUNCTION_TYPE.CUSTOM.value,		//custom function type
		intType,						//return type is integer
		[
			{"this": intLikeType}
		]
	);
	//add new method
	intLikeType.addMethod(getIntFuncName, getIntValFunc);
	//create block for main body of getInt function
	var blk = getIntValFunc._scope.createBlock(true);
	//create command for addressing 'this' to ultimately access "_intVal"
	var cmdAddr = blk.createCommand(
		COMMAND_TYPE.ADDA,	//ADDA command type to compute address of data field
		[
			//reference to the object <this>
			getIntValFunc.getArg("this", intLikeType),
			//use argument name as an offset to access data field "_intVal"
			value.createValue("_intVal")
		],					//command arguments: <this>, <offset>
		[]					//no symbols attached
	);
	//create command to retrieve data field
	var cmdLoad = blk.createCommand(
		COMMAND_TYPE.LOAD,	//LOAD command type to retrieve actual data field
		[
			//ADDA command
			cmdAddr
		],
		[]					//no symbols attached
	);
	//create command to return accessed "_intVal" data field
	var retCmd = blk.createCommand(
		COMMAND_TYPE.RETURN,	//RETURN command type to return "_intVal"
		[
			//RETURN command
			cmdLoad
		],
		[]						//no symbols attached
	);
	//add return to appropriate return's command list
	getIntValFunc._return_cmds.push(retCmd);
};

//create program and within it a global scope
//input(s): (none)
//output(s):
//	(scope) => global scope that was created inside a new program
function util__createGlobScp(){
	//create program with global scope
	var prog = new program();
	//retrieve and return global scope
	return prog.getGlobalScope();
};

//run all tests and produce response message string evaluating results
//input(s): (none)
//output(s): (none)
function run_obj_type_tests() {
	//prompt
	alert("****starting testing parsing****");
	//create simplest type
	//test__createSimplestType();
	//create standard type that mimics integer
	test__createIntLikeType();
};