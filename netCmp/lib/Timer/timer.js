/**
	Developer:	Eduard Sedakov
	Date:		2016-09-25
	Description:	library for timer
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created timers, indexed by their corresponding ids:
//	key: timer id
//	value: timer object
Timer.__library = {};

//unique identifier used by timer
Timer.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Timer.reset = function() {
	Timer.__library = {};	//set to empty hash map
	Timer.__nextId = 1;		//set to first available integer
};

//static calls:
Timer.reset();

//class Timer declaration:
//class creates Timer
//input(s): (none)
//	f: (content:text) => function name (global callback function), which will be called
//			when timer triggers
//	p: (content:integer) => timing interval in milliseconds
//output(s): (none)
function Timer(f, p){
	//id
	this._id = Timer.__nextId++;
	//store this object inside library
	Timer.__library[this._id] = this;
	//set function name
	this._name = f;
	//set timer period
	this._period = p;
	//init callback function reference
	this._func = null;
	//loop thru children scopes of global scope
	for( var childScp in parser.__instance._children ){
		//if iterated scope represents function and function name matches the given one
		if( childScp._funcDecl != null &&  childScp._funcDecl._name == this._name ){
			//set callback function reference
			this._func = childScp._funcDecl;
		}	//end if iterated scope represents the given callback function
	}	//end loop thru children of global scope
	//check if callback function has not been determined
	if( this._func == null ){
		//error
		throw new Error("runtime: given timer callback function does not exist");
	}
};	//end File ctor