/**
	Developer:	Eduard Sedakov
	Date:		2015-10-09
	Description:	hierarchy of blocks within contained inside language construct: IF-THEN-ELSE,
				WHILE_LOOP, FUNCTION, OBJECT, PROGRAM (i.e. global scope)
	Used by:	block, symbol
	Dependencies:	block, symbol, SCOPE_TYPE
**/

//==========globals:==========

//unique identifier used by scope
scope.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
scope.reset = function() {
	scope.__nextId = 1;		//set to first available integer
};

//static calls:
scope.reset();

//static functions:

//create object definition scope
//input(s):
//	owner: (scope) => parent scope that encapsulates object
//	objTitle: (string) => (optional) name of the object/type
//	t: (type) => (optional) type declaration
//output(s):
//	(scope) => new object scope
scope.createObjectScope =
	function(owner, objTitle, t){
	//call scope constructor and return newly created scope
	var tmpScp = new scope(
		owner,			//parent scope
		SCOPE_TYPE.OBJECT,	//object scope type
		null,			//not a function, so no function declaration
		t,				//type declaration
		null,			//starting block - no block
		null,			//ending block - no block
		null,			//starting block - no block
		[]			//so far no symbols declared, so empty set
	);

	//add extra field '_typeTitle'
	if( typeof objTitle !== "undefined" && objTitle ){

		//set title
		tmpScp._typeTitle = objTitle;
	}

	//return scope
	return tmpScp;
};

//create function scope
//input(s):
//	owner: (scope) => parent scope that encapsulates function
//output(s):
//	(scope) => new object scope
scope.createFunctionScope =
	function(owner){
	//create start block where function arguments are declared
	var startBlk = new block(null);
	//call scope constructor and return newly created scope
	return new scope(
		owner,			//parent scope
		SCOPE_TYPE.FUNCTION,	//object scope type
		null,			//for now set it to be NULL, later will be changed
		null,			//not a type object declaration
		startBlk,		//starting block - arguments
		null,			//no ending block
		startBlk,		//starting block is the current one, right now
		[]			//so far no symbols declared, so empty set
	);
};

//class "scope" declaration:
//scope represents language construct such as IF-THEN-ELSE, WHILE_LOOP, FUNCTION or OBJECT
//	declaration, PROGRAM body. Unlike blocks, scopes do not connect with each other.
//input(s):
//	owner: (scope) => scope that owns this one (if null, then this scope is global, i.e. program)
//	type: (SCOPE_TYPE) => scope type
//	funcDecl: (functinoid) => reference to functinoid object (or NULL if not function declaration)
//	typeDecl: (type) => reference to type object (or NULL if not type declaration)
//	start: (block) => comparator block in WHILE loop or IF-THEN-ELSE condition
//	fin: (block) => finalizing block
//	cur: (block) => current block (usually it is also a start block)
//	symbs: (Array<symbol>) => array of symbols defined explicitly inside this scope
//output(s): (none)
function scope(owner, type, funcDecl, typeDecl, start, fin, cur, symbs){
	//assign id
	this._id = scope.__nextId++;
	//assign scope that owns this one
	this._owner = owner;
	//assign type of scope
	this._type = type;
	//assign function declaration
	this._funcDecl = funcDecl;
	//assign type declaration
	this._typeDecl = typeDecl;
	//setup hashmap of blocks: {key: block id, value: block reference}
	this._blks = {};
	//assign reference for starting block
	this._start = start;	//do not add 
	//if finalizing block is defined
	if( fin ){
		//add to block list
		this.addBlock(fin);
	}
	//assign reference for finalizing block
	this._end = fin;
	//if current block is defined
	if( cur ){
		//add to block list
		this.addBlock(cur);
	}
	//assign reference for current block
	this._current = cur;
	//setup collection for symbols
	this._symbols = {};
	//add symbols to collection
	for( var i = 0; i < symbs.length; i++ ) {
		//add symbol to collection
		this._symbols[symbs[i]] = symbs[i];
	}
	//setup hashmap of child scopes defined inside this scope
	this._children = {};
	//if owner of this scope is not null
	if( this._owner ){
		//add this scope to parent	
		this._owner.addScope(this);
	}
};

//check if given block is inside
//input(s):
//	blk: (block) block to check if it is inside
//output(s):
//	(boolean) => {true} if block is inside this scope, and {false} otherwise
scope.prototype.isBlockInside = 
	function(blk){
	return blk._id in this._blks;
};

//check if given scope is inside
//input(s):
//	scp: (scope) => scope to check if it is inside
//output(s):
//	(boolean) => {true} if scope is inside this one, and {false} otherwise
scope.prototype.isScopeInside =
	function(scp){
	return scp._id in this._children;
};

//add block to this scope
//input(s):
//	blk: (block) block to be added to scope
//output(s): (none)
scope.prototype.addBlock =
	function(blk){
	//if block is NOT inside this scope
	if( this.isBlockInside(blk) == false ){
		//add block to this scope
		this._blks[blk._id] = blk;
		//if block already has owner
		//ES 2016-01-20: constrain condition by ensuring that the owner
		//	is some other scope (not this one)
		if( blk._owner != null && blk._owner !== this ){
			//remove this block from the other scope
			delete blk._owner._blks[blk._id];
		}
		//set this scope to be parent of the given block
		blk._owner = this;
	}
};

//add child scope to this one
//input(s):
//	scp: (scope) scope to be added to this one
//output(s): (none)
scope.prototype.addScope =
	function(scp){
	//if scope is NOT inside this scope
	if( this.isScopeInside(scp) == false ){
		//add scope to this one
		this._children[scp._id] = scp;
		//set owner of the specified scope to be this scope
		scp._owner = this;
	}
};

//set given block as current inside this scope (if it is not inside scope, then it will be added)
//input(s):
//	blk: (block) block to be set as a current
//output(s): (none)
scope.prototype.setCurrentBlock = 
	function(blk){
	//add current block to this scope (if it is already inside, then it will not be added)
	this.addBlock(blk);
	//set block to be current
	this._current = blk;
};

//create block inside this scope (newly created can be set as current block)
//input(s):
//	isCurrent: (boolean) should newly created block be set as current?
//output(s):
//	(block) => block that was created inside this scope
scope.prototype.createBlock =
	function(isCurrent){
	//create new block
	var blk = new block(this);
	//if this block has to be current
	if( isCurrent ){
		//set it to be current and add to the list
		this.setCurrentBlock(blk);
	} else {	//otherwise, simply add to the list
		this.addBlock(blk);
	}
	return blk;
};

//add symbol to the scope
//input(s):
//	symb: (symbol) symbol to be added to this scope
//output(s): (none)
scope.prototype.addSymbol = function(symb){
	//is symbol is not defined inside this scope
	if( this.isSymbolInside(symb._name) == false ){
		//add symbol
		this._symbols[symb._name] = symb;
	}
};

//find symbol inside this scope (each variable name should be uniquely spelled)
//input(s):
//	name: (string) name of the variable, which should be unique within given scope
//output(s):
//	(symbol) => symbol that was found inside this scope
scope.prototype.isSymbolInside =
	function(symbName){
	return symbName in this._symbols;
};

//find symbol inside this scope and if not in this scope, then in its parent scope hierarchy
//input(s):
//	n: (text) symbol's name (each symbol has to have unique name)
scope.prototype.findSymbol = function(n){
	//check if symbol is inside current scope
	if( this.isSymbolInside(n) ){
		return this._symbols[n];
	}
	//if this scope has no parent/owner
	if( this._owner == null ){
		return null;
	}
	//otherwise, there is a parent, try to find symbol in it
	return this._owner.findSymbol(n);
};	//end function 'findSymbol'

//get hashmap of all accessible symbols within this and its parent scopes
//input(s): (none)
//output(s):
//	(hashmap<string, symbol>) => {key = variable name, value = reference to symbol}
scope.prototype.getAllAccessibleSymbols =
	function(){
	//init symbols from owner
	var parSymbs = {};
	//if owner is defined
	if( this._owner !== null ){
		parSymbs = this._owner.getAllAccessibleSymbols();
	}
	//concatenate and return symbols from this and owner scopes
	//see: http://stackoverflow.com/questions/929776/merging-associative-arrays-javascript
	return $.extend({}, parSymbs, this._symbols);
};

//convert current scope object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
scope.prototype.toString = 
	function() {
	return "{id: " + this._id +
		", type: " + this._type.name +
		", owner.id: " + (this._owner == null ? "(none)" : this._owner._id) +
		", blks: " + hashMapToStr(this._blks) +
		", children: " + hashMapToStr(this._children) +
		"}";
};

//get type name of this object (i.e. scope)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
scope.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.SCOPE;
};

//compare with another scope (it is a simple comparison operator, just check ids)
//input(s):
//	anotherScp: (scope) scope to compare against
//output(s):
//	(boolean) => {true} if this scope is equal to {anotherScp}; {false} if they are not equal
scope.prototype.isEqual =
	function(anotherScp) {
	//make sure that {anotherScp} is not null, so we can compare
	if( anotherScp !== null ) {
		//ensure that {this} is of the same type as {anotherScp}
		if( this.getTypeName() == anotherScp.getTypeName() ) {
			//compare ids of both command objects
			return this._id == anotherScp._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherScp is null
	return false;
};
