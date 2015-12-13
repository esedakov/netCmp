/**
	Developer:	Eduard Sedakov
	Date:		2015-10-13
	Description:	class to encapsulate an entire program code and all entities defined
	Used by:	parser
	Dependencies:	scope, block
**/

//==========globals:==========

//==========statics:==========

//class "program" declaration:
//program contains all scopes defined, and all scopes internally represent all blocks and
//	all symbols -- so in a way program encaps everything
function program(){
	//initialize hashmap of scopes
	this._scopes = {};
	//create start block (right now pass no scope owner)
	var start = new block(null);
	//create finalizing block (right now pass no scope owner)
	var end = new block(null);
	//create and assign global scope
	this._scopes[scope.__nextId] = new scope(
		null,	//no parent
		SCOPE_TYPE.GLOBAL,	//global scope type
		null,	//not function declaration
		null,	//not type object declaration
		start,	//pass in first block
		end,	//pass in last block
		start,	//set start as the current
		{}	//no symbols right now are defined (may change later)
	);
	//set owner for start and end blocks
	start._owner = this._scopes[scope.__nextId - 1];
	end._owner = this._scopes[scope.__nextId - 1];
};

//convert program object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
program.prototype.toString = 
	function() {
	return "program: " + hashMapToStr(this._scopes);
};

//get type name of this object (i.e. program)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
program.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.PROGRAM;
};

//get global scope
//input(s): (none)
//output(s):
//	(SCOPE) => global scope
program.prototype.getGlobalScope =
	function() {
	//check if there is global scope
	if( isEmptyCollection(this._scopes) == false ){
		return firstCollectionElem(this._scopes)[1];
	}
	//return back NULL
	return null;
};

//do not handle isEqual, since there should be only one program defined at a time
