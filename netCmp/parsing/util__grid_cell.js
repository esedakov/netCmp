/**
	Developer:	Eduard Sedakov
	Date:		2017-12-21
	Description:	grid cell
	Used by: util__grid.js
	Depends on:	(none)
**/

//==========globals:==========

//unique identifier assigned to each grid cell
GridCell.__nextId;

//store created grid cell instances in library indexed by their respective id
//	key: unique grid cell id
//	value: grid cell instance
GridCell.__library;

//==========statics:==========

//reset/initialize static data members
//input(s): (none)
//output(s): (none)
GridCell.reset = function() {
	GridCell.__nextId = 1;
	GridCell.__library = {};
};	//end function 'reset'

//initialize grid cell global parameters
GridCell.reset();

//class Grid Cell declaration:
//grid cell accumulates canvas elements that physically happen to occupy space that
//	belongs to this cell
//input(s):
//	gr: (Grid) reference to grid object that contains this cell
//output(s): (none)
function GridCell(gr) {
	//assign id
	this._id = GridCell.__nextId++;
	//store this cell in grid cell library
	GridCell.__library[this._id] = this;
	//init array of elements that belong to this cell
	this._entries = [];
	//assign grid reference
	this._grid = gr;
};	//end constructor for GridCell

//convert grid cell to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
GridCell.prototype.toString = function() {
	//init resulting string
	var res = "GridCell: {id = " + this._id + ", <" + this._entries.length + "> = [";
	//get array of object indexes and add it as comma-separated string to result
	res += this.getObjIndexes(true, " => ", null).join(", ");
	//return string representation
	return res + "]}";
};	//end method 'toString'

//get array of objects' indexes stored in this cell
//input(s):
//	doIncludeUnkown: (boolean) should those entries that are not from NetCMP be included in resulting set
//	sep: (text) separator symbol between entity type and entity id
//	pos: (Point) optional-argument that is non-content-based Point position, where to find selected objects
//				If not used, then pass in NULL.
//output(s):
//	(array<string>) => array of object indexes representing those objects that are stored in this cell
GridCell.prototype.getObjIndexes = function(doIncludeUnkown, sep, pos) {
	//init resulting array of indexes
	var res = [];
	//loop thru grid cell entries
	for( var i = 0; i < this._entries.length; i++ ) {
		//get currently iterated entry
		var tmpEntry = this._entries[i];
		//try to get object location (left-top and right-bottom points)
		var tmpObjLocArr = this._grid.getObjLocation(tmpEntry);
		//if position is given
		if( pos != null ) {
			//determine X- and Y-displacement of given position from top-left corner
			var tmpOffX = pos._x - tmpObjLocArr[0]._x;
			var tmpOffY = pos._y - tmpObjLocArr[0]._y;
			//determine width and height of bounding box
			var tmpWidth = tmpObjLocArr[1]._x - tmpObjLocArr[0]._x;
			var tmpHeight = tmpObjLocArr[1]._y - tmpObjLocArr[0]._y;
			//if position is not inside bounding box
			if( tmpOffX < 0 || tmpOffX > tmpWidth || tmpOffY < 0 || tmpOffY > tmpHeight ) {
				//skip this object
				continue;
			}	//end if position is not inside bounding box
		}	//end if position is given
		//if this is object AND its function set has 'getTypeName' method AND it has identifier
		if( typeof tmpEntry == "object" && typeof tmpEntry.getTypeName !== "undefined" && 
			typeof tmpEntry._id !== "undefined"
		) {
			//assign entity name
			var tmpStrRep = tmpEntry.getTypeName().name;
			//add id
			tmpStrRep += sep + tmpEntry._id.toString();
			//add this entry to resulting array
			res.push(tmpStrRep);
		//else, this is not NetCMP entity type
		} else if( doIncludeUnkown ) {
			//specify that this is unkown type and try to print it in standard way
			res.push("UNKOWN" + sep + tmpEntry.toString());
		}	//end if this is object AND has 'getTypeName' method
	}	//end loop thru grid cell entries
	//return resulting array of indexes
	return res;
};	//end method 'getObjIndexes'

//get type name of this object
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
GridCell.prototype.getTypeName = function() {
	return RES_ENT_TYPE.GRID_CELL;
};	//end method 'getTypeName'

//compare this and the other grid cells (compare grid cell ids)
//input(s):
//	anotherCell: (GridCell) grid cell instance
//output(s):
//	(boolean) => TRUE if grid cells are equal, and FALSE otherwise
GridCell.prototype.isEqual = function(anotherCell) {
	//make sure that another object is not null
	if( anotherCell !== null ) {
		//make sure that this and another objects are of the same entity type
		if( this.getTypeName() == anotherCell.getTypeName() ) {
			//compare objects based on their ids
			return this._id == anotherCell._id;
		}	//end if this and another objects are of the same entity type
	}	//end if another object is not null
	//otherwise, return false
	return false;
};	//end method 'isEqual'
