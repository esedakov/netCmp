/**
	Developer:	Eduard Sedakov
	Date:		2016-01-25
	Description:	describe function call and entities used in it
	Used by: {interpreter}
	Depends on:	POSITION, ENTITY, CONTENT, {lexer}, {preprocessor}, {parser}, {logical tree}
**/

//==========globals:==========

//unique identifier used by frame
funcCall.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
funcCall.reset = function() {
	funcCall.__nextId = 1;		//set to first available integer
};

//static calls:
funcCall.reset();

//class describes function call
//input(s):
//	f: (functinoid) reference to the function object (i.e. functinoid)
//	p: (position) position of function call in the caller
//	e: (entity) owner entity from which this function was caller (or NULL if none)
//output(s): (none)
function funcCall(f, p, e){
	//stack of function arguments => [0] is the first argument
	this._args = [];			//=> ARRAY<CONTENT or ENTITY>
	//return value for the function
	this._returnVal = null;		//=> CONTENT or ENTITY
	//functinoid reference
	this._funcRef = f;			//=> FUNCTINOID
	//if entity is not null (from which function call is made)
	if( typeof e == "object" && e != null ){
		//set type of object from which this call is made
		this._objRef = e._type;
		//set owner entity
		this._owner = e;
	} else {	//otherwise, function does not belong to any type (stand-alone)
		//set object type and owner reference to NULL
		this._objRef = null;	//=> TYPE
		this._owner = null;		//=> ENTITY
	}	//end if entity is given
	//specify position in the caller from which call has been made
	this._posInCaller = p;
};	//end constructor for 'funcCall'

//convert current content to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
funcCall.prototype.toString = function(){
	//schema: FUNC_CALL[functinoid_id : return_type ( list_of_arg_types ) ]
	//e.g. FUNC_CALL[4 : integer (real, text)]
	//initialize variable for keeping list of argument types
	var argTypes = "";
	//compose list of argument types
	for( var argObj in this._args ){
		//if list of argument types is not empty
		if( argTypes != "" ){
			//append separator (e.g. comma)
			argTypes += ", "
		}	//end if list of argument types is not empty
		//append current function argument type name
		argTypes += argObj._name;
	}	//end loop thru argument types
	//return text representation of function call object
	return "FUNC_CALL[" + this._funcRef._id + " : " + this._returnVal._type._name + argTypes + "]";
};	//end function 'toString'

//get type name of this object (i.e. function call)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
funcCall.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.FUNC_CALL;
};

//compare with another function call by simply comparing ids
//input(s):
//	anotherFuncCall: (funcCall) function call to compare against
//output(s):
//	(boolean) => {true} if this funcCall is equal to {anotherFuncCall};
//				 {false} if they are not equal
funcCall.prototype.isEqual =
	function(anotherFuncCall) {
	//make sure that {anotherFuncCall} is not null, so we can compare
	if( anotherFuncCall !== null ) {
		//ensure that {this} is of the same type as {anotherFuncCall}
		if( this.getTypeName() == anotherFuncCall.getTypeName() ) {
			//compare ids of both objects
			return this._id == anotherFuncCall._id;
		}	//end if two contents have same type
	}	//end if another content is not null
	//if reached this point, then two objects are either of different 
	//	type or anotherFuncCall is null
	return false;
};	//end function 'isEqual'