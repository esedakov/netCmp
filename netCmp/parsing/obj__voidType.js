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
	tmp_void_type.createField(
		"this", 							//variable name
		tmp_void_type, 						//variable type
		tmp_void_type._scope._start			//first block in the type's scope
	);
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
	//create fundamental functions
	//tmp_void_type.createReqMethods();
};