<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-19
	Description:	record expand/shrink page view
	Used by:		(AJAX:vw__page)
	Dependencies:	(none)
	*/

	//check if POST has 'exp' flag
	if( array_key_exists('e', $_POST) ){}

		//include library for function 'nc__util__reInitSession'
		require_once './lib/lib__utils.php';

		//re-initialize session
		nc__util__reInitSession();

		//record data inside session
		$_SESSION["view"]['mode'] = $_POST["e"];

	}	//end if POST has 'exp' flag

?>