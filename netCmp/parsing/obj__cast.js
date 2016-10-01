/**
	Developer:	Eduard Sedakov
	Date:		2016-09-23
	Description:	cast component
	Used by:	{interpreter}
	Dependencies: (none)
**/

//function for creating cast component
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__castType(gScp){
	//create dummy component cast
	var tmp_cast_type = new type("cast", OBJ_TYPE.CAST, gScp);
	//create symbol 'this'
	tmp_cast_type.createField(
		"this", 							//variable name
		tmp_cast_type, 						//variable type
		tmp_cast_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_cast_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};