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

		//init information of specific IO entry (used for method > 5)
		$tmpIOEntityAttr = NULL;

		//if method is greater then 5 (i.e. focused on specific IO entity)
		if( intval($_POST['method']) > 5 ){

			//check if 'id' or 'type' has not been passed in
			if( array_key_exists('id', $_POST) == false ||
				array_key_exists('type', $_POST) == false ){

				//error
				die("processing IO request on specific entity, but missing 'id' and/or 'type'");

			}	//end if 'id' or 'type' has not been passed in

			//get attributes of IO entity
			$tmpIOEntityAttr = nc__db__getIOEntryAttrs($_POST['id']);

		}	//end if method is greater then 5


	}	//end if method is passed in

?>