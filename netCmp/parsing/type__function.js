/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	types of functions/operators
	Used by:	functinoid, type
	Dependencies:	(none)
**/

var FUNCTION_TYPE = {
	CTOR: {value: 1, name: "constructor"},		//constructor
	ADD: {value: 2, name: "add"},			//operator '+'
	SUB: {value: 3, name: "subtract"},		//operator '-'
	MUL: {value: 4, name: "multiply"},		//operator '*'
	DIV: {value: 5, name: "divide"},		//operator '/'
	TO_STR: {value: 6, name: "to string"},		//convert object to string
	IS_EQ: {value: 7, name: "is equal"},		//are two objects equal to each other
	CLONE: {value: 8, name: "clone object"},	//create copy from given instance
	MAIN: {value: 9, name: "main"},			//main function
	CUSTOM: {value: 10, name: "user defined"}	//any other function
};
