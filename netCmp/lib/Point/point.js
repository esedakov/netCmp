/**
	Developer:	Eduard Sedakov
	Date:		2016-09-22
	Description:	library for point type
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created points, indexed by their corresponding ids:
//	key: point id
//	value: point object
Point.__library = {};

//unique identifier used by point
Point.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Point.reset = function() {
	Point.__library = {};	//set to empty hash map
	Point.__nextId = 1;		//set to first available integer
};

//static calls:
Point.reset();

//class Point declaration:
//class creates Point
//input(s):
//	ES 2017-12-22 (b_02): introduce new func argument 'storeUsingContent:
//	storeUsingContent: (boolean) should point and dimensions be wrapped inside
//			content objects, or stored like regular js object types. Default: true.
//output(s): (none)
function Point(storeUsingContent){
	//id
	this._id = Point.__nextId++;
	//store this object inside library
	Point.__library[this._id] = this;
	//ES 2017-12-22 (b_02): set flag that determines whether point and dimensions
	//	are wrapped in content or not
	this._storeViaContent = (typeof storeUsingContent == "undefined" || storeUsingContent == null) ? true : false;
	//ES 2017-12-22 (b_02): init X and Y fields as non-content-based values
	this._x = 0;
	this._y = 0;
	//ES 2017-12-22 (b_02): if using content-based value storing
	if( this._storeViaContent ) {
		//create X coordinate for point
		this._x = new content(
			type.__library["integer"],
			0
		);
		//create Y coordinate for point
		this._y = new content(
			type.__library["integer"],
			0
		);
	}	//ES 2017-12-22 (b_02): end if using content-based value storing
};	//end Point ctor


//method for converting datetime to text string
//input(s): (none)
//output(s):
//	(text) => text representation of datetime object
Point.prototype.toString = function(){
	//format: ( {x} , {y} )
	return	"(" + this._x._value + " , " + this._y._value + ")";
};	//end method 'toString'

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Point.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.POINT;
}

//comparison method
//input(s):
//	anotherFp: (fileProp) fileProp to compare with
//output(s):
//	(boolean) => {true} if this fileProp is equal to {anotherFp}; {false} otherwise
Point.prototype.isEqual = function(anotherFp){
	//make sure that {anotherFp} is not null
	if( typeof anotherFp != "object" || anotherFp == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherFp}
	if( this.getTypeName() != anotherFp.getTypeName() ){
		return false;
	}
	//compare internal fields
	return	this._x._value == anotherFp._x._value &&
			this._y._value == anotherFp._y._value;
};	//end method 'isEqual'