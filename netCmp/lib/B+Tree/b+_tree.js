/**
	Developer:	Eduard Sedakov
	Date:		2016-03-19
	Description:	library for creating and maintaining B+ (balanced) tree
		See chapter 10 (Tree Structured Index) in Database Managment System by Ramakrishnan
	Used by: {interpreter}
	Depends on:	obj__b+_node.js, {interpeter}, content
**/

//==========globals:==========

//store all created B+ trees, indexed by their corresponding ids:
//	key: B+ tree id
//	value: B+ tree object
Btree.__library = {};

//unique identifier used by B+ tree
Btree.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Btree.reset = function() {
	Btree.__library = {};	//set to empty hash map
	Btree.__nextId = 1;		//set to first available integer
};

//static calls:
Btree.reset();

//class B+ Tree declaration:
//class creates B+ tree
//input(s):
//	interp: (interpreter) interpreter instance
//	typeOfKey: (type) type of key
//	typeOfVal: (type) type of value
//output(s): (none)
function Btree(interp, typeOfKey, typeOfVal){
	//assign id
	this._id = Btree.__nextId++;
	//add this tree to the library
	Btree.__library[this._id] = this;
	//root node
	this._root = new Bnode(BTREE_NODE_TYPE.ROOT | BTREE_NODE_TYPE.LEAF);
	//save interpreter instance
	this._interp = interp;
	//number of nodes in a tree
	this._numNodes = 0;
	//number of levels in a tree
	this._numLevels = 0;
	//type of key
	this._keyTy = typeOfKey;
	//type of value
	this._valTy = typeOfVal;
	//make sure that key type supports comparison functions (less, greater, and equal)
	if( !("__isless__" in this._keyTy._methods) || 
		!("__isgreater__" in this._valTy._methods) ||
		!("__iseq__" in this._valTy._methods)
	) {
		//error
		throw new Error("Type " + tmpType._name + " must support LESS and GREATER operators");
	}
	//get LESS operator functinoid for faster access
	this._lessOpKey = this._keyTy._methods["__isless__"];
	//get GREATER operator functinoid for faster access
	this._greaterOpKey = this._keyTy._methods["__isgreater__"];
	//get IS_EQ operator functinoid for faster access
	this._equalOpKey = this._keyTy._methods["__iseq__"];
};	//end constructor for B+ tree

//find a B+ node by a given key
//input(s):
//	key: (content) key to be found in a B+ tree
//output(s):
//	(Bnode) => B+ tree node to be found
Btree.prototype.find = function(key){
	//recursively step through B+ tree starting from root to find the given key
	return this.findNode(this._root, key);
};	//end function 'find'

//compare two content/entry objects
//input(s):
//	o1: (content) object # 1 participating in comparison
//	o2: (content) object # 2 participating in comparison
//	funcOp: (functinoid) operator functinoid
Btree.prototype.compare = function(o1, o2, funcOp){
	//compare iterated entry and the given key
	var tmpResult = this._interp.invokeCall(
		funcOp,		//functinoid: comparison operator
		o1,			//owner of comparison operator
		[			//function arguments
			o1,			//'this'
			o2			//key to compare with
		]
	);
	//check is returned value is invalid
	if( tmpResult == null || tmpResult._type._type != OBJ_TYPE.BOOL ){
		//error
		throw new Error("comparison operator must return boolean value");
	}
	//if currently iterated entry is larger then the given key
	return tmpResult._value;
};	//end function 'compare'

//recursive function for finding B+ node by key
//input(s):
//	n: (Bnode) currently searched B+ node
//	key: (content) key to be found
//output(s):
//	(Bnode) => B+ node (leaf) to be found
Btree.prototype.findNode = function(n, key) {
	//if this is a leaf node, then we return it
	if( n._type == BTREE_NODE_TYPE.LEAF ){
		return n;
	}
	//next node to check, if any
	var tmpNextNode = null;
	//linearly search thru current node entries to find the given key
	for( var i = 0; i < n._entries.length; i++ ){
		//get currently iterated entry
		var tmpCurEnt = n._entries[i];
		//check if current entry's key is NULL
		if( tmpCurEnt._key == null ){
			//this means that we found the last entry in the node
			//so, recursively step into this entry's node
			tmpNextNode = tmpCurEnt._val;
			//quit loop, we have found the next node to search in
			break;
		}
		//compare iterated entry and the given key
		var tmpIsLarger = this._interp.invokeCall(
			this._greaterOpKey,			//functinoid: comparison operator
			tmpCurEnt._key,				//owner of comparison operator
			[							//function arguments
				tmpCurEnt._key,				//'this'
				key							//key to compare with
			]
		);
		//check is returned value is invalid
		if( tmpIsLarger == null || tmpIsLarger._type._type != OBJ_TYPE.BOOL ){
			//error
			throw new Error("comparison operator must return boolean value");
		}
		//if currently iterated entry is larger then the given key
			//that means we found a next recursively searhing node
			tmpNextNode = tmpCurEnt._val;
			//quit loop
			break;
		}	//end if iterated entry is larger then the given key
	}	//end loop to linearly search for given key among current node entries
	//if next node is not determined (i.e. it is null)
	if( tmpNextNode == null ){
		//error
		throw new Error("58372597685478493");
	}
	//recursively step into next node
	return this.findNode(tmpNextNode, key);
};	//end function 'findNode'

//insert new node with given key and value
//input(s):
//	key: (content) key to be inserted in a new node
//	val: (content) value to be inserted in a new node
//output(s):
//	(Bnode) => created B+ tree node
Btree.prototype.insert = function(key, val){
	//TODO
};	//end function 'insert'

//remove a node
//input(s):
//	key: (content) key to be removed
//output(s): (none)
Btree.prototype.remove = function(key){
	//TODO
};	//end function 'remove'

//is tree empty
//input(s): (none)
//output(s):
//	(boolean) => is B+ tree empty or not
Btree.prototype.isEmpty = function(){
	//TODO
};	//end function 'isEmpty'

//remove all nodes in the tree
//input(s): (none)
//output(s): (none)
Btree.prototype.removeAll = function(){
	//TODO
};	//end function 'removeAll'

//get maximum key
//input(s): (none)
//output(s):
//	(pair<key, value>) => key-value pair if there is at least one node; otherwise, null
Btree.prototype.getMax = function(){
	//TODO
};	//end function 'getMax'

//get minimum key
//input(s): (none)
//output(s):
//	(pair<key, value>) => key-value pair if there is at least one node; otherwise, null
Btree.prototype.getMin = function(){
	//TODO
};	//end function 'getMin'

//get number of nodes in a tree
//input(s): (none)
//output(s):
//	(integer) => number of nodes in the B+ tree
Btree.prototype.numNodes = function(){
	return this._numNodes;
};	//end function 'numCount'

//get number of levels
//input(s): (none)
//output(s):
//	(integer) => number of levels in a B+ tree
Btree.prototype.numLevels = function(){
	return this._numLevels;
};	//end function 'numLevels'