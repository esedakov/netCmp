/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	result returned by every parsing routine
	Used by:	(all parsing routines)
	Dependencies:	command, block, scope, symbol, function, type, res_ent_type
**/

//object is returned by parsing functions to determine whether function execute successfully,
//	and to transfer some information back to the caller (from callee)
//input(s):
//	success: (boolean) => did parsing function execute successfully?
//	results: (Array<hash<res_ent_type, object>>) => resulted output
//output(s): (none)
function Result(success, results) {
	this.success = success;	//success flag
	this.results = results;	//array of hash-maps, where each should contain one key-value pair
	//e.g. [{command, obj1},{block, obj2},{command, obj3},{scope, obj4},{scope, obj5}, ...]
};

//create fast access failed result instance
var FAILED_RESULT = new Result(false, []);
