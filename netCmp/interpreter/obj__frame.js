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
	this._iters = null; //ITERATOR
};	//end constructor for 'frame'

//load variables
//input(s): (none)
//output(s): (none)
frame.prototype.loadVariables = function(){
	//loop thru symbols of associated scope
	for( var tmpSymbName in this._scope._symbols ){
		//get current symbol reference
		var tmpSymbRef = this._scope._symbols[tmpSymbName];
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
	}	//end loop thru symbols of this scope
};	//end function 'loadVariables'