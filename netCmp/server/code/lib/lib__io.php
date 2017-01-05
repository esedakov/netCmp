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

	//create copy of the specified file
	//input(s):
	//	id: (integer) id of a file to copy
	//	attr: (fattr) attributes of the copied file
	//	pid: (integer) parent directory id
	//output(s):
	//	(integer) => id of the resulting file copy
	function nc__io__copyFile($id, $attr, $pid){

		//split file name of target file by '.' to get its name and extension
		$tmpNameArr = explode($attr->_name, ".")[0];
		
		//derive unique name of copied file
		$tmpName = $tmpNameArr[0].dechex(rand(1000000, 100000000)).".".$tmpNameArr[1];

		//create file copy
		$resId = nc__io__create(

			//new file name
			$tmpName,

			//this is a file (not a folder)
			true,

			//parent directory id
			$pid,

			//file permissions are the same as permissions of the copied file
			$attr->_fperm,

			//type of file
			$attr->_type

		);

		//compose array of source and destination file ids to retrieve their full paths
		$tmpFileIdArr = array();
		array_push($tmpFileIdArr, $id);		//source: copied file
		array_push($tmpFileIdArr, $resId);	//destination: resulting file copy

		//get actual file names for source (copied) and destination (resulting copy)
		$tmpFullFileNameArr = nc__db__getFullFilePaths($tmpFileIdArr);

		//if copying file contents failed
		if( !copy($tmpFullFileNameArr[$id], $tmpFullFileNameArr[$resId]) ){

			//error
			nc__util__error("(nc__io__copyFile:1) failed to copy file");

		}	//end if copying file contents failed

		//return resulting file copy id
		return $resId;

	}	//end function 'nc__io__copyFile'

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
		if( nc__db__isIORecordExist($name, $dirId, $isFile) == false ){

			//if folder where file will reside is root
			if( nc__util__isRoot($dirId) ){

				//set root id
				$dirId = $_SESSION['consts']['root_id'];

			}	//end if folder where file will reside is root

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
				$tmpUniqFileName = dechex(rand(1000000, 100000000));

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

	//save a file
	//input(s):
	//	fileId: (integer) id of an existing file
	//	cnt: (text) new file content
	//output(s): (none)
	function nc__io__saveFile($fileId, $cnt){

		//compose array that include this file id
		$tmpFileIdArr = array();
		array_push($tmpFileIdArr, $fileId);

		//get full file name for this file id
		$tmpFullFileNameArr = nc__db__getFullFilePaths($tmpFileIdArr);

		//write out new file contents
		file_put_contents($tmpFullFileNameArr[$fileId], $cnt);

	}	//end function 'nc__io__saveFile'

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
	//	isFile: (boolean) do move a file (TRUE) or a folder (FALSE)
	//output(s):
	//	(boolean) => TRUE if siuccess, FALSE if failure
	function nc__io__move($id, $dirId, $isFile){

		//if new parent folder does not exist
		if( !nc__db__checkIfExistsById($dirId, false) ){

			//error: new parent folder does not exist
			nc__util__error("(nc__io__move:1) new parent folder does not exist");

		}	//end if new parent folder does not exist

		//move file/folder and return result
		return nc__db__moveIOEntity($id, $dirId, $isFile);

	}	//end function 'nc__io__move'

	//delete specified file/folder
	//input(s):
	//	id: (integer) id of the file or folder to be deleted
	//	isFile: (boolean) is this a file or a folder
	//output(s):
	//	(boolean) => TRUE if success, FALSE if failure
	function nc__io__delete($id, $isFile){

		//if deleting a folder
		if( $isFile ){

			//get array of file/folder ids that are directly stored inside this directory
			$internal = nc__db__getIOEntriesInDirectory($id, true, true);

			//loop thru retrieved io entries (files/folders)
			foreach( $internal as $entId => $entAttr ){

				//if this is a folder
				if( $entAttr->_type == 5 ){

					//call recursively this function to delete this folder
					nc__io__delete($entId, false);
				
				} else {	//else, it is a file

					//compose fattr struct with all fields set to null except for id and suspend
					$attr = nc__db__updateIOAttrs(
						$entId, null, null, null, null, null, null, true
					);

					//update db entry by setting it suspended, and return result
					nc__db__updateIOAttrs($id, $attr);

				}	//end if this a folder

			}	//end loop thru retrieved io entries (files/folders)

		}	//end if deleting a folder
		
		//compose file attribute struct with all fields set to null except for id and suspend
		$attr = nc__db__updateIOAttrs($id, null, null, null, null, null, null, true);

		//update db entry by setting it suspended, and return result
		return nc__db__updateIOAttrs($id, $attr);

	}	//end function 'nc__io__delete'

	//get list of files and folders at the specified location/folder
	//input(s):
	//	prn_id: (text) id of parent directory (if it is NULL, then this is ROOT directory)
	//output(s):
	//	array<file_id:integer, file_name:text> list of files in the specified folder
	function nc__io__getIOEntries($prn_id){

		//if parent directory is ROOT
		if( is_null($prn_id) || strtoupper($prn_id) == "NULL" ){

			//reset parent directory id
			$prn_id = key(nc__db__getFolders("NULL"));

		}	//end if parent directory is ROOT

		//get list of files for the specified location
		return array_merge(nc__db__getFiles($prn_id), nc__db__getFolders($prn_id));

	}	//end function 'nc__io__getFiles'

?>