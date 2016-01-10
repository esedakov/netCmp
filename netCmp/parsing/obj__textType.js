/**
	Developer:	Eduard Sedakov
	Date:		2016-01-06
	Description:	text type
	Used by:	(testing)
	Dependencies: type, obj_type, functinoid, function_type
**/

//function for creating text type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__textType(gScp){
	//create dummy type text
	var tmp_txt_type = new type("text", OBJ_TYPE.TEXT, gScp);
	//create symbol 'this'
	var tmp_txt_this = new symbol("this", tmp_txt_type, tmp_txt_type._scope);
	//add 'this' to the scope
	tmp_txt_type._scope.addSymbol(tmp_txt_this);
	//create fundamental functions
	tmp_int_type.createReqMethods();
	//create symbol '_value' of type text
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