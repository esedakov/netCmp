/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	supported object types
	Used by:	type
	Dependencies:	(none)
**/

var OBJ_TYPE = {
	VOID: {value: 1, name: "void", template: false},
	INT: {value: 2, name: "int", template: false},
	REAL: {value: 3, name: "real", template: false},
	TEXT: {value: 4, name: "text", template: false},
	BOOL: {value: 5, name: "boolean", template: false},
	ARRAY: {value: 6, name: "array", template: true},
	BTREE: {value: 7, name: "tree", template: true},

	//ES 2016-06-04 (b_interpreter_2): add new component 'drawing' for showing graphical objects using jointJS
	DRAWING: {value: 8, name: "drawing", template: false},
	
	CUSTOM: {value: 9, name: "custom", template: false}
};
