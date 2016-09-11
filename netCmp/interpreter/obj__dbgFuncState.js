/**
	Developer:	Eduard Sedakov
	Date:		2016-09-10
	Description:	debugging function state = dfs
	Used by: {debugger}
	Depends on:	DBG_MODE, frame, position, {jointJS}, entity/content
**/

//==========globals:==========

//unique identifier used by entity
dfs.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
dfs.reset = function() {
	dfs.__nextId = 1;	//set to first available integer
};

//static calls:
dfs.reset();

//class "DFS" (debugging function state) declaration:
//class contains information for the debugger, which was used during execution of specific function
//input(s):
//	mode: (DBG_MODE) debugging mode
//	fr: (frame) function's frame
//	pos: (position) executed posiition, when execution was transfered away from thie function
//	fc: (funcCall) function call reference
//output(s): (none)
function dfs(mode, fr, pos, fc){
	//assign id
	this._id = dfs.__nextId++;
	//assign debugging mode
	this._mode = mode;
	//assign frame reference
	this._frame = fr;
	//assign execution position
	this._pos = pos;
	//null function call reference -- it will be assigned by interpreter during invokeCall
	this._funcCall = fc;
	//null returning value of this function call -- will be assigned by debugger
	this._val = 0;
};	//end ctor for 'dfs' (debugging function state)

//get type name of this object (i.e. debugging function state)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
dfs.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.DFS;
};	//end operator 'getTypeName'

//compare with another debugging function state
//input(s):
//	anotherDfs: (DFS) debugging function state
//output(s):
//	(boolean) => {true} if this dfs is equal to {anotherDfs}; {false} otherwise
dfs.prototype.isEqual = 
	function(anotherDfs) {
	//make sure that {anotherDfs} is not null
	if( typeof anotherDfs != "undefined" && anotherDfs != null ){
		//ensure that {this} is of the same type as {anotherDfs}
		if( this.getTypeName() == anotherDfs.getTypeName() ) {
			//compare ids
			return this._id == anotherDfs._id;
		}	//end if same type
	}	//end if anotherDfs is not null
	//else, these DFS's are not equal
	return false;
};	//end operator 'isEqual'