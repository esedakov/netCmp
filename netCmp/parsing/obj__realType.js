/**
	Developer:	Eduard Sedakov
	Date:		2015-12-12
	Description:	floating point type
	Used by:	(testing)
	Dependencies: type, obj_type, functinoid, function_type
**/

//function for creating real type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__realType(gScp){
	//create dummy type real
	var tmp_real_type = new type("real", OBJ_TYPE.REAL, gScp);
	//create symbol 'this'
	var tmp_real_this = new symbol("this", tmp_real_type, tmp_real_type._scope);
	//add 'this' to the scope
	tmp_real_type._scope.addSymbol(tmp_real_this);
	//create symbol '_value' of type real
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