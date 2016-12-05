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


	}	//end function 'nc__util__redirect'

?>