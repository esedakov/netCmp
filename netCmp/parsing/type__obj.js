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

	//ES 2016-09-21 (b_libs_1): add new type for describing location of a point
	POINT: {value: 10, name: "point", template: false},
	//ES 2016-09-21 (b_libs_1): add new type for date-time
	DATETIME: {value: 11, name: "datetime", template: false},
	//ES 2016-09-21 (b_libs_1): add new type for collecting file properties information
	FILE_PROP: {value: 12, name: "fileprop", template: false},

	//ES 2016-09-21 (b_libs_1): add new component for file manipulations
	FILE: {value: 13, name: "file", template: false},
	//ES 2016-09-21 (b_libs_1): add new component for timer
	TIMER: {value: 14, name: "timer", template: false},
	//ES 2016-09-21 (b_libs_1): add new component for math functions
	MATH: {value: 15, name: "fileprop", template: false},
	//ES 2016-09-21 (b_libs_1): add new component for casting functions
	CAST: {value: 16, name: "cast", template: false},
	
	CUSTOM: {value: 9, name: "custom", template: false}
};
