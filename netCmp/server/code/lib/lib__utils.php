<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-08
	Description:	database utility functions
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//CONSTANTS:
	//	1. minimum number of characters in the user name
	$nc__util__g__username__minchars = 5;
	//	2. minimum number of characters in the password
	$nc__util__g__pass__minchars = 7;

	//redirect to another page
	//see: http://stackoverflow.com/questions/353803/redirect-to-specified-url-on-php-script-completion
	//input(s):
	//	path: (text) partial path (starting from 'netcmp' folder) to the redirected file
	//output(s): (none)
	function nc__util__redirect($path){

		ob_start(); // ensures anything dumped out will be caught

		// clear out the output buffer
		while (ob_get_status()) 
		{
		    ob_end_clean();
		}

		//replace '\\' with '/'
		str_replace('\\', '/', $path);

		//set url
		$url = $_SERVER['HTTP_HOST'] . '/' . $path;

		// no redirect
		header( "Location: $url" );

	}	//end function 'nc__util__redirect'

	//get currently displayed PHP file name from the server information
	//input(s): (none)
	//output(s):
	//	(text) => currently shown PHP file name
	function nc__util__getPHPFileName(){

		//get PHP full file path
		$tmpFullPath = $_SERVER['SCRIPT_NAME'];

		//index last '/' in the full file path after which file name follows
		$tmpSlashIdx = strrpos($tmpFullPath, "/");

		//index last '.' after which file extension follows
		$tmpDotIdx = strrpos($tmpFullPath, ".");

		//return only PHP file name
		return substr($tmpFullPath, $tmpSlashIdx + 1, $tmpDotIdx - $tmpSlashIdx - 1);

	}	//end function 'nc__util__getPHPFileName'

	//report error
	//input(s):
	//	msg: (text) error message
	//output(s): (none)
	function nc__util__error($msg){

		//report error message and kill process
		die( "error: " . $msg );

	}	//end function 'nc__util__error'

	//check if FORM field is not set by the user
	//input(s):
	//	fieldName: (text) field name
	//output(s):
	//	(boolean) => TRUE if field is set, FALSE if empty (not set)
	function nc__util__isFieldSet($fieldName){

		//check if field exists among POST fields and it is not empty
		return array_key_exists($fieldName, $_POST) && !empty($_POST[$fieldName]);

	}	//end function 'nc__util__isFieldSet'

?>