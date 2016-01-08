/**
	Developer:	Eduard Sedakov
	Date:		2015-10-03
	Description:	represent program entities - variable/array/hashmap instance
	Used by:	scope, command
	Dependencies:	command, type
**/

//==========globals:==========

//unique identifier used by symbol
symbol.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
symbol.reset = function() {
	symbol.__nextId = 1;	//set to first available integer
};

//static calls:
symbol.reset();

//class "symbol" declaration:
//store information about program entity (i.e. variable, array, hashing map)
//input(s):
//	name: (string) => name of entity
//	entType: (type) => object type, representing type of declared entity
//	scp: (scope) => scope where this symbol is defined in
//output(s): (none)
function symbol(name, entType, scp) {
	//assign id
	this._id = symbol.__nextId++;
	//assign scope
	this._scope = scp;
	//assign entity name
	this._name = name;
	//assign entity type
	this._type = entType;
	//initialize use-chain, i.e. arguments of all commands that are defined (cmds) by this symbol
	this._useChain = {};
	this._useOrder = [];	//orderring array of usage chain
	//initialize def-chain, i.e. commands that this symbol defines
	this._defChain = {};
	this._defOrder = [];	//orderring array of definition chain
};

//get last definition command
//input(s): (none)
//output(s):
//	(command) => command that last defined this symbol
symbol.prototype.getLastDef = function(){
	//if this symbol has no commands in definition chain
	if( this._defOrder.length == 0 ){
		return null;
	}
	//return command added last to the chain
	return this._defChain[this._defOrder[this._defOrder.length - 1]];
};	//end function 'getLastDef'

//get last usage command
//input(s): (none)
//output(s):
//	(command) => command that last was used for this symbol
symbol.prototype.getLastUse = function(){
	//if this symbol has no command in usage chain
	if( this._useOrder.length == 0 ){
		return null;
	}
	//return command added last to usage chain
	return this._useChain[this._useOrder[this._useOrder.length - 1]];
};	//end function 'getLastUse'

//remove item from def-chain
//input(s):
//	cmd: (command) => command to remove from definition chain
//output(s): (none)
symbol.prototype.delFromDefChain = function(cmd){
	//if command is inside definition chain
	if( cmd._id in this._defChain ){
		//check if command is inside order array
		var tmpIdx = this._defOrder.indexOf(cmd._id);
		if( tmpIdx < 0 ){
			//item was not found, quit
			return;
		}
		//remove element from definition chain
		delete this._defChain[cmd._id];
		//remove element from order array
		this._defOrder.splice(tmpIdx, 1);
	}
};	//end function 'delFromDefChain'

//remove last entry in the def-chain
//input(s): (none)
//output(s): (none)
symbol.prototype.delLastFromDefChain = function(){
	//make sure that there is at least one entry in the chain
	if( this._defOrder.length > 0 ){
		//get last index
		var tmpIdx = this._defOrder.length - 1;
		//get command id of the last entry
		var tmpCmdId = this._defOrder[tmpIdx];
		//remove element from chain
		delete this._defChain[tmpCmdId];
		//remove element from order array
		this._defOrder.pop();
	}	//end if chain is not empty
};	//end function 'delLastFromDefChain'

//add command to use-chain (make sure that no duplicates are added)
//input(s):
//	cmd: (Command) => command was used as argument inside another command, defined by this symbol
//output(s): (none)
symbol.prototype.addToUseChain = function(cmd) {
	//make sure that command is not inside use-chain
	if( !(cmd._id in this._useChain) ) {
		//add command to use-chain
		this._useChain[cmd._id] = cmd;
		//add command to orderring usage array
		this._useOrder.push(cmd._id);
	}
};

//remove item from use-chain
//input(s):
//	cmd: (command) => command to remove from usage chain
//output(s): (none)
symbol.prototype.delFromUseChain = function(cmd){
	//if command is inside usage chain
	if( cmd._id in this._useChain ){
		//check if command is inside order array
		var tmpIdx = this._useOrder.indexOf(cmd._id);
		if( tmpIdx < 0 ){
			//item was not found, quit
			return;
		}
		//remove element from usage chain
		delete this._useChain[cmd._id];
		//remove element from order array
		this._useOrder.splice(tmpIdx, 1);
	}
};	//end function 'delFromUseChain'

//remove last entry in the use-chain
//input(s): (none)
//output(s): (none)
symbol.prototype.delLastFromUseChain = function(){
	//make sure that there is at least one entry in the chain
	if( this._useOrder.length > 0 ){
		//get last index
		var tmpIdx = this._useOrder.length - 1;
		//get command id of the last entry
		var tmpCmdId = this._useOrder[tmpIdx];
		//remove element from chain
		delete this._useChain[tmpCmdId];
		//remove element from order array
		this._useOrder.pop();
	}	//end if chain is not empty
};	//end function 'delLastFromUseChain'

//add command to def-chain (make sure that no duplicates are added)
//input(s):
//	cmd: (Command) => command is defined by this symbol
//output(s): (none)
symbol.prototype.addToDefChain = function(cmd) {
	//make sure that command is not inside def-chain
	if( !(cmd._id in this._defChain) ) {
		//add command to def-chain
		this._defChain[cmd._id] = cmd;
		//add command to orderring definition array
		this._defOrder.push(cmd._id);
	}
};

//convert current symbol object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
symbol.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", name: " + this._name +
		", type: " + this._type +
		", def: " + hashMapToStr(this._defChain) +
		", use: " + hashMapToStr(this._useChain) +
		"}";
};

//get type name of this object (i.e. symbol)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
symbol.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.SYMBOL;
};

//compare with another symbol (it is a simple comparison operator, just check scope and ids)
//input(s):
//	anotherSymb: (type) symbol to compare against
//output(s):
//	(boolean) => {true} if this symbol is equal to {anotherSymb}; {false} if they are not equal
symbol.prototype.isEqual =
	function(anotherSymb) {
	//make sure that {anotherSymb} is not null, so we can compare
	if( anotherSymb !== null ) {
		//ensure that {this} is of the same type as {anotherSymb}
		if( this.getTypeName() == anotherSymb.getTypeName() ) {
			//compare scopes and ids of both symbol objects
			return this._scope == anotherSymb._scope && this._id == anotherSymb._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherSymb is null
	return false;
};
