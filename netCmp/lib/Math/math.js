/**
	Developer:	Eduard Sedakov
	Date:		2016-09-24
	Description:	library for component math
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store math reference in global variable
math.__instance = null;

//create math instance
math.getInstance = function(){
	//check if math instance does not exists
	if( math.__instance == null ){
		//create math instance
		math.__instance = new math();
	}
	//return math instance
	return math.__instance;
};	//end function 'getInstance'

//class Math declaration:
//class creates Math component
//input(s): (none)
//output(s): (none)
function math(){
	//nothing
};	//end File ctor

//-----------------constant-----------------//

//get PI constant
//input(s): (none)
//output(s):
//	(content:REAL) => PI constant
math.prototype.pi = function(){
	//return PI
	return new content(
		type.__library["real"],
		Math.PI
	);
};	//end method 'pi'

//-----------------exponent-----------------//

//raise number (ineger or real) to a given power
//input(s):
//	base: (content:INTEGER/REAL) base number to raise to a power
//	pwr: (content:INTEGER/REAL) power
//output(s):
//	(content:REAL) => resulting number after base has been raised to a specified power
math.prototype.power = function(base, pwr){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.pow(base._value, pwr._value)
	);
};	//end method 'power'

//calculate root from a given base
//input(s):
//	base: (content:INTEGER/REAL) base number, from which will calculate root
//output(s):
//	(content:REAL) => resulting root
math.prototype.sqrt = function(base){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.sqrt(base._value)
	);
};	//end method 'sqrt'

//calculate natural logarithm from a given number
//input(s):
//	n: (content:INTEGER/REAL) number, from which will calculate natural logarithm
//output(s):
//	(content:REAL) => resulting natural logarithm
math.prototype.log = function(n){
	//return content with result
	return new content(
		type.__library["real"],
		Math.log(n._value)
	);
};	//end method 'log'

//----------------arithmetic----------------//

//calculate absolute number
//input(s):
//	n: (content:INTEGER/REAL) number in question
//output(s):
//	(content:INTEGER/REAL) => absolute number
math.prototype.abs = function(n){
	//return content with result
	return new content(
		n._type,	//same type as a given number (real or integer)
		Math.abs(n._value)
	);
};	//end method 'abs'

//calculate floor of given number
//input(s):
//	n: (content:REAL) number in question
//output(s):
//	(content:INTEGER) => resulting floor for the given number
math.prototype.floor = function(n){
	//return content with result
	return new content(
		type.__library["integer"],
		Math.floor(n._value)
	);
};	//end method 'floor'

//calculate ceiling of given number
//input(s):
//	n: (content:REAL) number in question
//output(s):
//	(content:INTEGER) => resulting ceiling for the given number
math.prototype.ceil = function(n){
	//return content with result
	return new content(
		type.__library["integer"],
		Math.ceil(n._value)
	);
};	//end method 'ceil'

//find maximum number in the given array of numbers
//input(s):
//	a: (content:Array<REAL>) array of real numbers, where to find maximum
//output(s):
//	(content:REAL) => resulting maximum number
math.prototype.max = function(a){
	//initialize max to be first number in the array
	var tmpMax = a._value[0]._value;
	//loop thru remaining numbers in the array
	for( var idx = 0; idx < a._value.length; idx++ ){
		//if currently selected maximum is less then iterated number
		if( tmpMax < a._value[idx]._value ){
			//reset maximum
			tmpMax = a._value[idx]._value;
		}	//end if max is less then iterated number
	}	//end loop thru array of numbers to find maximum
	//return content with result
	return new content(
		type.__library["real"],
		tmpMax
	);
};	//end method 'max'

//find minimum number in the given array of numbers
//input(s):
//	a: (content:Array<REAL>) array of real numbers, where to find minimum
//output(s):
//	(content:REAL) => resulting minimum number
math.prototype.min = function(a){
	//initialize min to be first number in the array
	var tmpMin = a._value[0]._value;
	//loop thru remaining numbers in the array
	for( var idx = 0; idx < a._value.length; idx++ ){
		//if currently selected minimum is greater then iterated number
		if( tmpMin > a._value[idx]._value ){
			//reset minimum
			tmpMin = a._value[idx]._value;
		}	//end if min is less then iterated number
	}	//end loop thru array of numbers to find minimum
	//return content with result
	return new content(
		type.__library["real"],
		tmpMin
	);
};	//end method 'min'

//------------------random------------------//

//get random number from 0 to 1
//input(s): (none)
//output(s):
//	(content:REAL) => random number from 0 to 1
math.prototype.rand = function(){
	//return content with result
	return new content(
		type.__library["real"],
		Math.random()
	);
};	//end method 'rand'

//-----------------distance-----------------//

//calculate manhattan distance, given X and Y displacements
//input(s):
//	p1: (content:POINT) first point
//	p2: (content:POINT) second point
//output(s):
//	(content:INTEGER) => resulting manhattan distance
math.prototype.manhDistance = function(p1, p2){
	//measure x-displacement between two points (p1 and p2)
	var x = Math.abs(p1._x._value - p2._x._value);
	//measure y-displacement between two points (p1 and p2)
	var y = Math.abs(p1._y._value - p2._y._value);
	//return content with result
	return new content(
		type.__library["integer"],
		x + y
	);
};	//end method 'manhDistance'

//calculate euclidean distance, given X and Y displacements
//input(s):
//	x: (content:INTEGER/REAL) x displacement
//	y: (content:INTEGER/REAL) y displacement
//output(s):
//	(content:REAL) => resulting euclidean distance
math.prototype.euclDistance = function(x, y){
	//return content with result
	return new content(
		type.__library["real"],
		Math.sqrt(x._value * x._value + y._value * y._value)
	);
};	//end method 'euclDistance'

//---------------triginometry---------------//

//calculate cosine
//input(s):
//	dgr: (content:INTEGER/REAL) number of degrees, from which will calculate cosine
//output(s):
//	(content:REAL) => resulting cosine
math.prototype.cos = function(dgr){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.cos(dgr._value * Math.PI / 180)
	);
};	//end method 'cos'

//calculate arc-cosine
//input(s):
//	base: (content:INTEGER/REAL) number, from which will calculate arc-cosine
//output(s):
//	(content:REAL) => resulting arc-cosine
math.prototype.arccos = function(base){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.acos(base._value) * 180 / Math.PI
	);
};	//end method 'arccos'

//calculate sine
//input(s):
//	dgr: (content:INTEGER/REAL) number of degrees, from which will calculate sine
//output(s):
//	(content:REAL) => resulting sine
math.prototype.sin = function(dgr){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.sin(dgr._value * Math.PI / 180)
	);
};	//end method 'sin'

//calculate arc-sine
//input(s):
//	base: (content:INTEGER/REAL) number, from which will calculate arc-sine
//output(s):
//	(content:REAL) => resulting arc-sine
math.prototype.arcsin = function(base){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.asin(base._value) * 180 / Math.PI
	);
};	//end method 'arcsin'

//calculate tangent
//input(s):
//	dgr: (content:INTEGER/REAL) number of degrees, from which will calculate tangent
//output(s):
//	(content:REAL) => resulting tangent
math.prototype.tan = function(dgr){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.tan(dgr._value * Math.PI / 180)
	);
};	//end method 'tan'

//calculate arc-tangent
//input(s):
//	base: (content:INTEGER/REAL) number, from which will calculate arc-tangent
//output(s):
//	(content:REAL) => resulting arc-tangent
math.prototype.arctan = function(base){
	//return content with result
	return new content(
		type.__library["real"], 
		Math.atan(base._value) * 180 / Math.PI
	);
};	//end method 'arctan'