/**
	Developer:	Eduard Sedakov
	Date:		2016-09-23
	Description:	file type
	Used by:	{file manipulations}, {interpreter}
	Dependencies: (none)
**/

//function for creating file type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__fileType(gScp){
	//create dummy type file
	var tmp_file_type = new type("file", OBJ_TYPE.FILE, gScp);
	//create symbol 'this'
	tmp_file_type.createField(
		"this", 							//variable name
		tmp_file_type, 						//variable type
		tmp_file_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_file_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};