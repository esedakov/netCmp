/**
	Developer:	Eduard Sedakov
	Date:		2017-12-21
	Description:	grid that is used for organizing canvas elements stored in canvas map
	Used by: (viz)
	Depends on:	util__grid_cell.js
**/

//==========globals:==========

//side size (width = height) for the grid cell in pixels/units
Grid.__cellSize;

//==========statics:==========

//reset/initialize static data members
//input(s): (none)
//output(s): (none)
Grid.reset = function() {
	Grid.__cellSize = 100;
};	//end function 'reset'

//initialize grid global parameter(s)
Grid.reset();

//class Grid declaration:
//grid is as of now used solely for more optimized way of organizing and storing
//	canvas elements on the canvas map inside application view.
//input(s): (none)
//output(s): (none)
function Grid() {
	//initialize empty list of grid cells
	//	Note 1: storing only non-empty cells (initially no cells at all)
	//	Note 2: this is an associative array, where key is location string of cell, of
	//		the following format: "x1y45" to represent cell on row 45 and column 1
	//	Note 3: column and row indexes start at 0, so first grid cell has address "x0y0"
	//	Note 4: all grid cells are of the same size, and they are squares, i.e. width=height
	this._cells = {};
	//counter for non-empty grid cells
	this._count = 0;
	//collect all objects that are currently stored in grid
	//	Note 1: this is also associative array, but a reverse of '_cells'
	//	Note 2: key is RES_ENT_TYPE.name+id (e.g. COMMAND31) and value is also associative
	//		array with two fields: 'obj' => this object stored in grid, and 'cell' is an array
	//		of 2 points ('top-left' and 'bottom-right') cell addresses that make up bounding
	//		box for the region of cells that contain this object
	//	Note 3: this is an example record:
	//		_objects[COMMAND123] = {
	//			"obj": <command id=123 object reference>,
	//			"cell": ['x0y0', 'x0y5']
	//		}
	this._objects = {};
	//width of grid in number of cells
	this._width = 0;
	//height of grid in number of cells
	this._height = 0;
};	//end constructor for Grid

//generate string representation for object
//input(s):
//	obj: (netcmp object) object that is supported netcmp type
//output(s):
//	(string) => object's index into '_objects' associative array
Grid.prototype.getObjIdx = function(obj) {
	//if given object is from netcmp project
	if( typeof obj == "object" && typeof obj.getTypeName == "function" && typeof obj._id !== "undefined" ) {
		//return object index
		return obj.getTypeName() + obj._id;
	}	//end if given object is from netcmp project
	//otherwise, return NULL indicating that it is not netcmp supported object
	return null;
};	//end method 'getObjIdx'

//check if object is inside grid
//input(s):
//	obj: (netcmp object) object that is supported netcmp type
//output(s):
//	(string) => i++f object is inside, then key of this object into '_objects' array
//	NULL => if object does not exist
Grid.prototype.isInside = function(obj) {
	//get object index
	var tmpObjIdx = this.getObjIdx(obj);
	//if it is netcmp supported object
	if( tmpObjIdx != null ) {
		//check and return
		return tmpObjIdx in this._objects ? tmpObjIdx : null;
	}	//end if it is netcmp supported object
	//otherwise, there is no such object
	return null;
};	//end method 'isInside'

//create cell address string
//input(s):
//	x: (number) x-index of the cell
//	y: (number) y-index of the cell
//output(s):
//	(string) => cell address string
Grid.prototype.getAddrStr = function(x, y) {
	return "x" + x.toString() + "y" + y.toString();
};	//end method 'getAddrStr'

//does the cell exist, i.e. is it within boundaries of grid
//input(s):
//	x: (number) x-index of the cell
//	y: (number) y-index of the cell
//output(s):
//	(boolean) => TRUE if cell exists, FALSE if it is outside of grid boundaries
Grid.prototype.isCellExist = function(x, y) {
	return x >= 0 && x < this._width && y >= 0 && y < this._height;
};	//end method 'isCellExist'

//get cell that has specified position
//input(s):
//	pos: (Poiny) non-content-based Point position
//output(s):
//	(string) => if cell is non-empty, then cell's key into '_cells' associative array
//	NULL => if cell is empty or does not exist
Grid.prototype.getCell = function(pos) {
	//determine X and Y indexes for cell address
	var tmpCellX = Math.floor(pos._x / Grid.__cellSize);
	var tmpCellY = Math.floor(pos._y / Grid.__cellSize);
	//create cell address string
	var tmpAddrStr = this.getAddrStr(tmpCellX, tmpCellY);
	//if this cell exists and not empty
	if( this.isCellExist(x, y) && tmpAddrStr in this._cells ) {
		//return cell string
		return tmpAddrStr;
	}	//end if this cell exists and non empty
	//otherwise, cell does not exist OR it is empty, so return NULL
	return null;
};	//end method 'getCell'