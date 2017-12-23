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
