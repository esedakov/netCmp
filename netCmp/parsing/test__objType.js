/**
	Developer:	Eduard Sedakov
	Date:		2015-10-30
	Description:	test file for object type creation
	Used by:	(testing)
	Dependencies:	program, scope, objType, obj_type, function_type
**/

//check creation of simplest typ, i.e. do not use any createXXXX functions to
//	offer deault implementation of ctor, toString, isEq, and clone. Instead
//	provide fake fields inside 'funcs' attribute for objType constructor to
//	bypass code that creates default methods. This should in a way resemble
//	type VOID which does not need any methods, so it can setup fake values
//	for all required type methods.
//input(s): (none)
//output(s): (none)
function test__createSimplestType(){
	//first create program with global scope
	var prog = new program();
	//get global scope
	var g_scp = prog.getGlobalScope();
	//create simple type
	var simpleType = new objType(
		"simplest",			//type name
		OBJ_TYPE.CUSTOM,	//it is custom type
		g_scp,				//declare inside global scope
		{},					//it is simplest type, so no data fields as well
		{
			FUNCTION_TYPE.CTOR.value : null,	//it is a fake value
			FUNCTION_TYPE.TO_STR.value : null,
			FUNCTION_TYPE.IS_EQ.value : null,
			FUNCTION_TYPE.CLONE.value : null
		}
	);	//end create simplest type
};	//end function to test creating simplest type

//run all tests and produce response message string evaluating results
//input(s): none
//output(s): (none)
function run_obj_type_tests() {
	//prompt
	alert("****starting testing parsing****");
	//create simplest type
	test__createSimplestType();
};