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
	HASH: {value: 7, name: "hash", template: true},
	CUSTOM: {value: 8, name: "custom", template: false}
};
