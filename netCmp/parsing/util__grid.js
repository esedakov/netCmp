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
