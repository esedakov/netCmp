/**
	Developer:	Eduard Sedakov
	Date:		2016-06-05
	Description:	drawing type
	Used by:	(testing)
	Dependencies: type, obj_type, functinoid, function_type
**/

//function for creating point type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__drawingType(gScp){
	//create dummy type drawing
	//var tmp_txt_type = new type("text", OBJ_TYPE.TEXT, gScp);
	var tmp_drw_type = new type("drawing", OBJ_TYPE.DRAWING, gScp);
	//create symbol 'this'
	tmp_drw_type.createField(
		"this", 							//variable name
		tmp_drw_type, 						//variable type
		tmp_drw_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_drw_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
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