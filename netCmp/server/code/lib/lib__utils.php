<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-31
	Description:	database utility functions
	Used by:		(everything)
	Dependencies:	(none)
	*/

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
	function nc__util__error($msg){

		//report error message and kill process
		die( "error: " . $msg );

	}	//end function 'nc__util__error'

?>