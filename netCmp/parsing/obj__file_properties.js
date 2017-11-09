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
function create__filePropertiesType(gScp){
	//create dummy type file properties
	//ES 2017-02-06 (bug fix): changed type to FILE_PROP
	var tmp_pt_type = new type("fileprop", OBJ_TYPE.FILE_PROP, gScp);
	//create symbol 'this'
	tmp_pt_type.createField(
		"this", 							//variable name
		tmp_pt_type, 						//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_created' date (date when file was created)
	tmp_pt_type.createField(
		"_created",							//variable name
		type.__library["datetime"],			//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_modified' date (date when file was last modified)
	tmp_pt_type.createField(
		"_modified",						//variable name
		type.__library["datetime"],			//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_path' string (location)
	tmp_pt_type.createField(
		"_path",							//variable name
		type.__library["text"],				//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_name' string (file name)
	tmp_pt_type.createField(
		"_name",							//variable name
		type.__library["text"],				//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_owner' string (owner name)
	tmp_pt_type.createField(
		"_owner",							//variable name
		type.__library["text"],				//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_perms' string (file access/change/delete/rename permissions)
	tmp_pt_type.createField(
		"_perms",							//variable name
		type.__library["text"],				//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create accessible data field for '_size' (file size on the server)
	tmp_pt_type.createField(
		"_size",							//variable name
		type.__library["integer"],			//variable type
		tmp_pt_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_pt_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};
