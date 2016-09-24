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
//input(s): (none)
//output(s): (none)
function Point(){
	//id
	this._id = Point.__nextId++;
	//store this object inside library
	Point.__library[this._id] = this;
	//create X coordinate for point
	this._x = 0;
	//create Y coordinate for point
	this._y = 0;
};	//end Point ctor