/**
	Developer:	Eduard Sedakov
	Date:		2016-09-22
	Description:	library for file properties type
	Used by: {interpreter}
	Depends on:	{interpeter}, content
**/

//==========globals:==========

//store all created file propertiess, indexed by their corresponding ids:
//	key: file properties id
//	value: file properties object
FileProp.__library = {};

//unique identifier used by file properties
FileProp.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
FileProp.reset = function() {
	FileProp.__library = {};	//set to empty hash map
	FileProp.__nextId = 1;		//set to first available integer
};

//static calls:
FileProp.reset();

//class FileProp declaration:
//class creates FileProp
//input(s): (none)
//output(s): (none)
function FileProp(){
	//id
	this._id = FileProp.__nextId++;
	//store this object inside library
	FileProp.__library[this._id] = this;
	//date created
	this._created = new content(type.__library["datetime"], new Datetime());
	//modification date
	this._modified = new content(type.__library["datetime"], new Datetime());
	//file path string to locate it on the server (does not include name)
	//	Note; empty path means it does not exist on server (temporary file)
	this._path = new content(type.__library["text"], "");
	//file name (not absolute name -- no path)
	this._name = new content(type.__library["text"], "");
	//file owner name
	this._owner = new content(type.__library["text"], "");
	//permissions for other users (does not apply to owner -- owner has all rights)
	//	Note: [read,write,delete.rename] => each is in the form of boolean: 0/1
	this._perms = new content(type.__library["text"], "0000");
	//file size on the server
	this._size = new content(type.__library["integer"], 0);
};	//end FileProp ctor//get type name

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
FileProp.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.FILEPROP;
}

//comparison method
//input(s):
//	anotherFp: (fileProp) fileProp to compare with
//output(s):
//	(boolean) => {true} if this fileProp is equal to {anotherFp}; {false} otherwise
FileProp.prototype.isEqual = function(anotherFp){
	//make sure that {anotherFp} is not null
	if( typeof anotherFp != "object" || anotherFp == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherFp}
	if( this.getTypeName() != anotherFp.getTypeName() ){
		return false;
	}
	//compare internal fields
	return	this._name._value == anotherFp._name._value &&
			this._created._value.isEqual(anotherFp._created._value) &&
			this._owner._value == anotherFp._owner._value &&
			this._perms._value == anotherFp._perms._value &&
			this._size._value == anotherFp._size._value &&
			this._path._value == anotherFp._path._value;
};	//end method 'isEqual'