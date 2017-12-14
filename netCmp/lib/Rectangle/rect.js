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