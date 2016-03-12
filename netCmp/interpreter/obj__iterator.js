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
//	idx: (integer) starting index
//	s: (scope) loop's scope
//	ent: (entity) entity to be looped thru
//output(s): (none)
function iterator(idx, s, ent){
	//assign id
	this._id = iterator.__nextId++;
	//starting index
	this._index = idx;
	//scope
	this._scope = s;
	//reference entity to be looped thru
	this._entity = ent;
};	//end constructor for 'iterator'

//convert current iterator to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
iterator.prototype.toString = function(){
	//e.g. ITERATOR[ENTITY_IDX (SCOPE_IDX) : index]
	return "ITERATOR[" + this._entity._id + " ( " + this._scope._id + " ) " +
				" : " + this._index + "]";
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