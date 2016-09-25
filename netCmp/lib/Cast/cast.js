/**
	Developer:	Eduard Sedakov
	Date:		2016-09-25
	Description:	library for cast operators
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store cast reference in global variable
cast.__instance = null;

//==========constants:===========

//real precision i.e. number of digits after floating point
cast.__realPrecision = 3;

//create cast instance
cast.getInstance = function(){
	//check if cast instance does not exists
	if( cast.__instance == null ){
		//create cast instance
		cast.__instance = new cast();
	}
	//return cast instance
	return cast.__instance;
};	//end function 'getInstance'

//class cast declaration:
//class creates cast component
//input(s): (none)
//output(s): (none)
function cast(){
	//nothing
};	//end File ctor

//-------------text-------------//


//-------------real-------------//



//-----------integer------------//



//-----------boolean------------//


