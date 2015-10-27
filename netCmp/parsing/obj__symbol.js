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
	//initialize def-chain, i.e. commands that this symbol defines
	this._defChain = {};
};

//add command to use-chain (make sure that no duplicates are added)
//input(s):
//	cmd: (Command) => command was used as argument inside another command, defined by this symbol
//output(s): (none)
symbol.prototype.addToUseChain = function(cmd) {
	//make sure that command is not inside use-chain
	if( !(cmd._id in this._useChain) ) {
		//add command to use-chain
		this._useChain[cmd._id] = cmd;
	}
};

//add command to def-chain (make sure that no duplicates are added)
//input(s):
//	cmd: (Command) => command is defined by this symbol
//output(s): (none)
symbol.prototype.addToDefChain = function(cmd) {
	//make sure that command is not inside def-chain
	if( !(cmd._id in this._defChain) ) {
		//add command to def-chain
		this._defChain[cmd._id] = cmd;
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
