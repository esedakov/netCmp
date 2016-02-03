/**
	Developer:	Eduard Sedakov
	Date:		2016-01-25
	Description:	execution position
	Used by:	{interpreter}
	Depends on: (none)
**/

//==========globals:==========

//==========statics:==========

//class position that describes certain place in the 
//	Control-Flow-Graph (CFG) that needs to be executed
//input(s):
//	s: (scope) scope
//	b: (block) block
//	c: (command) command
function position(s, b, c){
	//assign scope, block, and command
	this._scope = s;
	this._block = b;
	this._cmd = c;
};	//end constructor for position

//convert current position to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
position.prototype.toString = function(){
	//e.g. POSITION[scope._id, block._id, cmd._id]
	return "POSITION[" + this._scope._id + " , " + this._block._id + 
				" , " + this._cmd._id + "]";
};	//end function 'toString'

//get type name of this object (i.e. position)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
position.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.POSITION;
};

//compare with another position by comparing JS object (contained in '_value')
//input(s):
//	anotherPosition: (position) position to compare against
//output(s):
//	(boolean) => {true} if this position is equal to {anotherPosition};
//				 {false} if they are not equal
position.prototype.isEqual =
	function(anotherPosition) {
	//make sure that {anotherPosition} is not null, so we can compare
	if( anotherPosition !== null ) {
		//ensure that {this} is of the same type as {anotherPosition}
		if( this.getTypeName() == anotherPosition.getTypeName() &&
			//make sure that two positions represent JS object of the same type
			this._type == anotherPosition._type
		) {
			//compare ids of both command objects
			return this._value == anotherPosition._value;
		}	//end if two positions have same type
	}	//end if another position is not null
	//if reached this point, then two objects are either of different 
	//	type or anotherPosition is null
	return false;
};	//end function 'isEqual'