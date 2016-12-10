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

	//check if user name is valid
	//input(s):
	//	userName: (text) string for user name
	//	beUnique: (boolean) should user name be checked for uniqness
	//output(s):
	//	(boolean) => TRUE if user name is valid, FALSE if otherwise
	function nc__util__isUserNameValid($userName, $beUnique){

		//if user name is not valid
		if( 

			//check if user name is not long enough
			strlen($userName) < $nc__util__g__username__minchars ||

			//check if user name contains any character(s) other then letters and numbers
			//	see: http://www.w3schools.com/php/php_form_url_email.asp
			!preg_match("/^[a-zA-Z0-9]*$/", $userName) ||

			//check uniqness of user name is necessary
			(
				//if need to check uniqness
				$beUnique &&

				//is user name is not unique (i.e. user name is used, already)
				nc__db__isUserExist($userName) == true
			)
		){

			//failed -- user name is not valid
			return false;

		}

		//success -- user name is valid
		return true;

	}	//end function 'nc__util__isUserNameValid'

	//check if email is valid
	//input(s):
	//	email: (text) user email
	//output(s):
	//	(boolean) => TRUE: if email is valid, FALSE: otherwise
	function nc__util__isEmailValid($email){

		//if email is not valid
		//	see: http://stackoverflow.com/a/12026863
		if( !filter_var($email, FILTER_VALIDATE_EMAIL) ){

			//failed -- email is not valid
			return false;

		}

		//success -- email is formatted correctly, but it still is left to check
		//	whether it exists. This can only be accomplished by sending an email
		return true;

	}	//end function 'nc__util__isEmailValid'

?>