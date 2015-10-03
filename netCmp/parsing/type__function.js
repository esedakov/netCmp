/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	types of functions/operators
	Used by:	functinoid, type
	Dependencies:	(none)
**/

var FUNCTION_TYPE = {
	CTOR: {type: 1, name: "constructor"},		//constructor
	ADD: {type: 2, name: "add"},			//operator '+'
	SUB: {type: 3, name: "subtract"},		//operator '-'
	MUL: {type: 4, name: "multiply"},		//operator '*'
	DIV: {type: 5, name: "divide"},			//operator '/'
	TO_STR: {type: 6, name: "to string"},		//convert object to string
	IS_EQ: {type: 7, name: "is equal"},		//are two objects equal to each other
	CLONE: {type: 8, name: "clone object"},		//create copy from given instance
	CUSTOM: {type: 9, name: "user defined"}		//any other function
};
