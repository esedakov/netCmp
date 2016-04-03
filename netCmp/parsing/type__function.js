/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	types of functions/operators
	Used by:	functinoid, type
	Dependencies:	(none)
**/

var FUNCTION_TYPE = {
	//generic methods
	CTOR: {value: 1, name: "create"},			//default constructor
	ADD: {value: 2, name: "+"},					//operator '+'
	SUB: {value: 3, name: "-"},					//operator '-'
	MUL: {value: 4, name: "*"},					//operator '*'
	DIV: {value: 5, name: "/"},					//operator '/'
	MOD: {value: 6, name: "mod"},				//operator 'mod'
	TO_STR: {value: 7, name: "tostring"},		//convert object to string
	IS_EQ: {value: 8, name: "isequal"},			//are two objects equal to each other
	IS_LESS: {value: 9, name: "isless"},			//are two objects equal to each other
	IS_GREATER: {value: 10, name: "isgreater"},			//are two objects equal to each other
	CLONE: {value: 11, name: "cloneobject"},		//create copy from given instance
	MAIN: {value: 12, name: "main"},			//main function
	CUSTOM_CTOR: {value: 11, name: "constructor"}, 	//custom constructor (optional, i.e. only if user creates a constructor method)
	//array/tree methods
	LENGTH: {value: 14, name: "length"},		//number of elements in the container (tree or array)
	GET: {value: 15, name: "get"},				//get specific element from the container (tree or array)
	INSERT: {value: 16, name: "insert"},		//insert an element inside the container (tree or array)
	REMOVE: {value: 17, name: "remove"},		//remove an element from the container (tree or array)
	INDEX: {value: 18, name: "index"},			//get index for specified array element (for array)
	IS_INSIDE: {value: 19, name: "isinside"},	//is key inside tree (for tree)
	REMOVE_ALL: {value: 20, name: "removeall"},	//remove all elements from collection (tree or array)
	GET_MAX: {value: 21, name: "getmax"},		//get maximum key (for tree)
	GET_MIN: {value: 22, name: "getmin"},		//get minimum key (for tree)
	NUM_LEVELS: {value: 23, name: "numlevels"},	//get height of tree (for tree)
	//custom function
	CUSTOM: {value: 20, name: "user_defined"}	//any other function
};
