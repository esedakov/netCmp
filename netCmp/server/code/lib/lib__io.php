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
	//	isCodeFile: (boolean) is this a code file OR just a regular text file
	//output(s):
	//	(integer) => file id
	//	-1 => if failed
	function nc__io__create($name, $isFile, $dirId, $perms, $isCodeFile){

		//check if user is not logged in
		if( nc__util__isNotLoggedIn() ){

			//error -- user needs to be logged in to create new file/folder
			nc__util__error("(nc__io__create:1) user needs to be logged in");

		}	//end if user is not logged in

		//if file/folder does not exist
		if( nc__db__isIORecordExist($name, $dirId) == false ){


		}	//end if file/folder does not exist


	}	//end function 'nc__io__create'

?>