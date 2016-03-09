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
	TO_STR: {value: 7, name: "toString"},		//convert object to string
	IS_EQ: {value: 8, name: "isEqual"},			//are two objects equal to each other
	CLONE: {value: 9, name: "cloneObject"},		//create copy from given instance
	MAIN: {value: 10, name: "main"},			//main function
	CUSTOM_CTOR: {value: 11, name: "constructor"}, 	//custom constructor (optional, i.e. only if user creates a constructor method)
	//array/hashmap methods
	LENGTH: {value: 12, name: "length"},		//number of elements in the container
	GET: {value: 13, name: "get"},				//get specific element from the container
	INSERT: {value: 14, name: "insert"},		//insert an element inside the container
	REMOVE: {value: 15, name: "remove"},		//remove an element from the container
	INDEX: {value: 16, name: "index"},			//get index for specified array element
	GET_HASH_CODE: {value: 17, name: "getHashCode"},	//get hashcode (key) for given object (value)
	//custom function
	CUSTOM: {value: 18, name: "user_defined"}	//any other function
};
