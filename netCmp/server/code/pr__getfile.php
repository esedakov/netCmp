<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	retrieve file from the server
	Used by:		(AJAX:vw__codeview)
	Dependencies:	(none)
	*/

	//check if POST has 'file_id' and 'file_type' are passed in
	if( array_key_exists('f', $_POST) && array_key_exists('t', $_POST) ){


	} else {	//else, did not pass file id and type

		//error
		die("missing required POST attributes");

	}	//end if POST has 'file_id' and 'file_type' passed in

?>