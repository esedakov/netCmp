<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-31
	Description:	process IO request
	Used by:		(AJAX:openFileDialog.php)
	Dependencies:	(lib__utils.php)
	*/

	//if method is passed in
	if( array_key_exists('method', $_POST) ){

		//include library for functions 'nc__util__reInitSession', 'nc__util__isIOEntryNameValid'
		require_once './lib/lib__utils.php';

		//include DB library for function 'nc__db__createIORecord'
		require_once './lib/lib__db.php';

		//include IO library for function 'nc__io__create'
		require_once './lib/lib__io.php';

		//re-initialize session
		nc__util__reInitSession();


	}	//end if method is passed in

?>