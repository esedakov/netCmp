/**
	Developer:	Eduard Sedakov
	Date:		2016-09-21
	Description:	date-time type
	Used by:	(testing)
	Dependencies: type, obj_type, {file properties}
**/

//function for creating date-time type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__datetimeType(gScp){
	//create dummy type date-time
	var tmp_dt_type = new type("datetime", OBJ_TYPE.POINT, gScp);
	//create symbol 'this'
	tmp_dt_type.createField(
		"this", 							//variable name
		tmp_dt_type, 						//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_year'
	tmp_dt_type.createField(
		"_year", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_month'
	tmp_dt_type.createField(
		"_month", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_day'
	tmp_dt_type.createField(
		"_day", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_hour'
	tmp_dt_type.createField(
		"_hour", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_min'
	tmp_dt_type.createField(
		"_min", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create symbol '_sec'
	tmp_dt_type.createField(
		"_sec", 							//variable name
		type.__library["integer"], 			//variable type
		tmp_dt_type._scope._start			//first block in the type's scope
	);
	//create fundamental functions
	tmp_dt_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};