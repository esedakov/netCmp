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

		//get attributes of the parent directory
		$parDirAttr = nc__db__getIOEntryAttrs($_SESSION['file']['open']);

		//check if directory was not found
		if( isnull($parDirAttr) ){

			//error
			die("parent directory does not exist");

		}	//end if directory was not found

		//init permission value to check
		$tmpPermVal = 0;

		//if creating something
		if( $_POST['method'] == '1' || $_POST['method'] == '2' || 
			$_POST['method'] == '3' || $_POST['method'] == '6' ){

			//set WRITE permission value
			$tmpPermVal = NC__ENUM__FPERM::WRITE;

		} else if( $_POST['method'] == '7' ){	//if delete

			//set DELETE permission value
			$tmpPermVal = NC__ENUM__FPERM::DELETE;
		
		} else if( $_POST['method'] == '8' ){	//if rename

			//set MOVE permission value
			$tmpPermVal = NC__ENUM__FPERM::MOVE;

		} else if( $_POST['method'] == '5' || $_POST['method'] == '10' ){	//if properties

			//set READ permission value
			$tmpPermVal = NC__ENUM__FPERM::READ;

		} else {	//if not supported method

			//error
			die("unkown method");

		}	//end if creating something

		//if need an extra attribute (copy, rename, and save)
		//TODO: also handle saving file
		if( $_POST['method'] == 6 || $_POST['method'] == 8 ){

			//if 'extra' has not been passed in
			if( array_key_exists('extra', $_POST) == false ){

				//error
				die("processing IO request on specific entry, but missing 'extra' attribute");

			}	//end if 'extra' has not been passed in

		}	//end if need an extra attribute (copy, rename, and save)

		//check if user is not the owner
		if( $_SESSION['consts']['user']['id'] != $parDirAttr->_ownerId ){

			//if there is no WRITE permission for this parent folder
			if( $parDirAttr->_fperm & $tmpPermVal == 0 ){

				//error
				die("permission check failed");

			}	//end if user is not the owner

		}	//end if user is not the owner

		//depending on the type of method requested
		switch( $_POST['method'] ){
			//create folder
			case '1':
			//create text file
			case '2':
			//create code file
			case '3':
				//generate temporary name
				$tmpName = "temp_".dechex(rand(1000000, 100000000));
				//init type to be '5' (folder)
				$tmpType = 5;
				//init extension
				$tmpExt = "";
				//if text file
				if( $_POST['method'] == '2' ){
					//assign 'txt' file extension
					$tmpExt = ".txt";
					//set type to be '1' (text file)
					$tmpType = 1;
				} else if( $_POST['method'] == '3' ){	//if code file
					//assign 'nc' file extension
					$tmpExt = ".nc";
					//set type to be '3' (code file)
					$tmpType = 3;
				}
				//append extension
				$tmpName .= $tmpExt;
				//create IO entity record in DB
				nc__db__createIORecord(
					//name
					$tmpName,
					//parent directory id
					$_SESSION['file']['open'],
					//permissions of the parent directory
					$parDirAttr->_fperm,
					//owner id
					$_SESSION['consts']['user']['id'],
					//file/folder type
					$tmpType
				);
				//if text or code file (if not a folder)
				if( $tmpType != 5 ){
					//create physical file and create location record in DB for this file
					nc__io__create(
						//generate new name for this file
						dechex(rand(1000000, 100000000)).$tmpExt
						//is file: true
						true,
						//parent directory id
						$_SESSION['file']['open'],
						//permissions of the parent directory
						$parDirAttr->_fperm,
						//file type
						$tmpType
					);
				}	//end if text or code file
				break;
			//create copy of a IO entity
			case '6':
				//if copying a folder then abort
				if( $_POST['type'] == 5 ){
					//error
					die("folder copying is not implemented");
				}
				//copy file
				nc__io__copyFile(
					//id of the file to be copied
					$tmpIOEntityAttr->_id,
					//attributes of the copied file
					$tmpIOEntityAttr,
					//parent directory id, where to copy file
					$_SESSION['file']['open']
				);
				break;
	}	//end if method is passed in

?>