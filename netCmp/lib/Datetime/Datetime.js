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
	this._year = 
		new content(
			type.__library["integer"],
			0
		);
	//create empty month
	this._month = 
		new content(
			type.__library["integer"],
			0
		);
	//create empty day
	this._day = 
		new content(
			type.__library["integer"],
			0
		);
	//create empty hour
	this._hour =
		new content(
			type.__library["integer"],
			0
		);
	//create empty minutes
	this._min =
		new content(
			type.__library["integer"],
			0
		);
	//create empty seconds
	this._sec =
		new content(
			type.__library["integer"],
			0
		);
};	//end Datetime ctor

//set internal fields to current datetime and return it
//input(S): (none)
//output(s):
//	(content:Datetime) => current datetime
//see: http://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
Datetime.prototype.Now = function(){
	//get current datetime
	var now	 = new Date();
	//set internal fields
	this._year._value	= now.getFullYear();
	this._month._value  = now.getMonth()+1;
	this._day._value	= now.getDate();
	this._hour._value	= now.getHours();
	this._min._value	= now.getMinutes();
	this._sec._value	= now.getSeconds();
	//return this object
	return new content(
		type.__library["datetime"],
		this
	);
};	//nd method 'Now'

//set internal fields using values retrieved from string
//input(s):
//	s: (content:text) text representation of datetime, in the same format as 'toString'
//output(s): (none)
Datetime.prototype.fromString = function(s){
	//yyyy-mm-dd HH:MM:SS
	//0123456789012345678
	//set year
	this._year._value = parseInt(s._value.substring(0, 4));
	//set month
	this._month._value = parseInt(s._value.substring(5, 2));
	//set date
	this._day._value = parseInt(s._value.substring(8, 2));
	//set hour
	this._hour._value = parseInt(s._value.substring(11, 2));
	//set minutes
	this._min._value = parseInt(s._value.substring(14, 2));
	//set seconds
	this._sec._value = parseInt(s._value.substring(17, 2));
};	//end method 'fromString'

//method for converting datetime to text string
//input(s): (none)
//output(s):
//	(text) => text representation of datetime object
Datetime.prototype.toString = function(){
	//format: yyyy-mm-dd HH:MM:SS
	return	this._year._value.toString() + "-" +
			this._month._value.toString() + "-" +
			this._day._value.toString() + " " +
			this._hour._value.toString() + ":" +
			this._min._value.toString() + ":" +
			this._sec._value.toString();
};	//end method 'toString'

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
Datetime.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.DATETIME;
}

//comparison method
//input(s):
//	anotherDt: (datetime) datetime to compare with
//output(s):
//	(boolean) => {true} if this datetime is equal to {anotherDt}; {false} otherwise
Datetime.prototype.isEqual = function(anotherDt){
	//make sure that {anotherDt} is not null
	if( typeof anotherDt != "object" || anotherDt == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherDt}
	if( this.getTypeName() != anotherDt.getTypeName() ){
		return false;
	}
	//compare internal fields
	return	this._year._value == anotherDt._year._value &&
			this._month._value == anotherDt._month._value &&
			this._day._value == anotherDt._day._value &&
			this._hour._value == anotherDt._hour._value &&
			this._min._value == anotherDt._min._value &&
			this._sec._value == anotherDt._sec._value;
};	//end method 'isEqual'