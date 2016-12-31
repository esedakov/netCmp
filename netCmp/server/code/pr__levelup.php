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
?>