/**
	Developer:	Eduard Sedakov
	Date:		2016-02-18
	Description:	void type
	Used by:	(testing)
	Dependencies: type, obj_type, functinoid, function_type
**/

//function for creating void type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__voidType(gScp){
	//create dummy type void
	var tmp_void_type = new type("void", OBJ_TYPE.VOID, gScp);
	//create symbol 'this'
	var tmp_void_this = new symbol("this", tmp_void_type, tmp_void_type._scope);
	//add 'this' to the scope
	tmp_void_type._scope.addSymbol(tmp_void_this);
	//create fundamental functions
	//tmp_void_type.createReqMethods();
};