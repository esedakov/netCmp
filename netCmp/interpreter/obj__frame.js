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
	//ES 2016-08-15 (b_cmp_test_1): have we started IF-THEN-ELSE or LOOP scope, if
	//	so, set reference of this scope here.
	this._startingScope = null;
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
	//ES 2016-09-04 (b_log_cond_test): initialize array of command ids that should be
	//	transferred back to parent frame. This is intended only for a limited set of
	//	command types:
	//	- phi
	this._transferToParentCmdIdArr = [];
	//map symbols to variables
	this._symbsToVars = {};	//<symbId, ENTITY>
	//map functinoids to functionCalls
	this._funcsToFuncCalls = {};	//<funcId, FUNC_CALL>
	//available iterator (if any). It is used only in 
	//	the case if this frame represents a FOREACH
	//	loop's scope.
	this._iter = null; //ITERATOR
	//ES 2016-09-06 (b_debugger, Issue 7): initialize temporary stack of function arguments
	this.funcArgStk = [];
	//ES 2016-09-06 (b_debugger, Issue 7): redirections (i.e. usage of ADDA and LOAD command pair)
	this.redirectCmdMapToEnt = {}; //command{ADDA or LOAD}._id => entity
	//ES 2016-09-06 (b_debugger, Issue 7): hashmap between scope id (in this case only conditional
	//	and loop scopes are considered) and result of comparison command
	this.compResMap = {};	//scope id => comparison result
	//ES 2016-09-06 (b_debugger, Issue 7): init temporary iterator variable
	this.tmpNextLoopIter = null;
};	//end constructor for 'frame'

//ES 2016-08-16 (b_cmp_test_1): get scope that we have entered
//input(s): (none)
//output(s):
//	(scope) => entered scope
frame.prototype.getEnteredScope = function(){
	//get scope that we are entering
	var tmpEntScope = this._startingScope;
	//if entering scope is null
	if( tmpEntScope == null ){
		//set entering scope to frame's associated scope
		tmpEntScope = this._scope;
	}
	//return this scope
	return tmpEntScope;
};	//ES 2016-08-16 (b_cmp_test_1): end method 'getEnteredScope'

//get entity by the given symbol name
//input(s):
//	n: (text) symbol name
//output(s):
//	(entity) => if there is an entity by the specified name, then return this entity
//	null => if there is no such entity
frame.prototype.getEntityByName = function(n){
	//if there is symbol with the given name in this frame
	if( n in this._scope._symbols ){
		//get symbol
		var tmpSymb = this._scope._symbols[n];
		//if there is an entity for this symbol
		if( tmpSymb._id in this._symbsToVars ){
			return this._symbsToVars[tmpSymb._id];
		}
		//fail
		return null;
	}	//end if there is symbol with the given name in this frame
	//keep track of currently iterated scope
	var tmpScp = this._scope;
	//loop thru hierarchy of scopes till find one among parents that has associated frame
	while( tmpScp._owner != null ){
		//check if there is a frame for this scope
		if( tmpScp._owner._id in frame.__library ){
			//found it
			break;
		}
		//go to next level
		tmpScp = tmpScp._owner;
	}
	//if there is no parent frame for this frame
	if( tmpScp._owner == null ){
		//fail
		return null;
	}
	//try finding entity in the parent frame
	return frame.__library[tmpScp._owner._id].getEntityByName(n);
};	//end function 'getEntityByName'

//ES 2016-09-04 (b_debugger): get all accessible entities in the form of text message
//input(s): (none)
//output(s):
//	(text) => text, representing collection of all accessible entities in this frame
frame.prototype.getAllAccessibleEntities = function(){
	//init text message
	var res = "";
	//loop thru entities in this frame
	for( var tmpCurSymbId in this._symbsToVars ){
		//get currently iterated entity
		var tmpEnt = this._symbsToVars[tmpCurSymbId];
		//make sure that iterated entity is object
		if( typeof tmpEnt != "object" ){
			//skip this entity
			continue;
		}
		//if resulting text message is not empty
		if( res != "" ){
			//add new line
			res += "\n";
		}
		//add symbol name and its value
		res += tmpEnt._symbol._name + " => " + tmpEnt.toString();
	}	//end loop thru entities in this frame
	//check if there is parent AND this frame exists in library
	if( this._scope._owner != null && this._scope._owner._id in frame.__library ){
		//get frame array
		var tmpFrmArr = frame.__library[this._scope._owner._id];
		//get text message for variables of parent scope
		var tmpParTxtMsg = tmpFrmArr[tmpFrmArr.length - 1].getAllAccessibleEntities();
		//if text message from parent scope is not empty
		if( tmpParTxtMsg != "" ){
			//add it to resulting text message
			res += "\n" + tmpParTxtMsg;
		}
	}
	//return resulting text message
	return res;
};	//ES 2016-09-04 (b_debugger): end method 'getAllAccessibleEntities'

//load variables
//input(s):
//	ES 2016-08-06 (b_cmp_test_1): introduce optional argument 'f' to represent parent frame
//	f: (frame) parent frame, from which some of variables can be loaded/transitioned
//output(s): (none)
frame.prototype.loadVariables = function(f){
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
				//check if we are loading variables inside a constructor function
				if( tmpFuncCall._funcRef._func_type == FUNCTION_TYPE.CTOR ){
					//create THIS entity
					this._symbsToVars[tmpSymbRef._id] = new entity(
						tmpSymbRef,		//symbol THIS
						this,			//this frame
						null,			//no initializing command
						null			//no parent entity
					);
				} else {	//else, not inside CTOR, so we must have owner entity
					//error
					throw new Error("runtime error: 473857329857");
				}	//end if we are loading variables inside ctor function
			} else {	//else, if owner exists
				//get owner of function-call object, which is THIS
				this._symbsToVars[tmpSymbRef._id] = tmpFuncCall._owner;
			}
		} else {	//else it is not a symbol THIS
			//setup variable for storing initializing command
			var tmpInitCmd = null;
			//if there is initializing command
			if( tmpSymbRef._defOrder.length > 0 ){
				//get command that initializes this symbol
				tmpInitCmd = tmpSymbRef._defChain[tmpSymbRef._defOrder[0]];
			}	//end if there is initializing command
			//ES 2016-08-06 (b_cmp_test_1): if retrieving variable from parent frame
			//	i.e. check if parent frame given and loaded variable is defined in that frame
			if( (typeof f != "undefined") && (tmpSymbRef._id in f._symbsToVars) ){
				//copy refeence of entity from parent to this frame
				this._symbsToVars[tmpSymbRef._id] = f._symbsToVars[tmpSymbRef._id];
			} else {	//ES 2016-08-06 (b_cmp_test_1): (original case) else, creating new variable
				//create and store entity for the given symbol
				this._symbsToVars[tmpSymbRef._id] = new entity(
					tmpSymbRef,		//symbol
					this,			//frame
					tmpInitCmd,		//initializing command
					null			//no parent entity
				);
			}	//end if retrieve variable from parent frame
		}	//end if it is a symbol THIS
	}	//end loop thru symbols of this scope
};	//end function 'loadVariables'

//ES 2016-08-07 (b_cmp_test_1): create new method for importing variables from parent frame
//input(s):
//	f: (frame) parent from, from which to import data into this frame
//output(s): (none)
frame.prototype.importVariables = function(f){
	//copy map between commands and variables from parent frame
	this._cmdsToVars = $.extend({}, f._cmdsToVars);
	//loop thru set of symbols-to-entities of parent frame
	for( var symbId in f._symbsToVars ){
		//check if iterated symbol does not exist in this frame
		if( !(symbId in this._symbsToVars) ){
			//copy it over into this frame
			this._symbsToVars[symbId] = f._symbsToVars[symbId];
		}	//end if iterated symbol does not exist in this frame
	}	//end loop thru symbols-to-entities of parent frame
};	//end function 'importVariables'

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