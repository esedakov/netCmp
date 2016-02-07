/**
	Developer:	Eduard Sedakov
	Date:		2016-02-04
	Description:	interpreter module
	Used by: {everything}
	Depends on:	{everything}
**/

//class is designed for interpreting CFG (Control Flow Graph)
//input(s): 
//	code: (text) => strign representation of the code to be parsed 
//output(s): (none)
function interpreter(code){
	//try to parse given code
	this._parser = new parser(code);
	//process program
	this._parser.process__program();
	//ensure that global function __main__ exists
	if( !("__main__" in this._parser._globFuncs) ){
		//function main was not declared => abort
		throw new Error("runtime error: function 'MAIN' is not declared");
	}
	//get MAIN functinoid
	var mainFunc = this._parser._globFuncs["__main__"];
	//get scope for the MAIN functinoid
	var scpMain = mainFunc._scope;
	//make sure that function has at least one block
	if( scpMain._start == null ){
		//main function does not have any blocks => empty function
		throw new Error("runtime error: MAIN function has no starting block");
	}
	//create current frame for MAIN function
	this._curFrame = new frame(scpMain);
	//create a funcCall object needed for MAIN function
	var funcCallMain = new funcCall(
		mainFunc,		//__main__ functinoid 
		new position(	//position inside MAIN function
			scpMain, 					//main scope
			scpMain._start, 			//starting block of main function
			scpMain._start._cmds[0]		//beginning command of main function
		),
		null	//main does not belong to eny type (so no owning entity)
	);
	//add funcCall object to current frame
	this._curFrame._funcsToFuncCalls[mainFunc._id] = funcCallMain;
	//make sure that MAIN function has no arguments
	if( mainFunc._args.length != 0 ){
		throw new Error("runtime error: MAIN function cannot have any arguments");
	}
	//load variables for this frame
	this._curFrame.loadVariables();
	//run user's program, starting from the MAIN function
	this.run(this._curFrame);
};	//end constructor for interpreter

//process currently executed command in CONTROL FLOW GRAPH (CFG)
//input(s):
//	f: (frame) => current frame
//output(s): (none)
interpreter.prototype.run = function(f){
	//loop to process commands in this frame
	do {
		//get currently executed position in the frame
		var curPos = f._current;
		//get currenty executed command
		var cmd = curPos._cmd;
		//initialize temporary stack of function arguments
		var funcArgStk = [];
		//redirections (i.e. usage of ADDA and LOAD command pair)
		var redirectCmdMapToEnt = {}; //command{ADDA or LOAD}._id => entity
		//temporary for storing next position to execute
		var nextPos = null;
		//depending on the type of current command
		switch(cmd._type.value){
			case COMMAND_TYPE.NOP.value:
				//do nothing
			break;
			case COMMAND_TYPE.NULL.value:
				//loop thru symbols associated with this command
				for( tmpSymbId in cmd._defChain ){
					//make sure that this symbol has associated entity already defined
					if( !(tmpSymbId in f._symbsToVars) ){
						//error
						throw new Error("runtime error: 4738592375897");
					}	//end if symbol is already defined
					//get entity for this symbol
					var tmpEnt = f._symbsToVars[tmpSymbId];
					//add entity for this command
					f._cmdsToVars[cmd._id] = tmpEnt;
				}	//end loop thru associated symbols
			break;
			case COMMAND_TYPE.PUSH.value:
				//initialize variable that stores entity for argument command
				var tmpArgEnt = null;
				//if argument command has at least one entity
				if( cmd._args.length > 0 && cmd._args[0] in f._cmdsToVars ){
					//set argument command
					tmpArgEnt = f._cmdsToVars[cmd._args[0]._id];
					//store value inside argument stack
					funcArgStk.push(tmpArgEnt._value);
				} else {
					throw new Error("runtime error: 9835973857985");
				}	//end if argument command has at least one entity
			break;
			case COMMAND_TYPE.POP.value:
				//TODO
			break;
			case COMMAND_TYPE.LOAD.value:
				//get its only argument (ADDA command)
				var tmpAddaCmdId = cmd._args[0]._id;
				//if there is an entity for ADDA command
				if( tmpAddaCmdId in f._cmdsToVars ){
					//add entry to redirection map
					redirectCmdMapToEnt[cmd._id] = f._cmdsToVars[tmpAddaCmdId];
				} else {
					//error
					throw new Error("runtime error: 3947284731847149817");
				}	//end if there is an entity for ADDA command
			break;
			case COMMAND_TYPE.STORE.value:
				//structure of STORE command is as follows:
				//	STORE [ADDA command] [stored EXPRESSION command]
				//get ADDA command id
				var tmpAddaCmdId = cmd._args[0]._id;
				//get EXPRESSION's command id
				var tmpStoredExpCmdId = cmd._args[1]._id;
				//get entity stored for ADDA command
				var tmpLeftSideEnt = f._cmdsToVars[tmpAddaCmdId];
				//make sure that what we got is not functinoid
				//	since we cannot assign value returned by function, i.e.
				//	call foo() = 123; <== error
				if( tmpLeftSideEnt.getTypeName() == RES_ENT_TYPE.FUNCTION ){
					//error
					throw new Error("runtime error: 4856765378657632");
				}	//end if assigning function's result (error case)
				//
			break;
			case COMMAND_TYPE.ADDA.value:
				//get command of left side of access operator ('.')
				var tmpLeftSideCmd = cmd._args[0];
				//get entity for left side's command
				var tmpLeftSideEnt = f._cmdsToVars[tmpLeftSideCmd._id];
				//get command or functinoid representing right side
				var tmpRightSideRef = cmd._args[1];
				//initialize value that should be associated with ADDA command
				var tmpAddaVal = null;
				//if handling access operator (i.e. '.'), then there must be
				//	a third argument (that can be either symbol or a null)
				if( cmd._args.length > 2 ){
					//get third (optional) argument that is used for non-method field
					//	to represent symbol for the right side
					var tmpRightSideSymb = cmd._args[2];
					//store value inside the map '_cmdsToVars', so that LOAD or STORE
					//	command could use field's of method's reference value:
					//	1. for data field => entity OR content
					//	2. for method field => functinoid
					//if this is a method field (i.e. third argument - symbol is null)
					if( tmpRightSideSymb == null ){
						//store functinoid for ADDA's value
						tmpAddaVal = tmpRightSideRef;	//functinoid reference
						//also store left side's entity for this ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpLeftSideEnt;
					} else {	//otherwise, it is a data field
						//get entity OR a content representing given field
						tmpAddaVal = tmpLeftSideEnt._fields[tmpRightSideSymb._name];
						//store extracted entity/content for ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpAddaVal;
					}	//end if it is a method field
				} else {	//otherwise, must be handling collection (array or hashmap)
					//get entity type's type
					var tmpObjType = tmpLeftSideEnt._type._type.value;
					//get content representing right side (it has to be a singelton)
					//check if it is an array
					if( tmpObjType == OBJ_TYPE.ARRAY.value ){
						//	right side => integer
					} else if( tmpObjType == OBJ_TYPE.HASH.value ){	//if hashmap
						//	right side => text
					}	//end if it is an array
				}	//end if handling access operator
				//store right's side value for ADDA command
				f._cmdsToVars[cmd._id] = tmpAddaVal;
			break;
		}	//end switch -- depending on the type of current command
		//if 'nextPos' is still NULL, then we simply need to move to the
		//	next consequent command (if there is any)
		if( nextPos == null ){
			//try to get next consequent position
			nextPos = f.getNextPos();
			//make sure that there is a next position available
			if( nextPos == null ){
				//reached the end, so quit
				return;
			}	//end if -- make sure there is a next available position 
		}	//end if move to next consequent position
		//move to the next command
		f._current = nextPos;
	} while (true);	//end loop to process commands in this frame
};	//end function 'run'