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
//	parent: (canvasElement / NULL) outter element that surrounds this one, providing such element exists (otherwise, NULL)
//	drawFuncArr: (Array<Func Ptr>) array of function pointers to draw on this parsing object on the canvas
//output(s): (none)
function canvasElement(x, y, width, height, type, obj, symbList, parent, drawFuncArr) {
	//id
	this._id = canvasElement.__nextId++;
	//assign fields
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this._type = type;
	this.obj = obj;
	this._parent = parent;
	this._drawFuncPtrArr = drawFuncArr;
	//split comma-separated list into array of symbols
	this._symbArr = symbList == null ? [] : symbList.split(',');
	//if this canvas element has associated object
	if( obj != null ) {
		//reference canvas element from within parsing entity
		obj._canvasElemRef = this;
	}
	//rotation degree
	this._angleRot = null;
	//pivot point for rotation
	this._pivorRot = null;
	//incoming connections (array of canvasElements that represent connecting arrows)
	this._inCons = [];
	//outgoing connections (similar array as incoming connections)
	this._outCons = [];
};	//end ctor

//does this canvas element contain point (X,Y) inside its border or not
//input(s):
//	x, y: (number) x- and y-coordinates of point that is checked
//output(s):
//	(boolean) => TRUE if point is contained, FALSE otherwise
canvasElement.prototype.isPointContained = function(x, y) {
	//compute difference between given (X,Y) point and left-top corner of element
	var dx = x - this.x, dy = y - this.y;
	//return TRUE if DX and DY are greater than 0 and less than width and height
	//	which would indicate that point is inside borders of canvas element
	return dx > 0 && dy > 0 && dx < this.width && dy < this.height;
};	//end method 'isPointContained'

//add transformation operation for this canvas element
//input(s):
//	type: (CANVAS_TRANSFORM_OPS_TYPE) type of operation
//	val: (js Object) 
//		=> {X,Y} - associative array that indicates X- and Y-displacements
//		=> DEGREE - rotation degree
//output(s): (none)
canvasElement.prototype.setTransformOp = function(type, val) {
	//if operation is rotation
	if( type.value == CANVAS_TRANSFORM_OPS_TYPE.ROTATE.value ) {
		//set rotation angle
		this._angleRot = val.angle;
		//set pivot point
		this._pivorRot = {"x" : val.pivot.x, "y": val.pivot.y};
	//else, if operation is translation
	} else if( type.value == CANVAS_TRANSFORM_OPS_TYPE.TRANSLATE.value ) {
		//adjust given X- and Y-displacement by existed translation amount
		this.x += val.x;
		this.y += val.y;
	}	//end if operation is rotation
};	//end method 'setTransformOp'

//get type name of this object
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
canvasElement.prototype.getTypeName = function() {
	return RES_ENT_TYPE.CANVAS_ELEM;
};	//end function 'getTypeName'

//convert object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation of this object
canvasElement.prototype.toString = function() {
	return "{CANVAS_ELEM: id = " + this._id + ", x = " + this.x + ", y = " + 
			this.y + ", width = " + this.width + ", height = " + this.height + 
			(typeof this._obj == "object" ? (", " + this._obj._id) : "") + "}";
};	//end function 'toString'

//compare this canvas element with another
//input(s): (none)
//output(s):
//	(boolean) => TRUE if this matches given object, otherwise FALSE
canvasElement.prototype.isEqual = function(other) {
	//if other object exists and is not null
	if( typeof other != "undefined" && other != null ) {
		//if other object is canvas element
		if( other.getTypeName() == this.getTypeName() ) {
			//compare ids and if they are equal return TRUE
			return this._id == other._id;
		}
	}	//end if other object exists and is not null
	//otherwise, it is invalid object, so fail
	return false;
};	//end function 'isEqual'