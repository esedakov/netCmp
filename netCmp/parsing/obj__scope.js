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

//ES 2016-10-09 (b_db_init): create library of scope ids, to make easier transfer of
//	scopes to the server
scope.__library = {};

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
scope.reset = function() {
	scope.__nextId = 1;		//set to first available integer
	//ES 2016-10-09 (b_db_init): initialize library of scope ids
	scope.__library = {};
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
	//ES 2016-10-09 (b_db_init): add this scope to the library
	scope.__library[this._id] = this;
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
		this._symbols[symbs[i]._name] = symbs[i];
	}
	//setup hashmap of child scopes defined inside this scope
	this._children = {};
	//if owner of this scope is not null
	if( this._owner ){
		//add this scope to parent	
		this._owner.addScope(this);
	}
	//ES 2017-02-14 (soko): create set of NULL commands, so that interpreter could
	//	use this set to initialize them all, when starting this scope execution
	this._nullCmds = {};	//ES 2017-02-14 (soko): key: command id, val: command obj
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

//ES 2016-08-13 (b_cmp_test_1): check whole hierarchy of scopes to determine if one scope (s)
//	is inside another scope (this)
//input(s):
//	s: (scope) scope to check if it is direct/indirect child of this scope
//output(s):
//	(boolean) => {true} if S is direct/indirect child of THIS scope
scope.prototype.isDescendant =
	function(s){
	//check if S has no parent scope
	if( s._owner == null ){
		//S is not a descandent of THIS
		return false;
	}
	//check if THIS is parent of S
	if( s._owner._id == this._id ){
		//S is a descendant
		return true;
	}
	//go deeper in hirearchy
	return this.isDescendant(s._owner);
};	//ES 2016-08-13 (b_cmp_test_1): end method 'isDescendant'

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
	function(isCurrent, doForceCreate){
	//if argument 'doForceCreate' is not specified
	if( typeof doForceCreate == "undefined" ){
		//set 'doForceCreate' to false
		doForceCreate = false;
	}
	//if there is a current block
	if( doForceCreate == false && this._current !== null ){
		//if current block is empty, then return that block
		if( this._current._cmds.length == 0 ||
			(
				this._current._cmds.length == 1 && 
				this._current._cmds[0]._type == COMMAND_TYPE.NOP
			) 
		){
			//return this block
			return this._current;
		}	//end if current block is empty
	}	//end if there is a current block
	//create new block
	var blk = new block(this);
	//if this block has to be current
	if( isCurrent ){
		//set it to be current and add to the list
		this.setCurrentBlock(blk);
	} else {	//otherwise, simply add to the list
		this.addBlock(blk);
	}
	//if there is no start (i.e. there was no block in this scope)
	if( this._start == null ){
		//assign first block
		this._start = blk;
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

//ES 2017-02-12 (soko): move code from function 'findSymbol' into this new function, to
//	separate two types of traversals: (1) thru scrope hierarchy, which is the code
//	that got moved in (this function), and (2) thru stack of scopes - this traversal
//	was missing, as a result, parser was failing to find declared objects inside
//	function, once it switched from function scope to object scope.
//	example:
//	function void:__main__(){
//		...
//		var integer i = ...
//		var foo k = ...
//		...
//		let k.arr[i] = 0;	//<< switched to scope of object definition 'foo', so no longer can find 'i'
scope.prototype.findInsideScopeHierarchy = function(n){
        //check if symbol is inside current scope
        if( this.isSymbolInside(n) ){
                return this._symbols[n];
        }
        //if this scope has no parent/owner
        if( this._owner == null ){
                return null;
        }
        //otherwise, there is a parent, try to find symbol in it
        return this._owner.findInsideScopeHierarchy(n);
};	//ES 2017-02-12 (soko): end function 'findInsideScopeHierarchy'

//find symbol inside this scope and if not in this scope, then in its parent scope hierarchy
//input(s):
//	n: (text) symbol's name (each symbol has to have unique name)
scope.prototype.findSymbol = function(n){
	/* ES 2017-02-12 (soko): moved code into function 'findInsideScopeHierarchy', see reason there
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
	ES 2017-02-12 (soko): end moved code into function 'findInsideScopeHierarchy' */
	//ES 2017-02-12 (soko): try to find symbol inside this scope
	var tmpThisScopeSymb = this.findInsideScopeHierarchy(n);
	//ES 2017-02-12 (soko): if found symbol inside this scope
	if( tmpThisScopeSymb != null ){
		//return found symbol inside this scope
		return tmpThisScopeSymb;
	}	//ES 2017-02-12 (soko): end if found symbol inside this scope
	//ES 2017-02-12 (soko): traverse in reverse order stack of scopes
	for( var scpIdx = parser.__instance._stackScp.length - 1; scpIdx >= 0; scpIdx-- ){
		//try to find symbol inside currently iterated scope hierarchy
		var tmpFoundSymb = parser.__instance._stackScp[scpIdx].findInsideScopeHierarchy(n);
		//if symbol was found
		if( tmpFoundSymb != null ){
			//return back to the caller found symbol
			return tmpFoundSymb;
		}	//end if symbol was found
	}	//ES 2017-02-12 (soko): end traverse in reverse order stack of scopes
	//ES 2017-02-12 (soko): when reach this point, then no symbol with this name exists, so return null
	return null;
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
