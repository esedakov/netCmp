/**
	Developer:	Eduard Sedakov
	Date:		2016-09-21
	Description:	file properties type
	Used by:	{file manipulations}
	Dependencies: (none)
**/

//function for creating file properties type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__drawingType(gScp){
	//create dummy type file properties
	var tmp_pt_type = new type("fileprop", OBJ_TYPE.POINT, gScp);
	//create symbol 'this'
	tmp_pt_type.createField(
		"this", 							//variable name
		tmp_pt_type, 						//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_pt_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};