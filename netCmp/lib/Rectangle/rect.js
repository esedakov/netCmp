/**
	Developer:	Eduard Sedakov
	Date:		2017-12-14
	Description:	library for rectangle type
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created rectangles, indexed by their corresponding ids:
//	key: rectangle id
//	value: rectangle object
Rect.__library = {};

//unique identifier used by rectangle
Rect.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Rect.reset = function() {
	Rect.__library = {};	//set to empty hash map
	Rect.__nextId = 1;		//set to first available integer
};

//static calls:
Rect.reset();

//class Rectangle declaration:
//class creates Rectangle
//input(s):
//	storeUsingContent: (boolean) should point and dimensions be wrapped inside
//			content objects, or stored like regular js object types
//output(s): (none)
function Rect(storeUsingContent){
	//id
	this._id = Rect.__nextId++;
	//store this object inside library
	Rect.__library[this._id] = this;
	//set flag that determines whether point and dimensions are wrapped in content or not
	this._storeViaContent = storeUsingContent;
	//init top-left vertex (i.e. Point)
	this._lt = null;
	//init dimensions parameters: width and height
	this._width = 0;
	this._height = 0;
	//if using content
	if( this._storeViaContent ) {
		//setup parameters using content objects
		this._lt = new content(
			type.__library["point"],
			new Point()
		);
		this._width = new content(
			type.__library["integer"],
			0
		);
		this._height = new content(
			type.__library["integer"],
			0
		);
	//else, do not wrap values inside content objects, simply use js types
	} else {
		this._lt = new Point();
	}	//end if using content
};	//end Rectangle ctor


//method for converting rectangle to text string
//input(s): (none)
//output(s):
//	(text) => text representation of rectangle object
Rect.prototype.toString = function(){
	//init references to values of left-top point, width, and height
	var tmpLT = this._lt;
	var tmpW = this._width;
	var tmpH = this._height;
	//if using content
	if( this._storeViaContent ) {
		//reset references to values of left-top, width, and height
		tmpLT = this._lt._value;
		tmpW = this._width._value;
		tmpH = this._height._value;
	}
	//format: ( 'lt': POINT, 'width': INT, 'height': INT )
	return	"( lt: " + tmpLT.toString() + " , width: " + tmpW + " , height: " + tmpH + " )";
};	//end method 'toString'

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Rect.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.RECT;
};	//end method 'getTypeName'

//comparison method
//input(s):
//	anotherRect: (Rect) another rectangle to compare with
//output(s):
//	(boolean) => {true} if this rectangle is equal to {anotherRect}; {false} otherwise
Rect.prototype.isEqual = function(anotherRect){
	//make sure that {anotherRect} is not null
	if( typeof anotherRect != "object" || anotherRect == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherRect}
	if( this.getTypeName() != anotherRect.getTypeName() ){
		return false;
	}
	//if using content
	if( this._storeViaContent ) {
		return this._lt._value.isEqual(anotherRect._lt._value) &&
			this._width._value == anotherRect._width._value &&
			this._height._value == anotherRect._height._value;
	}	//end if using content
	//compare internal fields like regular js objects (since no content wrapper is used)
	return	this._lt.isEqual(anotherRect._lt) &&
			this._width == anotherRect._width &&
			this._height == anotherRect._height;
};	//end method 'isEqual'