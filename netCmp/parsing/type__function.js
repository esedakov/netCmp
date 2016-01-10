/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	types of functions/operators
	Used by:	functinoid, type
	Dependencies:	(none)
**/

var FUNCTION_TYPE = {
	CTOR: {value: 1, name: "constructor"},		//constructor
	ADD: {value: 2, name: "+"},					//operator '+'
	SUB: {value: 3, name: "-"},					//operator '-'
	MUL: {value: 4, name: "*"},					//operator '*'
	DIV: {value: 5, name: "/"},					//operator '/'
	MOD: {value: 6, name: "mod"},				//operator 'mod'
	TO_STR: {value: 7, name: "toString"},		//convert object to string
	IS_EQ: {value: 8, name: "isEqual"},			//are two objects equal to each other
	CLONE: {value: 9, name: "cloneObject"},		//create copy from given instance
	MAIN: {value: 10, name: "main"},			//main function
	CUSTOM: {value: 11, name: "user defined"}	//any other function
};
