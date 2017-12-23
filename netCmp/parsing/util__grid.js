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
