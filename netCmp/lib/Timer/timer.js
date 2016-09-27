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
};	//end function 'reset'

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
	//init timeout instance
	this._timeout = null;
	//loop thru children scopes of global scope
	for( var childScp in parser.__instance._children ){
		//if iterated scope represents function and function name matches the given one
		if( childScp._funcDecl != null &&  childScp._funcDecl._name == this._name._value ){
			//set callback function reference
			this._func = childScp._funcDecl;
		}	//end if iterated scope represents the given callback function
	}	//end loop thru children of global scope
	//check if callback function has not been determined
	if( this._func == null ){
		//error
		throw new Error("runtime: given timer callback function does not exist");
	}
};	//end Timer ctor

//start timer
//input(s): (none)
//output(s): (none)
Timer.prototype.start = function(){
	//create temporary variable for 'this' (Timer) to use inside anonymous Timeout function
	var that = this;
	//create timeout variable and start timer
	this._timeout = setTimeout(
		//anonymous function to invoke timer callback
		function() {
			//invoke a call to given global callback function
			entity.__interp.invokeCall(
				entity.__interp._curFrame,		//current frame
				that._func,						//functinoid: callback global function
				null,							//this is a global function, so no owner object
				[]								//no function arguments are passed in
			);
			//remove DFS after call
			dbg.__debuggerInstance._callStack.pop();
		},
		//timer period
		this._period._value
	);
};	//end method 'start'

//stop timer
//input(s): (none)
//output(s): (none)
Timer.prototype.stop = function(){
	//clear timeout
	clearTimeout(this._timeout);
	//null timeout
	this._timeout = null;
};	//end method 'stop'


//method for converting datetime to text string
//input(s): (none)
//output(s):
//	(text) => text representation of datetime object
Timer.prototype.toString = function(){
	//format: {name}:{period}
	return	this._name._value + ":" +
			this._period._value.toString();
};	//end method 'toString'

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Timer.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.TIMER;
}

//comparison method
//input(s):
//	anotherTimer: (fileProp) fileProp to compare with
//output(s):
//	(boolean) => {true} if this fileProp is equal to {anotherTimer}; {false} otherwise
Timer.prototype.isEqual = function(anotherTimer){
	//make sure that {anotherTimer} is not null
	if( typeof anotherTimer != "object" || anotherTimer == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherTimer}
	if( this.getTypeName() != anotherTimer.getTypeName() ){
		return false;
	}
	//compare internal fields
	return	this._name._value == anotherTimer._name._value &&
			this._period._value == anotherTimer._period._value;
};	//end method 'isEqual'