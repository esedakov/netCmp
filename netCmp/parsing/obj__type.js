/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	describe type to be used to define other objects
	Used by:	(any derived type class), symbol, functinoid, value
	Dependencies:	obj_type, scope, command, argument
**/

//==========globals:==========

//store all created types in this library:
//	key: type name (string)
//	value: reference to this type object
type.__library = {};

//unique identifier used by type
type.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
type.reset = function() {
	type.__library = {};	//set to empty hash map
	type.__nextId = 1;	//set to first available integer
};

//static calls:
//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
//be invoked as a stand-alone function. The former approach that allowed function to
//be declared inside any object scope, was affecting jointJS, specifically viewport
//constructor was throwing a error.
//type.inheritFrom(argument);		//type <- argument (type is child of argument)
inheritFrom(type, argument);
type.reset();

//class "type" declaration:
//class represents type - supported by default (int, real, text, boolean) and
//	those that are created by the user in the program. The later should have
//	unique names, since types are referenced by the name, so if they collide
//	then only one will be stored (the other is going to be lost)
//input(s):
//	name: (string) => name of the type
//	t: (obj_type) => type of the type... (see type__obj.js)
//	scp: (scope) => reference to the scope where this type was defined
//output(s): (none)
function type(name, t, scp){
	//assign id
	this._id = type.__nextId++;
	//assign name
	this._name = name;
	//assign type
	this._type = t;
	//parent type
	this._parentType = null;
	//create and assign object definition scope
	this._scope = scope.createObjectScope(scp, name, this);
	//data members, represented by hash-map:
	//	key: (string) => field name (has to be unique within scope of object among fields)
	//	value: {type: (type) field type, cmd: (command) => init command (if any)}
	this._fields = {};
	//functions, represented by hash-map:
	//	key: (string) function name (has to be unique within scope of object among methods)
	//	value: (functinoid) => reference to the function object
	this._methods = {};
	//add to library
	type.__library[name] = this;
	//if this type uses templates, then parser would design a separate type specifier for
	//	each used combination of templates. In this case there would be two kinds of type
	//	spccifier. I would call them as a BASE and as DERIVED. Base type is the one where
	//	template types are not yet determined, i.e. not linked to specific types. This type
	//	is created first and contains all data and method fields. On the contrary, derived
	//	type has associated templates with specific types; it also does not have any data
	//	and method fields defined, instead it refers to base type to get those fields.
	//if _baseType is null AND it has templates, then this is a base type
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): BASE type is no longer part of type architecture
	//this._baseType = null;
	//tree, array of template type and associated type specifier. Note that base type 
	//	does not have any information for tree values, since it lacks template 
	//	associations info
	this._templateNameArray = [];	//{name, type}
	//call parent constructor
	//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
	//be invoked as a stand-alone function. The former approach that allowed function to
	//be declared inside any object scope, was affecting jointJS, specifically viewport
	//constructor was throwing a error.
	//this.ctorParent(argument, ARGUMENT_TYPE.OBJECT);
	ctorParent(this, argument, ARGUMENT_TYPE.OBJECT);
};

//return existing or newly created type
//input(s):
//	name: (string) => name of the type
//	t: (obj_type) => type of the type... (see type__obj.js)
//	scp: (scope) => reference to the scope where this type was defined
//output(s):
//	(type) => type
type.createType = function(name, t, scp){
	//check if type already exists
	if( name in type.__library ){
		return type.__library[name];
	}
	//otherwise, create a new type and return it
	return type.__library[name];
};	//end function 'createType'

//check if this type supports certain fundamental method/operator
//Note: does not check non-fundamental functinoid type, i.e. CUSTOM
//input(s):
//	t: (FUNCTION_TYPE) => type of fundamental functinoid type
//output(s):
//	(boolean) => does this functinoid support such method/operator
type.prototype.checkIfFundMethodDefined = function(t){
	//determine functinoid name
	var funcName = functinoid.detFuncName(t);
	//check if method is defined and return result
	return funcName in this._methods;
};	//end function 'checkIfFundMethodDefined'

//create required fundamentall methods for this type, such as CTOR, isEQ, ...
//input(s):
//output(s):
type.prototype.createReqMethods = function(){
	//create default constructor method
	this.createMethod(
		"__create__", 			//function name
		FUNCTION_TYPE.CTOR,		//function type is constructor
		this,					//return type is this type
		{}						//no arguments (default constructor)
	);
	//create toString method
	this.createMethod(
		"__tostring__",			//function name
		FUNCTION_TYPE.TO_STR,	//function type is toString
		type.__library["text"],	//return type is text
		{						//argument(s)
			'this' : this	//object of this type
		}
	);
	//create isEqual method
	this.createMethod(
		"__isequal__",				//function name
		FUNCTION_TYPE.IS_EQ,		//function type is isEqual
		type.__library["boolean"],	//return type is boolean
		{							//argument(s)
			'this' : this,	//this object of this type
			'other' : this	//another object to compare with of the same type
		}
	);
	//create clone method
	this.createMethod(
		"__clone__",			//function name
		FUNCTION_TYPE.CLONE,	//function type is clone
		this,					//return type is this type
		{						//argument(s)
			'this' : this	//this object of this type to be cloned/copied
		}
	);
	//if this is INT or REAL or TEXT types
	if( this._type == OBJ_TYPE.INT || 
		this._type == OBJ_TYPE.REAL || 
		this._type == OBJ_TYPE.TEXT ){
		//support ADD function
		this.createMethod(
			"__add__",			//function name
			FUNCTION_TYPE.ADD,	//function type is addition
			this,				//return its own type
			{					//arguments
				'this' : this,	//this object of this type
				'other' : this	//another object to sum with of the same type
			}
		);
		//support LESS comparison function
		this.createMethod(
			"__isless__",				//function name
			FUNCTION_TYPE.IS_LESS,		//function type is less comparison operator
			type.__library["boolean"],	//return boolean as comparison result
			{							//argument(s)
				'this': this,	//this object of this type to be compared
				'other': this	//another object to be compared with (same type)
			}
		);
		//support GREATER comparison functions
		this.createMethod(
			"__isgreater__",			//function name
			FUNCTION_TYPE.IS_GREATER,	//function type is less comparison operator
			type.__library["boolean"],	//return boolean as comparison result
			{							//argument(s)
				'this': this,	//this object of this type to be compared
				'other': this	//another object to be compared with (same type)
			}
		);
	}
	//if this is INT or REAL types
	if( this._type == OBJ_TYPE.INT || 
		this._type == OBJ_TYPE.REAL ){
		//support SUB function 
		this.createMethod(
			"__sub__",			//function name
			FUNCTION_TYPE.SUB,	//function type is subtraction
			this,				//return its own type
			{					//arguments
				'this' : this,	//this object of this type
				'other' : this	//another object to subtract with of the same type
			}
		);
		//support MUL function 
		this.createMethod(
			"__mul__",			//function name
			FUNCTION_TYPE.MUL,	//function type is multiply
			this,				//return its own type
			{					//arguments
				'this' : this,	//this object of this type
				'other' : this	//another object to multiply with of the same type
			}
		);
		//support DIV function 
		this.createMethod(
			"__div__",			//function name
			FUNCTION_TYPE.DIV,	//function type is division
			this,				//return its own type
			{					//arguments
				'this' : this,	//this object of this type
				'other' : this	//another object to divide with of the same type
			}
		);
		//support MOD function 
		this.createMethod(
			"__mod__",			//function name
			FUNCTION_TYPE.MOD,	//function type is module
			this,				//return its own type
			{					//arguments
				'this' : this,	//this object of this type
				'other' : this	//another object to take module with of the same type
			}
		);
	}
	//ES 2016-06-04 (b_interpreter_2): case for initializing methods for DRAWING component
	if( this._type == OBJ_TYPE.DRAWING ){
		//custom function to trigger model movement in specified direction by given amount
		this.createMethod(
			"movemodel",				//function name
			FUNCTION_TYPE.MOVE_MODEL,	//function type
			type.__library["void"],		//nothing returns
			{
				'this': this,						//this object
				'idx': type.__library["integer"],	//model index
				'dispX': type.__library["integer"],	//offset in X-direction
				'dispY': type.__library["integer"]	//offset in Y-direction
			}
		);
		//custom function to trigger model rotation by specified degree
		this.createMethod(
			"rotatemodel",				//function name
			FUNCTION_TYPE.ROTATE_MODEL,	//function type
			type.__library["void"],		//nothing returns
			{
				'this': this,						//this object
				'idx': type.__library["integer"],	//model index
				'deg': type.__library["integer"]	//degree of rotation (absolute)
			}
		);
		//custom function to remove model
		this.createMethod(
			"removemodel",				//function name
			FUNCTION_TYPE.REMOVE_MODEL,	//function type
			type.__library["void"],		//nothing returns
			{
				'this': this,						//this object
				'idx': type.__library["integer"]	//model index
			}
		);
		//custom function to setup font
		this.createMethod(
			"setfont",					//function name
			FUNCTION_TYPE.SET_FONT,		//function type
			type.__library["void"],		//nothing returns
			{
				'this': this,							//this object
				'fontSize': type.__library["integer"],	//font size
				'colorTxt': type.__library["text"]		//text color
			}
		);
		//custom function to setup text position in bounding rectangle
		this.createMethod(
			"settxtposition",			//function name
			FUNCTION_TYPE.SET_TXT_POS,	//function type
			type.__library["void"],		//nothing returns
			{
				'this': this,						//this object
				'x': type.__library["integer"],		//x-axis position in bounding rectangle
				'y': type.__library["integer"]		//y-axis position in bounding rectangle
			}
		);
		//custom function for drawing rectangle
		this.createMethod(
			"drawrect",					//function name
			FUNCTION_TYPE.DRAW_RECT,	//function type
			type.__library["integer"],	//index for created model
			{
				'this': this,						//this object
				'x': type.__library["integer"],		//x-position
				'y': type.__library["integer"],		//y-position
				'w': type.__library["integer"],		//width
				'h': type.__library["integer"],		//height
				'opacity': type.__library["real"],			//transparency of object
				'borderColor': type.__library["text"],		//color for border
				'borderSize': type.__library["integer"],	//size of border
				'fillColor': type.__library["text"],		//filling color
				'roundX': type.__library["integer"],		//rounding in X-axis
				'roundY': type.__library["integer"],		//rounding in Y-axis
				'txt': type.__library["text"],				//text inside rectangle
			}
		);
		//custom function for drawing image
		this.createMethod(
			"drawimage",				//function name
			FUNCTION_TYPE.DRAW_IMAGE,	//function type
			type.__library["integer"],	//index for created model
			{
				'this': this,						//this object
				'x': type.__library["integer"],		//x-position
				'y': type.__library["integer"],		//y-position
				'w': type.__library["integer"],		//width
				'h': type.__library["integer"],		//height
				'imgPath': type.__library["text"],	//path to rendering image
			}
		);
		//custom function for drawing ellipse
		this.createMethod(
			"drawellipse",				//function name
			FUNCTION_TYPE.DRAW_ELLIPSE,	//function type
			type.__library["integer"],	//index for created model
			{
				'this': this,						//this object
				'x': type.__library["integer"],		//x-position
				'y': type.__library["integer"],		//y-position
				'w': type.__library["integer"],		//width
				'h': type.__library["integer"],		//height
				'opacity': type.__library["real"],			//transparency of object
				'borderColor': type.__library["text"],		//color for border
				'borderSize': type.__library["integer"],	//size of border
				'fillColor': type.__library["text"],		//filling color
				'txt': type.__library["text"],				//text inside rectangle
			}
		);
	}
	//if this is ARRAY or B+ TREE type
	if( this._type == OBJ_TYPE.ARRAY ||
		this._type == OBJ_TYPE.BTREE ){
		//custom function to determine length of collection
		this.createMethod(
			"length",					//function name
			FUNCTION_TYPE.LENGTH,		//function type is module
			type.__library["integer"],	//return its own type
			{
				'this': this
			}							//no arguments
		);
		//make sure that at least one template is available
		if( this._templateNameArray.length < 1 ){
			//error
			throw new Error("parsing error: type: requires templates");
		}
		//type of container's entry value
		var tmpEntryType = this._templateNameArray[0].type;
		//type of index/key
		var tmpIdxType = type.__library["integer"];
		//boolean type
		var tmpBoolType = type.__library["boolean"];
		//if this is a tree
		if( this._type == OBJ_TYPE.BTREE ){
			//make sure that at least two templates are available (for key:[0], and for value:[1])
			if( this._templateNameArray.length != 2 ){
				//error
				throw new Error("parsing error: type: B+ tree requires exactly 2 template arguments to be available: for key and for value");
			}
			//reset type of index
			tmpIdxType = this._templateNameArray[0].type;
			//reset entry type (it is stored inside second entry)
			tmpEntryType = this._templateNameArray[1].type;
		}
		//get function -- retrieves entry at the specified index/key
		this.createMethod(
			"get",					//function name
			FUNCTION_TYPE.GET,		//custom function for arrays and trees
			tmpEntryType,			//type of return value
			{
				'this': this,		//this object that represents type of array or B+ tree
				'index': tmpIdxType	//type of index/key for accessing entries in array/B+tree
			}
		);
		//isEmpty function -- checks if collection is empty
		this.createMethod(
			"isempty",					//function name
			FUNCTION_TYPE.IS_EMPTY,		//custom function for arrays and trees
			tmpBoolType,				//type of return value
			{
				'this': this		//this object that represents type of array or B+ tree
			}
		);
		//function for removing all elements in tree
		this.createMethod(
			"removeall",				//function name
			FUNCTION_TYPE.REMOVE_ALL,	//custom function for tree
			type.__library["void"],				//returns type of an entry in tree
			{
				'this': this			//this object that represents type of tree
			}
		);
		//add function -- inserts entry at the end of array or at the specified key in tree
		//	also create function remove for deleting an entry from array or tree
		if( this._type == OBJ_TYPE.ARRAY ){
			//function for adding an element in array
			this.createMethod(
				"insert",					//function name
				FUNCTION_TYPE.INSERT,		//custom function for arrays
				type.__library["void"],		//returns this array
				{
					'this': this,			//this object that represents type of array
					'val': tmpEntryType,	//type of inserted entry
					'index': type.__library["integer"]	//type of an index where to insert an entry
				}
			);
			//function for removing an element in array
			this.createMethod(
				"remove",					//function name
				FUNCTION_TYPE.REMOVE,		//custom function for arrays
				type.__library["void"],		//returns type of an entry in array
				{
					'this': this,			//this object that represents type of array
					'index': type.__library["integer"]	//type of an index where to remove an entry
				}
			);
			//indexing function -- get index for specified element (index of first match)
			this.createMethod(
				"index",					//function name
				FUNCTION_TYPE.INDEX,		//custom function for arrays
				type.__library["integer"],	//return type
				{
					'this': this,			//this object (this array instance)
					'val': tmpEntryType		//value for which to find an index
				}
			);
		} else {
			//function for adding an element in tree
			this.createMethod(
				"insert",					//function name
				FUNCTION_TYPE.INSERT,		//custom function for trees
				type.__library["void"],		//returns nothing
				{
					'this': this,			//this object that represents type of array or tree
					'val': tmpEntryType,	//type of inserted entry
					'index': tmpIdxType		//type of key where to insert an entry in tree
				}
			);
			//function for removing an element in tree
			this.createMethod(
				"remove",					//function name
				FUNCTION_TYPE.REMOVE,		//custom function for tree
				type.__library["void"],		//returns nothing
				{
					'this': this,			//this object that represents type of tree
					'index': tmpIdxType		//type of a key where to remove an entry
				}
			);
			//function for checking if specified key is inside tree
			this.createMethod(
				"isinside",					//function name
				FUNCTION_TYPE.IS_INSIDE,	//custom function for tree
				tmpBoolType,				//returns type of an entry in tree
				{
					'this': this,			//this object that represents type of tree
					'index': tmpIdxType		//type of a key where to remove an entry
				}
			);
			//function for retrieving maximum key from tree
			this.createMethod(
				"getmax",					//function name
				FUNCTION_TYPE.GET_MAX,		//custom function for tree
				tmpIdxType,					//returns key for largest entry (if tree is not empty)
				{
					'this': this			//this object that represents type of tree
				}
			);
			//function for retrieving minimum key from tree
			this.createMethod(
				"getmin",					//function name
				FUNCTION_TYPE.GET_MIN,		//custom function for tree
				tmpIdxType,					//returns key for smallest entry (if tree is not empty)
				{
					'this': this			//this object that represents type of tree
				}
			);
			//function for retrieving number of levels in a tree
			this.createMethod(
				"numlevels",				//function name
				FUNCTION_TYPE.NUM_LEVELS,	//custom function for tree
				type.__library["integer"],	//returns type of an entry in tree
				{
					'this': this			//this object that represents type of tree
				}
			);
		}	//end if it is an array (create functions 'add' and 'remove')
	}	//end if it is an array or tree
};	//end function 'createReqMethods'

//get number of template arguments
//input(s): (none)
//output(s):
//	(integer) => number of template arguments
type.prototype.getTmplArgs = function(){
	return '__tmp_templateCount' in this ? this.__tmp_templateCount : this._templateNameArray.length;
};

//create DERIVED templated type
//input(s):
//	baseTy: (type) base type specifier
//	tmplTyArr: (Array<type>) template type association array. It has to specify associated
//		types in the order that base type requires.
//output(s):
//	(type) => derived templated type
/*ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed code:
		base type is no longer used, and there is now only derived type (when 
		we consider type with template argument(s))
type.createDerivedTmplType = function(baseTy, tmplTyArr){
	//first of check that this base type actually is valid type object
	if( baseTy === null && baseTy.getTypeName() !== RES_ENT_TYPE.value ){
		//not a valid type object, throw a parsing error
		throw new Error("63786528563876");
	}
	//check if template type array has different size then the base template array
	if( tmplTyArr.length != baseTy.getTmplArgs() ){
		//derived template type has wrong number of templates; this is a user code bug
		return null;
	}
	//compose type name that includes information about templated types
	var tyTmplName = baseTy._name + '<';
	//loop thru template array and append templated type names
	for(var i = 0; i < tmplTyArr.length; i++ ){
		//append template type
		tyTmplName += tmplTyArr[i]._name + (i > 0 ? "," : "");
	}
	//place an end '>' symbol in new type name
	tyTmplName += '>';
	//check if this type already exists
	if( tyTmplName in type.__library ){
		//if it exists, return type
		return type.__library[tyTmplName];
	}
	//create derived type object
	var derTyObj = new type(tyTmplName, baseTy._type, baseTy._scope);
	//assign base type
	derTyObj._baseType = baseTy;
	//loop thru templates
	for( var k = 0; k < tmplTyArr.length; k++ ){
		//assign template element
		derTyObj._templateNameArray.push({'name' : null, 'type': tmplTyArr[k]});
	}
	//return newly created derived template type
	return derTyObj;
};	//end function 'createDerivedTmplType'
ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
*/

//is this type uses templates
//input(s): (none)
//output(s):
//	(boolean) => does this type uses templates
type.prototype.isTmplType = function(){
	//check if array of templates is non-empty
	return this.getTmplArgs() > 0;
};	//end function 'isTmplType'


//is this a base templated type
//input(s): (none)
//output(s):
//	(boolean) => is this a base templated type
/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed code
		Not using BASE type anymore in type architecture
type.prototype.isTmplBaseType = function(){
	//is this type has no base type and has at least one template
	return this._baseType == null && this.getTmplArgs() > 0;
};	//end function 'isBaseType'
ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
*/

//is this is a derived templated type
//input(s): (none)
//output(s):
//	(boolean) => is this a derived templated type
/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed code
		There is only DERIVED type, now. No BASE type.
type.prototype.isTmplDerivedType = function(){
	//is this type has base and has at least one template
	return this._baseType !== null && this.getTmplArgs() > 0;
};	//end function 'isTmplDerivedType'
ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
*/

//check if field has been defined in this type
//input(s):
//	name: (string) field name
//output(s):
//	(boolean) => {true} if field with specified name already exists, {false} if does not exist
type.prototype.isFieldExist =
	function (name) {
	//check if there is a key in "_fields" that is equal to {name}
	return name in this._fields;
};

//check if function/method has been defined in this type
//input(s):
//	name: (string) function name
//output(s):
//	(boolean) => {true} if method with specified name already exists, {false} if does not exist
type.prototype.isMethodExist =
	function (name) {
	//check if there is a key in "_methods" that is equal to {name}
	return name in this._methods;
};

//create field for this type and also create command inside constructor that
//	is associated with this field
//input(s):
//	n: (text) field name
//	t: (type) field type
//	b: (block) constructor's block
//output(s): (none)
type.prototype.createField = function(n, t, b){
	//create symbol for current field
	var tmpCurFldSymb = new symbol(
		n,				//field name
		t,				//field type
		this._scope		//type's scope
	);
	//add symbol to type's scope
	this._scope.addSymbol(tmpCurFldSymb);
	//check if 'b' is null
	if( b == null ){
		//check if there is no starting block for this type
		if( this._scope._start == null ){
			//create current block and set it to be starting block
			this._scope._start = this._scope.createBlock(true, true);
		}
		//set 'b' to be starting block
		b = this._scope._start;
	}
	//create initializing command for the specified type
	type.getInitCmdForGivenType(t, b, tmpCurFldSymb);
};	//end function 'createField'

//create and return a command that initializes specified type
//input(s):
//	t: (type) => type of variable that needs to be initialized
//	b: (block) => block reference where to create this command
//	s: (symbol) => symbol representing this command
//output(s):
//	(Command) => command for initializing given type
type.getInitCmdForGivenType = function(t, b, s){
	//initialize variables for command type and command's argument value
	var tmpCmdType = COMMAND_TYPE.NULL;
	var tmpCmdArgVal = null;
	//depending on the type of field
	switch(t._type.value){
		case OBJ_TYPE.INT.value:
			tmpCmdArgVal = value.createValue(0);
			break;
		case OBJ_TYPE.REAL.value:
			tmpCmdArgVal = value.createValue(0.0);
			break;
		case OBJ_TYPE.TEXT.value:
			tmpCmdArgVal = value.createValue("");
			break;
		case OBJ_TYPE.BOOL.value:
			tmpCmdArgVal = value.createValue(false);
			break;
		default:	//every other type
			tmpCmdType = COMMAND_TYPE.EXTERNAL;
			tmpCmdArgVal = value.createValue("createVariableEntity(" + s._id + ")");
			break;
	}	//end case on field type
	//create command
	return b.createCommand(
		tmpCmdType,					//command type
		[tmpCmdArgVal],				//command argument
		[s]				//symbol representing this field
	);
};	//end function 'getInitCmdForGivenType'

//add field data member to this type definition
//input(s):
//	name: (string) => name of the new field
//	t: (type) => type of the new field
//	ctorCmd: (command) => command that initializes this field (if any)
//output(s): (none)
type.prototype.addField =
	function(name, t, ctorCmd) {
	//ensure thay field does not already exists in this type
	if( !this.isFieldExist( name ) ) {
		//add record for this field
		this._fields[name] = {type: t, cmd: ctorCmd};
	}
};

//create method
//input(s):
//	n: (text) function/method name
//	ft: (FUNCTION_TYPE) function type
//	rt: (type) function return type
//	args: (HashMap<key: (text) argument name, value: (type) argument type)
//output(s):
//	(functinoid) => newly created function reference
type.prototype.createMethod = function(n, ft, rt, args){
	//create function
	var tmpFunc = new functinoid(
		n,				//function name
		this._scope,	//this type's scope
		ft,				//function type
		rt				//return type
	);
	//add method to type
	this.addMethod(n, tmpFunc);
	//loop thru arguments
	for( argName in args ){
		//create function argument
		tmpFunc.createFuncArgument(
			argName,		//argument name
			args[argName]	//argument type
		);
	}	//end loop thru arguments
	//return newly created functionoid
	return tmpFunc;
};	//end function 'createMethod'

//add function to this type declaration
//input(s):
//	name: function name
//	funcDecl: reference to the functinoid
//output(s): (none)
type.prototype.addMethod =
	function(name, funcDecl) {
	//ensure that function declaration does not already exist in this type
	if( !this.isMethodExist( name ) ){
		//add record for this method
		this._methods[name] = funcDecl;
		//specify type's scope as a parent for this function AND add function's
		//scope to the type
		this._scope.addScope(funcDecl._scope);
	}
};

//convert current type object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
type.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", name: " + this._name +
		", type: " + this._type.name +
		", scope.id: " + (this._scope === null ? "(undefined)" : this._scope._id) +
		", fields: " + hashMapToStr(this._fields) +
		", methods: " + hashMapToStr(this._methods) +
		"}";
};

//get type name of this object (i.e. type)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
type.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.value;
};

//compare with another type (it is a simple comparison operator, just check ids)
//input(s):
//	anotherType: (type) type to compare against
//output(s):
//	(boolean) => {true} if this type is equal to {anotherType}; {false} if they are not equal
type.prototype.isEqual =
	function(anotherType) {
	//make sure that {anotherType} is not null, so we can compare
	if( anotherType !== null ) {
		//ensure that {this} is of the same type as {anotherType}
		if( this.getTypeName() == anotherType.getTypeName() ) {
			//compare ids of both type objects
			return this._id == anotherType._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherType is null
	return false;
};
