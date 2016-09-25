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

//convert text to an integer, when it is possible (i.e. if there are digit
//	characters in the text string)
//input(s):
//	o: (content:text) object for conversion
//output(s):
//	(content:integer) => resulting object after conversion
cast.prototype.txt2int = function(o){
	//init integer variable
	var res = 0;
	//loop thru characters of given text string
	for( var idx = 0; idx < o.length; idx++ ){
		//check if current character is not a digit
		if( !(o[idx] >= '0' && o[idx] <= '9') ){
			//quit loop
			break;
		}
		//add converted integer representation to result
		res = 10 * res + ( o[idx].charCodeAt() - '0'.charCodeAt() );
	}	//end loop thru characters of text string
	//return resulting integer
	return new content(
		type.__library["integer"],
		res
	);
};	//end method 'text2int'

//-------------real-------------//



//-----------integer------------//



//-----------boolean------------//


