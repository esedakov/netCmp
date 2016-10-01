/**
	Developer:	Eduard Sedakov
	Date:		2016-09-23
	Description:	math component
	Used by:	{interpreter}
	Dependencies: (none)
**/

//function for creating math component
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__mathType(gScp){
	//create dummy component math
	var tmp_math_type = new type("math", OBJ_TYPE.MATH, gScp);
	//create symbol 'this'
	tmp_math_type.createField(
		"this", 							//variable name
		tmp_math_type, 						//variable type
		tmp_math_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_math_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};