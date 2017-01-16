<?
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-19
	Description:	utility functions to manipulate JSON, which will deliver both parsing data
						and file contents from client to server (primarily via AJAX)
	Used by:		()
	Dependencies:	(none)
	*/
	
	//receive JSON from js client
	//input(s): (none)
	//output(s):
	//	(Array<String> => String/Base64) field name => field values
	//	Note: $_POST['mydata'] if in JS, json was formed as follows: {mydata: ...}
	//		see: http://stackoverflow.com/a/10955053
	//	also, see: http://stackoverflow.com/a/37758747
	function nc__json__receive(){

		//

	}	//end function 'nc__json__receive'

	//add image to the JSON
	//input(s):
	//	json: (Array<String> => String/Base64) json object
	//	fileName: (text) file name
	//	cnt: (PHP Image Data) image data
	//output(s):
	//	(Array<String> => String/Base64) json object
	//	see: http://stackoverflow.com/a/13758760

	//extract image object from JSON
	//input(s):
	//	json: (Array<String> => String/Base64) json object
	//	fieldName: (text) field name that referres to the image
	//output(s):
	//	(text) => base64 string that represents image

?>