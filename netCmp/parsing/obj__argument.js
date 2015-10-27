/**
	Developer:	Eduard Sedakov
	Date:		2015-10-13
	Description:	types of command arguments
	Used by:	command, value, functinoid, type
	Dependencies:	type__argument.js
**/

//==========globals:==========

//==========statics:==========

//class "argument" declaration:
//argument is a wrapper for all basic entities that are used as arguments inside commands.
//these entities are commands themselves, and also constants (i.e. value class), function
//definition (i.e. functinoid), object definition (i.e. type)
//input(s):
//	type: (ARGUMENT_TYPE) => type of argument
//output(s): (none)
function argument(type){
	//assign argument type
	this._argType = type;
};

//do not handle toString, getTypeName, or isEqual functions -- they will be
//	overwritten and handled by child classes
