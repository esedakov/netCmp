/**
	Developer:	Eduard Sedakov
	Date:		2016-09-22
	Description:	library for component file
	Used by: {interpreter}
	Depends on:	{interpeter}, content, {file properies}, FILE_TYPE
**/

//==========globals:==========

//store all created files, indexed by their corresponding ids:
//	key: file id
//	value: file object
File.__library = {};

//unique identifier used by file
File.__nextId = 1;

//server communication timeout for loading files (in milliseconds)
File.__timeout = 60000;	//60 seconds = 1 minute

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
File.reset = function() {
	File.__library = {};	//set to empty hash map
	File.__nextId = 1;		//set to first available integer
};

//static calls:
File.reset();

//class File declaration:
//class creates File
//input(s): (none)
//output(s): (none)
function File(){
	//id
	this._id = File.__nextId++;
	//store this object inside library
	File.__library[this._id] = this;
	//type of file
	this._type = FILE_TYPE.TXT;
	//file buffer
	this._buf = null;
	//if file type is text
	//if( this._type.value == FILE_TYPE.TXT.value ){
	//	//set buffer to be empty string
	//	this._buf = "";
	//}
	//is buffer written to server
	this._isUpdated = false;
	//was file changed
	this._isChanged = false;
	//file properties
	this._prop = 
		new content(
			type.__library["fileprop"],
			new FileProp()
		);
};	//end File ctor

//create new file
//input(s):
//	t: (FILE_TYPE) file type
//	n: (content:TEXT) string to represent absolute file name, with root being represented '/'
//	readPerms: (content:BOOL) allow other users to read file
//	writePerms: (content:BOOL) allow other users to write file
//	delPerms: (content:BOOL) allow other users to delete file
//	renamePerms: (content:BOOL) allow other users to rename file
//output(s):
//	(content:File) => new temporary file (it is not written yet on server)
File.prototype.create = function(t, n, readPerms, writePerms, delPerms, renamePerms){
	//set file type
	this._type = t;
	//get file name from content
	var name = n._value;
	//get index of last '/' in the absolute file name
	var tmpLastSlashIndex = name.lastIndexOf("/");
	//set path to the file
	this._prop._value._path = 
		new content(
			type.__library["text"],
			name.substring(0, tmpLastSlashIndex + 1)
		);
	//set actual file name
	this._prop._value._name = 
		new content(
			type.__library["text"],
			name.substring(tmpLastSlashIndex + 1)
		);
	//set creation and modification datetimes to right now
	this._prop._value._created = 
		new content(
			type.__library["datetime"],
			new Datetime().Now()
		);
	this._prop._value._modified = 
		new content(
			type.__library["datetime"],
			new Datetime().Now()
		);
	//leave owner string to be empty, since server will substitute it (itself)
	this._prop._value._owner = new content(type.__library["text"], "");
	//get value from param flags
	var isr = readPerms._value, isw = writePerms._value,
		isd = delPerms._value, isn = renamePerms._value;
	//set permission string
	this._prop._value._perms = 
		new content(
			type.__library["text"],
			(isr ? "1" : "0") + (isw ? "1" : "0") + (isd ? "1" : "0") + (isn ? "1" : "0")
		);
	//zero out file size
	this._prop._value._size = 
		new content(
			type.__library["integer"],
			0
		);
	//set file flag to be changed -- to acknowledge fact that this file needs to be pushed on server
	this._isChanged = true;
	//set file flag to be not updated -- again, need to write it on server
	this._isUpdated = false;
	//null out buffer
	this._buf = (this._type.value == FILE_TYPE.TXT.value ? "" : null);
	//return this file
	return new content(
		type.__library["file"],
		this
	);
};	//end method 'create'

//get text representation of the file
//input(s): (none)
//output(s):
//	(content:TEXT) => file text (_buf)
File.prototype.text = function() {
	//if this is not a TEXT file
	if( this._type != FILE_TYPE.TXT ){
		//error -- cannot access buffer of non-text object (cannot represent this object
		//	in the language)
		throw new Error("runtime: file: cannot access buffer's content of non-text file"); 
	}
	//otherwise, text, so return buffer, encapsulated inside CONTENT
	return new content(type.__library["text"], this._buf);
};	//end method 'text'

//method for converting datetime to text string
//input(s): (none)
//output(s):
//	(text) => text representation of datetime object
File.prototype.toString = function(){
	return	this.text();
};	//end method 'toString'

//read file from server
//input(s):
//	done: (js-function) callback function to denote that read is successfully done
//		Note: done is called with no arguments
//	err: (js-function) callback function to denote that read failed
//		Note: err is called with one argument - error message
//output(s): (none)
File.prototype.read = function(done, err){
	//for ajax see: http://www.w3schools.com/jQuery/ajax_ajax.asp
	//reset read flag to be not done
	this._readDone = false;
	//communicate with server to transfer data in base64 format
	$.ajax({
		//ES: TODO: url for ajax handler
		//	see: http://stackoverflow.com/questions/8449716/cross-origin-requests-are-only-supported-for-http-but-its-not-cross-domain?answertab=votes#tab-top
		url: 'pr__getfile.php',
		//specify data to be sent to the server (file path/name, permissions, ...)
		//data: this._prop._value,
		//set reference for 'this' inside callback functions
		context: this,

		//ES 2017-02-06 (fix bug): specify method
		method: 'POST',

		//ES 2017-02-05 (b_bug_fix_file): transfer 'p' (path) and 'n' (file name) parameters to the server
		data: {
			'p': this._prop._value._path._value,
			'n': this._prop._value._name._value
		},
			

		//success
		//for loading data in base64 format (for example loading images)
		//	see: http://stackoverflow.com/questions/4285042/asychronously-load-images-with-jquery
		success: function(data){
			//FOR SERVER: ES: TODO: http://stackoverflow.com/questions/3967515/how-to-convert-image-to-base64-encoding
			//set buffer with arrived data
			this._buf = data.b64data;
			//get file properties
			//ES 2017-01-05 (b_bug_fix_file): changed requirements: no longer need to return properties
			//this._prop._value = data.properties;
			//set flag that file is identical to the one stored on the server
			this._isChanged = false;
			//check if callback exists
			if( typeof done == 'function' ){
				//invoke success callback
				done(this);
			}
			//test
			//$("#testImageId").attr("src", "data:image/png;base64,"+data.b64data);
		},
		//to prevent re-downloading data from the server
		cache: true,
		//failure
		error: function(xhr, status, error){
			//set error message
			//	see: http://www.w3schools.com/jQuery/tryit.asp?filename=tryjquery_ajax_ajax_error
			tmpErrMsg = "communication error: " + xhr.status + xhr.statusText;
			//check if callback exists
			if( typeof err == 'function' ){
				//invoke failure callback
				err(tmpErrMsg);
			} else {
				//write error message in file buffer
				this._buf = tmpErrMsg;
			}
		},
		//timeout
		timeout: File.__timeout
	});
};	//end method 'read'

//write data to server
//input(s):
//	done: (js-function) callback function to denote that read is successfully done
//		Note: done is called with no arguments
//	err: (js-function) callback function to denote that read failed
//		Note: err is called with one argument - error message
//output(s): (none)
File.prototype.write = function(done, err){
	//ES: TODO
};	//end method 'write'

//get type name
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
File.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.FILE;
}

//comparison method
//input(s):
//	anotherFile: (File) file to compare with
//output(s):
//	(boolean) => {true} if this file is equal to {anotherFile}; {false} otherwise
File.prototype.isEqual = function(anotherFile){
	//make sure that {anotherFile} is not null
	if( typeof anotherFile != "object" || anotherFile == null ){
		return false;
	}
	//ensure that {this} is of the same type as {anotherFile}
	if( this.getTypeName() != anotherFile.getTypeName() ){
		return false;
	}
	//compare internal fields
	return	this._type == anotherFile._type &&
			this._buf == anotherFile._buf &&
			this._isUpdated == anotherFile._isUpdated &&
			this._isChanged == anotherFile._isChanged &&
			this._prop._value.isEqual(anotherFile._prop._value);
};	//end method 'isEqual'
