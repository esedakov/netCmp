/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	result returned by every parsing routine
	Used by:	(all parsing routines)
	Dependencies:	command, block, scope, symbol, function, type
**/

//object is returned by parsing functions to determine whether function execute successfully,
//	and to transfer some information back to the caller (from callee)
//input(s):
//	success: (boolean) => did parsing function execute successfully?
//	//
//output(s): (none)
