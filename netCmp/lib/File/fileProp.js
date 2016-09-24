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
	this._created = new Datetime();
	//modification date
	this._modified = new Datetime();
	//file path string to locate it on the server (does not include name)
	//	Note; empty path means it does not exist on server (temporary file)
	this._path = "";
	//file name (not absolute name -- no path)
	this._name = "";
	//file owner name
	this._owner = "";
	//permissions for other users (does not apply to owner -- owner has all rights)
	//	Note: [read,write,delete.rename] => each is in the form of boolean: 0/1
	this._perms = "0000";
	//file size on the server
	this._size = 0;
};	//end FileProp ctor