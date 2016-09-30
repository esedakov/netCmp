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
	CUSTOM_CTOR: {value: 13, name: "constructor"}, 	//custom constructor (optional, i.e. only if user creates a constructor method)
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
	IS_EMPTY: {value: 24, name: "isempty"},		//is collection empty
	ADD_BACK: {value: 34, name: "addback"},		//ES 2016-09-17 (b_dbg_test): add element to the end of an array
	ADD_FRONT: {value: 35, name: "addfront"},	//ES 2016-09-17 (b_dbg_test): add element to the front of an array
	//drawing methods
	MOVE_MODEL: {value: 25, name: "movemodel"},	//move jointJS graphical object on specified offset in X\Y direction
	ROTATE_MODEL: {value: 26, name: "rotatemodel"},	//rotate jointJS object
	REMOVE_MODEL: {value: 27, name: "removemodel"},	//remove jointJS object
	SET_FONT: {value: 28, name: "setfont"},		//set font information
	SET_TXT_POS: {value: 29, name: "settxtposition"},	//set text position relative to the bounding rectangle
	DRAW_RECT: {value: 30, name: "drawrect"},	//draw rectangle (jointJS object)
	DRAW_IMAGE: {value: 31, name: "drawimage"},	//draw image (jointJS object)
	DRAW_ELLIPSE: {value: 32, name: "drawellipse"},	//draw ellipse (jointJS object)
	//file manipulations methods
	FILE_CREATE: {value: 36, name: "fcreate"},	//ES 2016-09-21 (b_libs_1): create file
	FILE_READ: {value: 37, name: "fread"},	//ES 2016-09-21 (b_libs_1): read file
	FILE_WRITE: {value: 38, name: "fwrite"},	//ES 2016-09-21 (b_libs_1): write file
	//FILE_GET_PROP: {value: 39, name: "getfileprop"},//ES 2016-09-21 (b_libs_1): get properties of file
	//FILE_SET_PROP: {value: 40, name: "setfileprop"},//ES 2016-09-21 (b_libs_1): set properties of file
	FILE_TEXT: {value: 98, name: "ftext"},			//ES 2016-09-26 (b_libs_1): get file text
	//timer methods
	TIMER_START: {value: 41, name: "start"},//ES 2016-09-21 (b_libs_1): start timer
	TIMER_STOP: {value: 42, name: "stop"},//ES 2016-09-21 (b_libs_1): stop timer
	//math methods
	MATH_POWER: {value: 43, name: "power"},		//ES 2016-09-21 (b_libs_1): raise to exponent
	MATH_SQRT: {value: 44, name: "sqrt"},		//ES 2016-09-21 (b_libs_1): calculate square root
	MATH_COS: {value: 45, name: "cos"},			//ES 2016-09-21 (b_libs_1): get cos
	MATH_ACOS: {value: 46, name: "acos"},		//ES 2016-09-21 (b_libs_1): get arccosine
	MATH_SIN: {value: 47, name: "sin"},			//ES 2016-09-21 (b_libs_1): get sine
	MATH_ASIN: {value: 48, name: "asin"},		//ES 2016-09-21 (b_libs_1): get arcsine
	MATH_TAN: {value: 49, name: "tan"},			//ES 2016-09-21 (b_libs_1): get tangent
	MATH_ATAN: {value: 50, name: "atan"},		//ES 2016-09-21 (b_libs_1): get arctangent
	MATH_RAND: {value: 51, name: "random"},		//ES 2016-09-21 (b_libs_1): get random number
	MATH_PI: {value: 52, name: "pi"},			//ES 2016-09-21 (b_libs_1): get PI constant
	MATH_LOG_R: {value: 53, name: "rlog"},		//ES 2016-09-21 (b_libs_1): get natural log from real number
	MATH_LOG_I: {value: 99, name: "ilog"},		//ES 2016-09-21 (b_libs_1): get natural log from integer number
	MATH_ABS_R: {value: 54, name: "rabs"},		//ES 2016-09-21 (b_libs_1): get absolute value from real number
	MATH_ABS_I: {value: 54, name: "iabs"},		//ES 2016-09-21 (b_libs_1): get absolute value from integer number
	MATH_FLOOR: {value: 55, name: "floor"},		//ES 2016-09-21 (b_libs_1): get floor
	MATH_CEIL: {value: 56, name: "ceil"},		//ES 2016-09-21 (b_libs_1): get ceiling
	MATH_INT_MAX: {value: 57, name: "imax"},	//ES 2016-09-21 (b_libs_1): get max number from array
	MATH_INT_MIN: {value: 58, name: "imin"},	//ES 2016-09-21 (b_libs_1): get min number from array
	MATH_REAL_MAX: {value: 57, name: "rmax"},	//ES 2016-09-21 (b_libs_1): get max number from array
	MATH_REAL_MIN: {value: 58, name: "rmin"},	//ES 2016-09-21 (b_libs_1): get min number from array
	MATH_MANH_DIST: {value: 59, name: "manhdist"},//ES 2016-09-21 (b_libs_1): manhanttan distance between two points
	MATH_EUCL_DIST: {value: 60, name: "eucldist"},//ES 2016-09-21 (b_libs_1): euclidean distance between two points
	//cast methods
	INT_TO_TXT: {value: 61, name: "inttotxt"},	//ES 2016-09-21 (b_libs_1): cast: int to text
	INT_TO_REAL: {value: 62, name: "inttoreal"},//ES 2016-09-21 (b_libs_1): cast: int to real
	INT_TO_BOOL: {value: 63, name: "inttobool"},//ES 2016-09-21 (b_libs_1): cast: int to boolean
	TXT_TO_INT: {value: 64, name: "txttoint"},	//ES 2016-09-21 (b_libs_1): cast: text to int
	TXT_TO_REAL: {value: 65, name: "txttoreal"},//ES 2016-09-21 (b_libs_1): cast: text to real
	TXT_TO_BOOL: {value: 66, name: "txttobool"},//ES 2016-09-21 (b_libs_1): cast: text to boolean
	REAL_TO_INT: {value: 67, name: "realtoint"},//ES 2016-09-21 (b_libs_1): cast: real to int
	REAL_TO_TXT: {value: 68, name: "realtotxt"},//ES 2016-09-21 (b_libs_1): cast: real to text
	REAL_TO_BOOL: {value: 69, name: "realtobool"},//ES 2016-09-21 (b_libs_1): cast: real to boolean
	BOOL_TO_INT: {value: 70, name: "booltoint"},//ES 2016-09-21 (b_libs_1): cast: boolean to int
	BOOL_TO_TXT: {value: 71, name: "booltotxt"},//ES 2016-09-21 (b_libs_1): cast: boolean to text
	BOOL_TO_REAL: {value: 72, name: "booltoreal"},//ES 2016-09-21 (b_libs_1): cast: boolean to real
	TXT_TO_DT: {value: 73, name: "txttodt"},	//ES 2016-09-21 (b_libs_1): cast: text to date-time
	DT_TO_TXT: {value: 74, name: "dttotxt"},	//ES 2016-09-21 (b_libs_1): cast: date-time to text
	//point
	//PT_GET_X: {value: 75, name: "getx"},	//ES 2016-09-21 (b_libs_1): get X-coordinate
	//PT_GET_Y: {value: 76, name: "gety"},	//ES 2016-09-21 (b_libs_1): get y-coordinate
	//PT_SET_X: {value: 77, name: "setx"},	//ES 2016-09-21 (b_libs_1): set x-coordinate
	//PT_SET_Y: {value: 78, name: "sety"},	//ES 2016-09-21 (b_libs_1): set y-coordinate
	//date-time
	//DT_GET_YEAR: {value: 79, name: "getyear"},	//ES 2016-09-21 (b_libs_1): get year
	//DT_GET_MONTH: {value: 80, name: "getmonth"},//ES 2016-09-21 (b_libs_1): get month
	//DT_GET_DAY: {value: 81, name: "getday"},	//ES 2016-09-21 (b_libs_1): get day
	//DT_GET_HOUR: {value: 82, name: "gethour"},	//ES 2016-09-21 (b_libs_1): get hour
	//DT_GET_MIN: {value: 83, name: "getmin"},	//ES 2016-09-21 (b_libs_1): get minutes
	//DT_GET_SEC: {value: 84, name: "getsec"},	//ES 2016-09-21 (b_libs_1): get seconds
	//DT_SET_YEAR: {value: 85, name: "setyear"},	//ES 2016-09-21 (b_libs_1): set year
	//DT_SET_MONTH: {value: 86, name: "setmonth"},//ES 2016-09-21 (b_libs_1): set month
	//DT_SET_DAY: {value: 87, name: "setday"},	//ES 2016-09-21 (b_libs_1): set day
	//DT_SET_HOUR: {value: 88, name: "sethour"},	//ES 2016-09-21 (b_libs_1): set hour
	//DT_SET_MIN: {value: 89, name: "setmin"},	//ES 2016-09-21 (b_libs_1): set minutes
	//DT_SET_SEC: {value: 90, name: "setsec"},	//ES 2016-09-21 (b_libs_1): set seconds
	DT_NOW: {value: 91, name: "now"},			//ES 2016-09-23 (b_libs_1): return current datetime
	//file properties
	//FP_CREATED: {value: 92, name: "created"},	//ES 2016-09-21 (b_libs_1): get creation date
	//FP_MODIFIED: {value: 93, name: "modified"},	//ES 2016-09-21 (b_libs_1): get modification date
	//FP_PATH: {value: 94, name: "path"},			//ES 2016-09-21 (b_libs_1): get path on server
	//FP_OWNER: {value: 95, name: "owner"},		//ES 2016-09-21 (b_libs_1): get name of owner user
	//FP_PERM: {value: 96, name: "permission"},	//ES 2016-09-21 (b_libs_1): get permission string
	//FP_SIZE: {value: 97, name: "size"},			//ES 2016-09-21 (b_libs_1): get size of file
	//custom function
	CUSTOM: {value: 33, name: "user_defined"}	//any other function
};
