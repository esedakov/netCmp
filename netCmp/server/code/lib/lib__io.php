<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-18
	Description:	utility functions for input/output, i.e. file/folder manipulations
	Used by:		(code_view), (file_folder_view)
	Dependencies:	(lib_db), (lib_utils)
	*/

	//include DB functions
	require_once 'lib__db.php';

	//include library for utility functions: 'nc__util__error' and 'nc__util__isNotLoggedIn'
	require_once 'lib__utils.php';

	//function for creating folder or text file
	//input(s):
	//	name: (text) file or folder name
	//	isFile: (boolean) flag: is this a file or a folder
	//	dirId: (integer) folder id, where this file will reside
	//	perms: (fperm) file or folder permissions
	//	fileType: (integer) type of file
	//					1 - regular text file
	//					2 - image file
	//					3 - code file
	//					4 - cfg file
	//					5 - folder
	//output(s):
	//	(integer) => file id
	//	-1 => if failed
	function nc__io__create($name, $isFile, $dirId, $perms, $fileType){

		//check if user is not logged in
		if( nc__util__isNotLoggedIn() ){

			//error -- user needs to be logged in to create new file/folder
			nc__util__error("(nc__io__create:1) user needs to be logged in");

		}	//end if user is not logged in

		//if file/folder does not exist
		if( nc__db__isIORecordExist($name, $dirId) == false ){

			//determine type of IO entry
			$tmpIOEntryType = ($isFile ? ($isCodeFile ? '3' : '1') : '5');

			//create DB record for file
			$tmpEntId = nc__db__createIORecord(
				$name,
				$dirId,
				$perms,
				$_SESSION['consts']['user']['id'],
				$tmpIOEntryType
			);

			//if creating a file
			if( $isFile ){

				//generate unique file name
				$tmpUniqFileName = dechex(rand(1000000, 100000000)) . '.ncf';

				//create new file
				$tmpFileHand = fopen(
					$_SESSION['consts']['pub_folder'] . $tmpUniqFileName,
					"w"
				);

				//check if file was created successfully
				if( $tmpFileHand == false ){

					//error -- file/folder creation failed
					nc__util__error("(nc__io__create:2) failed to create a IO item");

				}	//end if file was created successfully

				//close file handler
				fclose($tmpFileHand);

				//link DB file record with actual file location
				nc__db__setFileLocation(
					$tmpEntId,
					0,			//right now, stored only locally
					$_SESSION['consts']['pub_folder'],
					$tmpUniqFileName
				);

			}	//end if creating a file

			//return IO entry id
			return $tmpEntId;

		}	//end if file/folder does not exist

		//return -1, since did not create any item
		return -1;

	}	//end function 'nc__io__create'

	//function for creating image file
	//	Note: store image as actual image object and not as base64 string
	//	see: http://stackoverflow.com/a/15153931
	//	also, see: http://stackoverflow.com/a/11845784
	//input(s):
	//	name: (text) file or folder name
	//	dirId: (integer) folder id, where this file will reside
	//	perms: (fperm) file or folder permissions
	//	cnt: (text) base64 string that represents image data
	//output(s):
	//	(integer) => file id
	//	-1 => if failed
	function nc__io__createImageFile($name, $dirId, $perms, $cnt){

		//

	}	//end function 'nc__io__createImageFile'

	//function for saving changes in the specified text file
	//input(s):
	//	fileId: (integer) file id
	//	txt: (text) complete file text content
	//output(s):
	//	(boolean) => TRUE if success, FALSE if failure

	//function for moving/renaming file or folder
	//input(s):
	//	id: (integer) file or folder id
	//	dirId: (integer) folder id, where this file will reside now
	//		Note: use '-1' for dirId, if it is same as before
	//	name: (text) new/former file name
	//output(s):
	//	(boolean) => TRUE if siuccess, FALSE if failure

?>