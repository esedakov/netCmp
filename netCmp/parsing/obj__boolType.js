/**
	Developer:	Eduard Sedakov
	Date:		2016-01-06
	Description:	boolean type
	Used by:	(testing)
	Dependencies: type, obj_type, functinoid, function_type
**/

//function for creating boolean type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__booleanType(gScp){
	//create dummy type boolean
	var tmp_bool_type = new type("boolean", OBJ_TYPE.BOOL, gScp);
	//create symbol 'this'
	tmp_bool_type.createField(
		"this", 							//variable name
		tmp_bool_type, 						//variable type
		tmp_bool_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_bool_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
	//create symbol '_value' of type integer
	//var tmp_int_valSymb = new symbol("_value", tmp_int_type, tmp_int_type._scope);
	//add '_value' to the scope
	//tmp_int_type._scope.addSymbol(tmp_int_valSymb);
	//create default constructor
	//var tmp_int_ctorFunc = new functinoid(
	//	"__create__",			//function name
	//	tmp_int_type._scope,	//function scope
	//	FUNCTION_TYPE.CTOR,		//type of function is constructor
	//	tmp_int_type			//returns create type
	//);
	//add constructor method to the type definition
	//tmp_int_type.addMethod("__create__", tmp_int_ctorFunc);
};