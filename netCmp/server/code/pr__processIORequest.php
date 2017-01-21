<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-31
	Description:	process IO request
	Used by:		(AJAX:openFileDialog.php)
	Dependencies:	(utils), (db), (io), (fattr)
	*/

	//if method is passed in
	if( array_key_exists('method', $_POST) ){

		//include library for functions 'nc__util__reInitSession', 'nc__util__isIOEntryNameValid'
		require_once './lib/lib__utils.php';

		//include DB library
		require_once './lib/lib__db.php';

		//include IO library for function 'nc__io__create'
		require_once './lib/lib__io.php';

		//include library for file attributes
		require_once './lib/lib__fattr.php';

		//include view for properties
		require_once './vw__property.php';

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
			$tmpIOEntityAttr = nc__db__getIOEntryAttrs($_POST['id'], $_POST['type'] != '5');

		}	//end if method is greater then 5

		//get attributes of the parent directory
		$parDirAttr = nc__db__getIOEntryAttrs($_SESSION['file']['open'], false);

		//check if directory was not found
		if( is_null($parDirAttr) ){

			//error
			die("parent directory does not exist");

		}	//end if directory was not found

		//init permission value to check
		$tmpPermVal = 0;

		//if creating something or saving or uploading an image file
		if( $_POST['method'] == '1' || $_POST['method'] == '2' || 
			$_POST['method'] == '3' || $_POST['method'] == '6' ||
			$_POST['method'] == '11' || $_POST['method'] == '4' ){

			//set WRITE permission value
			$tmpPermVal = NC__ENUM__FPERM::WRITE;

		} else if( $_POST['method'] == '7' ){	//if delete

			//set DELETE permission value
			$tmpPermVal = NC__ENUM__FPERM::DELETE;
		
		} else if( $_POST['method'] == '8' || $_POST['method'] == '12' ){	//if rename or move

			//set MOVE permission value
			$tmpPermVal = NC__ENUM__FPERM::MOVE;

		} else if( $_POST['method'] == '5' || $_POST['method'] == '10' ){	//if properties

			//set READ permission value
			$tmpPermVal = NC__ENUM__FPERM::READ;

		} else {	//if not supported method

			//error
			die("unkown method");

		}	//end if creating something

		//if need an extra attribute (rename, save, upload, and move)
		if( $_POST['method'] == 8 || $_POST['method'] == 11 || 
			$_POST['method'] == 4 || $_POST['method'] == 12 ){

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
				//create physical file and create location record in DB for this file
				nc__io__create(
					//unique name
					$tmpName,
					//is file: true
					$tmpType != 5,
					//parent directory id
					$_SESSION['file']['open'],
					//permissions of the parent directory
					$parDirAttr->_fperm,
					//file type
					$tmpType
				);
				break;
			case '4':
				nc__io__createImageFile(
					//image file name
					"temp_".dechex(rand(1000000, 100000000)).".jpg",
					//parent directory id
					$_SESSION['file']['open'],
					//permissions of the parent directory
					$parDirAttr->_fperm,
					//base64 image data
					$_POST['extra']
				);
				break;
			//property for parent directory
			case '5':
				//output folder property
				echo showIOEntryProperties($parDirAttr);
				//quit now, no need to output openSaveFileDialog
				return;
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
			//delete IO entity
			case '7':
				//delete file/folder
				nc__io__delete($tmpIOEntityAttr->_id, $tmpIOEntityAttr->_type != 5);
				break;
			//rename IO entity
			case '8':
				//check if new IO entry name is not valid
				if( !nc__util__isIOEntryNameValid($_POST['extra']) ){
					//error
					die("IO entry name is not valid");
				}	//end if new IO entry name is not valid
				//if given new name is unique in the parent folder
				if( nc__db__checkIfExistsByName($tmpIOEntityAttr->_dirId, $_POST['extra']) ){
					//error
					die("attempting to rename IO entry with non-unique name in the parent dir");
				}	//end if new name is not unique in the parent folder
				//construct fattr struct with new name specified in it
				$tmpFAttr = new nc__class__fattr(
					$tmpIOEntityAttr->_id,
					null, null, null, $_POST['extra'], null, null, null
				);
				//update name
				nc__db__updateIOAttrs($tmpIOEntityAttr->_id, $tmpFAttr,
					//ES 2017-01-21 (b_file_hierarchy): fix bug: pass third (required) parameter
					//	to specify whether renaming item is a file or a folder
					$tmpIOEntityAttr->_type != 5
				);
				break;
			//property for IO entity
			case '10':
				//output file/folder property
				echo showIOEntryProperties($tmpIOEntityAttr);
				//quit now, no need to output openSaveFileDialog
				return;
			//save file
			case '11':
				//if we are saving other then the code or text file
				if( $_POST['type'] != 3 && $_POST['type'] != 1 ){
					//error
					die("can save content for only code or text file");
				}
				//if new file contents is not empty AND contain other then the legal characters
				if( strlen($_POST['extra']) > 0 && 
					!preg_match(
						"/^[a-zA-Z0-9\.\s\S\n\r\\\=\<\>&\|\+-\/\*\[\]\(\)\{\}\,\:]*$/", 
						$_POST['extra']
					) 
				){
					//error
					die("files can only contain code characters");
				}
				//save a file
				nc__io__saveFile($tmpIOEntityAttr->_id, $_POST['extra']);
				//quit with no messaage
				return;
			//move file/folder
			case '12':
				//move item to the specified location (extra: new parent folder id)
				nc__io__move($tmpIOEntityAttr->_id, $_POST['extra'], $_POST['type'] != 5);
				break;
			default:
				//error
				die("unkown requested method");
			break;

		}	//end switch on the type of method requested

		//output open-file dialog
		require 'vw__openFileDialog.php';

	}	//end if method is passed in

?>