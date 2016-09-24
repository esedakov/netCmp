/**
	Developer:	Eduard Sedakov
	Date:		2016-09-23
	Description:	timer component
	Used by:	{interpreter}
	Dependencies: (none)
**/

//function for creating timer component
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__timerType(gScp){
	//create dummy component timer
	var tmp_timer_type = new type("timer", OBJ_TYPE.TIMER, gScp);
	//create symbol 'this'
	tmp_timer_type.createField(
		"this", 							//variable name
		tmp_timer_type, 					//variable type
		tmp_timer_type._scope._start		//first block in the type's scope
	);
	//create fundamental functions
	tmp_timer_type.createReqMethods();
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
};