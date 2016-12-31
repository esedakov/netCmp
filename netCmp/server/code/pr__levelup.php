<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	try to navigate one level up (open-file browsing)
	Used by:		(AJAX:vw__openFileDialog.php)
	Dependencies:	(lib__utils.php)
	*/

	//include library for function 'nc__util__reInitSession'
	require_once './lib/lib__utils.php';

	//include DB library for function 'nc__db__getIOEntryAttrs'
	require_once './lib/lib__db.php';

	//re-initialize session
	nc__util__reInitSession();

	//get attributes of the current folder
	$tmpDirAttrs = nc__db__getIOEntryAttrs($_SESSION["file"]["open"], false);

	//if folder was not found
	if( is_null($tmpDirAttrs) ){

		//error
		die("folder was not found");

	}	//end if folder was not found

	//if this folder has no parent
	if( is_null($tmpDirAttrs->_dirId) ){

		//exit
		exit;

	}	//end if this folder has no parent

	//navigate one level up in file/folder hierarchy
	$_SESSION["file"]["open"] = $tmpDirAttrs->_dirId;

	//output open-file dialog
	require 'vw__openFileDialog.php';

?>