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
