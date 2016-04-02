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

//determine if node contains given key
//input(s):
//	n: (Bnode) B+ tree node
//	k: (content) key to look for
//output(s):
//	(integer) => index of entry that matches given key in the node
Btree.prototype.isInside = function(n, k){
	//loop thru node entries
	for( var k = 0; k < n._entries.length; k++ ){
		//is current entry matches given key
		if( this.compare(
				n._entries[k]._key,		//current entry's key
				k,						//given key to comapre with
				this._equalOpKey		//operator '>'
			)
		) {
			//found
			return k;
		}	//end if current entry matches given key
	}	//end loop thru node entries
	//failed to find
	return -1;
};	//end function 'isInside'

//find index for node entry where to find/insert/remove given key, i.e. first entry
//	that is smaller then the given key
//input(s):
//	n: (Bnode) B+ tree node
//	k: (content) key
//output(s):
//	(integer) => index of entry, where to insert given key
Btree.prototype.getIndexForEntrySmallerThenGivenKey = function(n, k){
	//loop index
	var k = 0;
	//loop thru node entries
	for( k = 0; k < n._entries.length; k++ ){
		//if this entry is not used
		if( n._entries[k]._key == null ){
			//quit loop, found end of entrys' array
			break;
		}
		//is current entry less then the given key
		if( this.compare(
				n._entries[k]._key,		//current entry's key
				k,						//given key to comapre with
				this._lessOpKey			//operator '<'
			)
		) {
			//found the spot within array of entries
			return k;
		}	//end if current entry matches given key
	}	//end loop thru node entries
	//return index for the last entry
	return k;
};	//end function 'getIndexForEntrySmallerThenGivenKey'

//recursive function for finding B+ node by key
//input(s):
//	n: (Bnode) currently searched B+ node
//	key: (content) key to be found
//output(s):
//	(Bnode) => B+ node (leaf) to be found
Btree.prototype.findNode = function(n, key) {
	//if this is a leaf node, then we return it
	if( n._type & BTREE_NODE_TYPE.LEAF.value != 0 ){
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
		//if currently iterated entry is larger then the given key
		if( this.compare(
				tmpCurEnt._key,			//object # 1
				key,					//object # 2
				this._greaterOpKey		//operator '>'
			) 
		) {
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
//	see page 384 from Database Managment System (3Rd edition) by Ramakrishnan and Gehrke
//input(s):
//	n: (Bnode) node where to attempt inserting new key-value pair
//	key: (content) key to be inserted in a new node
//	val: (content) value to be inserted in a new node
//output(s):
//	['node'] => (Bnode) => created B+ tree node
//	['newchild'] => new child entry, if any
Btree.prototype.insert = function(n, key, val){
	//prepare result set to be returned back to the caller
	var res = {};
	//determine a subtree where to insert new entry
	var tmpEntryIndex = this.getIndexForEntrySmallerThenGivenKey(
		n,		//currently processed node
		key		//key to be inserted in a node
	);
	//is this a LEAF node
	var tmpIsLeaf = n._type & BTREE_NODE_TYPE.LEAF.value == 0;
	//if given node is a non-leaf
	if( tmpIsLeaf ){
		//recursively traverse chosen subtree
		var tmpInsertRes = this.insert(
			n._entries[tmpEntryIndex]._val,		//next node to recursively traverse
			key,								//key to be inserted
			val								//value to be inserted
		);
	}	//end if given node is a non-leaf
	//if need to add 
	if( 'newchild' in tmpInsertRes || tmpIsLeaf ){
		//add new child to the entry array of this node
		n._entries.splice(
			tmpEntryIndex, 					//former index for new key
			0,
			//if leaf, then add value; otherwise, new node produced by a recursive call
			(tmpIsLeaf ? val : tmpInsertRes['newchild'])
		);
		//if this node has space for keeping track of new child
		if( n.canAddNewNode() ){
			//create a new node
			var tmpSiblingNode = new Bnode(n._type);
			//added new node
			this._numNodes++;
			//find the middle entry (length for array of entries should be odd)
			var tmpMiddleIdx = n._entries.length / 2;
			//move entries after middle entry (not including middle entry, itself)
			//	into the new "sinbling" node
			//	Note: if it is a leaf node, then push up middle entry and also copy;
			//		but if it is a non-leaf just push it up (do not copy)
			for( var k = tmpMiddleIdx + (tmpIsLeaf ? 0 : 1); k < n._entries.length; k++ ){
				//move current entry to the new node
				tmpSiblingNode._entries.push(n._entries[k]);
				//remove this entry from the former node
				delete n._entries[k];
			}	//end loop to move entries into new 'sibling' node
			//save reference to the middle entry
			res['newchild'] = n._entries[tmpMiddleIdx];
			//remove middle entry from the former node (it will be pusged up
			//	in a parent node)
			delete n._entries[tmpMiddleIdx];
			//save reference to new node
			res['node'] = tmpSiblingNode;
			//if root node was split
			if( n._type == BTREE_NODE_TYPE.ROOT.value != 0 ){
				//added extra level
				this._numLevels++;
				//create a new root node
				res['node'] = new Bnode(BTREE_NODE_TYPE.ROOT.value);
				//added new root node
				this._numNodes++;
				//add middle node to the root
				res['node']._entries.push(res['newchild']);
				//remove 'newchild' information from result set
				delete res['newchild'];
				//declare former root and its sibling to be non-root nodes
				this._root._type = BTREE_NODE_TYPE.NODE.value;
				tmpSiblingNode._type = BTREE_NODE_TYPE.NODE.value;
				//keep reference to the new root in tree instance
				this._root = res['node'];
			}	//end if root node was split
		}	//end if this node has space for new child
	}	//end if child was split
};	//end function 'insert'

//remove a node
//	see page 388 from Database Managment System (3Rd edition) by Ramakrishnan and Gehrke
//input(s):
//	p: (Bnode) parent node
//	n: (Bnode) node where to attempt inserting new key-value pair
//	key: (content) key to be removed
//output(s):
//	['node'] => (Bnode) => B+ tree node to be removed
//	['oldchild'] => old child entry, if any
Btree.prototype.remove = function(p, n, key){
	//prepare result set to be returned back to the caller
	var res = {};
	//determine a subtree where to remove new entry
	var tmpEntryIndex = this.getIndexForEntrySmallerThenGivenKey(
		n,		//currently processed node
		key		//key to be removed in a node
	);
	//is this a LEAF node
	var tmpIsLeaf = n._type & BTREE_NODE_TYPE.LEAF.value == 0;
	//if given node is a non-leaf
	if( tmpIsLeaf == false ){
		//recursively traverse chosen subtree
		var tmpInsertRes = this.remove(
			n,									//this node is a parent to the next level
			n._entries[tmpEntryIndex]._val,		//next node to recursively traverse
			key									//key to be removed
		);
	}	//end if given node is a non-leaf
	//if need to remove node
	if( 'newchild' in tmpInsertRes || tmpIsLeaf ){
		//remove entry
		n._entries.splice(
			tmpEntryIndex, 					//former index for new key
			1								//remove 1 item at specified index
		);
		//remove a node
		this._numNodes--;
		//init index of this node in parent's child array
		var tmpThisNodeIdx = 0;
		//init left and right siblings of this node (providing they both exist)
		var tmpLeftSib = null;
		var tmpRightSib = null;
		//loop thru child array to find index of this node in parent's child array
		for( tmpThisNodeIdx = 0; tmpThisNodeIdx < p._entries.length; tmpThisNodeIdx++ ){
			//if currently iterated node is this node
			if( p._entries[tmpThisNodeIdx].isEqual(n) ){
				//found this node, then try to set left and right siblings
				//if there is entry to the left of this node
				if( tmpThisNodeIdx > 0 ){
					tmpLeftSib = p._entries[tmpThisNodeIdx - 1];
				}
				//if there is entry to the right of this node
				if( tmpThisNodeIdx + 1 < p._entries.length ){
					tmpRightSib = p._entries[tmpThisNodeIdx + 1];
				}
				//quit loop
				break;
			}	//end if currently iterated node is this node
		}	//end loop thru child array
		//determine which of the two nodes (sibling and current) is on the right
		//	and on the left sides, because it is better to assist in moving/copying
		//	content from source (sibling) to destination (current)
		//To determine left/right nodes, take a minimum (first) value from two nodes
		var curNodeMinVal = n._entries[0]._key;
		var sibNodeMinVal = tmpSiblingNode._entries[0]._key;
		//initialize left and right nodes
		var tmpLeftNode = null, tmpRightNode = null;
		//initialize index for left node in parent
		var tmpParentLeftNodeIdx = -1;
		//now, compare two values to determine which node is which
		if( this.compare(	//if {{current}} is less then {{sibling}}
				curNodeMinVal,		//current entry's key
				sibNodeMinVal,		//given key to comapre with
				this._lessOpKey		//operator '<'
			) 
		) {
			//current node is left, sibling is right
			tmpLeftNode = n;
			tmpRightNode = tmpSiblingNode;
			//set index for current node
			tmpParentLeftNodeIdx = tmpThisNodeIdx;
		} else {	//if {{current}} is greater then {{sibling}}
			//sibling node is left, current node is right
			tmpLeftNode = tmpSiblingNode;
			tmpRightNode = n;
			//set index for sibling (which is node to the left of current)
			tmpParentLeftNodeIdx = tmpThisNodeIdx - 1;
		}	//end if compare two values to determine which node is which
		//select a sibling with more entries inside, so that we could try to
		//	redistribute rather then merge nodes (merging is expensive procedure
		//	especially if it triggers subsequent merges in the rest of hierarchy,
		//	so it is better to select node with larger number of entries)
		var tmpSiblingNode = tmpLeftSib._entries.length > tmpRightSib._entries.length ? tmpLeftSib._entries.length : tmpRightSib._entries.length;
		//if sibling node is less then half-full (i.e. has fewer then a half of entries)
		//	then we have to merge this and sibling nodes
		//we can redistribute entries between sibling and current node if following
		//	condition holds: 
		//	Notation:
		//	H = half of entries, e.g. number of entries in a half-sized node
		//	C = number of entries in a current node
		//	S = number of entries in a sibling node
		//Note # 1: current node must contain less then half-sized entries (H-C > 0)
		//Note # 2: sibling node must be greater or equal then a half-sized node (H-S >= 0)
		//	H - C <= H - S
		//	in other words, number of enties needed for current node to become half-sized
		//	should be less or equal to number of entries on which sibling node exceeds
		//	half-sized node. In other words #2, we need to test whether sibling node has
		//	enough entries to make current node half-sized, and contain enough entries
		//	to be half-sized itself, or greater.
		//	refactorring condition above gives you this: H <= (C + S) / 2
		if( 
			//current node must have less then half-sized node
			n._entries.length < Bnode.__maxNumEntries / 2 &&

			//sibling node must be greater or equal to half-sized node
			tmpSiblingNode._entries.length >= Bnode.__maxNumEntries / 2 &&

			//sibling node should have enough of entries for redistribution
			Bnode.__maxNumEntries / 2 <= ((tmpSiblingNode._entries.length + n._entries.length) / 2)
		){
			//initialize flag to determine from start or end should be moved entries
			var tmpDoMoveFromStart = null;
			//redistribute entries from sibling node to the current node, which means
			//	moving just enough of entries from sibling node to current node to make
			//	current half-sized node
			//if current node is to the left of sibling (i.e. sibling is greater)
			if( tmpParentLeftNodeIdx == tmpThisNodeIdx ){
				//move entries from start of sibling to the end of current
				tmpDoMoveFromStart = true;
			} else {	//otherwise, sibling is to the left of current
				//move entries from end of sibling to the start of current
				tmpDoMoveFromStart = false;
			}
			//loop while current node is less then half-sized
			while( n._entries.length < Bnode.__maxNumEntries / 2 ){
				//if move entries from start of sibling to end of current
				if( tmpDoMoveFromStart ){
					//copy over an entry to current's end
					n._entries.push(tmpSiblingNode._entries[0]);
					//delete a starting entry in the sibling node
					tmpSiblingNode._entries.shift();
				} else {	//else, move from end of sibling
					//determine index
					var tmpEntIdx = tmpSiblingNode._entries.length - 1;
					//copy over an entry to current's start
					n._entries.unshift(tmpSiblingNode._entries[tmpEntIdx]);
					//delete an ending entry in the sibling node
					tmpSiblingNode.pop();
				}	//end if move entries from sibling's start to current's end
			}	//end loop while current node is less then half-sized
		} else {	//else, need to merge sibling and this (current) nodes
			//move entries from right node to the end of left node
			for( var j = 0; j < tmpRightNode._entries.length; j++ ){
				//copy over enties from right node to left node
				tmpLeftNode._entries.push(tmpRightNode._entries[j]);
			}	//end loop move entries from right node to left node
			//make entry (in parent) for the right node point to the left node
			p._entries[tmpParentLeftNodeIdx + 1] = tmpLeftNode;
			//delete record of left node from its parent
			delete p._entries[tmpParentLeftNodeIdx];
		}	//end if node is less then a half-full
	}	//end if need to remove node
	//if it is a root
	if( n._type == BTREE_NODE_TYPE.ROOT.value != 0 ){
		//if root only contains one entry, then we can discard this node and reset root to its only child
		if( n._entries.length == 1 ){
			//remove node
			this._numNodes--;
			//reduce level by 1
			this._numLevels--;
			//reset root to its only child
			this._root = this._root._entries[0];
		}	//end if root contains only single child
	}	//end if this node is a root
};	//end function 'remove'

//is tree empty
//input(s): (none)
//output(s):
//	(boolean) => is B+ tree empty or not
Btree.prototype.isEmpty = function(){
	//check whether root has any entries
	return this._root._entries.length == 0;	//if no entries, then tree is empty
};	//end function 'isEmpty'

//remove all nodes in the tree
//input(s): (none)
//output(s): (none)
Btree.prototype.removeAll = function(){
	//remove all entries from root
	this._root._entries = [];
};	//end function 'removeAll'

//get maximum key
//input(s):
//	n: (Bnode) currently iterated node
//output(s):
//	(pair<key, value>) => key-value pair if there is at least one node; otherwise, null
Btree.prototype.getMax = function(n){
	//initialize index for right most entity
	var tmpMaxIdx = n._entries.length - 1;
	//make sure that this node has at least one entry
	if( tmpMaxIdx < 0 ){
		//error
		return null;
	}
	//check if currently iterated node is a leaf
	if( n._type & BTREE_NODE_TYPE.LEAF.value != 0 ){
		//return maximum key-value pair (it is the right most entry)
		return n._entries[tmpMaxIdx];
	}
	//if not a leaf, then recursively move to the next level deeper (expand right most entry)
	return this.getMax(n._entries[tmpMaxIdx]._val);
};	//end function 'getMax'

//get minimum key
//input(s):
//	n: (Bnode) currently iterated node
//output(s):
//	(pair<key, value>) => key-value pair if there is at least one node; otherwise, null
Btree.prototype.getMin = function(){
	//make sure that this node has at least one entry
	if( n._entries.length == 0 ){
		//error
		return null;
	}
	//check if currently iterated node is a leaf
	if( n._type & BTREE_NODE_TYPE.LEAF.value != 0 ){
		//return minimum key-value pair (it is the left most entry)
		return n._entries[0];
	}
	//if not a leaf, then recursively move to the next level deeper (expand left most entry)
	return this.getMax(n._entries[0]._val);
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