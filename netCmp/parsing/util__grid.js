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
		return obj.getTypeName().name + obj._id;
	}	//end if given object is from netcmp project
	//otherwise, return NULL indicating that it is not netcmp supported object
	return null;
};	//end method 'getObjIdx'

//get object location
//input(s):
//	obj: (netcmp object) object that is supported netcmp type for which determining location
//output(s):
//	[Left-Top-position, Right-Bottom-position] - array that contains two corners of bounding box
//	NULL - if object was not found
Grid.prototype.getObjLocation = function(obj) {
	//get object index
	var tmpObjIdx = this.getObjIdx(obj);
	//init result
	var res = null;
	//if object was found
	if( tmpObjIdx != null ) {
		//assign result
		res = this._objects[tmpObjIdx].cell;
	}	//end if object was found
	//return resulting array OR null (depending on whether found object OR not)
	return res;
};	//end method 'getObjLocation'

//check if object is inside grid
//input(s):
//	obj: (netcmp object) object that is supported netcmp type
//output(s):
//	(string) => if object is inside, then key of this object into '_objects' array
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
	if( this.isCellExist(tmpCellX, tmpCellY) && tmpAddrStr in this._cells ) {
		//return cell string
		return tmpAddrStr;
	}	//end if this cell exists and non empty
	//otherwise, cell does not exist OR it is empty, so return NULL
	return null;
};	//end method 'getCell'

//get array of object(s) at the specified position
//input(s):
//	pos: (Point) non-content-based Point position
//output(s):
//	(Array<string>) => array of string(s), where each represents object's key into '_objects' array
Grid.prototype.getObjectsByPos = function(pos) {
	//get cell index for the given positioon
	var tmpAddrStr = this.getCell(pos);
	//return array of object indexes
	var tmpCellObjs = this.getObjectsByCellIndex(tmpAddrStr);
	//init resulting array
	var res = [];
	//loop thru object indexes
	for( var tmpIdx = 0; tmpIdx < tmpCellObjs.length; tmpIdx++ ) {
		//get bounding rectangle around currently iterated object
		var tmpBRect = this._objects[tmpCellObjs[tmpIdx]].cell;
		//if currently iterated object contains given position
		if( tmpBRect[0]._x < pos._x && tmpBRect[1]._x > pos._x &&
			tmpBRect[0]._y < pos._y && tmpBRect[1]._y > pos._y ) {
			//add this object to resulting array
			res.push(tmpCellObjs[tmpIdx]);
		}	//end if currently iterated object contains given position
	}	//end loop thru object indexes
	//return resulting array of indexes
	return res;
};	//end method 'getObjectsByPos'

//get object given type and id
//input(s):
//	type: (RES_ENT_TYPE) object type
//	id: (number) object id
//output(s):
//	(netcmp object) => object with specified id and type, providing it exists
//	NULL => if no such object exists
Grid.prototype.getObjectById = function(type, id) {
	//get object index
	var tmpObjIdx = this.getObjIdx({
		"getTypeName" : function() { return type; },
		"_id": id
	});
	//init resulting variable
	var res = null;
	//if such object exists
	if( tmpObjIdx in this._objects ) {
		//get object and assign it to result
		res = this._objects[tmpObjIdx].obj;
	}	//end if such object exists
	//return result
	return res;
};	//end method 'getObjectById'

//get array of object(s) at the given cell
//input(s):
//	cidx: (string) cell index into '_cell' associative array, which can be acquired from 'getCell' method
//	pos: (Point) optional argument that is non-content-based Point position, at which to select objects
//				If not used, then pass in NULL.
//output(s):
//	(Array<string>) => array of string(s), where each represents object's key into '_objects' array
Grid.prototype.getObjectsByCellIndex = function(cidx, pos) {
	//init resulting array of object indexes
	var res = [];
	//if cell has objects
	if( cidx != null ) {
		//get array of entry indexes that represent those objects that stored inside this grid cell
		//	Note: do not include non=NetCMP types and no separator between entity type and entity id
		res = this._cells[cidx].getObjIndexes(false, "", pos);
	}	//end if cell has objects
	//return array of object indexes
	return res;
};	//end method 'getObjectsByCellIndex'

//add object to grid
//input(s):
//	obj: (netcmp object) object that is supported netcmp type
//	dim: (Rect) dimensions of given object (it is non-content-based rectangle)
//output(s):
//	(string) => this object's key into '_objects' associative array
//	NULL => if this object has been added before
Grid.prototype.insert = function(obj, dim) {
	//resulting output
	var res = null;
	//if this object has not been added yet
	if( obj != null &&  this.isInside(obj) == null ) {
		//if object to be added is scope
		if( obj.getTypeName() == RES_ENT_TYPE.SCOPE ) {
			//skip this object, most of them are large and some (like Global Scope)
			//	occupy an entire canvas map space, so it will not be practical
			//	to insert it, since it will cause huge time delay and memory burden.
			return res;
		}	//end if object to be added is scope
		//create bottom-right point
		var tmpBR = new Point();
		//set X and Y components for bottom-right point
		tmpBR._x = dim._lt._x + dim._lt._width;
		tmpBR._y = dim._lt._y + dim._lt._height;
		//create info set for newly added object
		var tmpObjInfo = {
			"obj": obj,
			"cell": [dim._lt, tmpBR]
		};
		//generate object index string
		res = obj.getTypeName() + obj._id;
		//include this object information set into collection
		this._objects[res] = tmpObjInfo;
		//loop thru cell rows, which this object occupies
		for( var y = dim._lt._y; y < tmpBR._y; y++ ) {
			//loop thru cells of current row
			for( var x = dim._lt._x; x < tmpBR._x; x++ ) {
				//generate cell address string
				var tmpCellAddr = this.getAddrStr(x, y);
				//if this cell does not exist
				if( !(tmpCellAddr in this._cells) ) {
					//create new cell at this address
					this._cells[tmpCellAddr] = new GridCell();
					//increment non-empty cell counter
					this._count++;
					//if this cell extends beyond grid width
					if( x >= this._width ) {
						//update width
						this._width = x + 1;
					}	//end if this cell extends beyond grid width
					//if this cell extends beyond grid height
					if( y >= this._height ) {
						//update height
						this._height = y + 1;
					}	//end if this cell extends beyond grid height
				}	//end if this cell does not exist
				//add object to the cell's entry array
				this._cells[tmpCellAddr]._entries.push(obj);
			}	//end loop thru cells of current row
		}	//end loop thru cell rows, which this object occupies
	}	//end if this object has not been added yet
	return res;
};	//end method 'insert'

//change position and/or dimensions of processed object
//input(s):
//	obj: (netcmp object) object that is supported netcmp type
//	dim: (Rect) dimensions of given object (it is non-content-based rectangle)
//output(s):
//	(string) => this object's key into '_objects' associative array
//	NULL => if this object has not been found in grid
Grid.prototype.change = function(obj, dim) {
	//get object index
	var tmpObjIdx = this.getObjIdx(obj);
	//if object was successfully removed (i.e. it was present in grid)
	if( this.remove(tmpObjIdx) ) {
		//insert object and return its object index
		return this.insert(obj, dim);
	}	//end if object was successfully removed
	//otherwise, there was no object in grid, so return NULL
	return null;
};	//end method 'change'

//remove object from grid
//input(s):
//	objIdx: (string) object index that points at the object inside grid
//output(s):
//	(boolean) => TRUE if object was removed, FALSE if it was not found and thus no change is made
Grid.prototype.remove = function(objIdx) {
	//init resulting flag that indicates whether object was actually removed (true) or not (false)
	var res = false;
	//init flag that indicates whether any cell that was emptied out (if any) is located either on
	//	the right side OR at the bottom side of grid
	var tmpIsSideCellEmptiedOut = false;
	//if object actually exists in array
	if( objIdx in this._objects ) {
		//get object info
		var tmpObj = this._objects[objIdx];
		//remove this entry
		delete this._objects[objIdx];
		//get top-left and bottom-right points that make up bounding rectangle around cells to be updated
		var tmpTL = {
				'_x': Math.floor(tmpObj.cell[0]._x / Grid.__cellSize),
				'_y': Math.floor(tmpObj.cell[0]._y / Grid.__cellSize)
			};
			tmpBR = {
				'_x': Math.ceil(tmpObj.cell[1]._x / Grid.__cellSize),
				'_y': Math.ceil(tmpObj.cell[1]._y / Grid.__cellSize)
			};
		//loop thru cell rows
		for( var y = tmpTL._y; y <= tmpBR._y; y++ ) {
			//loop thru cells in current row
			for( var x = tmpTL._x; x <= tmpBR._x; x++ ) {
				//generate cell address string
				var tmpAddrStr = this.getAddrStr(x, y);
				//if this cell exists and non-empty
				if( tmpAddrStr in this._cells ) {
					//get currently iterated cell
					var tmpCell = this._cells[tmpAddrStr];
					//find index for deleting object
					var tmpIdx = tmpCell._entries.indexOf(tmpObj.obj);
					//if object was found
					if( tmpIdx >= 0 ) {
						//delete this object
						tmpCell._entries.splice(tmpIdx, 1);
						//if cell became empty
						if( tmpCell._entries.length == 0 ) {
							//remove this cell from collection of cells
							delete this._cells[tmpAddrStr];
							//decrement non-empty cell counter
							this._count--;
							//if this cell is at the right or bottom side of grid
							if( x == (this._width - 1) || y == (this._height - 1) ) {
								//assert flag
								tmpIsSideCellEmptiedOut = true;
							}	//end if this cell is at the right or bottom side of grid
						}	//end if cell became empty
						//assert flag indicating that object was indeed removed
						res = true;
					}	//end if object was found
				}	//end if this cell exists and non-empty
			}	//end loop thru cells in current row
		}	//end loop thru cell rows
	}	//end if object actually exists in array
	//if need to update size of grid
	if( tmpIsSideCellEmptiedOut ) {
		//init info sets for grid sides to check
		var tmpSideSets = [{x: -1, y: this._height}, {x: this._width, y: -1}];
		//loop thru grid side info sets
		for( var tmpSideSetIdx = 0; tmpSideSetIdx < tmpSideSets.length; tmpSideSetIdx++ ) {
			//get info set for this side
			var tmpSideInfo = tmpSideSets[tmpSideSetIdx];
			//is this right side (TRUE) or bottom side (FALSE)
			var tmpIsRightSide = tmpSideInfo.y < 0;
			//determine max side size
			var tmpSideSize = Math.max(tmpSideInfo.x, tmpSideInfo.y);
			//is side completely empty
			var tmpIsSideEmpty = true;
			//loop thru cells belonging to side of the grid
			for( var i = 0; i < tmpSideSize; i++ ) {
				//generate cell address
				var tmpAddrStr = this.getAddrStr(
					//x-coordinate changes for bottom side
					tmpIsRightSide ? (tmpSideSize - 1) : i,
					//y-coordinate changes for right side
					tmpIsRightSide ? i : (tmpSideSize - 1)
				);
				//if currently iterated cell is not empty
				if( tmpAddrStr in this._cells ) {
					//de-assert: side is not empty
					tmpIsSideEmpty = false;
					//quit loop
					break;
				}	//end if currently iterated cell is not empty
			}	//end loop thru grid side
			//if side is empty
			if( tmpIsSideEmpty ) {
				//if it is right side that gets updated
				if( tmpIsRightSide ) {
					//decrease width by 1
					this._width--;
					//try to decrease width one column more
					tmpSideSets.push({x: this._width, y: -1});
				//else, it is bottom side that gets updated
				} else {
					//decrease height by 1
					this._height--;
					//try to decrease height one row more
					tmpSideSets.push({x: -1, y: this._height});
				}	//end if right side is updated
			}	//end if side is empty
		}	//end loop thru grid side info sets
	}	//end if need to update size of grid
	//return resulting flag
	return res;
};	//end method 'remove'

//remove all objects stored at the specified cell
//input(s):
//	cidx: (string) cell index into '_cell' associative array, which can be acquired from 'getCell' method
//output(s):
//	(boolean) => TRUE if cell was found and was not empty, FALSE otherwise
Grid.prototype.emptyOutCell = function(cidx) {
	//if this cell does not exist
	if( !(cidx in this._cells) ) {
		//return false to indicate that there is no such cell or it is empty
		return false;
	}	//end if this cell does not exist
	//get array of objects stored in this cell
	var tmpArrObjIdxs = this.getObjectsByCellIndex(cidx);
	//loop thru object indexes
	for( var i = 0; i < tmpArrObjIdxs.length; i++ ) {
		//get current object index
		var tmpCurIdx = tmpArrObjIdxs[i];
		//remove this object from grid
		this.remove(tmpCurIdx);
	}	//end loop thru object indexes
	//remove record for this cell, since it is now empty
	delete this._cells[cidx];
	//return true to indicate that this cell existed and it was emptied out
	return true;
};	//end method 'emptyOutCell'

//remove all objects in grid
//input(s): (none)
//output(s): (none)
Grid.prototype.removeAll = function() {
	//reset all grid data fields
	this._cells = {};
	this._objects = {};
	this._count = 0;
	this._width = 0;
	this._height = 0;
};	//end method 'removeAll'

//get entity type
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Grid.prototype.getTypeName = function() {
	return RES_ENT_TYPE.GRID;
};	//end method 'getTypeName'

//convert grid to string
//input(s): (none)
//output(s):
//	(string) => string representation of this grid
Grid.prototype.toString = function() {
	return "Grid: { number cells = " + this._count + ", width = " + this._width + ", height = " + this._height + "}";
};	//end method 'toString'
