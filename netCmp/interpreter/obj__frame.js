/**
	Developer:	Eduard Sedakov
	Date:		2016-01-25
	Description:	execution instance associated with specific scope. Internally, it stores collection of objects
						accessible at certain execution point
	Used by: {interpreter}
	Depends on:	{position}, {lexer}, {preprocessor}, {parser}, {logical tree}
**/

//==========globals:==========

//store all created frames, indexed by scope's id:
//	key: scope id
//	value: frame object
frame.__library = {};

//unique identifier used by frame
frame.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
frame.reset = function() {
	frame.__library = {};	//set to empty hash map
	frame.__nextId = 1;		//set to first available integer
};

//add frame to the library
//input(s):
//	s: (scope) scope for which this frame needs to be added
//	f: (frame) frame object to be added to the library
//output(s): (none)
frame.addFrame = function(s, f){
	//check if entry for the given scope does not exist
	if( !(s._id in frame.__library) ){
		//add empty array to the library for the given scope id
		frame.__library[s._id] = [];
	}
	//add frame
	frame.__library[s._id].push(f);
};	//end function 'addFrame'

//static calls:
frame.reset();

//class "frame" declaration:
//class describes single execution instance (a.k.a. thread) and collects all accessible objects (e.g.
//	variables, functionCalls, etc...) that are used to interpret user's code
//input(s):
//	s: (scope) scope for which this frame is created
//output(s): (none)
function frame(s){
	//assign id
	this._id = frame.__nextId++;
	//set associated scope
	this._scope = s;
	//store this frame inside library
	frame.addFrame(s, this);
	//current execution point
	this._current = new position(
		this._scope,				//scope reference
		this._scope._start,			//starting block
		this._scope._start._cmds[0]	//starting command
	);
	//map commands to variables
	this._cmdsToVars = {}; //<cmdId, ENTITY>
	//map symbols to variables
	this._symbsToVars = {};	//<symbId, ENTITY>
	//map functinoids to functionCalls
	this._funcsToFuncCalls = {};	//<funcId, FUNC_CALL>
	//available iterator (if any). It is used only in 
	//	the case if this frame represents a FOREACH
	//	loop's scope.
	this._iter = null; //ITERATOR
};	//end constructor for 'frame'

//load variables
//input(s): (none)
//output(s): (none)
frame.prototype.loadVariables = function(){
	//loop thru symbols of associated scope
	for( var tmpSymbName in this._scope._symbols ){
		//get current symbol reference
		var tmpSymbRef = this._scope._symbols[tmpSymbName];
		//if it is a symbol THIS
		if( tmpSymbName == "this" ){
			//make sure frame represents a function
			if( this._scope._funcDecl == null ){
				//error
				throw new Error("runtime error: 7583785972985");
			}
			//get function-call object for this scope's function
			var tmpFuncCall = this._funcsToFuncCalls[this._scope._funcDecl._id];
			//make sure that there is an owner for this function-call
			if( tmpFuncCall._owner == null ){
				//error
				throw new Error("runtime error: 473857329857");
			}
			//get owner of function-call object, which is THIS
			this._symbsToVars[tmpSymbRef._id] = tmpFuncCall._owner;
		} else {	//else it is not a symbol THIS
			//setup variable for storing initializing command
			var tmpInitCmd = null;
			//if there is initializing command
			if( tmpSymbRef._defOrder.length > 0 ){
				//get command that initializes this symbol
				tmpInitCmd = tmpSymbRef._defChain[tmpSymbRef._defOrder[0]];
			}	//end if there is initializing command
			//create and store entity for the given symbol
			this._symbsToVars[tmpSymbRef._id] = new entity(
				tmpSymbRef,		//symbol
				this,			//frame
				tmpInitCmd,		//initializing command
				null			//no parent entity
			);
		}	//end if it is a symbol THIS
	}	//end loop thru symbols of this scope
};	//end function 'loadVariables'

//get a next consequent execution position in CFG available (if there is any)
//input(s): (none)
//output(s):
//	(position) => next execution position
frame.prototype.getNextPos = function(){
	//check if there is a next consequent command in the same block
	if( this._current._cmdIdx + 1 < this._current._block._cmds.length ){
		//set next position to this next command
		this._current._cmdIdx = this._current._cmdIdx + 1;
		//update command reference
		this._current._cmd = this._current._block._cmds[this._current._cmdIdx];
		//return position
		return this._current;
	}	//end if there is a next consequent command in the same block
	//otherwise, the current block has no next command, so we need to go
	//	to the next FALLING block within the same scope
	var nextBlk = this._current._block._fallInOther;
	//if this next block is not set
	if( typeof nextBlk != "object" || nextBlk == null ){
		//we have reached the end, return null
		return null;
	}	//end if next block is not set
	//get first command in the retrieved next block
	var nextCmd = nextBlk._cmds[0];
	//return next position
	return new position(this._current._scope, nextBlk, nextCmd);
};	//end function 'getNextPos'

//get type name of this object (i.e. frame)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
frame.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.FRAME;
};	//end operator 'getTypeName'

//compare with another frame (it is a simple comparison operator, just check ids)
//input(s):
//	anotherCmd: (frame) frame to compare against
//output(s):
//	(boolean) => {true} if this frame is equal to {anotherFrm}; {false} if they are not equal
frame.prototype.isEqual =
	function(anotherFrm) {
	//make sure that {anotherFrm} is not null, so we can compare
	if( anotherFrm !== null ) {
		//ensure that {this} is of the same type as {anotherCmd}
		if( this.getTypeName() == anotherFrm.getTypeName() ) {
			//compare ids of both frame objects
			return this._id == anotherFrm._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherCmd is null
	return false;
};	//end operator 'isEqual'