/**
	Developer:	Eduard Sedakov
	Date:		2016-02-04
	Description:	interpreter module
	Used by: {everything}
	Depends on:	{everything}
**/

//==========globals:==========
//ES 2016-08-13 (b_cmp_test_1): global boolean flag to determine whether to render
//	Execution Command Stack (ECS)
//ES 2016-09-06 (b_debugger): do not render ECS, now using debugger (more functionall)
interpreter.__doRenderECS = false;

//ES 2017-01-26 (b_aws_fix_01): store error in static field, since if interpreter ctro
//	fails we would not be able to store it any where else
interpreter.__parsErrMsg = null;

//timinhg stack
interpreter.__timingStack = [];

//record time now
//input(s):
//      funcName: (text) name of function
//output(s): (none)
interpreter.addNewTimeRecord = function(funcName){

        //add entry in a timing stack
        //      see: http://stackoverflow.com/a/21120901
        interpreter.__timingStack.push({'name': funcName, 'time': window.performance.now()});

};      //end function 'addNewTimeRecord'

//ES 2017-02-14 (soko); create static function for initializing NULL command.
//Note: code for this function was moved from interpreter::run() case COMMAND_TYPE.NULL
//input(s):
//	cmd: (COMMAND) NULL command to initialize
//output(s):
//	(CONTENT) => rsulting content value associated with initialized NULL command
interpreter.initNullCommand = function(cmd){
	//if there are no associated symbols with this NULL command, then
	//	it must be a constant declaration. So we need to create a
	//	value that will represent such constant
	//get singleton constant value
	var tmpSnglVal = cmd._args[0]._value;
	//setup variable for type
	var tmpSnglType = null;
	//determine type of singleton constant value
	switch(typeof tmpSnglVal){
		case "number":
			//is it an integer (see http://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer)
			if( tmpSnglVal == (tmpSnglVal | 0) ){
				//integer
				tmpSnglType = type.__library["integer"];
			} else {
				//real
				tmpSnglType = type.__library["real"];
			}
		break;
		case "string":
			tmpSnglType = type.__library["text"];
		break;
		case "boolean":
			tmpSnglType = type.__library["boolean"];
		break;
		default:
			//error -- unkown singleton type
			throw new Error("473582764744597852");
		break;
	}
	//create constant value
	tmpCmdVal = new content(
		tmpSnglType,		//type
		tmpSnglVal			//value
	);
	return tmpCmdVal;
};	//ES 2017-02-14 (soko): end function 'initNullCommand'

//class is designed for interpreting CFG (Control Flow Graph)
//input(s): 
//	code: (text) => strign representation of the code to be parsed
//	w: (integer) => ES 2016-09-05 (b_debugger): viewport width
//	h: (integer) => ES 2016-09-05 (b_debugger): viewport height
//	id: (text) => ES 2016-09-05 (b_debugger): id of HTML element container around viewport
//output(s): (none)
function interpreter(code, w, h, id){
	//boolean flag to determine whether to stop execution of code
	this._doQuit = false;
	//library of EXTERNAL functions
	this._externalFuncLib = {};
	//populate library of external functions
	this.populateExtFuncLib();
	//ES 2017-01-26 (b_aws_fix_01): try to catch parsing errors
	try {
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
	/* ES 2016-09-08 (b_debugger): move code into function 'initInterpreter'
	//get scope for the MAIN functinoid
	var scpMain = mainFunc._scope;
	//make sure that function has at least one block
	if( scpMain._start == null ){
		//main function does not have any blocks => empty function
		throw new Error("runtime error: MAIN function has no starting block");
	}
	//create current frame for MAIN function
	this._curFrame = new frame(scpMain);
	//stack of frames
	this._stackFrames = {};
	//add current frame to the stack
	this._stackFrames[scpMain._id] = this._curFrame;
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
	//set global variable for interpeter in the entity file
	entity.__interp = this;
	//ES 2016-08-04 (b_cmp_test_1): keep only one reference to DRAWING component
	this._drwCmp = null;
	//ES 2016-09-03 (b_log_cond_test): store previous block, in order to know which PHI
	//	argument to use, since we associate PHI block argument with execution path
	//	chosen by the interpreter
	this._prevBlk = null;
	//load variables for this frame
	this._curFrame.loadVariables();
	ES 2016-09-08 (b_debugger): moved code into function 'initInterpreter' */
	//ES 2016-09-08 (b_debugger): invoke 'initInterpreter', which contains moved code
	//	that sets current frame, remaining interpeter fields, and loads variables
	this.initInterpreter(mainFunc);
	//ES 2016-09-05 (b_debugger): create debugger
	dbg.getDebugger(
		this._parser,
		id,
		w,
		h,
		DBG_MODE.STEP_IN,
		this._curFrame
	);

	//ES 2017-01-26 (b_aws_fix_01): catch all parsing errors
	} catch(err){

		//return error message to the caller
		interpreter.__parsErrMsg =  err;

		//quit now
		return;

	}	//ES 2017-01-26 (b_aws_fix_01): end try to catch parsing errors

	//run user's program, starting from the MAIN function
	//ES 2017-01-22 (b_dbg_app): remove statement that auto stars debugging
	//this.run(this._curFrame);

	//ES 2017-01-26 (b_aws_fix_01): reset error to null
	interpreter.__parsErrMsg = null;

};	//end constructor for interpreter

//ES 2016-09-08 (b_debugger): moved code from interpreter's ctor (see above)
//	It sets current frame, remaining interpreter fields, and loads variables
//input(s):
//	mainFunc: (functinoid) main function in user's code
//output(s): (none)
interpreter.prototype.initInterpreter = function(mainFunc){
//ES 2017-02-05: record time
interpreter.addNewTimeRecord("interpreter::initInterpreter");
	//get scope for the MAIN functinoid
	var scpMain = mainFunc._scope;
	//make sure that function has at least one block
	if( scpMain._start == null ){
		//main function does not have any blocks => empty function
		throw new Error("runtime error: MAIN function has no starting block");
	}
	//create current frame for MAIN function
	this._curFrame = new frame(scpMain);
	//stack of frames
	this._stackFrames = {};
	//add current frame to the stack
	this._stackFrames[scpMain._id] = this._curFrame;
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
	//set global variable for interpeter in the entity file
	entity.__interp = this;
	//ES 2016-08-04 (b_cmp_test_1): keep only one reference to DRAWING component
	this._drwCmp = null;
	//ES 2016-09-03 (b_log_cond_test): store previous block, in order to know which PHI
	//	argument to use, since we associate PHI block argument with execution path
	//	chosen by the interpreter
	this._prevBlk = null;
	//load variables for this frame
	this._curFrame.loadVariables();
        //ES 2017-02-14 (soko): load null commands, so that even if certain NULL commands
        //      are bypassed during execution, they are still initialized, and we can
        //      still reference their value
        this._curFrame.loadNullCmds();
};	//ES 2016-09-08 (b_debugger): end method 'initInterpreter'

//ES 2016-09-08 (b_debugger): reset static and non-static fields, so that interpreter
//	can restart without re-freshing page and without restarting parsing
//input(s): (none)
//output(s): (none)
interpreter.prototype.restart = function(){
	//reset static fields for all interpreting objects
	iterator.reset();
	funcCall.reset();
	frame.reset();
	entity.reset();
	content.reset();
	//reset non-static fields of an interpreter
	this._doQuit = false;
	//get first debugging state
	var tmpFirstDfs = dbg.__debuggerInstance._callStack[0];
	//clear out all DFS's
	dbg.__debuggerInstance._callStack = [];
	//re-insert first DFS back
	dbg.__debuggerInstance._callStack.push(tmpFirstDfs);
	//set debugging mode to step_in
	dbg.__debuggerInstance.getDFS()._mode = DBG_MODE.STEP_IN;
	//get main functinoid
	var mainFunc = this._parser._globFuncs["__main__"];
	//re-initialize interpreter
	this.initInterpreter(mainFunc);
	//set main frame
	dbg.__debuggerInstance.getDFS()._frame = this._curFrame;
	//set current position at start of main function and redraw cursor
	dbg.__debuggerInstance.setPosition(this._curFrame);
};	//ES 2016-09-08 (b_debugger): end method 'restart'

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
		//ADD: {value: 2, name: "+"},				//operator '+' 				(this, other)
		//SUB: {value: 3, name: "-"},				//operator '-' 				(this, other)
		//MUL: {value: 4, name: "*"},				//operator '*' 				(this, other)
		//DIV: {value: 5, name: "/"},				//operator '/' 				(this, other)
		//MOD: {value: 6, name: "mod"},				//operator 'mod' 			(this, other)
		//TO_STR: {value: 7, name: "toString"},		//convert object to string	(this)
		//IS_EQ: {value: 8, name: "isEqual"},		//compare objects			(this, other)
		//IS_LESS: {value: 9, name: "isLess"},			//are two objects equal to each other
		//IS_GREATER: {value: 10, name: "isGreater"},			//are two objects equal to each other
		//CLONE: {value: 11, name: "cloneObject"},	//clone object				(this)
		//LENGTH: {value: 14, name: "length of container"},						(this)
		//GET: {value: 15, name: "get element of container"},					(this, index)
		//INSERT: {value: 16, name: "insert into container"},					(this, val [, key])		//'key' is used only in tree
		//REMOVE: {value: 17, name: "remove from container"},					(this, index)
		//INDEX: {value: 18, name: "index"},									(this, val)
		//IS_INSIDE 															(this, index)
		//IS_EMPTY 																(this)
		//REMOVE_ALL 															(this)
		//GET_MAX 																(this)
		//GET_MIN 																(this)
		//NUM_LEVELS 															(this)
		//ADD_BACK																(this, val)
		//ADD_FRONT																(this, val)
		//FILE_CREATE															(this, n, readPerms, writePerms, delPerms, renamePerms)
		//FILE_TEXT																(this)
		//FILE_READ																(this)
		//FILE_WRITE															(this)
		//input(s):
		//	fname: (text) function type's name
		//	tname: (text) object type's name
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
			//also try to get VAL and INDEX entities
			var tmpValEnt = fr.getEntityByName("val");
			var tmpIndexEnt = fr.getEntityByName("index");
			//if this operator takes more then 1 argument (i.e. not To_Str, not Clone, not Length) BUT does not have
			//	either 'other', 'val', or 'index' arguments defined
			/* ES 2016-06-12 (b_interpreter_2): do not check presence of function arguments
			if( fname != FUNCTION_TYPE.TO_STR.name && 
				fname != FUNCTION_TYPE.CLONE.name && 
				fname != FUNCTION_TYPE.LENGTH.name && 
				fname != FUNCTION_TYPE.IS_EMPTY.name &&
				fname != FUNCTION_TYPE.REMOVE_ALL.name &&
				fname != FUNCTION_TYPE.GET_MAX.name &&
				fname != FUNCTION_TYPE.GET_MIN.name &&
				fname != FUNCTION_TYPE.NUM_LEVELS.name &&
				(tmpOtherEnt == null && tmpValEnt == null && tmpIndexEnt == null)	//only 1 argument is defined
			){
				//error
				throw new Error("runtime error: 497395723859724");
			}*/
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
			//if value entity exists and it is an ENTITY
			if( tmpValEnt != null && tmpValEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//replace entity's value with a content
				tmpValEnt = tmpValEnt._value;
			}
			//if index entity exists and it is an ENTITY
			if( tmpIndexEnt != null && tmpIndexEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//replace entity's value with a content
				tmpIndexEnt = tmpIndexEnt._value;
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
							tmpEqCmdType = COMMAND_TYPE.SUB;
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
						type.__library["text"],				//type is TEXT
						tmpThisVal._value.toString()		//THIS object is converted to string
					);
				break;
				case FUNCTION_TYPE.IS_EQ.name:
					//compare twp objects: THIS and OTHER and record BOOLEAN result
					tmpResVal = new content(
						type.__library["boolean"],			//type is boolean
						//compare THIS with OTHER
						JSON.stringify(tmpThisVal._value) == JSON.stringify(tmpOtherVal._value)
					);
				break;
				case FUNCTION_TYPE.CLONE.name:
					//make a clone of CONTENT
					tmpResVal = new content(
						tmpThisVal._type,
						JQuery.extend(true, {}, tmpThisVal._value)
					);
				break;
				//ES 2016-09-17 (b_dbg_test): add two new handlers for ADD_BACK and ADD_FRONT
				//	that assist in array methods that add elements at the back and front,
				//	respectively. This methods are onlt for arrays!
				case FUNCTION_TYPE.ADD_FRONT.name:
					//ES 2016-09-17 (b_dbg_test): set index to point at 0, so that SPLICE
					//	inserts element at the front of array
					tmpIndexEnt = new content(
						type.__library["integer"],	//integer type
						0							//0 == start of array
					);
					//ES 2016-09-17 (b_dbg_test): fall through, intentionally to avoid
					//	code duplication. No need for BREAK statement!
				case FUNCTION_TYPE.ADD_BACK.name:
					//ES 2016-09-17 (b_dbg_test): make sure that it is for array only
					if( tmpType._type.value != OBJ_TYPE.ARRAY.value ){
						//error -- unkown not supported type for ADD_BACK or ADD_FRONT
						throw new Error("cannot invoke " + fname + " for non-array type");
					}
					//ES 2016-09-17 (b_dbg_test): if index is not set, then it is ADD_BACK
					//	Because, ADD_FRONT already should have set index up (see case above)
					if( tmpIndexEnt == null ){
						//set index to {{LENGTH of array}}, to insert element at the end
						tmpIndexEnt = new content(
							type.__library["integer"],	//integer type
							tmpThisVal._value.length	//length - 1 == end of array
						);
					}
					//ES 2016-09-17 (b_dbg_test): fall through, intentionally to avoid
					//	code duplication. No need for BREAK statement!
				case FUNCTION_TYPE.INSERT.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'insert' method
						tmpBTreeInstance.insert(
							tmpBTreeInstance._root,	//start from root node
							tmpIndexEnt,			//key to insert
							tmpValEnt				//val to insert
						);
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that array's template type matches type of given value
						if( tmpType._templateNameArray[0].type != tmpValEnt._type ){
							//error: type mismatch
							throw new Error("array template type is not matching value's type");
						}
						//make sure that index is of integer type
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of type integer");
						}
						//insert element into array
						tmpThisVal._value.splice(
							tmpIndexEnt._value,
							0,
							tmpValEnt
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke INSERT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.REMOVE.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'remove' method
						tmpBTreeInstance.remove(
							null,					//no parent node
							tmpBTreeInstance._root,	//starting from root node
							tmpIndexEnt				//key to remove
						);
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that index is of integer type
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of type integer");
						}
						//remove element from array
						tmpThisVal._value.splice(
							tmpIndexEnt._value,
							1
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.INDEX.name:
					if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that array's template type matches type of given value
						if( tmpType._templateNameArray[0].type != tmpValEnt._type ){
							//error: type mismatch
							throw new Error("array template type is not matching value's type");
						}
						//set resulting value to -1, i.e. value not found
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							-1							//value was not found == -1
						);
						//loop thru elements of array to find given value
						for( var k = 0; k < tmpThisVal._value.length; k++ ){
							//is current element matching given value
							if( tmpThisVal._value[k] != null && tmpThisVal._value[k] == tmpValEnt ){
								//found corresponding index
								tmpResVal._value = k;
								break;
							}
						}	//end loop thru elements of array to find given value
					} else {
						throw new Error("Tree object does not support 'index' functinoid");
					}
				break;
				case FUNCTION_TYPE.IS_INSIDE.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'isInside' method
						tmpResVal = tmpBTreeInstance.isInside(
							tmpBTreeInstance._root,	//starting from root node
							tmpIndexEnt				//key to find
						) != -1;	//TRUE if it is inside, FALSE if not
						//encapsulate boolean value in a content object
						tmpResVal = new content(
							type.__library["boolean"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke IS_INSIDE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.IS_EMPTY.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'isInside' method
						tmpResVal = tmpBTreeInstance.isEmpty();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpResVal = (tmpThisVal._value.length == 0);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke IS_EMPTY for " + tmpType._name + " type");
					}
					//encapsulate boolean value in a content object
					tmpResVal = new content(
						type.__library["boolean"],	//integer type
						tmpResVal
					);
				break;
				case FUNCTION_TYPE.REMOVE_ALL.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'removeAll' method
						tmpBTreeInstance.removeAll();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpThisVal._value = [];
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE_ALL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.LENGTH.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'numNodes' method
						tmpResVal = tmpBTreeInstance.numNodes();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpResVal = tmpThisVal._value.length;
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke LENGTH for " + tmpType._name + " type");
					}
					//encapsulate integer value in a content object
					tmpResVal = new content(
						type.__library["integer"],	//integer type
						tmpResVal
					);
				break;
				case FUNCTION_TYPE.GET.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'find' method
						tmpResVal = tmpBTreeInstance.find(
							tmpIndexEnt				//key to find
						);
						//ES 2016-09-17 (b_dbg_test): find index for element that matches given key
						var tmpNdEntIdx = tmpBTreeInstance.isInside(
							tmpResVal,		//returned B+ tree node
							tmpIndexEnt		//given key to find
						);
						//ES 2016-09-17 (b_dbg_test): if there is no such key
						if( tmpNdEntIdx == -1 ){
							throw new Error("key " + tmpIndexEnt.toString() + " does not exist in B+ tree (id: " + tmpBTreeInstance._id + ")");
						} else {	//ES 2016-09-17 (b_dbg_test): there is such key
							//get element for this key
							tmpResVal = tmpResVal._entries[tmpNdEntIdx]._val;
						}
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that index is integer
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of integer type");
						}
						//make sure that index is non-negative and within bounds of array
						if( tmpIndexEnt._value < 0 || tmpIndexEnt._value >= tmpThisVal._value.length ){
							//error -- either index is negative or out of bound
							throw new Error("index is either negative or is out of bound");
						}
						//get entry from array at the specified index
						tmpResVal = tmpThisVal._value[tmpIndexEnt._value];
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.IS_LESS.name:
				case FUNCTION_TYPE.IS_GREATER.name:
					//if we reached less ('<') or greater ('>') operator, then following should hold:
					//	1. operator ('<' or '>') belongs to fundamental singleton type
					//	2. this type has to be numerical or textual
					//	3. in case it is textual, we compare two texts by length and then by letter
					//		composition
					//ensure that type is numerical/textual fundamential singleton
					if( 
						tmpType._type.value == OBJ_TYPE.INT.value ||
						tmpType._type.value == OBJ_TYPE.REAL.value ||
						tmpType._type.value == OBJ_TYPE.TEXT.value
					){
						//operator's type is numerical or textual
						if( fname == FUNCTION_TYPE.IS_LESS.name ){
							//apply a less comparison operator and store boolean result
							tmpResVal = tmpThisVal._value < tmpOtherVal._value;
						} else {
							//apply a greater comparison operator and store boolean result
							tmpResVal = tmpThisVal._value > tmpOtherVal._value;
						}
						//encompas boolean result with a content object
						tmpResVal = new content(
							type.__library["boolean"],	//boolean type
							tmpResVal					//comparison result value
						);
					} else {
						//error
						throw new Error("can compare only singleton numericals or singleton textuals");
					}
				break;
				case FUNCTION_TYPE.GET_MAX.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'getMax' method
						tmpResVal = tmpBTreeInstance.getMax(
							tmpBTreeInstance._root	//starting from root node
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET_MAX for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.GET_MIN.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'getMin' method
						tmpResVal = tmpBTreeInstance.getMin(
							tmpBTreeInstance._root	//starting from root node
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET_MIN for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.NUM_LEVELS.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'numLevels' method
						tmpResVal = tmpBTreeInstance.numLevels();
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke NUM_LEVELS for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.MOVE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//get displacement by X
						var tmpDispX = getLocalVariableContent(fr, "dispX");
						//get displacement by Y
						var tmpDispY = getLocalVariableContent(fr, "dispY");
						//invoke method
						tmpDrwInstance.moveModel(tmpIdx, tmpDispX, tmpDispY);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MOVE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.ROTATE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//get degree of rotation
						var tmpDeg = getLocalVariableContent(fr, "deg");
						//invoke method
						tmpDrwInstance.rotateModel(tmpIdx, tmpDeg);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke ROTATE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.SET_FONT.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpFontSize = getLocalVariableContent(fr, "fontSize");
						//get degree of rotation
						var tmpColorTxt = getLocalVariableContent(fr, "colorTxt");
						//invoke method
						tmpDrwInstance.setFontInfo(tmpFontSize, tmpColorTxt);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke SET_FONT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.SET_TXT_POS.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpX = getLocalVariableContent(fr, "x");
						//get degree of rotation
						var tmpY = getLocalVariableContent(fr, "y");
						//invoke method
						tmpDrwInstance.setTxtPosition(tmpX, tmpY);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke SET_TXT_POS for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.REMOVE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//invoke method
						tmpResVal = tmpDrwInstance.removeModel(tmpIdx);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_RECT.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpOpacity = getLocalVariableContent(fr, "opacity");
						//get color for border
						var tmpBorderColor = getLocalVariableContent(fr, "borderColor");
						//get size for border
						var tmpBorderSize = getLocalVariableContent(fr, "borderSize");
						//get filling color
						var tmpFillColor = getLocalVariableContent(fr, "fillColor");
						//get degree of rounding in X-axis
						var tmpRoundX = getLocalVariableContent(fr, "roundX");
						//get degree of rounding in Y-axis
						var tmpRoundY = getLocalVariableContent(fr, "roundY");
						//get text
						var tmpTxt = getLocalVariableContent(fr, "txt");
						//invoke method
						tmpResVal = tmpDrwInstance.drawRect(
							tmpX, tmpY, tmpW, tmpH, tmpOpacity,
							tmpBorderColor, tmpBorderSize, tmpFillColor,
							tmpRoundX, tmpRoundY, tmpTxt
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_RECT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_IMAGE.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpImgPath = getLocalVariableContent(fr, "imgPath");
						//invoke method
						tmpResVal = tmpDrwInstance.drawImage(
							tmpX, tmpY, tmpW, tmpH, tmpImgPath
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_IMAGE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_ELLIPSE.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpOpacity = getLocalVariableContent(fr, "opacity");
						//get color for border
						var tmpBorderColor = getLocalVariableContent(fr, "borderColor");
						//get size for border
						var tmpBorderSize = getLocalVariableContent(fr, "borderSize");
						//get filling color
						var tmpFillColor = getLocalVariableContent(fr, "fillColor");
						//get text
						var tmpTxt = getLocalVariableContent(fr, "txt");
						//invoke method
						tmpResVal = tmpDrwInstance.drawRect(
							tmpX, tmpY, tmpW, tmpH, tmpOpacity,
							tmpBorderColor, tmpBorderSize, 
							tmpFillColor, tmpTxt
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_RECT for " + tmpType._name + " type");
					}
				break;
				//ES 2016-09-30 (b_libs_1): new handler for file create method
				case FUNCTION_TYPE.FILE_CREATE.name:
					//make sure that method is called from file component
					if( tmpType._type.value == OBJ_TYPE.FILE.value ){
						//get instance of FILE object
						var tmpFileInstance = tmpThisVal._value;
						//get abs file name
						var tmpN = getLocalVariableContent(fr, "n");
						//get flags for read/write/delete/rename permissions
						var tmpR = getLocalVariableContent(fr, "readPerms");
						var tmpW = getLocalVariableContent(fr, "writePerms");
						var tmpD = getLocalVariableContent(fr, "delPerms");
						var tmpRename = getLocalVariableContent(fr, "renamePerms");
						//invoke method
						tmpResVal = tmpFileInstance.create(
							tmpN, tmpR, tmpW, tmpD, tmpRename
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke FILE_CREATE for " + tmpType._name + " type");
					}	//end if method called from file component
				break;
				//ES 2016-09-30 (b_libs_1): new handler for file create method
				case FUNCTION_TYPE.FILE_TEXT.name:
					//make sure that method is called from file component
					if( tmpType._type.value == OBJ_TYPE.FILE.value ){
						//get instance of FILE object
						var tmpFileInstance = tmpThisVal._value;
						//invoke method
						tmpResVal = tmpFileInstance.text();
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke FILE_TEXT for " + tmpType._name + " type");
					}	//end if method called from file component
				break;
				//ES 2016-09-30 (b_libs_1): new handler for file read method
				case FUNCTION_TYPE.FILE_READ.name:
					//make sure that method is called from file component
					if( tmpType._type.value == OBJ_TYPE.FILE.value ){
						//ES TODO:
						//	1. change DRAW_IMAGE to accept FILE instead of actual text argument
						//	2. implement new hierarchy for maintaining all loaded FILEs
						//			{
						//				key -> file_id
						//				value ->	{
						//								loaded? -> boolean
						//								postponedTasks -> Array<anonymous function>
						//							}
						//			}
						//			=> it should register all created FILE objects, but also
						//				know if this file has been loaded from server
						//			=> if DRAW_IMAGE should use FILE only that has not been loaded
						//					then, it should create (if needed) new item in
						//					hierarchy for required FILE_ID (image), set loaded? to
						//					FALSE, and set value to an array with anonymous function
						//					that invokes 'drawRect' and then encapsulates resulting
						//					INTEGER inside CONTENT object
						//			=> when FILE loading completed (which happens when 'done'
						//				callback is fired, then we should check)
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke FILE_READ for " + tmpType._name + " type");
					}	//end if method called from file component
				break;
				//ES 2016-09-30 (b_libs_1): new handler for file write method
				case FUNCTION_TYPE.FILE_WRITE.name:
					//make sure that method is called from file component
					if( tmpType._type.value == OBJ_TYPE.FILE.value ){
						//ES TODO: need to create method in file.js, which in turn requires
						//	designing server side. So lets wait. It will also have to deal
						//	with hierarchy that controls loaded/created file objects
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke FILE_WRITE for " + tmpType._name + " type");
					}	//end if method called from file component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for initializing timer
				case FUNCTION_TYPE.TIMER_INIT.name:
					//make sure that method is called from timer component
					if( tmpType._type.value == OBJ_TYPE.TIMER.value ){
						//get instance of TIMER object
						var tmpFileInstance = tmpThisVal._value;
						//callback function name
						var tmpFuncName = getLocalVariableContent(fr, "f");
						//period
						var tmpPeriod = getLocalVariableContent(fr, "p");
						//invoke method
						tmpResVal = tmpFileInstance.init(tmpFuncName, tmpPeriod);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TIMER_INIT for " + tmpType._name + " type");
					}	//end if method called from timer component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for starting timer
				case FUNCTION_TYPE.TIMER_START.name:
					//make sure that method is called from timer component
					if( tmpType._type.value == OBJ_TYPE.TIMER.value ){
						//get instance of TIMER object
						var tmpFileInstance = tmpThisVal._value;
						//invoke method
						tmpResVal = tmpFileInstance.start();
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TIMER_START for " + tmpType._name + " type");
					}	//end if method called from timer component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for stoping timer
				case FUNCTION_TYPE.TIMER_STOP.name:
					//make sure that method is called from timer component
					if( tmpType._type.value == OBJ_TYPE.TIMER.value ){
						//get instance of TIMER object
						var tmpFileInstance = tmpThisVal._value;
						//invoke method
						tmpResVal = tmpFileInstance.stop();
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TIMER_START for " + tmpType._name + " type");
					}	//end if method called from timer component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_PI.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//invoke method
						tmpResVal = tmpFileInstance.pi();
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_PI for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_POWER.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get base
						var tmpBase = getLocalVariableContent(fr, "base");
						//get power
						var tmpPower = getLocalVariableContent(fr, "pwr");
						//invoke method
						tmpResVal = tmpFileInstance.power(tmpBase, tmpPower);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_POWER for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_SQRT.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get base
						var tmpBase = getLocalVariableContent(fr, "base");
						//invoke method
						tmpResVal = tmpFileInstance.sqrt(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_SQRT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_LOG_R.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.rlog(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_LOG_R for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_LOG_I.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.ilog(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_LOG_I for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_ABS_R.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.abs(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_ABS_R for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_ABS_I.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.abs(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_ABS_I for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_FLOOR.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.floor(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_FLOOR for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_CEIL.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get number
						var tmpN = getLocalVariableContent(fr, "n");
						//invoke method
						tmpResVal = tmpFileInstance.ceil(tmpN);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_CEIL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_INT_MAX.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get array
						var tmpArr = getLocalVariableContent(fr, "a");
						//invoke method
						tmpResVal = tmpFileInstance.max(tmpArr);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_INT_MAX for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_REAL_MAX.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get array
						var tmpArr = getLocalVariableContent(fr, "a");
						//invoke method
						tmpResVal = tmpFileInstance.max(tmpArr);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_REAL_MAX for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_INT_MIN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get array
						var tmpArr = getLocalVariableContent(fr, "a");
						//invoke method
						tmpResVal = tmpFileInstance.min(tmpArr);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_INT_MIN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_REAL_MIN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get array
						var tmpArr = getLocalVariableContent(fr, "a");
						//invoke method
						tmpResVal = tmpFileInstance.min(tmpArr);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_REAL_MIN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_RAND.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//invoke method
						tmpResVal = tmpFileInstance.rand();
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_RAND for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_MANH_DIST.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get point 1
						var tmpP1 = getLocalVariableContent(fr, "p1");
						//get point 2
						var tmpP2 = getLocalVariableContent(fr, "p2");
						//invoke method
						tmpResVal = tmpFileInstance.manhDistance(tmpP1, tmpP2);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_MANH_DIST for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_EUCL_DIST.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get point 1
						var tmpP1 = getLocalVariableContent(fr, "p1");
						//get point 2
						var tmpP2 = getLocalVariableContent(fr, "p2");
						//invoke method
						tmpResVal = tmpFileInstance.euclDistance(tmpP1, tmpP2);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_EUCL_DIST for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_COS.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpDegree = getLocalVariableContent(fr, "dgr");
						//invoke method
						tmpResVal = tmpFileInstance.cos(tmpDegree);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_COS for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_ACOS.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpBase = getLocalVariableContent(fr, "base");
						//invoke method
						tmpResVal = tmpFileInstance.arccos(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_ACOS for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_SIN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpDegree = getLocalVariableContent(fr, "dgr");
						//invoke method
						tmpResVal = tmpFileInstance.sin(tmpDegree);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_SIN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_ASIN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpBase = getLocalVariableContent(fr, "base");
						//invoke method
						tmpResVal = tmpFileInstance.arcsin(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_ASIN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_TAN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpDegree = getLocalVariableContent(fr, "dgr");
						//invoke method
						tmpResVal = tmpFileInstance.tan(tmpDegree);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_TAN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for math method
				case FUNCTION_TYPE.MATH_ATAN.name:
					//make sure that method is called from math component
					if( tmpType._type.value == OBJ_TYPE.MATH.value ){
						//get instance of MATH object
						var tmpFileInstance = tmpThisVal._value;
						//get degree
						var tmpBase = getLocalVariableContent(fr, "base");
						//invoke method
						tmpResVal = tmpFileInstance.arctan(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MATH_ATAN for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.TXT_TO_INT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.txt2int(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TXT_TO_INT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.TXT_TO_REAL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.txt2real(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TXT_TO_REAL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.TXT_TO_BOOL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.txt2bool(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TXT_TO_BOOL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.REAL_TO_INT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.real2int(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REAL_TO_INT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.REAL_TO_TXT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.real2txt(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REAL_TO_TXT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.REAL_TO_BOOL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.real2bool(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REAL_TO_BOOL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.INT_TO_TEXT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.int2text(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke INT_TO_TEXT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.INT_TO_REAL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.int2real(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke INT_TO_REAL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.INT_TO_BOOL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.int2bool(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke INT_TO_BOOL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.BOOL_TO_INT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.bool2int(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke BOOL_TO_INT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.BOOL_TO_REAL.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.bool2real(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke BOOL_TO_REAL for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.BOOL_TO_TXT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.bool2txt(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke BOOL_TO_TXT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.TXT_TO_DT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.txt2dt(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke TXT_TO_DT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
				//ES 2016-10-01 (b_libs_1): new handler for cast method
				case FUNCTION_TYPE.DT_TO_TXT.name:
					//make sure that method is called from cast component
					if( tmpType._type.value == OBJ_TYPE.CAST.value ){
						//get instance of CAST object
						var tmpFileInstance = tmpThisVal._value;
						//get object for casting to another type
						var tmpBase = getLocalVariableContent(fr, "o");
						//invoke method
						tmpResVal = tmpFileInstance.dt2txt(tmpBase);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DT_TO_TXT for " + tmpType._name + " type");
					}	//end if method called from math component
				break;
			}
			//return resulting content value
			return tmpResVal;
		}
	};
};	//end function 'populateExtFuncLib'

//get content object for specified local variable name
//	f: (frame) current frame
//	name: (text) local variable name
//output(s):
//	(content) => value for specified variable
function getLocalVariableContent(f, name){
	var tmpEnt = f.getEntityByName(name);
	//set content equal to entity by default
	var tmpVal = tmpEnt;
	//if OTHER is defined and it is an entity
	if( tmpEnt != null && tmpEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
		//re-define value of OTHER
		tmpVal = tmpEnt._value;
	}
	//return content for local variable
	return tmpVal;
};	//end method 'getLocalVariableContent'

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
			//throw new Error("runtime error: 4738592375897");
			continue;	// *** happens with symbols representing fields for complex objects
						//i.e. field "_type" for "elem" type object
		}	//end if symbol is already defined
		//get entity for this symbol
		var tmpEnt = f._symbsToVars[tmpSymbId];
		//it has to be an entity
		if( tmpEnt.getTypeName() != RES_ENT_TYPE.ENTITY ){
			//then, we deal with content -- no need to reassign a content's value with
			//	a reference to the content -- it creates a link when content points
			//	to itself. So skip this symbol and try next one...
			continue;
		}
		//add entity for this command
		f._cmdsToVars[c._id] = tmpEnt;
		//if the value is given by the caller, then need to assign it to symbol
		if( typeof v == "object" && v != null ){
			//make sure that type is matching
			if( tmpEnt._type.isEqual(v._type) == false ){
				//check if type difference is adequate
				if( 
					//integer = real
					(
						tmpEnt._type._type.value == OBJ_TYPE.INT.value && 
						v._type._type.value == OBJ_TYPE.REAL.value
					) ||
					//real = integer
					(
						v._type._type.value == OBJ_TYPE.INT.value && 
						tmpEnt._type._type.value == OBJ_TYPE.REAL.value
					)
				) {
					//change value's type
					v._type = tmpEnt._type;
				} else {	//else, type mismatch is not adequate
					//ES 2016-08-15 (b_cmp_test_1): if entity is array AND
					//	 array template is matching type of associated value
					if( tmpEnt._type._type.value == OBJ_TYPE.ARRAY.value &&
						tmpEnt._type._templateNameArray[0].type == v._type
					){
						//skip to next entity, do not assign value to entity
						// since value is just one entry in the array
						continue;
					} else {
						//error
						throw new Error("runtime error: 467579326578326582");
					}	//ES 2016-08-15 (b_cmp_test_1): end if not array or type mismatch
				}
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
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT.value
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
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT.value
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

//get content object
//input(s):
//	o: (entity or content) object from which to get a content
//output(s):
//	(content) => content object retrieved
//ES 2016-08-07 (b_cmp_test_1): change this function to static, so that it can used outside
interpreter.getContentObj = function(o){
	//check if it is aleady a content
	if( o.getTypeName() == RES_ENT_TYPE.CONTENT ){
		return o;
	//else it has to be entity
	} else if ( o.getTypeName() == RES_ENT_TYPE.ENTITY ){
		return o._value;
	//otherwise, cannot get a content
	} else {
		//error
		throw new Error("984973853562755");
	}
};	//end function 'getContentObj'

//invoke a call to CFG functinoid
//input(s):
//	f: (frame) outer current frame
//	funcRef: (functinoid) functionoid to be executed
//	ownerEnt: (entity/content) owner for given functinoid (if any)
//	args: (optional) array of arguments
//output(s):
//	(entity/content) => value returned by the function
interpreter.prototype.invokeCall = function(f, funcRef, ownerEnt, args){
	//if array of argument is not defined or it is empty
	if( typeof args != "object" || args == null ){
		args = [];
	}
	// *********if this is a constructor, then instead of calling
	//	actual ctor function (which would only contain a NOP), create an
	//	actual object on your own, and do not perform ctor's invocation**************
	//IF FUNC_TYPE == CTOR AND OWNER_TYPE.TYPE is not CUSTOM, THEN ...
	//OR, else when calling "loadVariables" for MAIN function that contains a tree
	//	variable, instantiate tree object at that time
	//create current frame for MAIN function
	var tmpFrame = new frame(funcRef._scope);
	//create funcCall object
	var tmpFuncCallObj = new funcCall(
		funcRef,			//functinoid
		f._current,			//next command's position in the caller
		ownerEnt,			//owner entity
		f					//ES 2016-09-10 (b_debugger): caller's frame
	);
	//get number of function arguments
	var tmpNumArgs = funcRef._args.length;
	//move arguments from the argument stack to funcCall's stack
	while( tmpFuncCallObj._args.length < tmpNumArgs ){
		//insert argument in function call object
		tmpFuncCallObj._args.push(args.pop());
	}
	//reverse order of arguments
	tmpFuncCallObj._args.reverse();
	//add funcCall object to current frame
	tmpFrame._funcsToFuncCalls[funcRef._id] = tmpFuncCallObj;
	//load variables for this frame
	tmpFrame.loadVariables();
	//ES 2016-09-10 (b_debugger): initialize mode variable
	var mode = dbg.__debuggerInstance.getDFS()._mode;
	//ES 2016-09-10 (b_debugger): if not step in
	if( mode != DBG_MODE.STEP_IN ){
		//make it run non-stop
		mode = DBG_MODE.NON_STOP;
	}
	//ES 2016-09-10 (b_debugger): create entry in debugger's call stack
	dbg.__debuggerInstance._callStack.push(
		new dfs(
			mode,			//mode
			tmpFrame,		//frame
			null,			//set via setPosition call, below
			tmpFuncCallObj	//function call
		)
	);
	//ES 2016-09-10 (b_debugger): set position to the first command in the function call
	dbg.__debuggerInstance.setPosition(tmpFrame);
	//ES 2016-09-10 (b_debugger): if debugging mode is step_in
	if(dbg.__debuggerInstance.getDFS()._mode == DBG_MODE.STEP_IN){
		//quit funcCall now (we should point cursor at the first command, so do not
		//	start processing it, yet)
		return null;
	}
	//run function
	this.run(tmpFrame);
	//assign returned result to this command (CALL)
	return tmpFrame._funcsToFuncCalls[funcRef._id]._returnVal;
};	//end function 'invokeCall'

//ES 2016-09-08 (b_debugger): should interpreter run non stop
//input(s):
//	f: (frame) current frame
//output(s):
//	(boolean) => TRUE: run non stop, FALSE: cmd-by-cmd
interpreter.prototype.shouldRunNonStop = function(f){
	return  dbg.__debuggerInstance.getDFS()._mode == DBG_MODE.STEP_IN ||		//step by command
			(														//step-over
				dbg.__debuggerInstance.getDFS()._mode == DBG_MODE.STEP_OVER &&
				//we should step over function call commands, only. Every
				//	other command is stepped similarly to step_in mode
				dbg.__debuggerInstance.getDFS()._frame._id == f._id
			);
};	//end method 'shouldRunNonStop'

//process currently executed command in CONTROL FLOW GRAPH (CFG)
//input(s):
//	f: (frame) => current frame
//	ES 2016-09-10 (b_debugger): rsCallVal: (entity/content) => OPTIONAL: resulting value, returned
//		by the function call, after it was entered via step_in action
//output(s): (none)
interpreter.prototype.run = function(f, rsCallVal){
//ES 2017-02-05: record time
interpreter.addNewTimeRecord("interpreter::run:START");
	/*ES 2016-09-06 (b_debugger, Issue 7): move all variables initialized inside
		RUN function into defintion of the frame
	//initialize temporary stack of function arguments
	var funcArgStk = [];
	//redirections (i.e. usage of ADDA and LOAD command pair)
	var redirectCmdMapToEnt = {}; //command{ADDA or LOAD}._id => entity
	//hashmap between scope id (in this case only conditional and loop
	//	scopes are considered) and result of comparison command
	var compResMap = {};	//scope id => comparison result
	//ES 2016-08-08 (b_cmp_test_1): init temporary iterator variable
	var tmpNextLoopIter = null;
	ES 2016-09-06 (b_debugger): end move all variables in frame definition */
	//ES 2016-09-04 (b_debugger): should we run non-stop this frame
	var doSingleCmd = this.shouldRunNonStop(f);
	//loop to process commands in this frame
	do {
		//get currently executed position in the frame
		var curPos = f._current;
		//get currenty executed command
		var cmd = curPos._cmd;
		//ES 2016-08-13 (b_cmp_test_1): check if current block has '_relatedScope'
		//	field set. If so, then we are entering PHI/CONDITION blocks of such scope
		if( curPos._block._relatedScope != null ){
			//set frame's starting scope field
			f._startingScope = curPos._block._relatedScope;
		}
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
				//if there are no associated symbols with this NULL command, then
				//	it must be a constant declaration. So we need to create a
				//	value that will represent such constant
				//get singleton constant value
				var tmpSnglVal = cmd._args[0]._value;
				//setup variable for type
				var tmpSnglType = null;
				//determine type of singleton constant value
				switch(typeof tmpSnglVal){
					case "number":
						//is it an integer (see http://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer)
						if( tmpSnglVal == (tmpSnglVal | 0) ){
							//integer
							tmpSnglType = type.__library["integer"];
						} else {
							//real
							tmpSnglType = type.__library["real"];
						}
					break;
					case "string":
						tmpSnglType = type.__library["text"];
					break;
					case "boolean":
						tmpSnglType = type.__library["boolean"];
					break;
					default:
						//error -- unkown singleton type
						throw new Error("473582764744597852");
					break;
				}
				//create constant value
				tmpCmdVal = new content(
					tmpSnglType,		//type
					tmpSnglVal			//value
				);
			break;
			case COMMAND_TYPE.POP.value:
				//make sure this frame represents a function
				if( 
					//if there is no function associated with frame's scope, or
					f._scope._funcDecl == null || 

					//if there is no funcCall object for this functionoid
					!(f._scope._funcDecl._id in f._funcsToFuncCalls)
				){
					//error
					throw new Error("47857645784256478564");
				}
				//get array of content/value arguments for this function
				var tmpFuncValArgs = f._funcsToFuncCalls[f._scope._funcDecl._id]._args;
				//get array of function argument names
				var tmpFuncArgNames = f._scope._funcDecl._args;
				//make sure that this command has only one symbol
				if( cmd._defOrder.length != 1 ){
					//error
					throw new Error("45435426894673963");
				}
				//get symbol representing this argument
				var tmpArgSymb = cmd._defChain[cmd._defOrder[0]];
				//index
				var tmpArgIdx = -1;
				//check if this argument represents "this"
				if( tmpArgSymb._name == "this" ){
					//it is the very first argument
					tmpArgIdx = 0;
				}
				//if index is not known, yet
				if( tmpArgIdx == -1 ){
					//loop thru function arguments and find the one for this POP command
					for( var i = 0; i < tmpFuncArgNames.length; i++ ){
						//get currently looped function argument
						var tmpCurFuncArg = tmpFuncArgNames[i];
						//check if we found correct function argument
						if( tmpArgSymb._name == tmpCurFuncArg.name ){
							//set the index and quit loop
							tmpArgIdx = i;
							break;
						}	//end if found correct function argument
					}	//end loop thru function arguments
				}	//end if index is not known, yet
				//if index has been set
				if( tmpArgIdx >= 0 ){
					//save value for this argument
					tmpCmdVal = tmpFuncValArgs[tmpArgIdx];
				} else {	//not set, error
					throw new Error("848357238956982");
				}	//end if index has been set
			break;
			case COMMAND_TYPE.EXIT.value:
				//need to propagate this EXIT thru hierarchy of RUN calls
				//	proposing to introduce a field inside interpreter that is
				//	used to abort interpretation (i.e. _doQuit:boolean) that
				//	can signal when to stop executing
				this._doQuit = true;
				//ES 2016-09-08 (b_debugger): quit debugger
				dbg.__debuggerInstance.quitDebugger();
				//quit function RUN, right away
				//return;
			break;
			case COMMAND_TYPE.PUSH.value:
				//initialize variable that stores entity for argument command
				var tmpArgEnt = null;
				//if argument command has at least one entity
				if( cmd._args.length > 0 && cmd._args[0]._id in f._cmdsToVars ){
					//set argument command
					tmpArgEnt = f._cmdsToVars[cmd._args[0]._id];
					//assign retrieved value to PUSH command
					//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
					tmpCmdVal = interpreter.getContentObj(tmpArgEnt);
					//store value inside argument stack
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					f.funcArgStk.push(tmpCmdVal);
				} else {
					throw new Error("runtime error: 9835973857985");
				}	//end if argument command has at least one entity
			break;
			case COMMAND_TYPE.ISNEXT.value:
				//ES 2016-08-08 (b_cmp_test_1): get iterating entity
				var tmpIterEntity = f._cmdsToVars[cmd._args[1]._id];
				//ES 2016-08-08 (b_cmp_test_1): if loop iterator was not yet initialized, i.e.
				//	if this is the first loop iteration
				//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
				if( f.tmpNextLoopIter == null ){
					//create iterator
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					f.tmpNextLoopIter = new iterator(this._curFrame._scope, tmpIterEntity);
					//set this command's value to true, so that CMP that would compare
					//	value of this command with TRUE could yield success and remain
					//	inside the loop
					tmpCmdVal = true;
				} else {	//ES 2016-08-08 (b_cmp_test_1): else, check if there is next item
					//if there is not next item
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					if( f.tmpNextLoopIter.isNext() == false ){
						//reset loop iterator, since we are leaving the loop
						//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
						f.tmpNextLoopIter = null;
						//set this command's value to false, so similarly CMP would yield
						//	failure when comparing this command with TRUE, and this would
						//	leave the loop
						tmpCmdVal = false;
					} else {
						//set true to stay inside loop
						tmpCmdVal = true;
					}	//end if there is no next item
				}	//end if it is a first loop iteration
				//create constant value
				tmpCmdVal = new content(
					type.__library["boolean"],	//type
					tmpCmdVal					//value
				);
			break;
			case COMMAND_TYPE.NEXT.value:
				//ES 2016-08-08 (b_cmp_test_1): if loop iterator is not null, then we are
				//	inside the loop, trying to iterate over the first/next element
				//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
				if( f.tmpNextLoopIter != null ){
					//move to the next iterating element
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					tmpCmdVal = f.tmpNextLoopIter.next();
				} else {	//ES 2016-08-08 (b_cmp_test_1):  we have exited the loop
					//do nothing (loop will exit via BEQ command that checks whether
					//	isNext is true or not. If it is true, it remains inside the
					//	loop; otherwise, it leaves the loop)
				}
			break;
			case COMMAND_TYPE.CALL.value:
				//format: CALL [functinoid, symbol]
				//	symbol is optional (only if function is not stand-alone)
				//ES 2016-09-10 (b_debugger): if we already got return value for this
				//	function call, and simply need to complete all remaining steps
				if( typeof rsCallVal != "undefined" ){
					//set command return value
					tmpCmdVal = rsCallVal;
				} else {	//ES 2016-09-10 (b_debugger): original case
					//get functinoid
					var tmpFuncRef = cmd._args[0];
					//get number of function arguments
					var tmpNumArgs = tmpFuncRef._args.length;
					//if there is not enough of arguments on the stack
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					if( f.funcArgStk.length < tmpNumArgs ){
						//error
						throw new Error("runtime error: not enough of function arguments");
					}
					//get owner entity (if any) for this functinoid
					var tmpFuncOwnerEnt = null;
					if( cmd._args.length > 1 &&
						cmd._args[1] != null ){
						if( cmd._args[1]._id in f._symbsToVars ){
							//assign entity for the function owner
							tmpFuncOwnerEnt = f._symbsToVars[cmd._args[1]._id];
						} else if( cmd._args[1]._id in f._cmdsToVars ){
							//assign content for the function owner
							tmpFuncOwnerEnt = f._cmdsToVars[cmd._args[1]._id];
						}
					}
					//if calling constructor
					if( tmpFuncRef._name == functinoid.detFuncName(FUNCTION_TYPE.CTOR) ){
						//if there is a symbol defined for this call command
						if( cmd._defOrder.length > 0 ){
							//get symbol associated with call to __create__
							var tmpDefCtorSymb = cmd._defChain[cmd._defOrder];
							//make sure that this symbol is defined in this frame
							if( tmpDefCtorSymb._id in f._symbsToVars ){
								//set value for this command
								tmpCmdVal = f._symbsToVars[tmpDefCtorSymb._id];
								//extract value from entity
								//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
								tmpCmdVal = interpreter.getContentObj(tmpCmdVal);
							} else {	//if not, then error
								throw new Error("runtime error: 435239574589274853");
							}	//end if symbol is not defined in this frame
						}	//end if symbol associated with this call command
					} else {	//else, making a call to a non-constructor function
						//ES 2016-08-16 (b_cmp_test_1): indent to distinguish callee's code
						//ES 2016-09-10 (b_debugger): not using ECS, instead debugger
						//this._drwCmp._viz.performIndentationAction(true);
						//invoke a call
						//ES 2016-09-06 (b_debugger, Issue 7): access variables from frame object
						tmpCmdVal = this.invokeCall(f, tmpFuncRef, tmpFuncOwnerEnt, f.funcArgStk);
						//ES 2016-09-10 (b_debugger): if debugging mode is step_in
						if( dbg.__debuggerInstance.getDFS()._mode == DBG_MODE.STEP_IN ){
							//quit now
							return;
						}	//ES 2016-09-10 (b_debugger): end if debugging mode is step_in
						//ES 2016-09-10 (b_debugger): remove DFS
						dbg.__debuggerInstance._callStack.pop();
						//ES 2016-08-16 (b_cmp_test_1): unindent for caller's code
						//ES 2016-09-10 (b_debugger): not using ECS, instead debugger
						//this._drwCmp._viz.performIndentationAction(false);				
					}	//end if calling constructor
				}	//ES 2016-09-10 (b_debugger): end if got already return value
			break;
			case COMMAND_TYPE.EXTERNAL.value:
				//EXTERNAL ['FUNCTION_NAME(ARGS)']
				//get text argument that encodes FUNCTION_NAME and ARGS
				var tmpExtCmdArg = cmd._args[0]._value;
				//make sure it is of type string and it is not empty string
				if( typeof tmpExtCmdArg != "string" || tmpExtCmdArg == "" ){
					throw new Error("runtime error: unkown EXTERNAL command argument");
				}
				//get function name
				var tmpExtFuncName = tmpExtCmdArg.substring(0, tmpExtCmdArg.indexOf("("));
				//if function is 'createVariableEntity' (for declaring entity)
				if( tmpExtFuncName == "createVariableEntity" ){
					//make sure that there is only one argument
					if( tmpExtCmdArg.indexOf(";") >= 0 ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'createVariableEntity' should only take one argument");
					}
					//expecting only one (integer) argument
					var tmpSymbId = parseInt(tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(")")));
					//create entity using EXTERNAL function
					//	'createVariableEntity': function(sid; fr)
					tmpCmdVal = this._externalFuncLib['createVariableEntity'](tmpSymbId, f);
				//if function is 'process' (for processing fundamental operators)
				} else if( tmpExtFuncName == "process" ) {
					//make sure there are 2 arguments
					if( tmpExtCmdArg.split(";").length != 2 ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'process' should take exactly 2 arguments");
					}
					//get function type's name
					var tmpFuncTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(";"));
					//get type name
					var tmpObjTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf(";") + 1, tmpExtCmdArg.indexOf(")"));
					//process EXTERNAL operation
					//	'process': function(fname; tname; fr)
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
					//ES 2016-08-16 (b_cmp_test_1): get scope that we are entering
					var tmpEntScope = f.getEnteredScope();
					/* ES 2016-09-03 (b_log_cond_test): remove code -- found a different approach
					//if this is a condition scope
					//ES 2016-08-15 (b_cmp_test_1): change condition to use variable
					//	entering scope, since condition (i.e. starting blocks) are
					//	semantically part of the construct for which condition is used,
					//	but physically, they are part of parent of this construct.
					//	And, we need to know which construct we are entering, associated
					//	scope for current frame, would not tell this information, because
					//	it would reference parent of construct we are entering, and we
					//	need to know this construct actually...
					if( tmpEntScope._type == SCOPE_TYPE.CONDITION ){
						//if condition is present inside map
						//ES 2016-08-15 (b_cmp_test_1): change condition to use scope
						//	for the construct we are entering, see details above
						if( tmpEntScope._id in compResMap ){
							//get value from the compResMap for this scope
							//ES 2016-08-15 (b_cmp_test_1): we need to use scope for the
							//	construct we are entering, see details above
							var tmpResMapEntry = compResMap[tmpEntScope._id];
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
					//else, if current block has '_fallInOther' not nulled
					} else if( curPos._block._fallInOther != null ) {
						//get scope for '_fallInOther' block
						var tmpFallInOtherScp = curPos._block._fallInOther._owner;
						//check if that scope is a loop
						if( tmpFallInOtherScp._type == SCOPE_TYPE.FOREACH || 
							tmpFallInOtherScp._type == SCOPE_TYPE.WHILE ){
							//if it is not first iteration in the loop
							if( f._scope._id in compResMap ){
								//take value (a.k.a. content or entity) of right argument as value of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
							} else {	//else, it is first iteration in the loop
								//take value of left argument as value of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
							}	//end if it is not first iteration in the loop
						}	//end if it is a loop scope
					}	//end if it is condition scope
					ES 2016-09-03 (b_log_cond_test): end removed code */
					//ES 2016-09-03 (b_log_cond_test): if previous block is associated with
					//	left argument of PHI command
					if( this._prevBlk._id in this._parser._phiArgsToBlks[curPos._block._id].left ){
						//set value of left argument
						f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
					} else if( this._prevBlk._id in this._parser._phiArgsToBlks[curPos._block._id].right ){
						//set value of right argument
						f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
					} else {
						//error
						throw new Error("runtime error: 473589237558749535");
					}	//ES 2016-09-03 (b_log_cond_test): end if previous block is associated with left
				} else {	//else, it has inacceptable number of command arguments
					throw new Error("runtime error: 84937859532785");
				}	//end if PHI command has one argument
				//ES 2016-09-04 (b_log_cond_test): save command id in special array to
				//	transfer it back to the parent.
				f._transferToParentCmdIdArr.push(cmd._id);
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
				//ES 2016-08-16 (b_cmp_test_1): get scope that we are entering
				var tmpEntScope = f.getEnteredScope();
				//if this is a condition scope
				//get entity for the right comparison argument
				//ES 2016-08-08 (b_cmp_test_1): make sure that we got content
				var tmpLeftCmpEnt = interpreter.getContentObj(f._cmdsToVars[cmd._args[0]._id]);
				//get entity for the left comparison argument
				//ES 2016-08-08 (b_cmp_test_1): make sure that we got content
				var tmpRightCmpEnt = interpreter.getContentObj(f._cmdsToVars[cmd._args[1]._id]);
				//compare left and right results and store in the proper map
				if( tmpLeftCmpEnt.isEqual(tmpRightCmpEnt) ){
					//ES 2016-08-16 (b_cmp_test_1): change condition to use variable
					//	entering scope, since condition (i.e. starting blocks) are
					//	semantically part of the construct for which condition is used,
					//	but physically, they are part of parent of this construct.
					//	And, we need to know which construct we are entering, associated
					//	scope for current frame, would not tell this information, because
					//	it would reference parent of construct we are entering, and we
					//	need to know this construct actually...
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					f.compResMap[tmpEntScope._id] = 0;
				} else {
					//ES 2016-08-16 (b_cmp_test_1): see comments in THEN clause
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					f.compResMap[tmpEntScope._id] = tmpLeftCmpEnt.isLarger(tmpRightCmpEnt) ? 1 : -1;
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
				//ES 2016-08-16 (b_cmp_test_1): get scope that we are entering
				var tmpEntScope = f.getEnteredScope();
				//BXX [comparison_command, where_to_jump_command]
				//ensure that there is comparison result for this scope
				//ES 2016-08-16 (b_cmp_test_1): change condition to use variable
				//	entering scope, since condition (i.e. starting blocks) are
				//	semantically part of the construct for which condition is used,
				//	but physically, they are part of parent of this construct.
				//	And, we need to know which construct we are entering, associated
				//	scope for current frame, would not tell this information, because
				//	it would reference parent of construct we are entering, and we
				//	need to know this construct actually...
				//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
				if( !(tmpEntScope._id in f.compResMap) ){
					//error
					throw new Error("runtime error: 483957238975893");
				}
				//get comparison result
				//ES 2016-08-16 (b_cmp_test_1): use entered scope, see comment above
				//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
				var tmpCmpRes = f.compResMap[tmpEntScope._id];
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
						//ES 2016-08-15 (b_cmp_test_1): typo (double equal sign instead of single)
						tmpDoJump = tmpCmpRes == -1 || tmpCmpRes == 0;
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
					//ES 2016-08-15 (b_cmp_test_1): change condition to use variable
					//	entering scope, since condition (i.e. starting blocks) are
					//	semantically part of the construct for which condition is used,
					//	but physically, they are part of parent of this construct.
					//	And, we need to know which construct we are entering, associated
					//	scope for current frame, would not tell this information, because
					//	it would reference parent of construct we are entering, and we
					//	need to know this construct actually...
					if( tmpEntScope._type == SCOPE_TYPE.CONDITION ){
						//for conditions, we need to know which branch (THEN or ELSE) we have taken
						//	this helps to determine which argument of PHI command to associate with
						//	the total value of PHI command. So assign a non-integer value (e.g. a
						//	string value) to the entry in 'compResMap'
						//ES 2016-08-15 (b_cmp_test_1): we need to use scope for the
						//	construct we are entering, see details above
						//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
						f.compResMap[tmpEntScope._id] = "0";
					}	//end if it is a condition scope
				}	//end if need to jump
				//do not associate symbols
				doAssociateSymbWithCmd = false;
				//ES 2016-08-15 (b_cmp_test_1): reset frame's field for starting scope
				f._startingScope = null;
			break;
			case COMMAND_TYPE.BRA.value:
				//get command where to jump
				var tmpJmpCmd = cmd._args[0];
				//set destination position where to jump
				nextPos = new position(
					tmpJmpCmd._blk._owner,	//scope
					tmpJmpCmd._blk,			//block
					tmpJmpCmd				//command
				);
				//do not associate symbols
				doAssociateSymbWithCmd = false;
				//ES 2016-08-15 (b_cmp_test_1): reset frame's field for starting scope
				f._startingScope = null;
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
				if( !(tmpFuncScp._funcDecl._id in f._funcsToFuncCalls) ){
					//error
					throw new Error("runtime error: 89573957853");
				}
				//find funcCall object for this function
				var tmpFuncCallObj = f._funcsToFuncCalls[tmpFuncScp._funcDecl._id];
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
				//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
				tmpFuncCallObj._returnVal = interpreter.getContentObj(tmpRetExpEnt);
//ES 2017-02-05: record time
interpreter.addNewTimeRecord("interpreter::run:END");
				//quit this RUN instance
				//ES 2016-09-10 (b_debugger): make RUN return a value, to distinguish this
				//	return from the other
				return null;
			//this BREAK is not reached
			break;
			case COMMAND_TYPE.LOAD.value:
				//get its only argument (ADDA command)
				var tmpAddaCmdId = cmd._args[0]._id;
				//if there is an entity for ADDA command
				if( tmpAddaCmdId in f._cmdsToVars ){
					//add entry to redirection map
					//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
					f.redirectCmdMapToEnt[cmd._id] = f._cmdsToVars[tmpAddaCmdId];
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
				if( tmpLeftSideEnt._type.isEqual(tmpStoredExpEnt._type) == false ){
					//error
					throw new Error("runtime error: type mismatch in assigned expression");
				}
				//store extracted value in an entity
				//*** tmpLeftSideEnt can be either ENTITY or CONTENT. Can we act equally same for assigning value to a content or an entity?
				//*** should not we try to find an entity that represents this left side?
				//*** can we store entry inside array same way? what about tree entity? => no!!!
				tmpLeftSideEnt._value = tmpStoredExpEnt.getTypeName() == RES_ENT_TYPE.ENTITY ? tmpStoredExpEnt._value : tmpStoredExpEnt;
				//if left side is a content
				if( tmpLeftSideEnt.getTypeName() == RES_ENT_TYPE.CONTENT ){
					//reset value of content
					tmpLeftSideEnt._value = tmpLeftSideEnt._value._value;
				}
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
						//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
						f.redirectCmdMapToEnt[cmd._id] = tmpLeftSideEnt;
					} else {	//otherwise, it is a data field
						//get entity OR a content representing given field
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						tmpCmdVal = interpreter.getContentObj(tmpLeftSideEnt)._value[tmpRightSideSymb._name];
						//store extracted entity/content for ADDA command
						//ES 2016-09-06 (b_debugger, Issue 7): access variable from frame object
						f.redirectCmdMapToEnt[cmd._id] = tmpCmdVal;
					}	//end if it is a method field
				} else {	//otherwise, must be handling collection (array or B+ tree)
					//get entity type's type
					var tmpObjType = tmpLeftSideEnt._type._type.value;
					//make sure that the right hand side is command
					if( tmpRightSideRef.getTypeName() != RES_ENT_TYPE.COMMAND ){
						//error
						throw new Error("runtime error: 547857847773412");
					}
					//also make sure that this command has been evaluated
					//if( !(cmd._id in f._cmdsToVars) ){
					//	//error
					//	throw new Error("runtime error: 893578923578927 (id:" + cmd._id + " => type:" + cmd._type.value + ")");
					//}
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
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						var tmpArrIdxVal = interpreter.getContentObj(tmpArrIdxEnt)._value;
						//make sure that index is not addressing outside of array
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						if( tmpArrIdxVal >= interpreter.getContentObj(tmpLeftSideEnt)._value.length ){
							//index addresses beyond array boundaries
							throw new Error("runtime error: index is addressing outside of array boundaries");
						}
						//save array entry for ADDA command
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						tmpCmdVal = interpreter.getContentObj(tmpLeftSideEnt)._value[tmpArrIdxVal];
					} else if( tmpObjType == OBJ_TYPE.BTREE.value ){	//if tree
						//	right side => text
						//get entity representing tree entry
						var tmpHashIdxEnt = f._cmdsToVars[tmpRightSideRef._id];
						//ensure thay tree entry is text
						if( tmpHashIdxEnt._type._type.value != OBJ_TYPE.TEXT.value ){
							//error
							throw new Error("runtime error: 8947385735829");
						}
						//get index value
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						var tmpHashIdxVal = interpreter.getContentObj(tmpHashIdxEnt)._value;
						//TODO: check if addressed hash entry is actually inside tree
						//TODO: need to create special class for trees (it has to be more complex then JS associative array, i.e. be able to get min/max values and possibly to sort)
						throw new Error("runtime error: tree is not implemented, yet");
					}	//end if it is an array
				}	//end if handling access operator
				//do not associate symbols with this command
				doAssociateSymbWithCmd = false;
			break;
		}	//end switch -- depending on the type of current command
		//ES 2016-08-13 (b_cmp_test_1): do render ECS
		if( interpreter.__doRenderECS ){
			//check if drawing component is not setup
			if( this._drwCmp == null ){
				//setup drawing component
				this._drwCmp = new drawing();
			}
			//init text representation of entry
			var tmpEntTxt = "null";
			//if item is object AND not null AND CONTENT or ENTITY
			if( typeof tmpCmdVal == "object" && 
				tmpCmdVal != null && 
				(
					tmpCmdVal.getTypeName() == RES_ENT_TYPE.CONTENT || 
					tmpCmdVal.getTypeName() == RES_ENT_TYPE.ENTITY 
				)
			){
				//set text representation for this command's value
				tmpEntTxt = tmpCmdVal.toString();
			}
			//add new entry to ECS
			this._drwCmp._viz.addEntryToECS(cmd, tmpEntTxt);
		}
		//ES 2016-09-16 (b_dbg_test): if this is the starting block inside the scope
		if( f._scope._start._id == curPos._block._id ){
			//include this command's value into transfer-back-list
			f._transferToParentCmdIdArr.push(cmd._id);
		}
		//if need to associate symbol(s) with this command
		if( doAssociateSymbWithCmd ){
			//associate entities with NULL command
			this.associateEntWithCmd(f, cmd, tmpCmdVal);
		}	//end if need to associate symbol(s) with this command
		//if there is a value
		//ES 2016-08-09 (b_cmp_test_1): remove condition that checks whether command
		//	was already present inside command-to-variable set or not
		//	This is important for loop iterations, when we pass thru 2-nd and greater
		//	loop iteration, and all command-to-variable entities already been inserted
		if( tmpCmdVal != null ){ //&& !(cmd._id in f._cmdsToVars) ){
			//store value (content or entity) for this command
			f._cmdsToVars[cmd._id] = tmpCmdVal;
			//ES 2017-02-05 (b_patch01): if in stepping mode
			if( dbg.__forceRender || dbg.__debuggerInstance._callStack[dbg.__debuggerInstance._callStack.length - 1]._mode == DBG_MODE.STEP_IN ){
				//convert resulting command value to text representation
				var tmpTxtResVal = getCompactTxt(tmpCmdVal);
				//ES 2016-09-10 (b_debugger): show command value in debugging CFG
				var tmpRectObj = dbg.__debuggerInstance.drawTextRect(cmd._id, tmpTxtResVal);
			}	//ES 2017-02-05 (b_patch01): end if in stepiing mode
			//ES 2016-09-10 (b_debugger): add jointJS rectangle to collection that
			//	maps command id to resulting command values, pictured as rect with text
			dbg.__debuggerInstance._cmdToResValEnt[cmd._id] = tmpRectObj;
		}	//end if there is a value
		//flag for loading variable in a new scope
		//ES 2016-08-06 (b_cmp_test_1): suppose that this variable is not used
		//var doLoadNewScope = false;
		//if 'nextPos' is still NULL, then we simply need to move to the
		//	next consequent command (if there is any)
		if( nextPos == null ){
			//try to get next consequent position
			nextPos = f.getNextPos();
			//make sure that there is a next position available
			if( nextPos == null ){
				//reached the end, so quit
				return null;
			}	//end if -- make sure there is a next available position 
		}	//end if move to next consequent position
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
			//ES 2016-09-13 (b_debugger_test): if exiting this scope, i.e. moving to parent scope
			} else if( nextPos._scope._id == f._scope._owner._id ) {
				//remove iterator
				f._iter = null;
				f.tmpNextLoopIter = null;
			}	//end if jumping to the start of loop
		}	//end if this is a loop scope
		//check if need to load new scope
		if( //ES 2015-08-05 (b_cmp_test_1): suppose that 'doLoadNewScope' is not used
			//doLoadNewScope ||		//if jumping inside a loop
			//OR, if moving from one scope to another
			cmd._blk._owner.isEqual(nextPos._scope) == false
		){
			//check if frame for transitioning scope has been already created
			if( nextPos._scope._id in this._stackFrames &&
				//make sure that it is not the scope we are going to delete
				nextPos._scope._id != this._curFrame._scope._id ){
				//ES 2016-09-04 (b_log_cond_test): loop thru old frame's command ids
				//	that should be transferred back to parent frame
				for( 
					tmpCmdArrIdx = 0; 
					tmpCmdArrIdx < this._stackFrames[this._curFrame._scope._id]._transferToParentCmdIdArr.length;
					tmpCmdArrIdx++ 
				){
					//get command id
					var tmpCurCmdId = this._stackFrames[this._curFrame._scope._id]._transferToParentCmdIdArr[tmpCmdArrIdx];
					//move entry command-to-entity from child to parent frame
					this._stackFrames[nextPos._scope._id]._cmdsToVars[tmpCurCmdId] =
						this._stackFrames[this._curFrame._scope._id]._cmdsToVars[tmpCurCmdId];
				}	//ES 2016-09-04 (b_log_cond_test): end loop thru old frame's command ids
				//ES 2016-09-16 (b_dbg_test): init flag -- do we move to ancestor scope
				var doMoveToAncestor = false;
				//ES 2016-09-16 (b_dbg_test): init iterator for scope hierarchy traversing
				var tmpScpIter = this._curFrame._scope._owner;
				//ES 2016-09-16 (b_dbg_test): loop thru scope hierarchy, starting from the
				//	current, to find out whether we are moving to ancestor scope
				while( tmpScpIter != null ){
					//check if iterating scope is the one we are moving to
					if( tmpScpIter._id == nextPos._scope._id ){
						//we are indeed moving to ancestor, set the flag to true
						doMoveToAncestor = true;
						//quit loop
						break;
					}	//end if iterating scope is the one we are moving to
					//move to parent scope
					tmpScpIter = tmpScpIter._owner;
				}	//end loop thru scope hierarchy starting from the current
				//ES 2016-09-16 (b_dbg_test): if we are moving to ancestor scope
				if( doMoveToAncestor ){
					//remove current frame from the stack
					//ES 2016-09-16 (Comments only): delete frame for the child scope
					delete this._stackFrames[this._curFrame._scope._id];
				}	//ES 2016-09-16 (b_dbg_test): end if moving to ancestor scope
				//retrieve existing frame
				this._curFrame = this._stackFrames[nextPos._scope._id];
			} else {	//create new frame
				//create new frame
				this._curFrame = new frame(nextPos._scope);
				//load variables for this new scope
				this._curFrame.loadVariables(f);
				//check whether stack of frames has frame associated with this scope
				if( nextPos._scope._id in this._stackFrames ){
					//delete it
					delete this._stackFrames[nextPos._scope._id];
				}
				//add frame to the stack
				this._stackFrames[nextPos._scope._id] = this._curFrame;
				//import data (cmds-to-vars and symbs-to-vars) from parent frame
				this._curFrame.importVariables(f);
			}	//end if frame already exists
			//ES 2016-09-06 (b_debugger, Issue 7): copy over special set of variables that
			//	was moved from RUN method into frame object with the purpose of maintaining
			//	their set of values, during command-by-command debugging, i.e. step_in/over
			this._curFrame.funcArgStk = f.funcArgStk;
			this._curFrame.redirectCmdMapToEnt = f.redirectCmdMapToEnt;
			this._curFrame.compResMap = f.compResMap;
			this._curFrame.tmpNextLoopIter = f.tmpNextLoopIter;
			//set frame variable (f)
			f = this._curFrame;
		}	//end if need to load new scope
		//ES 2016-09-03 (b_log_cond_test): check if we have moved to a different block
		if( curPos._block._id != nextPos._block._id ){
			//set previous block
			this._prevBlk = curPos._block;
		}
		//move to the next command
		f._current = nextPos;
		//ES 2017-02-05 (b_patch01): if upcoming command is EXIT
		if( f._current._cmd._type.value == COMMAND_TYPE.EXIT.value ){
			//force dbg to rener
			dbg.__forceRender = true;
		}	//ES 2017-02-05 (b_patch01): end if upcoming command is EXIT
		//ES 2016-09-04 (b_debugger): set debugger to current position
		//	and redraw viewport to show cursor at next command
		dbg.__debuggerInstance.setPosition(f);
		//ES 2016-09-08 (b_debugger): re-evaluate: should we run non-stop this frame
		doSingleCmd = this.shouldRunNonStop(f);
	//ES 2016-09-04 (b_debugger): added expression (!doSingleCmd) to make sure that
	//	loop stops if we execute single command, and runs non-stop otherwise 
	} while (!this._doQuit && !doSingleCmd);	//end loop to process commands in this frame
//ES 2017-02-05: record time
interpreter.addNewTimeRecord("interpreter::run:END");
};	//end function 'run'
