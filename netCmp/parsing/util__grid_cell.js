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
