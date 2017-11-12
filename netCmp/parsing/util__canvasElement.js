/**
	Developer:		Eduard Sedakov
	Date:			2017-11-09
	Description:	drawn element on Canvas
	Used by:		(viz)
	Dependencies:	scope, block, command, symbol
**/

//==========globals:==========

//unique identifier counter
canvasElement.__nextId = 1;

//==========statics:==========

//reset static variable(s)
//input(s): (none)
//output(s): (none)
canvasElement.reset = function() {
	canvasElement.__nextId = 1;
};	//end function 'reset'

//class Canvas Element declaration:
//This class represent CFG object (scope, block, command, symbol), when it is
//	drawn inside Canvas environment. It is solely used for Canvas, since SVG
//	approach (which is used inside JointJS) has its own internal data structures
//	that keep track of each object's position.
//input(s):
//	x: (number) x-coordinate of top-left corner
//	y: (number) y-coordinate of top-left corner
//	width: (number) width of axis-aligned bounding box
//	height: (number) height of axis-aligned bounding box
//	type: (RES_ENT_TYPE) object's type: scope, block, command, symbol
//	obj: (js Object) associated object
//	symbList: (string) comma-separated string of symbols that is associated with this object.
//						It is essentially used to describe symbols attached to commands.
//output(s): (none)
function canvasElement(x, y, width, height, type, obj, symbList) {
	//id
	this._id = canvasElement.__nextId++;
	//assign fields
	this._x = x;
	this._y = y;
	this._width = width;
	this._height = height;
	this._type = type;
	this._obj = obj;
	//split comma-separated list into array of symbols
	this._symbArr = symbList.split(',');
};	//end ctor
