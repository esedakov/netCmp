/**
	Developer:	Eduard Sedakov
	Date:		2016-02-04
	Description:	iterating thru loops
	Used by: frame, {interpreter}
	Depends on:	{parser}
**/

//==========globals:==========

//unique identifier used by iterator
iterator.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
iterator.reset = function() {
	iterator.__nextId = 1;	//set to first available integer
};

//static calls:
iterator.reset();

//class "iterator" declaration:
//class describes iteration thru loop
//input(s):
//	idx: (integer) ES 2016-08-08 (remove argument): starting index: array element index OR B+ node's id
//	s: (scope) loop's scope
//	ent: (entity) entity to be looped thru
//output(s): (none)
function iterator(s, ent){
	//assign id
	this._id = iterator.__nextId++;
	//reference entity to be looped thru
	//ES 2016-08-07 (b_cmp_test_1): COMMENTS ONL: this has to be either array
	//	or B+ tree (not iterated elements inside them)
	this._entity = ent;
	//ES 2016-08-08 (b_cmp_test_1): initialize starting index, so that 'findNext' could
	//	locate starting element
	this._cur = -1;
	//ES 2016-08-08 (b_cmp_test_1): find out next element
	this._next = this.findNext();
	//ES 2017-02-15 (soko): index of current element within current B+ tree node (only for B+ tree_
	this._elemIdx = 0;
	//scope
	this._scope = s;
};	//end constructor for 'iterator'

//ES 2016-08-07 (b_cmp_test_1): check if there is next element to iterate over
//input(s): (none)
//output(s):
//	(boolean) => TRUE if there is element to iterate over, FALSE if no element left to iterare
iterator.prototype.isNext = function(){
	//if next is determined, then there is next element to iterate over
	return this._next != null;
};	//end function 'isNext'

//ES 2016-08-07 (b_cmp_test_1): move to next element
//input(s): (none)
//output(s):
//	(Object) => next element
iterator.prototype.next = function(){
	//set current to next
	this._cur = this._next;
	//get next element
	this._next = this.findNext();
	//return current element
	return this.currentEntry();
};	//end function 'next'

//ES 2016-08-07 (b_cmp_test_1): get current entry
//input(s): (none)
//output(s):
//	(Object) => current element
iterator.prototype.currentEntry = function(){
	//if there is current element
	if( this._cur != null ){
		//if entity to iterate over is array
		if( this._entity._type._type.value == OBJ_TYPE.ARRAY.value ){
			//return current array entry
			return interpreter.getContentObj(this._entity)._value[this._cur];
		//else, entity to iterate over is B+ tree
		} else if( this._entity._type._type.value == OBJ_TYPE.BTREE.value ){
			//return current B+ tree entry
			//ES 2017-02-15 (soko): instead of returning a B+ tree node, which can house several
			//	elements inside it, return currently iterated element in this node, by
			//	accessing one with index of '_elemIdx'
			return Bnode.__library[this._cur]._entries[this._elemIdx]._key;
		}	//end if entity to iterate over is array
	}	//end if there is next element
	//else, there is no next element => return null
	return null;
};	//end function 'currentEntry'

//ES 2016-08-07 (b_cmp_test_1): find next element to iterate over
//input(s): (none)
//output(s):
//	(integer) => index/id of next element/node
iterator.prototype.findNext = function(){
	//if entity to iterate over is array
	if( this._entity._type._type.value == OBJ_TYPE.ARRAY.value ){
		//check if next index falls inside array
		if( interpreter.getContentObj(this._entity)._value.length > (this._cur + 1) ){
			//yes, there is next element
			return this._cur + 1;
		}
	//else, entity to iterate over is B+ tree
	} else if( this._entity._type._type.value == OBJ_TYPE.BTREE.value ){
		//get all B+ node ids in the form of ids
		var tmpNodeIds = Object.keys(Bnode.__library);
		//initialize index
		var tmpIdx = -1;
		//if current index is not -1, then we should find priorly iterated item
		if( this._cur != -1 ){
			//get index of current node
			tmpIdx = $(tmpNodeIds).index(this._cur);
		}
		//if there are elements past current
		if( (tmpIdx + 1) < tmpNodeIds.length ){
			//loop thru remaining elements past current
			for( var j = tmpIdx + 1; j < tmpNodeIds.length; j++ ){
				//if iterated node belongs to this tree AND
				if( Bnode.__library[tmpNodeIds[j]]._treeId == this._entity._id &&

					//it is a leaf node
					(Bnode.__library[tmpNodeIds[j]]._type & BTREE_NODE_TYPE.LEAF.value) != 0 )
				{
					//found, next element
					return tmpNodeIds[j];
				}
			}	//end loop thru remaining elements past current
		}	//end if there are elements past current
	}	//end if entity to iterate over is array
	//no next element to iterate over, return null
	return null;
};	//end function 'findNext'

//convert current iterator to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
iterator.prototype.toString = function(){
	//e.g. ITERATOR[ENTITY_IDX (SCOPE_IDX) : index]
	return "ITERATOR[" + this._entity._id + " ( " + this._scope._id + " ) " +
				" : " + this._cur + "]";
};	//end function 'toString'

//get type name of this object (i.e. iterator)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
iterator.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.ITERATOR;
};

//compare with another iterator by ids
//input(s):
//	anotherIter: (iterator) iterator to compare against
//output(s):
//	(boolean) => {true} if this iterator is equal to {anotherIter};
//				 {false} if they are not equal
iterator.prototype.isEqual =
	function(anotherIter) {
	//make sure that {anotherIter} is not null, so we can compare
	if( anotherIter !== null ) {
		//ensure that {this} is of the same type as {anotherIter}
		if( this.getTypeName() == anotherIter.getTypeName() &&
			//make sure that two iterators represent JS object of the same type
			this._type == anotherIter._type
		) {
			//compare values
			return this._value == anotherIter._value;
		}	//end if two iterators have same type
	}	//end if another iterator is not null
	//if reached this point, then two objects are either of different 
	//	type or anotherIter is null
	return false;
};	//end function 'isEqual'