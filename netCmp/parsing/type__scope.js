/**
	Developer:	Eduard Sedakov
	Date:		2015-10-09
	Description:	scope types
	Used by:	scope
	Dependencies:	(none)
**/

var SCOPE_TYPE = {
	FUNCTION: {value: 1, name: "function declaration"},
	CONDITION: {value: 2, name: "if-then-else condition"},
	WHILE: {value: 3, name: "while loop"},
	OBJECT: {value: 4, name: "type object declaration"},
	GLOBAL: {value: 5, name: "program/global scopoe"},
	FOREACH: {value: 6, name: "foreach loop"}
};
