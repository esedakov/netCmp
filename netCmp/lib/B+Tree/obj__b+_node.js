/**
	Developer:	Eduard Sedakov
	Date:		2016-03-19
	Description:	B+ node
	Used by: B+_tree.js
	Depends on:	type__b+_node.js, obj__pair.js
**/

//==========globals:==========

//unique identifier used by B+ node
Bnode.__nextId = 1;

//store all created B+ nodes, indexed by their corresponding ids:
//	key: B+ node id
//	value: B+ node object
Bnode.__library = {};

//maximum number of index entries that can contain B+ tree node
Bnode.__maxNumEntries = 10;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Bnode.reset = function() {
	Bnode.__nextId = 1;			//set to first available integer
	Bnode.__library = {};		//set the empty hash map for storing B+ tree nodes
	Bnode.__maxNumEntries = 10;	//max number of entries per node
};

//static calls:
Bnode.reset();

//class B+ Tree node declaration:
//class creates B+ node
//input(s):
//	t: (BTREE_NODE_TYPE) type of B+ tree node
//output(s): (none)
function Bnode(t){
	//assign id
	this._id = Bnode.__nextId++;
	//add this tree to the library
	Btree.__library[this._id] = this;
	//array for storing key-value pairs
	this._entries = [];			//key: actual data, value: B+ tree node OR null if
								//	this is leaf node, itself
	//set type of this node
	this._type = t;
};	//end constructor for B+ tree

//get number of entries inside this B+ tree node
//input(s): (none)
//output(s):
//	(integer) => number of B+ tree nodes
Bnode.prototype.getNumEntries = function(){
	return this._entries.length;
};	//end function 'getNumEntries'

//convert B+ tree node to string
//input(s): (none)
//output(s):
//	(string) => text representation
Bnode.prototype.toString = function(){
	//resulting text
	var res = "BNode{id: " + this._id + "; type: " + this._type.name + "; entries: \n\r";
	//loop thru entries
	for( var i = 0; i < this._entries.length; i++ ){
		//get key-value pair at current index
		var cur_kvp = this._entries[i];
		//add text representation for current key-value-pair
		res += cur_kvp._key + " => " + cur_kvp._val + ",\r\n";
	}
	//compose resulting text
	return res + "\n\r}";
};	//end function 'toString'

//get type name of this object (i.e. B+ tree node)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Bnode.prototype.getTypeName = function() {
	return RES_ENT_TYPE.BNODE;
};	//end function 'getTypeName'

//compare with another B+ tree node by simply comparing their corresponding ids
//input(s):
//	anotherBNode: (Bnode) => another B+ tree node to compare with
//output(s):
//	(boolean) => {true} => if this B+ tree node is equal to another B+ node; {false} otherwise
Bnode.prototype.isEqual = function(anotherBNode){
	//make sure that another object is not null
	if( anotherBNode !== null ){
		//ensure that {this} is of the same type as {anotherBNode}
		if( this.getTypeName() == anotherBNode.getTypeName() ){
			//compare ids
			return this._id == anotherBNode._id;
		}	//end if same type
	}	//end if another object is not null
	//if reached this point, then this is not equal to another object
	return false;
};	//end function 'isEqual'