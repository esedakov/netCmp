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
	//boolean flag to determine whether to stop execution of code
	this._doQuit = false;
	//library of EXTERNAL functions
	this._externalFuncLib = {};
	//populate library of external functions
	this.populateExtFuncLib();
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

//populate library of externall functions (i.e. it is used by EXTERNAL command)
//input(s): (none)
//output(s): (none)
interpreter.prototype.populateExtFuncLib = function(){
	//TODO
};	//end function 'populateExtFuncLib'

//associate entity/ies with the given command, based on symbol(s) representing this command
//input(s):
//	f: (frame) current frame
//	c: (command) current command with which to associate entities
//output(s): (none)
interpreter.prototype.associateEntWithCmd = function(f, c){
	//initialize temporary variable for keeping track of current symbol
	var tmpSymbId = null;
	//loop thru symbols associated with this command
	for( tmpSymbId in c._defChain ){
		//make sure that this symbol has associated entity already defined
		if( !(tmpSymbId in f._symbsToVars) ){
			//error
			throw new Error("runtime error: 4738592375897");
		}	//end if symbol is already defined
		//get entity for this symbol
		var tmpEnt = f._symbsToVars[tmpSymbId];
		//add entity for this command
		f._cmdsToVars[c._id] = tmpEnt;
	}	//end loop thru associated symbols
};	//end function 'associateEntWithCmd'

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
		//hashmap between scope id (in this case only conditional and loop
		//	scopes are considered) and result of comparison command
		var compResMap = {};	//scope id => comparison result
		//temporary for storing next position to execute
		var nextPos = null;
		//depending on the type of current command
		switch(cmd._type.value){
			case COMMAND_TYPE.NOP.value:
				//do nothing
			break;
			case COMMAND_TYPE.NULL.value:
			case COMMAND_TYPE.POP.value:
				//associate entities with NULL command
				associateEntWithCmd(f, cmd);
			break;
			case COMMAND_TYPE.EXIT.value:
				//need to propagate this EXIT thru hierarchy of RUN calls
				//	proposing to introduce a field inside interpreter that is
				//	used to abort interpretation (i.e. _doQuit:boolean) that
				//	can signal when to stop executing
				this._doQuit = true;
				//quit function RUN, right away
				return;
			break;
			case COMMAND_TYPE.PUSH.value:
				//initialize variable that stores entity for argument command
				var tmpArgEnt = null;
				//if argument command has at least one entity
				if( cmd._args.length > 0 && cmd._args[0]._id in f._cmdsToVars ){
					//set argument command
					tmpArgEnt = f._cmdsToVars[cmd._args[0]._id];
					//store value inside argument stack
					funcArgStk.push(tmpArgEnt._value);
					//assign retrieved value to PUSH command
					f._cmdsToVars[cmd._id] = tmpArgEnt._value;
				} else {
					throw new Error("runtime error: 9835973857985");
				}	//end if argument command has at least one entity
			break;
			case COMMAND_TYPE.CALL.value:
				//format: CALL [functinoid, symbol]
				//	symbol is optional (only if function is not stand-alone)
				//get functinoid
				var tmpFuncRef = cmd._args[0];
				//get number of function arguments
				var tmpNumArgs = tmpFuncRef._args.length;
				//if there is not enough of arguments on the stack
				if( funcArgStk.length < tmpNumArgs ){
					//error
					throw new Error("runtime error: not enough of function arguments");
				}
				//get owner entity (if any) for this functinoid
				var tmpFuncOwnerEnt = null;
				if( cmd._args[1] != null &&
					cmd._args[1]._id in f._cmdsToVars ){
					//assign entity for the function owner
					tmpFuncOwnerEnt = f._cmdsToVars[cmd._args[1]._id];
				}
				//create current frame for MAIN function
				var tmpFrame = new frame(tmpFuncRef._scope);
				//create funcCall object
				var tmpFuncCallObj = new funcCall(
					tmpFuncRef,			//functinoid
					f.getNextPos(),		//next command's position in the caller
					tmpFuncOwnerEnt		//owner entity
				);
				//move arguments from the argument stack to funcCall's stack
				while( tmpFuncCallObj._args.length < tmpNumArgs ){
					tmpFuncCallObj._args.push(funcArgStk.pop());
				}
				//reverse order of arguments
				tmpFuncCallObj._args.reverse();
				//add funcCall object to current frame
				tmpFrame._funcsToFuncCalls[tmpFuncRef._id] = tmpFuncCallObj;
				//load variables for this frame
				tmpFrame.loadVariables();
				//run function
				this.run(tmpFrame);
				//assign returned result to this command (CALL)
				f._cmdsToVars[cmd._id] = tmpFrame._funcsToFuncCalls[tmpFuncRef._id]._returnVal;
			break;
			case COMMAND_TYPE.EXTERNAL.value:
				//TODO
			break;
			case COMMAND_TYPE.PHI.value:
				//TODO
			break;
			case COMMAND_TYPE.ADD.value:
			case COMMAND_TYPE.SUB.value:
			case COMMAND_TYPE.MUL.value:
			case COMMAND_TYPE.DIV.value:
			case COMMAND_TYPE.MOD.value:
				//ARITHMETIC_COMMAND [leftArg, rightArg]
				//get entity for the right arithmetic argument
				var tmpLeftArithEnt = f._cmdsToVars[cmd._args[0]._id]._value;
				//get entity for the left arithmetic argument
				var tmpRightArithEnt = f._cmdsToVars[cmd._args[1]._id]._value;
				//initialize variable for keeping track of result
				var tmpArithRes = null;
				//depending on the type of command perform different operation
				switch(cmd._type){
					case COMMAND_TYPE.ADD.value:
						tmpArithRes = tmpLeftArithEnt + tmpRightArithEnt;
					break;
					case COMMAND_TYPE.SUB.value:
						tmpArithRes = tmpLeftArithEnt - tmpRightArithEnt;
					break;
					case COMMAND_TYPE.MUL.value:
						tmpArithRes = tmpLeftArithEnt * tmpRightArithEnt;
					break;
					case COMMAND_TYPE.DIV.value:
						tmpArithRes = tmpLeftArithEnt / tmpRightArithEnt;
					break;
					case COMMAND_TYPE.MOD.value:
						tmpArithRes = tmpLeftArithEnt % tmpRightArithEnt;
					break;
				}
				//assign a result to this arithmetic command
				//TODO
			break;
			case COMMAND_TYPE.CMP.value:
				//CMP [rightArg, leftArg]
				//get entity for the right comparison argument
				var tmpLeftCmpEnt = f._cmdsToVars[cmd._args[0]._id];
				//get entity for the left comparison argument
				var tmpRightCmpEnt = f._cmdsToVars[cmd._args[1]._id];
				//compare left and right results and store in the proper map
				if( tmpLeftCmpEnt == tmpRightCmpEnt ){
					compResMap[f._scope._id] = 0;
				} else {
					compResMap[f._scope._id] = tmpLeftCmpEnt > tmpRightCmpEnt ? 1 : -1;
				}
			break;
			case COMMAND_TYPE.BEQ.value:
			case COMMAND_TYPE.BNE.value:
			case COMMAND_TYPE.BGT.value:
			case COMMAND_TYPE.BGE.value:
			case COMMAND_TYPE.BLT.value:
			case COMMAND_TYPE.BLE.value:
				//BXX [comparison_command, where_to_jump_command]
				//ensure that there is comparison result for this scope
				if( !(f._scope._id in compResMap) ){
					//error
					throw new Error("runtime error: 483957238975893");
				}
				//get comparison result
				var tmpCmpRes = compResMap[f._scope._id];
				//depending on the jump type either perform a jump or skip
				var tmpDoJump = false;
				switch(cmd._type.value){
					case COMMAND_TYPE.BEQ.value:
						tmpDoJump = tmpCmpRes == 0;
					break;
					case COMMAND_TYPE.BNE.value:
						tmpDoJump = tmpCmpRes != 0;
					break;
					case COMMAND_TYPE.BGT.value:
						tmpDoJump = tmpCmpRes == 1;
					break;
					case COMMAND_TYPE.BGE.value:
						tmpDoJump = tmpCmpRes == 0 || tmpCmpRes == 1;
					break;
					case COMMAND_TYPE.BLT.value:
						tmpDoJump = tmpCmpRes == -1;
					break;
					case COMMAND_TYPE.BLE.value:
						tmpDoJump == tmpCmpRes == -1 || tmpCmpRes == 0;
					break;
				}
				//if need to jump
				if( tmpDoJump ){
					//get command where to jump
					var tmpJmpCmd = cmd._args[1];
					//set destination position where to jump
					nextPos = new position(
						tmpJmpCmd._blk._owner,	//scope
						tmpJmpCmd._blk,			//block
						tmpJmpCmd				//command
					);
				}	//end if need to jump
			break;
			case COMMAND_TYPE.BRA.value:
				//get command where to jump
				var tmpJmpCmd = cmd._arg[0];
				//set destination position where to jump
				nextPos = new position(
					tmpJmpCmd._blk._owner,	//scope
					tmpJmpCmd._blk,			//block
					tmpJmpCmd				//command
				);
			break;
			case COMMAND_TYPE.RETURN.value:
				//format: RETURN [expCmd]
				//get scope representing function
				var tmpFuncScp = f._scope;
				//make sure that it is a function scope
				if( tmpFuncScp._funcDecl == null ){
					//error
					throw new Error("runtime error: 2439472385784758");
				}
				//make sure that there is a funcCall object for this function
				if( !(tmpFuncScp._funcDecl in f._funcsToFuncCalls) ){
					//error
					throw new Error("runtime error: 89573957853");
				}
				//find funcCall object for this function
				var tmpFuncCallObj = f._funcsToFuncCalls[tmpFuncScp._funcDecl];
				//get returned expression command
				var tmpRetExpCmd = cmd._args[0]._id;
				//ensure that there is an entity for returned command
				if( !(tmpRetExpCmd in f._cmdsToVars) ){
					//error
					throw new Error("runtime error: 7487284924989402");
				}
				//get entity for returned expression command
				var tmpRetExpEnt = f._cmdsToVars[tmpRetExpCmd];
				//ensure that type of returned expression matches
				//	function's return type
				if( tmpRetExpEnt._type.isEqual(tmpFuncScp._funcDecl._return_type) == false ){
					//****TODO: need to handle cases when interpreter can cast one type to another
					//	for example, integer to real, or boolean to text, etc ... (singeltons only)
					//error
					throw new Error("runtime error: function return type does not match type of returned expression");
				}
				//save returned expression inside funcCall object
				tmpFuncCallObj._returnVal = tmpRetExpEnt;
				//quit this RUN instance
				return;
			//this BREAK is not reached
			break;
			case COMMAND_TYPE.LOAD.value:
				//get its only argument (ADDA command)
				var tmpAddaCmdId = cmd._args[0]._id;
				//if there is an entity for ADDA command
				if( tmpAddaCmdId in f._cmdsToVars ){
					//add entry to redirection map
					redirectCmdMapToEnt[cmd._id] = f._cmdsToVars[tmpAddaCmdId];
					//add entry to map command=>entity
					f._cmdsToVars[cmd._id] = f._cmdsToVars[tmpAddaCmdId];
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
				//get entity for stored expression
				var tmpStoredExpEnt = f._cmdsToVars[tmpStoredExpCmdId];
				//make sure that assigned expression matches type of
				//	left side expression (represented by ADDA command)
				if( tmpLeftSideEnt._type.isEqual(tmpStoredExpEnt) == false ){
					//error
					throw new Error("runtime error: type mismatch in assigned expression");
				}
				//store extracted value in an entity
				tmpLeftSideEnt._value = tmpStoredExpEnt.getTypeName() == RES_ENT_TYPE.ENTITY ? tmpStoredExpEnt._value : tmpStoredExpEnt;
				//add value to map command=>entity
				f._cmdsToVars[cmd._id] = tmpStoredExpEnt;
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
					//make sure that the right hand side is command
					if( tmpRightSideRef.getTypeName() != RES_ENT_TYPE.COMMAND ){
						//error
						throw new Error("runtime error: 547857847773412");
					}
					//also make sure that this command has been evaluated
					if( !(cmd._id in f._cmdsToVars) ){
						//error
						throw new Error("runtime error: 893578923578927 (id:" + cmd._id + " => type:" + cmd._type.value + ")");
					}
					//get content representing right side (it has to be a singelton)
					//check if it is an array
					if( tmpObjType == OBJ_TYPE.ARRAY.value ){
						//	right side => integer
						//get entity representing array index
						var tmpArrIdxEnt = f._cmdsToVars[tmpRightSideRef._id];
						//ensure thay array index is integer
						if( tmpArrIdxEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("runtime error: 478374893573985");
						}
						//get index value
						var tmpArrIdxVal = tmpArrIdxEnt._value._value;
						//make sure that index is not addressing outside of array
						if( tmpArrIdxVal >= tmpLeftSideEnt._value._value.length ){
							//index addresses beyond array boundaries
							throw new Error("runtime error: index is addressing outside of array boundaries");
						}
						//save array entry for ADDA command
						tmpAddaVal = tmpLeftSideEnt._value._value[tmpArrIdxVal];
					} else if( tmpObjType == OBJ_TYPE.HASH.value ){	//if hashmap
						//	right side => text
						//get entity representing hashmap entry
						var tmpHashIdxEnt = f._cmdsToVars[tmpRightSideRef._id];
						//ensure thay hashmap entry is text
						if( tmpHashIdxEnt._type._type.value != OBJ_TYPE.TEXT.value ){
							//error
							throw new Error("runtime error: 8947385735829");
						}
						//get index value
						var tmpHashIdxVal = tmpHashIdxEnt._value._value;
						//TODO: check if addressed hash entry is actually inside hashmap
						//TODO: need to create special class for hashmaps (it has to be more complex then JS associative array, i.e. be able to get min/max values and possibly to sort)
						throw new Error("runtime error: hashmap is not implemented, yet");
					}	//end if it is an array
				}	//end if handling access operator
				//store right's side value for ADDA command
				f._cmdsToVars[cmd._id] = tmpAddaVal;
			break;
		}	//end switch -- depending on the type of current command
		//flag for loading variable in a new scope
		var doLoadNewScope = false;
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
			//variable for keeping track of iterator
			var tmpIter = null;
			//this processed command must have been a jump command (conditional
			//	or unconditional) so check if this scope is a loop
			if( f._scope._type.value == SCOPE_TYPE.WHILE.value ||
				f._scope._type.value == SCOPE_TYPE.FOREACH.value ){
				//if jumping to the start of the loop
				if( nextPos._block.isEqual(f._scope._start) == true &&
					//make sure that we are jumping within the loop
					cmd._blk._owner.isEqual(f._scope) == true
				){
					//save iterator
					tmpIter = f._iter;
					//set flag to load loop's scope
				}	//end if jumping to the start of loop
			}	//end if this is a loop scope
			//check if need to load new scope
			if( doLoadNewScope ||		//if jumping inside a loop
				//OR, if moving from one scope to another
				cmd._blk._owner.isEqual(nextPos._scope) == false
			){
				//create new frame
				f = new frame(nextPos._scope);
				//load variables for this new scope
				this._curFrame.loadVariables();
			}	//end if need to load new scope
		}	//end if move to next consequent position
		//move to the next command
		f._current = nextPos;
	} while (!this._doQuit);	//end loop to process commands in this frame
};	//end function 'run'