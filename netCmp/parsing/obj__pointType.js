/**
	Developer:	Eduard Sedakov
	Date:		2016-09-21
	Description:	point type
	Used by:	{drawing}, {math}
	Dependencies: (none)
**/

//function for creating point type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__pointType(gScp){
	//create dummy type point
	var tmp_pt_type = new type("point", OBJ_TYPE.POINT, gScp);
	//create symbol 'this'
	tmp_pt_type.createField(
		"this", 							//variable name
		tmp_pt_type, 						//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_x' (x-coordinate)
	tmp_pt_type.createField(
		"_x", 								//variable name
		type.__library["integer"], 			//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_y' (y-coordinate)
	tmp_pt_type.createField(
		"_y", 								//variable name
		type.__library["integer"], 			//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_pt_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};