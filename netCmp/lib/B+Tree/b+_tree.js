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
	//ES 2016-08-07 (issue 6, b_cmp_test_1): add new argument that represents tree id to
	//	uniquely identify membership of such to this tree.
	this._root = new Bnode(BTREE_NODE_TYPE.ROOT.value | BTREE_NODE_TYPE.LEAF.value, this._id);
	//save interpreter instance
	this._interp = interp;
	//number of nodes in a tree
	this._numNodes = 1;
	//number of levels in a tree
	this._numLevels = 1;
	//type of key
	this._keyTy = typeOfKey;
	//type of value
	this._valTy = typeOfVal;
	//make sure that key type supports comparison functions (less, greater, and equal)
	if( !("__isless__" in this._keyTy._methods) || 
		!("__isgreater__" in this._keyTy._methods) ||
		!("__isequal__" in this._keyTy._methods)
	) {
		//error
		throw new Error("Type " + tmpType._name + " must support LESS and GREATER operators");
	}
	//get LESS operator functinoid for faster access
	this._lessOpKey = this._keyTy._methods["__isless__"];
	//get GREATER operator functinoid for faster access
	this._greaterOpKey = this._keyTy._methods["__isgreater__"];
	//get IS_EQ operator functinoid for faster access
	this._equalOpKey = this._keyTy._methods["__isequal__"];
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
		this._interp._curFrame,	//current frame
		funcOp,					//functinoid: comparison operator
		o1,						//owner of comparison operator
		[						//function arguments
			o1,						//'this'
			o2						//key to compare with
		]
	);
	//ES 2016-09-10 (b_debugger): remove DFS
	dbg.__debuggerInstance._callStack.pop();
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
//ES 2016-09-17 (b_dbg_test): variable name collision bug: argument and loop variable had same
//	name ('k'). Fix: renamed loop variable to a different name => 'm'.
Btree.prototype.isInside = function(n, k){
	//loop thru node entries
	for( var m = 0; m < n._entries.length; m++ ){
		//is current entry matches given key
		if( this.compare(
				n._entries[m]._key,		//current entry's key
				k,						//given key to comapre with
				this._equalOpKey		//operator '>'
			)
		) {
			//found
			return m;
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
//	op: (function reference) comparisom operator reference to use
//output(s):
//	(integer) => index of entry, where to insert given key
Btree.prototype.getIndexForEntrySmallerThenGivenKey = function(n, key, op){
	//loop index
	var k = 0;
	//if 'op' is not defined
	if( typeof op == "undefined" || op == null ){
		//set comparison operator to greater sign
		op = this._greaterOpKey;
	}
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
				key,					//given key to comapre with
				op						//operator '<'
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
	if( (n._type & BTREE_NODE_TYPE.LEAF.value) != 0 ){
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
	var tmpIsLeaf = (n._type & BTREE_NODE_TYPE.LEAF.value) != 0;
	//initialize
	var tmpInsertRes = {};
	//if given node is a non-leaf
	if( tmpIsLeaf == false ){
		//recursively traverse chosen subtree
		var tmpInsertRes = this.insert(
			n._entries[tmpEntryIndex]._val,		//next node to recursively traverse
			key,								//key to be inserted
			val									//value to be inserted
		);
	}	//end if given node is a non-leaf
	//if need to add 
	if( 'newchild' in tmpInsertRes || tmpIsLeaf ){
		//save node reference for entry index
		var tmpNodeRef = tmpIsLeaf ? null : n._entries[tmpEntryIndex]._val;
		//if created a new node
		if( 'newchild' in tmpInsertRes ){
			//substitute saved node reference with the one returned by the caller
			n._entries[tmpEntryIndex]._val = tmpInsertRes['newchild']._val;
		}
		//add new child to the entry array of this node
		n._entries.splice(
			tmpEntryIndex,
			0,
			//if leaf, then add value; otherwise, new node produced by a recursive call
			new pair(
				(tmpIsLeaf ? key : tmpInsertRes['newchild']._key),
				(tmpIsLeaf ? val : tmpNodeRef)
			)
		);
		//if need to redistribute or split
		if( n.isOverFilled() ){
			//create a new node
			//ES 2016-08-07 (issue 6, b_cmp_test_1): add new argument that represents tree id to
			//	uniquely identify membership of such to this tree.
			var tmpSiblingNode = new Bnode(n._type, this._id);
			//added new node
			this._numNodes++;
			//current number of entries in the iterated node
			var tmpNumEntries = n._entries.length;
			//find the middle entry (length for array of entries should be odd)
			var tmpMiddleIdx = Math.floor((tmpNumEntries - (tmpIsLeaf ? 0 : 1)) / 2);
			//save reference to the middle entry
			res['newchild'] = 
				new pair(
					n._entries[tmpMiddleIdx]._key, 
					tmpSiblingNode
				);
			//move entries after middle entry (not including middle entry, itself)
			//	into the new "sibling" node
			//	Note: if it is a leaf node, then push up middle entry and also copy;
			//		but if it is a non-leaf just push it up (do not copy)
			for( var k = tmpNumEntries - 1; k >= tmpMiddleIdx + (tmpIsLeaf ? 0 : 1); k-- ){
				//move current entry to the new node (at the start)
				tmpSiblingNode._entries.unshift(n._entries[k]);
				//remove this entry from the former node
				n._entries.splice(k, 1);
			}	//end loop to move entries into new 'sibling' node
			//if not a leaf
			if( ! tmpIsLeaf ){
				//remove middle key from the former node (it will be pusged up
				//	in a parent node), it was moved to the parente
				n._entries[tmpMiddleIdx]._key = null;
			}
			//save reference to new node
			res['node'] = tmpSiblingNode;
			//if root node was split
			if( (n._type & BTREE_NODE_TYPE.ROOT.value) != 0 ){
				//added extra level
				this._numLevels++;
				//create a new root node
				//ES 2016-08-07 (issue 6, b_cmp_test_1): add new argument that represents tree id to
				//	uniquely identify membership of such to this tree.
				res['node'] = new Bnode(BTREE_NODE_TYPE.ROOT.value, this._id);
				//added new root node
				this._numNodes++;
				//add middle node to the root
				res['node']._entries.push(
					new pair(
						res['newchild']._key,
						this._root
					)
				);
				res['node']._entries.push(
					new pair(
						null,
						res['newchild']._val
					)
				);
				//remove 'newchild' information from result set
				delete res['newchild'];
				//declare former root and its sibling to be non-root nodes
				this._root._type -= BTREE_NODE_TYPE.ROOT.value;
				tmpSiblingNode._type -= BTREE_NODE_TYPE.ROOT.value;
				//keep reference to the new root in tree instance
				this._root = res['node'];
				//remove 'node'
				delete res['node'];
			}	//end if root node was split
		}	//end if need to redistribute or split
	}	//end if child was split
	return res;
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
//TODO: needs code refactoring, since non-leaf and leaf cases contain lots of code duplication
Btree.prototype.remove = function(p, n, key){
	//prepare result set to be returned back to the caller
	var res = {};
	//if node is a non-leaf
	var tmpIsLeaf = (n._type & BTREE_NODE_TYPE.LEAF.value) != 0;
	//find a subtree which to expand to remove identified entry
	var tmpEntryIndex = this.getIndexForEntrySmallerThenGivenKey(
		n,		//currently processed node
		key,	//key to be removed in a node

		//if leaf, then find an exact key match to delete it; otherwise, find a first
		//	subtree, whose key is greater then the given (i.e. no exact match needed)
		(tmpIsLeaf ? this._equalOpKey : this._greaterOpKey)
	);
	//make sure that index is not out of bound
	if( tmpEntryIndex >= n._entries.length ){
		//such entry does not exist, quit
		return res;
	}
	//if this is a leaf node
	if( tmpIsLeaf ){
		n._entries.splice(
			tmpEntryIndex,			//former index for new key
			1						//remove 1 item at specified index
		);
	} else {	//if it is a non-leaf node
		//recursively call 'remove' to traverse in a chosen subtree
		var tmpRemoveRes = this.remove(
			n,									//this node is a parent to the next level
			n._entries[tmpEntryIndex]._val,		//next node to recursively traverse
			key									//key to be removed
		);
		//if no child was deleted (i.e. 'oldchild' is not present in result set)
		if( !('oldchild' in tmpRemoveRes) ){
			//quit
			return res;
		}
		//make sure that whatever is referenced by 'oldchild' is B+ node
		if( tmpRemoveRes['oldchild']._id in Bnode.__library ){
			//find 'oldchild' in the children array
			for( var j = 0; j < n._entries.length; j++ ){
				//if currently iterated entry's value represents an 'oldchild'
				if( n._entries[j]._val._id == tmpRemoveRes['oldchild']._id ){
					//if we are not deleting first entry
					if( j > 0 ){
						//move key from deleted entry to the previous to maintain correct structure of tree,
						//	i.e. all keys in the children to the left should be lower then the splitting key
						//	and all to the right should be equal or greater then the splitting key
						n._entries[j - 1]._key = n._entries[j]._key;
					}
					//remove entry
					n._entries.splice(
						j,		//former index for new key
						1		//remove 1 item at specified index
					);
					//if deleting last entry
					if( j == n._entries.length ){
						//need to set new ending entry, i.e. key should be NULL
						n._entries[n._entries.length - 1]._key = null;
					}
					//remove node
					delete Bnode.__library[tmpRemoveRes['oldchild']._id];
					//decrement number of nodes by 1
					this._numNodes--;
					//quit loop
					break;
				}	//end if found 'oldchild'
			}	//end loop thru children array
		}	///end if 'oldchild' is B+ node
	}	//end if it is a leaf node
	//if this node has no extra entries (i.e. it is less then half-full after deletion of child node)
	//Note: we need to subtract 1 (n._entries.length - 1), because array of entries contains one
	//	last entry with a null pointing at the very last child. This is not a real key entry, just
	//	a way to mimic the fact that each entry has 2 children - left and right.
	if( n.getNumEntries() < Bnode.__maxNumEntries / 2 ){
		//if not a root node
		if( p != null ){
			//init index of this node in parent's child array
			var tmpThisNodeIdx = this.getParentIndex(n, p);
			//get sibling S of this node (whichever sibling node that has more entries)
			var tmpSiblingNode = this.getMaxSibling(tmpThisNodeIdx, p);
			//make sure that S is a valid reference
			if( tmpSiblingNode == null ){
				//this node has to be a root
				if( (n._type & BTREE_NODE_TYPE.ROOT.value) == 0 ){
					//not a root => error
					throw new Error("non-root node has to have sibling(s)");
				}	//end if check node is not a root
				//since node is a root, just quit
				return res;
			}
			//initialize node reference for left sibling
			var tmpLeftSibling = tmpThisNodeIdx > 0 ? p._entries[tmpThisNodeIdx - 1]._val : null;
			//is sibling on the left or right with respect to the current node
			var tmpSiblingIsOnLeft = null;
			//if current node is to the left of sibling (i.e. sibling is greater)
			if( tmpLeftSibling == tmpSiblingNode ){
				//move entries from start of sibling to the end of current
				tmpSiblingIsOnLeft = true;
			} else {	//otherwise, sibling is to the left of current
				//move entries from end of sibling to the start of current
				tmpSiblingIsOnLeft = false;
			}
			//if S has extra entries (i.e. enough of entries to make this node half full
			//	and yet remain itself half-full), we can redistribute entries between 
			//	sibling and current node if following condition holds: 
			//Notation:
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
				n.getNumEntries() < Bnode.__maxNumEntries / 2 &&

				//sibling node must be greater or equal to half-sized node
				tmpSiblingNode.getNumEntries() >= Bnode.__maxNumEntries / 2 &&

				//sibling node should have enough of entries for redistribution
				//Note: we must subtract 2, because each array of entries (sibling and this node) has
				//	an extra entry at the very end, whose key is null and it points at the very last
				//	child in the array. This is needed to mimic the fact that each entry has 2 children.
				Bnode.__maxNumEntries / 2 <= ((tmpSiblingNode.getNumEntries() + n.getNumEntries()) / 2)
			){
				//Comments only: redistribute entries from sibling node to the current node, which
				//	means moving just enough of entries from sibling node to current node to make
				//	current half-sized node
				//loop while current node is less then half-sized
				while( n.getNumEntries() < Bnode.__maxNumEntries / 2 ){
					//if move entries from end of sibling to end of current
					if( tmpSiblingIsOnLeft ){
						//determine index
						var tmpEntIdx = tmpSiblingNode._entries.length - 1;
						//copy over an entry to current's start
						n._entries.unshift(tmpSiblingNode._entries[tmpEntIdx]);
						//delete an ending entry in the sibling node
						tmpSiblingNode._entries.pop();
						//if non leaf node
						if( ! tmpIsLeaf ){
							//last entry always is a NULL, so we moved a null that has a child reference
							//	now we need to swap keys of the first entry in the current (null) and
							//	last entry in the sibling (no longer a null)
							n._entries[0]._key = p._entries[tmpThisNodeIdx - 1]._key;							//move from parent to right node (this node)
							p._entries[tmpThisNodeIdx - 1]._key = tmpSiblingNode._entries[tmpEntIdx - 1]._key;	//substitute parent key with key from left node (sibling)
							tmpSiblingNode._entries[tmpEntIdx - 1]._key = null;									//replace key of left node with NULL (each non-leaf must have last ket set to NULL)
						} else {
							//because we are moving key from left leaf to right leaf, then we have to adjust
							//	parent key that points to the left and right keys, to hold the fact that
							//	all keys inside left are smaller then parent key and all keys inside right
							//	are either equal or greater to the parent key
							p._entries[tmpThisNodeIdx - 1]._key = n._entries[0]._key;
						}
					} else {	//else, move from start of sibling
						//copy over an entry to current's end
						n._entries.push(tmpSiblingNode._entries[0]);
						//delete a starting entry in the sibling node
						tmpSiblingNode._entries.shift();
						//determine index
						var tmpEntIdx = n._entries.length - 1;
						//if non leaf node
						if( ! tmpIsLeaf ){
							//each node should have last entry being a NULL, so now once an entry
							//	was moved to the end of current node, the last entry is no longer
							//	a null; the one before the last is NULL, however -- so, swap them
							n._entries[tmpEntIdx - 1]._key = p._entries[tmpThisNodeIdx]._key;	//substitute NULL with key from parent
							p._entries[tmpThisNodeIdx]._key = n._entries[tmpEntIdx]._key;		//substitute parent's key with the one moved from sibling
							n._entries[tmpEntIdx]._key = null;									//replace moved key with NULL (each non-leaf must have last key set to NULL)
						} else {
							//because we are moving key from left leaf to right leaf, then we have to adjust
							//	parent key that points to the left and right keys, to hold the fact that
							//	all keys inside left are smaller then parent key and all keys inside right
							//	are either equal or greater to the parent key
							p._entries[tmpThisNodeIdx]._key = tmpSiblingNode._entries[0]._key;
						}
					}	//end if move entries from sibling's start to current's end
				}	//end loop while current node is less then half-sized
			//else - merge sibling and this node -- whichever of these two nodes is right, call it M
			} else {
				//initialize references for the current and sibling nodes as left and right nodes
				var tmpLeftNode = null, tmpRightNode = null;
				//if sibling is on the left with respect to the current node
				if( tmpSiblingIsOnLeft ){
					tmpLeftNode = tmpSiblingNode;
					tmpRightNode = n;
				} else {	//else -- sibling is on the right with respect to the current node
					tmpLeftNode = n;
					tmpRightNode = tmpSiblingNode;
				}
				//set 'oldchild' to be reference to M (parent call will delete it)
				res['oldchild'] = tmpRightNode;
				//if it is a non-leaf node
				if( ! tmpIsLeaf ){
					//move "splitting key" from parent (key that references both left and right 
					//	nodes that are right now being merged) into the node on left
					//	i.e. just move a splitting key to the last entry (which has to be a NULL)
					tmpLeftNode._entries[tmpLeftNode._entries.length - 1]._key = p._entries[tmpThisNodeIdx - 1]._key;
				}
				//move all entries from right node (M) to the left node
				while( tmpRightNode._entries.length > 0 ){
					//move starting entry from right node to the end of left node
					tmpLeftNode._entries.push(tmpRightNode._entries[0]);
					//delete moved entry
					tmpRightNode._entries.splice(0, 1);
				}
			}	//end if sibling has extra entries -- can redistribute entries
		//if root node and it is empty
		} else if(n.getNumEntries() == 0 && this._root._entries.length > 0) {
			//reference root node
			var tmpFormerRootNode = this._root;
			//reset root node to the only child
			this._root = this._root._entries[0]._val;
			//reset type of node to be root
			this._root._type += BTREE_NODE_TYPE.ROOT.value;
			//decrement level by 1
			this._numLevels--;
			//delete root node
			delete Bnode.__library[tmpFormerRootNode._id];
			//decrement number of nodes by 1
			this._numNodes--;
		}	//end if not a root node
	}	//end if no child was deleted
	return res;
};	//end function 'remove'

//get index for this node, which corresponds to the position of this node in parent's array of children nodes
//input(s):
//	n: (Bnode) node, whose position needs to be determined in parent node
//	p: (Bnode) parent node
//output(s):
//	(integer) => position of given node in its parent array of children nodes
Btree.prototype.getParentIndex = function(n, p){
	//init index of this node in parent's child array
	var tmpThisNodeIdx = 0;
	//loop thru child array to find index of this node in parent's child array
	for( tmpThisNodeIdx = 0; tmpThisNodeIdx < p._entries.length; tmpThisNodeIdx++ ){
		//if currently iterated node is this node
		if( p._entries[tmpThisNodeIdx]._val.isEqual(n) ){
			//found node 'n'
			return tmpThisNodeIdx;
		}	//end if currently iterated node is this node
	}	//end loop thru child array
	//have not found node 'n'
	return -1;
};	//end function 'getParentIndex'

//get sibling that has more entries for specified node
//input(s):
//	n: (Bnode) node for which to find a sibling
//	p: (Bnode) parent node
//output(s):
//	(Bnode) => sibling node that has more entries
Btree.prototype.getMaxSibling = function(idx, p){
	//make sure that reference to the parent node is valid
	if( p == null ){
		//cannot get a sibling for the root
		return null;
	}
	//init left and right siblings of this node (providing they both exist)
	var tmpLeftSib = null;
	var tmpRightSib = null;
	//if there is entry to the left of this node
	if( idx > 0 ){
		tmpLeftSib = p._entries[idx - 1]._val;
	}
	//if there is entry to the right of this node
	if( idx + 1 < p._entries.length ){
		tmpRightSib = p._entries[idx + 1]._val;
	}
	//if there is only one sibling on the right
	if( tmpLeftSib == null && tmpRightSib != null ){
		return tmpRightSib;
	//else, if there is only one sibling on the left
	} else if ( tmpLeftSib != null && tmpRightSib == null ){
		return tmpLeftSib;
	//else, if this node has no siblings => error
	} else if( tmpLeftSib == null && tmpRightSib == null ){
		//error
		throw new Error("84783569238565325");
	//else, if both sibling nodes exist
	} else {
		return tmpLeftSib._entries.length > tmpRightSib._entries.length ? tmpLeftSib : tmpRightSib;
	}	//end if there is one sibling node
};	//end function 'getMaxSibling'

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
	//remove all nodes from node library
	//ES 2016-08-07 (issue 6, b_cmp_test_1): replace statement that simply removes
	//	all nodes from node library by a call to 'removeNodes' that deletes only
	//	nodes belonging to this specific tree
	//Bnode.__library = {};
	Bnode.removeNodes(this._id);
	//add current root to the library
	Bnode.__library[this._root._id] = this._root;
};	//end function 'removeAll'

//ES 2016-09-17 (b_dbg_test): get text representation of all B+ tree's nodes
//input(s): (none)
//output(s): (text)
Btree.prototype.toString = function(){
	//init text variable for composing text result
	var res = "";
	//loop thru all B+ nodes in the system (not just for this B+ tree)
	for( var tmpNdId in Bnode.__library ){
		//get B+ node object
		var tmpObj = Bnode.__library[tmpNdId];
		//check if this B+ node belongs to this B+ tree AND this is a leaf node
		if( tmpObj._treeId == this._id && (tmpObj._type & BTREE_NODE_TYPE.LEAF.value) != 0 ){
			//loop thru entries of LEAF node
			for( var tmpIdx = 0; tmpIdx < tmpObj._entries.length; tmpIdx++ ){
				//get key value pair for iterated entry
				var tmpKeyValPair = tmpObj._entries[tmpIdx];
				//add key and value to resulting string
				res += (res.length > 0 ? "," : "") + "[ " +
					tmpKeyValPair._key._value.toString() + 
					" -> " + 
					tmpKeyValPair._val._value.toString() +
					" ]";
			}	//end loop thru node entries
			//add this node to resulting string
		}	//end if node belongs to this B+ tree
	}	//end loop thru all B+ nodes (not just for this B+ tree)
	return res;
};	//end function 'toString'

//get maximum key
//input(s):
//	n: (Bnode) currently iterated node
//output(s):
//	key => key if there is at least one node; otherwise, null
Btree.prototype.getMax = function(n){
	//initialize index for right most entity
	var tmpMaxIdx = n._entries.length - 1;
	//make sure that this node has at least one entry
	if( tmpMaxIdx < 0 ){
		//error
		return null;
	}
	//check if currently iterated node is a leaf
	if( (n._type & BTREE_NODE_TYPE.LEAF.value) != 0 ){
		//return maximum key-value pair (it is the right most entry)
		return n._entries[tmpMaxIdx]._key;
	}
	//if not a leaf, then recursively move to the next level deeper (expand right most entry)
	return this.getMax(n._entries[tmpMaxIdx]._val);
};	//end function 'getMax'

//get minimum key
//input(s):
//	n: (Bnode) currently iterated node
//output(s):
//	(pair<key, value>) => key-value pair if there is at least one node; otherwise, null
Btree.prototype.getMin = function(n){
	//make sure that this node has at least one entry
	if( n._entries.length == 0 ){
		//error
		return null;
	}
	//check if currently iterated node is a leaf
	if( (n._type & BTREE_NODE_TYPE.LEAF.value) != 0 ){
		//return minimum key-value pair (it is the left most entry)
		return n._entries[0]._key;
	}
	//if not a leaf, then recursively move to the next level deeper (expand left most entry)
	return this.getMin(n._entries[0]._val);
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