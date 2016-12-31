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

		//include library for function 'nc__util__reInitSession'
		require_once './lib/lib__utils.php';

		//include library for function 'nc__db__getIOEntryAttrs' and 'nc__db__getFileLocation'
		require_once './lib/lib__db.php';

		//include library for permission constants
		require_once './lib/lib__fperm.php';

		//include library for function 'nc__io__getIOEntries'
		require_once './lib/lib__io.php';

		//re-initialize session
		nc__util__reInitSession();

		//get information from DB for this item (file/folder)
		$attr = nc__db__getIOEntryAttrs($_POST["f"]);

		//get type of IO item
		$itemType = $_POST["t"];

		//if file was not found
		if( is_null($attr) ){

			//error
			die("file was not found");

		}	//end id file was not found

		//check if user has permissions to access file
		if( 
			//if file can be read by any user
			$attr->_fperm & NC__ENUM__FPERM::READ == NC__ENUM__FPERM::READ ||

			//or, if this is the owner of the file
			$attr->_ownerId == $_SESSION['consts']['user']['id']
		){


		} else {	//if do not have access permissions

			//error
			die("missing access permissions");

		}	//end if user has permissions to access file

	} else {	//else, did not pass file id and type

		//error
		die("missing required POST attributes");

	}	//end if POST has 'file_id' and 'file_type' passed in

?>