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
	for( var idx = 0; idx < o._value.length; idx++ ){
		//check if current character is not a digit
		if( !(o._value[idx] >= '0' && o._value[idx] <= '9') ){
			//quit loop
			break;
		}
		//add converted integer representation to result
		res = 10 * res + ( o._value[idx].charCodeAt() - '0'.charCodeAt() );
	}	//end loop thru characters of text string
	//return resulting integer
	return new content(
		type.__library["integer"],
		res
	);
};	//end method 'text2int'

//convert text to a real, when it is possible (i.e. if there are digit
//	characters in the text string)
//input(s):
//	o: (content:text) object for conversion
//output(s):
//	(content:real) => resulting object after conversion
cast.prototype.txt2real = function(o){
	//init real variable
	var res = 0;
	//init flag: do process digits before floating point -- integer piece
	var doInt = true;
	//init floating point factor
	var fpFactor = 0;
	//loop thru characters of given text string
	for( var idx = 0; idx < o._value.length; idx++ ){
		//check if current character is not a digit AND is not floating point
		if( !(o._value[idx] >= '0' && o._value[idx] <= '9' && o._value[idx] != '.') ){
			//quit loop
			break;
		//if current character is a floating point
		} else if( o._value[idx] == '.' ){
			//change flag for processing digits after floating point
			doInt = false;
			//start next loop iteration right away
			continue;
		}	//end if current character is not a digit AND is not floating point
		//if this is a digit after floating point
		if( doInt == false ){
			//increase floating point factor
			fpFactor++;
			//check if we passed max real precision
			if( fpFactor > cast.__realPrecision ){
				//quit loop
				break;
			}	//end if passed max real precision
		}	//end if this is a digit after floating point
		//add converted real representation to result
		res = 10 * res + ( o._value[idx].charCodeAt() - '0'.charCodeAt() );
	}	//end loop thru characters of text string
	//convert to floating point
	res /= Math.pow(10, fpFactor);
	//return resulting real
	return new content(
		type.__library["real"],
		res
	);
};	//end method 'text2real'

//convert text to a boolean, when it is possible (i.e. if there is 'true', 'false', '1', or '0')
//input(s):
//	o: (content:text) object for conversion
//output(s):
//	(content:boolean) => resulting object after conversion
//	(content:boolean:false) => if there is nothing similar
cast.prototype.txt2bool = function(o){
	//init boolean variable
	var res = false;
	//check if text string (all lower case, so 'TruE' is same as 'tRUe' ...) begins with 'true'
	if( o._value.toLowerCase().indexOf('true') || o._value[0] == '1' ){
		//change result
		res = true;
	}
	//return resulting object
	return new content(
		type.__library["boolean"],
		res
	);
};	//end method 'text2bool'

//-------------real-------------//

//convert real to integer
//input(s):
//	o: (content:real) object for conversion
//output(s):
//	(content:integer) => resulting object after conversion
cast.prototype.real2int = function(o){
	//convert real to string
	var txt = o._value.toString();
	//extract substring before floating point and return integer converted from that substring
	return new content(
		type.__library["integer"],
		txt.substring(0, txt.indexOf('.'))
	);
};	//end method 'real2int'

//convert real to text
//input(s):
//	o: (content:real) object for conversion
//output(s):
//	(content:text) => resulting object after conversion
cast.prototype.real2txt = function(o){
	//return converted real to text string
	return new content(
		type.__library["text"],
		o._value.toString()
	);
};	//end method 'real2txt'

//convert real to boolean, i.e. if integer piece is 0 => false; otherwise, true
//input(s):
//	o: (content:real) object for conversion
//output(s):
//	(content:boolean) => resulting object after conversion
cast.prototype.real2bool = function(o){
	//converted real to text string
	var tmpTxt = o._value.toString();
	//convert to integer
	var tmpInt = tmpTxt.substring(0, tmpTxt.indexOf('.'));
	//return boolean
	return new content(
		type.__library["boolean"],
		tmpInt != 0	//if not zero => true; otherwise, false
	);
};	//end method 'real2bool'

//-----------integer------------//

//convert integer to real
//input(s):
//	o: (content:integer) object for conversion
//output(s):
//	(content:real) => resulting object after conversion
cast.prototype.int2real = function(o){
	//return real
	return new content(
		type.__library["real"],
		o._value * 1.0		//change integer to real
	);
};	//end method 'int2real'

//convert integer to text
//input(s):
//	o: (content:integer) object for conversion
//output(s):
//	(content:text) => resulting object after conversion
cast.prototype.int2txt = function(o){
	//return converted integer to text string
	return new content(
		type.__library["text"],
		o._value.toString()
	);
};	//end method 'int2txt'

//convert integer to boolean, i.e. if given integer is 0 => false; otherwise, true
//input(s):
//	o: (content:integer) object for conversion
//output(s):
//	(content:boolean) => resulting object after conversion
cast.prototype.int2bool = function(o){
	//return boolean
	return new content(
		type.__library["integer"],
		o._value != 0	//if not zero => true; otherwise, false
	);
};	//end method 'int2bool'

//-----------boolean------------//

//convert boolean to integer, i.e. if given boolean is false => 0; otherwise, 1
//input(s):
//	o: (content:boolean) object for conversion
//output(s):
//	(content:integer) => resulting object after conversion
cast.prototype.bool2int = function(o){
	//return integer
	return new content(
		type.__library["integer"],
		o._value ? 1 : 0	//if true => 1; otherwise, 0
	);
};	//end method 'bool2int'

//convert boolean to real, i.e. if given boolean is false => 0.0; otherwise, 1.0
//input(s):
//	o: (content:boolean) object for conversion
//output(s):
//	(content:real) => resulting object after conversion
cast.prototype.bool2real = function(o){
	//return real
	return new content(
		type.__library["real"],
		o._value ? 1.0 : 0.0	//if true => 1.0; otherwise, 0.0
	);
};	//end method 'bool2real'

//convert boolean to text
//input(s):
//	o: (content:boolean) object for conversion
//output(s):
//	(content:text) => resulting object after conversion
cast.prototype.bool2txt = function(o){
	//return text
	return new content(
		type.__library["text"],
		o._value ? "true" : "false"
	);
};	//end method 'bool2real'

//-----------datetime------------//

//input(s):
//	o: (content:datetime) object for conversion
//output(s):
//	(content:text) => resulting object after conversion
cast.prototype.dt2txt = function(o){
	//return text representation of datetime
	return new content(
		type.__library["text"],
		o._value.toString()
	);
};	//end method 'dt2txt'

//input(s):
//	o: (content:text) object for conversion
//output(s):
//	(content:datetime) => resulting object after conversion
cast.prototype.txt2dt = function(o){
	//create datetime object
	var dt = new datetime();
	//return datetime after being setup from string
	return new content(
		type.__library["datetime"],
		dt.fromString(o)
	);
};	//end method 'txt2dt'