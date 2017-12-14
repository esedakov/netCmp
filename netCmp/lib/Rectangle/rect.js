/**
	Developer:	Eduard Sedakov
	Date:		2017-12-14
	Description:	library for rectangle type
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created rectangles, indexed by their corresponding ids:
//	key: rectangle id
//	value: rectangle object
Rect.__library = {};

//unique identifier used by rectangle
Rect.__nextId = 1;
