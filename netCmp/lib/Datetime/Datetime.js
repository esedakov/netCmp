/**
	Developer:	Eduard Sedakov
	Date:		2016-09-22
	Description:	library for datetime type
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created datetimes, indexed by their corresponding ids:
//	key: datetime id
//	value: datetime object
Datetime.__library = {};

//unique identifier used by datetime
Datetime.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
Datetime.reset = function() {
	Datetime.__library = {};	//set to empty hash map
	Datetime.__nextId = 1;		//set to first available integer
};

//static calls:
Datetime.reset();

//class Datetime declaration:
//class creates Datetime
//input(s): (none)
//output(s): (none)
function Datetime(){
	//id
	this._id = Datetime.__nextId++;
	//store this object inside library
	Datetime.__library[this._id] = this;
	//create empty year
	this._year = 0;
	//create empty month
	this._month = 0;
	//create empty day
	this._day = 0;
	//create empty hour
	this._hour = 0;
	//create empty minutes
	this._min = 0;
	//create empty seconds
	this._sec = 0;
};	//end Datetime ctor

//set internal fields to current datetime and return it
//input(S): (none)
//output(s):
//	(Datetime) => current datetime
//see: http://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
Datetime.prototype.Now = function(){
	//get current datetime
	var now	 = new Date();
	//set internal fields
	this._year	= now.getFullYear();
	this._month   = now.getMonth()+1;
	this._day	 = now.getDate();
	this._hour	= now.getHours();
	this._min  = now.getMinutes();
	this._sec  = now.getSeconds();
	//return this object
	return this;
};	//nd method 'Now'