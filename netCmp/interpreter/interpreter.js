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
	this._externalFuncLib = {
		//construct entity of given type
		//input(s):
		//	sid: (integer) id of the symbol for which to construct empty entity
		//	fr: (frame) current frame
		//output(s): (entity) => constructed entity
		'createVariableEntity': function(sid, fr){
			//find entity for the specified symbol id
			return fr._symbsToVars[sid];
		},
		//complete fundamental functionality of specified class:
		//ADD: {value: 2, name: "+"},				//operator '+'
		//SUB: {value: 3, name: "-"},				//operator '-'
		//MUL: {value: 4, name: "*"},				//operator '*'
		//DIV: {value: 5, name: "/"},				//operator '/'
		//MOD: {value: 6, name: "mod"},				//operator 'mod'
		//TO_STR: {value: 7, name: "toString"},		//convert object to string
		//IS_EQ: {value: 8, name: "isEqual"},		//compare objects
		//CLONE: {value: 9, name: "cloneObject"},	//clone object
		//input(s):
		//	f: (text) function type's name
		//	t: (text) object type's name
		//	fr: (frame) current frame
		//output(s):
		//	(content) => resulting arithmetic value
		'process': function(fname, tname, fr){
			//make sure that type with specified name exists
			if( !(tname in type.__library) ){
				//error
				throw new Error("runtime error: 5738572598659824");
			}
			//get specified type
			var tmpType = type.__library[tname];
			//get THIS entity
			var tmpThisEnt = fr.getEntityByName("this");
			//make sure that THIS entity was found
			if( tmpThisEnt == null ){
				//error
				throw new Error("runtime error: 34297471894754");
			}
			//get OTHER entity
			var tmpOtherEnt = fr.getEntityByName("other");
			//if this is not a TO_STR and not CLONE operator, then we need to have OTHER entity defined
			if( fname != FUNCTION_TYPE.TO_STR.name && fname != FUNCTION_TYPE.CLONE.name && tmpOtherEnt == null ){
				//error
				throw new Error("runtime error: 497395723859724");
			}
			//setup variables that would store CONTENTS instead of ENTITIES
			var tmpThisVal = tmpThisEnt;
			var tmpOtherVal = tmpOtherEnt;
			//if THIS is an entity
			if( tmpThisEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//re-define value of THIS
				tmpThisVal = tmpThisEnt._value;
			}
			//if OTHER is defined and it is an entity
			if( tmpOtherEnt != null && tmpOtherEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//re-define value of OTHER
				tmpOtherVal = tmpOtherEnt._value;
			}
			//setup a resulting value
			var tmpResVal = null;
			//depending on the type of function
			switch(fname){
				case FUNCTION_TYPE.ADD.name:
				case FUNCTION_TYPE.SUB.name:
				case FUNCTION_TYPE.MUL.name:
				case FUNCTION_TYPE.DIV.name:
				case FUNCTION_TYPE.MOD.name:
					//convert function type to equivalent command type
					var tmpEqCmdType = null;
					switch(fname){
						case FUNCTION_TYPE.ADD.name:
							tmpEqCmdType = COMMAND_TYPE.ADD;
						break;
						case FUNCTION_TYPE.SUB.name:
							tmpEqCmdType = COMMAND_TYPE.SUB:
						break;
						case FUNCTION_TYPE.MUL.name:
							tmpEqCmdType = COMMAND_TYPE.MUL;
						break;
						case FUNCTION_TYPE.DIV.name:
							tmpEqCmdType = COMMAND_TYPE.DIV;
						break;
						case FUNCTION_TYPE.MOD.name:
							tmpEqCmdType = COMMAND_TYPE.MOD;
						break;
					}
					//perform an arithmetic operation to get resulting value (content type)
					tmpResVal = this.processArithmeticOp(
						tmpEqCmdType,			//equivalent command type
						tmpThisVal,				//first argument (content)
						tmpOtherVal				//second argument (content)
					);
				break;
				case FUNCTION_TYPE.TO_STR.name:
					//convert object to text
					tmpResVal = new content(
						tmpThisVal._value.toString(),		//THIS object is converted to string
						type.__library["text"]				//type is TEXT
					);
				break;
				case FUNCTION_TYPE.IS_EQ.name:
					//compare twp objects: THIS and OTHER and record BOOLEAN result
					tmpResVal = mew content(
						//compare THIS with OTHER
						JSON.stringify(tmpThisVal._value) == JSON.stringify(tmpOtherVal._value),
						type.__library["boolean"]			//type is boolean
					);
				break;
				case FUNCTION_TYPE.CLONE.name:
					//make a clone of CONTENT
					tmpResVal = new content(
						JQuery.extend(true, {}, tmpThisVal._value),
						tmpThisVal._type
					);
				break;
			}
			//return resulting content value
			return tmpResVal;
		}
	};
};	//end function 'populateExtFuncLib'

//associate entity/ies with the given command, based on symbol(s) representing this command
//input(s):
//	f: (frame) current frame
//	c: (command) current command with which to associate entities
//	v: (entity/content) command's value
//output(s): (none)
interpreter.prototype.associateEntWithCmd = function(f, c, v){
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
		//if the value is given by the caller, then need to assign it to symbol
		if( typeof v == "object" && v != null ){
			//make sure that type is matching
			if( tmpEnt._type.isEqual(v._type) == false ){
				//error
				throw new Error("runtime error: 467579326578326582");
			}
			//if 'v' is an entity
			if( v.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//assign symbol's entity with the value of this entity
				tmpEnt._value = v._value;
			} else {	//otherwise, it has to be a content object
				//assign an entity's value
				tmpEnt._value = v;
			}	//end if 'v' is an entity
		}	//end if assigning value is provided by the caller
	}	//end loop thru associated symbols
};	//end function 'associateEntWithCmd'

//perform arithmetic operation and preliminary checks before such computation
//	to determine if involved values can be operated on
//input(s):
//	op: (COMMAND_TYPE) type of command under processing
//	c1: (content) first argument of arithmetic operation
//	c2: (content) second argument of arithmetic operation
//output(s):
//	(content) => resulting value of operation
interpreter.prototype.processArithmeticOp = function(op, c1, c2){
	//initialize variables for storing type and value of resulting operation
	var tmpResType = null;
	var tmpResVal = null;
	//if resulting type should be TEXT
	if(
		//if it is ADD operator and one of arguments is TEXT
		op.value == COMMAND_TYPE.ADD.value &&
		(
			c1._type._type.value == OBJ_TYPE.TEXT.value || c2._type._type.value == OBJ_TYPE.TEXT.value
		)
	){
		//set resulting type to be TEXT
		tmpResType = c1._type._type.value == OBJ_TYPE.TEXT.value ? c1._type : c2._type;
	}
	//if resulting type should be REAL
	if(
		//if one of arguments is REAL
		c1._type._type.value == OBJ_TYPE.REAL.value || c2._type._type.value == OBJ_TYPE.REAL.value
	){
		//set resulting type to be REAL
		tmpResType = c1._type._type.value == OBJ_TYPE.REAL.value ? c1._type : c2._type;
	}
	//first we need to check if such arithmetic operation is valid
	if(
		//if left argument is not valid
		(
			//not of type integer
			c1._type._type.value != OBJ_TYPE.INT.value &&
			//and, not of type real
			c1._type._type.value != OBJ_TYPE.REAL.value &&
			//and, it is either not ADD operator OR if it is ADD it's argument is not of type TEXT
			(
				//not an ADD operator
				op.value != COMMAND_TYPE.ADD.value ||
				//or, it is an ADD but its argument is not of type TEXT
				(
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT
				)
			)
		) ||
		//if right argument is not valid
		(
			//not of type integer
			c2._type._type.value != OBJ_TYPE.INT.value &&
			//and, not of type real
			c2._type._type.value != OBJ_TYPE.REAL.value &&
			//and, it is either not ADD operator OR if it is ADD it's argument is not of type TEXT
			(
				//not an ADD operator
				op.value != COMMAND_TYPE.ADD.value ||
				//or, it is an ADD but its argument is not of type TEXT
				(
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT
				)
			)
		)
	){
		//error
		throw new Error("runtime error: 478278915739835");
	}
	//if resulting type was not set to either TEXT or REAL, then it has to become INTEGER
	if( tmpResType == null ){
		tmpResType = c1._type;	//at this point it should be INTEGER
	}
	//depending on the command type, perform an arithmetic operation
	switch(op.value){
		case COMMAND_TYPE.ADD.value:
			tmpResVal = c1._value + c2._value;
		break;
		case COMMAND_TYPE.SUB.value:
			tmpResVal = c1._value - c2._value;
		break;
		case COMMAND_TYPE.MUL.value:
			tmpResVal = c1._value * c2._value;
		break;
		case COMMAND_TYPE.DIV.value:
			tmpResVal = c1._value / c2._value;
		break;
		case COMMAND_TYPE.MOD.value:
			tmpResVal = c1._value % c2._value;
		break;
	}
	//create content object and return it back to the caller
	return new content(tmpResType, tmpResVal);
};	//end function 'processArithmeticOp'

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
		//initialize variable for keeping a value
		var tmpCmdVal = null;
		//initialize flag for associating symbols with a command
		var doAssociateSymbWithCmd = true;
		//depending on the type of current command
		switch(cmd._type.value){
			case COMMAND_TYPE.NOP.value:
				//do not need to associate symbols, since NOP never has
				//	such symbols in the first place
				doAssociateSymbWithCmd = false;
			break;
			case COMMAND_TYPE.NULL.value:
			case COMMAND_TYPE.POP.value:
				//do nothing (only associate symbols with the command)
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
					tmpCmdVal = tmpArgEnt._value;
				} else {
					throw new Error("runtime error: 9835973857985");
				}	//end if argument command has at least one entity
			break;
			case COMMAND_TYPE.ISNEXT.value:
				//TODO (need to first implement hashmap)
			break;
			case COMMAND_TYPE.NEXT.value:
				//TODO (need to first implement hashmap)
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
				tmpCmdVal = tmpFrame._funcsToFuncCalls[tmpFuncRef._id]._returnVal;
			break;
			case COMMAND_TYPE.EXTERNAL.value:
				//EXTERNAL ['FUNCTION_NAME(ARGS)']
				//get text argument that encodes FUNCTION_NAME and ARGS
				var tmpExtCmdArg = cmd._args[0];
				//make sure it is of type string and it is not empty string
				if( typeof tmpExtCmdArg != "string" || tmpExtCmdArg == "" ){
					throw new Error("runtime error: unkown EXTERNAL command argument");
				}
				//get function name
				var tmpExtFuncName = tmpExtCmdArg.substring(0, tmpExtCmdArg.indexOf("("));
				//if function is 'createVariableEntity' (for declaring entity)
				if( tmpExtFuncName == "createVariableEntity" ){
					//make sure that there is only one argument
					if( tmpExtCmdArg.indexOf(",") ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'createVariableEntity' should only take one argument");
					}
					//expecting only one (integer) argument
					var tmpSymbId = parseInt(tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(")")));
					//create entity using EXTERNAL function
					//	'createVariableEntity': function(sid, fr)
					tmpCmdVal = this._externalFuncLib['createVariableEntity'](tmpSymbId, f);
				//if function is 'process' (for processing fundamental operators)
				} else if( tmpExtFuncName == "process" ) {
					//make sure there are 2 arguments
					if( tmpExtCmdArg.split(",").length != 1 ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'process' should take exactly 2 arguments");
					}
					//get function type's name
					var tmpFuncTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(","));
					//get type name
					var tmpObjTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf(",") + 1, tmpExtCmdArg.indexOf(")"));
					//process EXTERNAL operation
					//	'process': function(fname, tname, fr)
					tmpCmdVal = this._externalFuncLib['process'](tmpFuncTypeName, tmpObjTypeName, f);
				} else {	//unkown EXTERNAL function
					//error
					throw new Error("runtime error: PARSING BUG: unkown EXTERNAL function name");
				}	//end if function is 'createVariableEntity'
			break;
			case COMMAND_TYPE.PHI.value:
				//Comments only: two types of constructs to be discussed:
				//	1. condition (IF-THEN-ELSE):
				//		* if jump-condition is taken, then use PHI's right argument
				//		* if not taken, then use PHI's left argument
				//	2. loop (FOREACH or WHILE):
				//		* if first iteration, then use PHI's left argument
				//		* if second or later iteration, then use PHI's right argument
				//if PHI command has one argument
				if( cmd._args.length == 1 ){
					//associate value of this argument with this command
					f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
				//if PHI command has two arguments
				} else if( cmd._args.length == 2 ){
					//if this is a condition scope
					if( f._scope._type == SCOPE_TYPE.CONDITION ){
						//if condition is present inside map
						if( f._scope._id in compResMap ){
							//get value from the compResMap for this scope
							var tmpResMapEntry = compResMap[f._scope._id];
							//if jump condition is taken, i.e. compResMap for this scope contains a string ('0')
							if( typeof tmpResMapEntry == "string" ){
								//use right argument of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
							} else {	//else jump condition is not taken
								//use left argument of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
							}	//end if jump condition is taken
						} else {	//else condition is not present inside map
							//error
							throw new Error("runtime error: 74647647676535");
						}	//end if condition is present inside map
					} else if( f._scope._type == SCOPE_TYPE.FOREACH || f._scope._type == SCOPE_TYPE.WHILE ){
						//if it is not first iteration in the loop
						if( f._scope._id in compResMap ){
							//take value (a.k.a. content or entity) of right argument as value of PHI command
							f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
						} else {	//else, it is first iteration in the loop
							//take value of left argument as value of PHI command
							f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
						}	//end if it is not first iteration in the loop
					}	//end if it is condition scope
				} else {	//else, it has inacceptable number of command arguments
					throw new Error("runtime error: 84937859532785");
				}	//end if PHI command has one argument
			break;
			case COMMAND_TYPE.ADD.value:
			case COMMAND_TYPE.SUB.value:
			case COMMAND_TYPE.MUL.value:
			case COMMAND_TYPE.DIV.value:
			case COMMAND_TYPE.MOD.value:
				//ARITHMETIC_COMMAND [leftArg, rightArg]
				//get content for the right arithmetic argument
				var tmpLeftArithEnt = f._cmdsToVars[cmd._args[0]._id];
				//if left argument is an entity
				if( tmpLeftArithEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
					tmpLeftArithEnt = tmpLeftArithEnt._value;
				}
				//get content for the left arithmetic argument
				var tmpRightArithEnt = f._cmdsToVars[cmd._args[1]._id];
				//if right argument is an entity
				if( tmpRightArithEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
					tmpRightArithEnt = tmpRightArithEnt._value;
				}
				//assign resulting command value
				tmpCmdVal = this.processArithmeticOp(
					cmd._type,			//command type
					tmpLeftArithEnt,	//first argument (content type)
					tmpRightArithEnt	//second argument (content type)
				);
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
				//do not associate symbols with command (just like NOP, CMP
				//	never has any associations)
				doAssociateSymbWithCmd = false;
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
					//if this is a condition scope
					if( f._scope._type == SCOPE_TYPE.CONDITION ){
						//for conditions, we need to know which branch (THEN or ELSE) we have taken
						//	this helps to determine which argument of PHI command to associate with
						//	the total value of PHI command. So assign a non-integer value (e.g. a
						//	string value) to the entry in 'compResMap'
						compResMap[f._scope._id] = "0";
					}	//end if it is a condition scope
				}	//end if need to jump
				//do not associate symbols
				doAssociateSymbWithCmd = false;
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
				//do not associate symbols
				doAssociateSymbWithCmd = false;
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
					tmpCmdVal = f._cmdsToVars[tmpAddaCmdId];
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
				tmpCmdVal = tmpStoredExpEnt;
			break;
			case COMMAND_TYPE.ADDA.value:
				//get command of left side of access operator ('.')
				var tmpLeftSideCmd = cmd._args[0];
				//get entity for left side's command
				var tmpLeftSideEnt = f._cmdsToVars[tmpLeftSideCmd._id];
				//get command or functinoid representing right side
				var tmpRightSideRef = cmd._args[1];
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
						tmpCmdVal = tmpRightSideRef;	//functinoid reference
						//also store left side's entity for this ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpLeftSideEnt;
					} else {	//otherwise, it is a data field
						//get entity OR a content representing given field
						tmpCmdVal = tmpLeftSideEnt._fields[tmpRightSideSymb._name];
						//store extracted entity/content for ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpCmdVal;
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
						tmpCmdVal = tmpLeftSideEnt._value._value[tmpArrIdxVal];
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
				//do not associate symbols with this command
				doAssociateSymbWithCmd = false;
			break;
		}	//end switch -- depending on the type of current command
		//if need to associate symbol(s) with this command
		if( doAssociateSymbWithCmd ){
			//associate entities with NULL command
			this.associateEntWithCmd(f, cmd, tmpCmdVal);
		} else {	//no need to associate symbols with this command
			//if there is a value
			if( tmpCmdVal != null ){
				//store value (content or entity) for this command
				f._cmdsToVars[cmd._id] = tmpCmdVal;
			}	//end if there is a value
		}	//end if need to associate symbol(s) with this command
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