<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	retrieve file ids or actual file contents
	Used by:		(AJAX:vw__dbg)
	Dependencies:	(none)
	*/

	//check if POST has 'prj_id' and 'file_type' are passed in
	if( array_key_exists('f', $_POST) && array_key_exists('i', $_POST) ){

		//include library for function 'nc__util__reInitSession'
		require_once './lib/lib__utils.php';

		//include library for functions 'nc__db__getProjectCodeFiles'
		//	and 'nc__db__getFullFilePaths'
		require_once './lib/lib__db.php';

		//include library for permission constants
		require_once './lib/lib__fperm.php';

		//include library for function 'nc__io__getIOEntries'
		require_once './lib/lib__io.php';

		//re-initialize session
		nc__util__reInitSession();

		//init list of ids
		$tmpListFileIds = "";

		//if 'l' (list of file ids) is not given
		if( array_key_exists('l', $_POST) == false ||
			strlen($_POST['l']) == 0 ){

			//get list of file ids for the specified project
			//	Note: we need files from all subfolders that
			//	belong to this project folder
			$tmpListFileIds = nc__db__getProjectCodeFiles($_POST['f']);

		} else {	//else, if 'l' is given

			//assign list of file ids
			$tmpListFileIds = $_POST['l'];

		}	//end if 'l' (list of file ids) is given

		//if list of file ids is empty
		if( strlen($tmpListFileIds) == 0 ){

			//quit now
			exit();

		}	//end if list of file ids is empty

		//if should get only code file ids
		if( $_POST['i'] == 'true' ){

			//return file ids
			echo $tmpListFileIds;

			//quit now
			exit();

		}	//end if should get only code file ids

		//convert list of file ids into array of file ids
		//	see: http://stackoverflow.com/a/1209461
		$tmpFileIdArr = explode( ',', $tmpListFileIds );

		//test
		//var_dump($tmpFileIdArr);

		//get full file paths
		$tmpFileIdToFullPathArr = nc__db__getFullFilePaths($tmpFileIdArr);

		//test
		//var_dump($tmpFileIdToFullPathArr);

		//init flag that indicates whether reading first file or later
		$tmpIsFirstFile = true;

		//loop thru array of file id=>path
		foreach( $tmpFileIdToFullPathArr as $tId => $tPath ){

			//test
			//var_dump($tId);
			//test
			//var_dump($tPath);

			//if not first file
			if( $tmpIsFirstFile == false ){

				//output new line
				echo "\n\r";

			}	//end if not first file

			//read file from the server
			//TODO: this approach only works for locally stored files
			readfile($tPath);

		}	//end loop thru array of file id=>path

	}	//end if POST has prj_id (f) and getFileIds (i)