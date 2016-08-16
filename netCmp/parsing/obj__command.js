/**
	Developer:	Eduard Sedakov
	Date:		2015-10-03
	Description:	represent single command unit
	Used by:	block, symbol, functinoid, argument
	Dependencies:	symbol, block
**/

//==========globals:==========

//store all created commands, separated by command type:
//	key: command type
//	value: array of commands (which works like stack, add new commands to the end of array)
command.__library = {};

//unique identifier used by type
command.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
command.reset = function() {
	command.__library = {};		//set to empty hash map
	command.__nextId = 1;		//set to first available integer
	//add all command types (initialize each to NULL)
	//ES 2016-03-06: moved into another function 'resetCommandLib'
	//	need to use this code to null out command library that is used
	//	to find similar commands every time we analyze code within each
	//	function body. By doing so, we "bound similar commands" to the
	//	scope of such functions. Thus, avoid cases when a command from
	//	one type definition (e.g. NULL) can be used for initialization
	//	of type fields of another type definition.
	/*command.__library[COMMAND_TYPE.NOP.value] = null;
	command.__library[COMMAND_TYPE.PUSH.value] = null;
	command.__library[COMMAND_TYPE.POP.value] = null;
	command.__library[COMMAND_TYPE.NULL.value] = null;
	command.__library[COMMAND_TYPE.LOAD.value] = null;
	command.__library[COMMAND_TYPE.STORE.value] = null;
	command.__library[COMMAND_TYPE.ADDA.value] = null;
	command.__library[COMMAND_TYPE.RETURN.value] = null;
	command.__library[COMMAND_TYPE.PHI.value] = null;
	command.__library[COMMAND_TYPE.ADD.value] = null;
	command.__library[COMMAND_TYPE.SUB.value] = null;
	command.__library[COMMAND_TYPE.MUL.value] = null;
	command.__library[COMMAND_TYPE.DIV.value] = null;
	command.__library[COMMAND_TYPE.MOD.value] = null;
	command.__library[COMMAND_TYPE.CMP.value] = null;
	command.__library[COMMAND_TYPE.BEQ.value] = null;
	command.__library[COMMAND_TYPE.BGT.value] = null;
	command.__library[COMMAND_TYPE.BLE.value] = null;
	command.__library[COMMAND_TYPE.BLT.value] = null;
	command.__library[COMMAND_TYPE.BNE.value] = null;
	command.__library[COMMAND_TYPE.BGE.value] = null;
	command.__library[COMMAND_TYPE.BRA.value] = null;
	command.__library[COMMAND_TYPE.ADDTO.value] = null;
	command.__library[COMMAND_TYPE.CALL.value] = null;
	command.__library[COMMAND_TYPE.EXTERNAL.value] = null;
	command.__library[COMMAND_TYPE.FUNC.value] = null;
	command.__library[COMMAND_TYPE.EXIT.value] = null;
	command.__library[COMMAND_TYPE.ISNEXT.value] = null;
	command.__library[COMMAND_TYPE.NEXT.value] = null;*/
	//ES 2016-03-06: call function 'resetCommandLib' to reset all commands
	command.resetCommandLib();
};

//ES 2016-03-06: moved code from function 'reset' (above)
//reset command library
//input(s): (none)
//output(s): (none)
command.resetCommandLib = function(){
	//add all command types (initialize each to NULL)
	command.__library[COMMAND_TYPE.NOP.value] = null;
	command.__library[COMMAND_TYPE.PUSH.value] = null;
	command.__library[COMMAND_TYPE.POP.value] = null;
	command.__library[COMMAND_TYPE.NULL.value] = null;
	command.__library[COMMAND_TYPE.LOAD.value] = null;
	command.__library[COMMAND_TYPE.STORE.value] = null;
	command.__library[COMMAND_TYPE.ADDA.value] = null;
	command.__library[COMMAND_TYPE.RETURN.value] = null;
	command.__library[COMMAND_TYPE.PHI.value] = null;
	command.__library[COMMAND_TYPE.ADD.value] = null;
	command.__library[COMMAND_TYPE.SUB.value] = null;
	command.__library[COMMAND_TYPE.MUL.value] = null;
	command.__library[COMMAND_TYPE.DIV.value] = null;
	command.__library[COMMAND_TYPE.MOD.value] = null;
	command.__library[COMMAND_TYPE.CMP.value] = null;
	command.__library[COMMAND_TYPE.BEQ.value] = null;
	command.__library[COMMAND_TYPE.BGT.value] = null;
	command.__library[COMMAND_TYPE.BLE.value] = null;
	command.__library[COMMAND_TYPE.BLT.value] = null;
	command.__library[COMMAND_TYPE.BNE.value] = null;
	command.__library[COMMAND_TYPE.BGE.value] = null;
	command.__library[COMMAND_TYPE.BRA.value] = null;
	command.__library[COMMAND_TYPE.ADDTO.value] = null;
	command.__library[COMMAND_TYPE.CALL.value] = null;
	command.__library[COMMAND_TYPE.EXTERNAL.value] = null;
	command.__library[COMMAND_TYPE.FUNC.value] = null;
	command.__library[COMMAND_TYPE.EXIT.value] = null;
	command.__library[COMMAND_TYPE.ISNEXT.value] = null;
	command.__library[COMMAND_TYPE.NEXT.value] = null;
};	//end function 'resetCommandLib'

//static calls:
//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
//be invoked as a stand-alone function. The former approach that allowed function to
//be declared inside any object scope, was affecting jointJS, specifically viewport
//constructor was throwing a error.
//command.inheritFrom(argument); //command <- argument (command is child of argument)
inheritFrom(command, argument);
command.reset();

//get snapshot of command library, by retrieving reference to each command type and returning
//it in a hashing map
//input(s): (none)
//output(s):
//	HashMap<COMMAND_TYPE, command> => hash that maps each command type to last created entity
command.getLastCmdForEachType = function(){
	//initialize hash map that will be returned
	var ret = {};
	//check if library of commands is not empty
	if( Object.keys(command.__library).length > 0 ){
		//loop thru all command types
		$.each(
			command.__library, 
			function(key, value){
				//check that value is an object
				if( typeof value == "object" ){
					ret[key] = value;
				}	//end if value is an object
			}	//end iterative function thru command types
		);	//loop thru command types
	}	//if command library is not empty
	return ret;
};

//restore command library from passed in command library snapshot (generated by getLastCmdForEachType)
//input(s):
//	cmdLibSnapshot: (HashMap<COMMAND_TYPE, command>) => snapshot of command library to which
//		existing library should be restored to
//output(s): (none)
command.restoreCmdLibrary = function(cmdLibSnapshot){
	//check if library of commands is not empty
	if( Object.keys(command.__library).length > 0 ){
		//loop thru all command types
		$.each(
			command.__library, 
			function(key, value){
				//check that value is an object
				if( typeof value == "object" ){
					//while commands in current library and snapshot are different, keep looping
					while( command.__library[key] != cmdLibSnapshot[key] ){
						//advance current command library to previous entry
						command.__library[key] = command.__library[key]._prev;
						//if current command is NULL, then quit
						if( command.__library[key] === null ) {
							break;
						}	//end if current command is NULL
					}	//end loop thru both libraries
				}	//end if value is an object
			}	//end iterating function
		);	//end jqeury each to loop thru all command types
	}	//end if command library is not empty
};

//check if given command type is "backed up", i.e. can we get previously created command and
//return it instead of creating new one
//input(s):
//	cmdType: (COMMAND_TYPE) => command type to check
//output(s):
//	(boolean) => is given command type allows using previously created commands instead of creating new
command.isBackedUp = function(cmdType){
	//exclude by command type
	switch(cmdType.value){
	case COMMAND_TYPE.NOP.value:	//each block needs one at beginning
	case COMMAND_TYPE.PUSH.value:	//correct number of function arguments have to passed
	case COMMAND_TYPE.POP.value:	//have to get correct number of function arguments
	case COMMAND_TYPE.PHI.value:	//system command (cannot be reduced)

	//jumps should not be reduced to correctly structure program flow
	case COMMAND_TYPE.BEQ.value:
	case COMMAND_TYPE.BGT.value:
	case COMMAND_TYPE.BLE.value:
	case COMMAND_TYPE.BLT.value:
	case COMMAND_TYPE.BNE.value:
	case COMMAND_TYPE.BGE.value:
	case COMMAND_TYPE.BRA.value:

	//ES 2016-08-13 (b_cmp_test_1): do not backup LOAD commands
	//	(let a[1] = a[1] + 1) => LOAD a[1] is merged into one, and then parser interchanges
	//	LOAD to STORE, to allow storing summation of a[1] and 1 inside a[1]. But this action
	//	has an effect on changing meaning of parsed code. Since there is only one LOAD for
	//	both left and right sides of expressions.
	case COMMAND_TYPE.LOAD.value:

	case COMMAND_TYPE.ADDTO.value:	//adding to collection has to be executed correct number of times
	case COMMAND_TYPE.CALL.value:		//each function call has to be made
	case COMMAND_TYPE.EXTERNAL.value:	//external declaration of a function (cannot be reduced)
	case COMMAND_TYPE.FUNC.value:		//internal declaration of a function (cannot be reduced)
	case COMMAND_TYPE.ISNEXT.value:		//used exclusively inside FOREACH loop, and cannot be reduced
	case COMMAND_TYPE.NEXT.value:		//used exclusively inside FOREACH loop, and cannot be reduced
		return false;	//should not be backed up (i.e. reduced)
	default:
		break;
	}
	//any other command type that reached this point, can and should be reduced...
	return true;
};

//determine if command type is of type JUMP
//input(s):
//	cmdType: (COMMAND_TYPE) => command type to check
//return(s):
//	(boolean) => is given command type a jump instruction
command.isJump = function(cmdType) {
	switch(cmdType.value){
	case COMMAND_TYPE.BEQ.value:
	case COMMAND_TYPE.BGT.value:
	case COMMAND_TYPE.BLE.value:
	case COMMAND_TYPE.BLT.value:
	case COMMAND_TYPE.BNE.value:
	case COMMAND_TYPE.BGE.value:
	case COMMAND_TYPE.BRA.value:
	case COMMAND_TYPE.RETURN.value:
	case COMMAND_TYPE.CALL.value:
		return true;
	default:
		break;
	};
	//if any command type reached this point, then it is not jump instruction
	return false;
};

//find similar command given command type and argument list using command library
//input(s):
//	cmdType: (COMMAND_TYPE) => command type for which to find existing equivalent
//	argList: (ARRAY<argument>) => array of arguments to be compared to determine whether
//			there is an exact equivalent
//	s: (SCOPE) ES 2016-08-13 (b_cmp_test_1): scope inside which this command would be created
//			if we cannot find similar command. Premise, we need to find similar command inside
//			this scope or any outter (i.e. parent) scopes, but inner (i.e. children), so for
//			instance, command from outside loop would not have argument coming from within loop
//output(s):
//	(command) => equivalent command that was found OR null (if no command was found)
command.findSimilarCmd = function(cmdType, argList, s) {
	//check if this command type is not backed up
	if( command.isBackedUp(cmdType) == false ){
		//if not backed up, then return null
		return null;
	}
	//get reference to the last entry in command library
	var cur = command.__library[cmdType.value];
	//loop thru command library
	while( cur !== null ){
		//ES 2016-08-13 (b_cmp_test_1): check if current command is comming from this or
		//		outter (i.e. parent) scope, i.e. that it is not comming from descandant scope
		if( cur._blk._owner._id == s._id || cur._blk._owner.isDescendant(s) ){
			//if number of arguments in the current command and number of entries in given argument list is the same, then proceed to comparison
			if( cur._args.length == argList.length ){
				//flag to determine if two commands are equal
				var areCmdsEqual = true;
				//loop thru arguments to compare them
				for( var argIndex = 0; argIndex < argList.length; argIndex++ ){
					//compare arguments
					if(
						//if both arguments are NULLs, or
						(argList[argIndex] === null && cur._args[argIndex] === null) ||

						//if both arguments are not nulls and are equal
						(
							//if both arguments are not NULLs, and
							argList[argIndex] !== null && cur._args[argIndex] !== null &&

							//compare two commands
							argList[argIndex].isEqual(cur._args[argIndex])
						)
					){
						//go to next argument
						continue;
					}
					//signal that two commands are not equal
					areCmdsEqual = false;
					//if arguments are not equal, then try next command
					break;
				}
			}
			//if two commands were found same, then return the one found in command library
			if( areCmdsEqual ){
				return cur;
			}
		}	//ES 2016-08-13 (b_cmp_test_1): end if current command is not from descandant scope
		//advance to next element in chain
		cur = cur._prev;
	}
	//if reached this point, then no proper command was found => quit
	return null;
};

//class "command" declaration:
//class describes single unit of processing that make up blocks
//input(s):
//	cmdType: (COMMAND_TYPE) => type of command to be created
//	argList: (ARRAY<argument>) => array of arguments for new command
//	blk: (block) => owning block
//output(s): (none)
function command(cmdType, argList, blk) {
	//assign ID
	this._id = command.__nextId++;
	//assign command type
	this._type = cmdType;
	//assign argument list
	this._args = argList;
	//set reference to block that owns this command
	this._blk = blk;
	//set previous command of the same type
	this._prev = command.__library[cmdType.value];
	//add to library
	command.__library[cmdType.value] = this;
	//initialize def-chain and use-chain
	this._defChain = {};	//symbols that are defined by this command
	this._defOrder = [];	//order of inserted symbols to Definition chain (_defChain)
	this._useChain = {};	//commands that using this command
	this._useOrder = [];	//order of inserted commands to Usage chain (_useChain)
	//call parent constructor
	//ES 2015-11-29 (Issue 1, b_vis): inheritance operation has been changed to run
	//be invoked as a stand-alone function. The former approach that allowed function to
	//be declared inside any object scope, was affecting jointJS, specifically viewport
	//constructor was throwing a error.
	//this.ctorParent(argument, ARGUMENT_TYPE.COMMAND);
	ctorParent(this, argument, ARGUMENT_TYPE.COMMAND);
};

//add command to use chain and make sure there are no duplicates
//input(s):
//	cmd: (command) => command to be added to use-chain
//output(s): (none)
command.prototype.addToUseChain =
	function(cmd) {
	//check that this is command type
	if( cmd.getTypeName() == RES_ENT_TYPE.COMMAND ) {
		//check that this command was not added to use chain, yet
		if( !(cmd._id in this._useChain) ) {
			//add command to use chain
			this._useChain[cmd._id] = cmd;
			//add command to orderring definition array
			this._useOrder.push(cmd._id);
		}
	}
};

//add symbol to definition chain and make sure that are no duplicates
//input(s):
//	symb: (symbol) => symbol to be added to def-chain
//output(s): (none)
command.prototype.addToDefChain =
	function(symb) {
	//check that this is symbol type
	if( symb.getTypeName() == RES_ENT_TYPE.SYMBOL ) {
		//check that this symbol was not added to definition chain, yet
		if( !(symb._id in this._defChain) ) {
			//add symbol to definition chain
			this._defChain[symb._id] = symb;
			//add symbol to orderring usage array
			this._defOrder.push(symb._id);
		}
	}
};

//add argument to this command
//input(s):
//	arg: (argument) => reference to argument to be added to this command
//output(s): (none)
command.prototype.addArgument =
	function(arg) {
	//add argument into argList
	this._args.push(arg);
	//if given argument is of type command, which is all cases except: NULL (value), 
	//	FUNC (functinoid), EXTERNAL (js function)
	if( arg !== null && arg.getTypeName() == RES_ENT_TYPE.COMMAND ) {
		//add this command to argument's useChain
		arg.addToUseChain(this);
		//check that def-chain is not empty
		if( Object.keys(arg._defChain).length > 0 ){
			//loop thru all symbols that define this command, and add argument to 
			//	useChain of each symbol that defines this command
			var cur_cmd = this;
			$.each(
				arg._defChain, 
				function(key, value){
					//make sure that value has function 'addToUseChain'
					if( "addToUseChain" in value ){
						//add argument to use chain of iterated symbol
						value.addToUseChain(cur_cmd);
					}	//end if function 'addToUseChain' is defined in value
				}	//end iterating function
			);	//end jquery each to loop thru all symbols
		}	//end if def-chain is not empty
	}	//end if argument is command
};

//add symbol to this command
//input(s):
//	symb: (symbol) => reference to symbol to be added to this command
//output(s): (none)
command.prototype.addSymbol =
	function(symb) {
	//add symbol to definition chain
	this.addToDefChain(symb);
	//add this command to definition chain of this symbol
	symb.addToDefChain(this);
};

//convert current command object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
command.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", type: " + this._type.name +
		", blk: " + (this._blk === null ? "((null))" : this._blk._id) +
		", args: " + arrToStr(this._args) +
		"}";
};

//get type name of this object (i.e. command)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
command.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.COMMAND;
};

//compare with another command (it is a simple comparison operator, just check ids)
//input(s):
//	anotherCmd: (command) command to compare against
//output(s):
//	(boolean) => {true} if this command is equal to {anotherCmd}; {false} if they are not equal
command.prototype.isEqual =
	function(anotherCmd) {
	//make sure that {anotherCmd} is not null, so we can compare
	if( anotherCmd !== null ) {
		//ensure that {this} is of the same type as {anotherCmd}
		if( this.getTypeName() == anotherCmd.getTypeName() ) {
			//compare ids of both command objects
			return this._id == anotherCmd._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherCmd is null
	return false;
};