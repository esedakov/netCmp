/**
	Developer:	Eduard Sedakov
	Date:		2017-12-14
	Description:	rectangle type
	Used by:	{drawing}, {quad-tree}, {math}
	Dependencies: {Point}
**/

//function for creating rectangle type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__rectType(gScp){
	//create dummy type point
	var tmp_rect_type = new type("rectangle", OBJ_TYPE.RECT, gScp);
	//create symbol 'this'
	tmp_rect_type.createField(
		"this", 							//variable name
		tmp_rect_type, 						//variable type
		tmp_rect_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for left-top vertex
	tmp_rect_type.createField(
		"_lt",								//variable name
		type.__library["point"],			//variable type
		tmp_rect_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_width'
	tmp_rect_type.createField(
		"_width", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_rect_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_height'
	tmp_rect_type.createField(
		"_height", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_rect_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_rect_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};