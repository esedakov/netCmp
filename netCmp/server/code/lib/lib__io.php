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

	//include library for file attributes
	require_once 'lib__fattr.php';

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

			//create DB record for file
			$tmpEntId = nc__db__createIORecord(
				$name,
				$dirId,
				$perms,
				$_SESSION['consts']['user']['id'],
				$fileType
			);

			//if creating a file (not folder:5 and not CFG:4)
			if( $isFile && $fileType < 4 ){

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
	//	see: http://stackoverflow.com/a/11511605
	function nc__io__createImageFile($name, $dirId, $perms, $cnt){

		//create a file
		$tmpFileId = nc__io__create(
			$name,		//file name 
			true, 		//it is file, not a folder
			$dirId, 	//directory id, where file will reside
			$perms, 	//permissions
			2			//image file type
		);

		//if file creation failed
		if( $tmpFileId == -1 ){

			//error -- file creation failed
			nc__util__error("(nc__io__createImageFile:1) nc__io__create returned -1");

		}	//end if file creation failed

		//get file name for the specified file id
		$tmpFileName = nc__db__getFileName($tmpFileId);

		//if file name is empty string
		if( $tmpFileName ){

			//error -- file name was not found
			nc__util__error("(nc__io__createImageFile:2) file name not found (id:$tmpFileId)");

		}	//end if file name is empty string

		//split base64 string into 2 strings: (1) image type, (2) remaining base64 string
		list($type, $data) = explode(';', $cnt);

		//split remaining base64 string by ',' to extract actual image data (as base64)
		list(, $data) = explode(',', $data);

		//decode image contents from base64 to actual image data
		$data = base64_decode($data);

		//determine image file extension
		list(, $tmpFileExt) = explode($type, '/');

		//write out image file
		file_put_contents($_SESSION['consts']['pub_folder'] . $tmpFileName, $data);

		//return file id
		return $tmpFileId;

	}	//end function 'nc__io__createImageFile'

	//function for saving changes in the specified text file (regular and code)
	//input(s):
	//	fileId: (integer) file id
	//	txt: (text) complete file text content
	//output(s): (none)
	function nc__io__changeTextFile($fileId, $txt){

		//get file name for the specified file id
		$tmpFileName = nc__db__getFileName($fileId);

		//if file name is empty string
		if( $tmpFileName ){

			//error -- file name was not found
			nc__util__error("(nc__io__changeTextFile:1) file name not found (id:$fileId)");

		}	//end if file name is empty string

		//change file contents
		file_put_contents($_SESSION['consts']['pub_folder'] . $tmpFileName, $txt);

	}	//end function 'nc__io__changeTextFile'

	//function for moving/renaming file or folder
	//input(s):
	//	id: (integer) file or folder id
	//	dirId: (integer) folder id, where this file will reside now
	//		Note: use '-1' for dirId, if it is same as before
	//	name: (text) new/former file name ('' if not changed)
	//output(s):
	//	(boolean) => TRUE if siuccess, FALSE if failure
	function nc__io__move($id, $dirId, $name){

		//move file/folder and return result
		return nc__db__moveIOEntity($id, $dirId, $name);

	}	//end function 'nc__io__move'

?>