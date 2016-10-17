<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		(everyone)
	Dependencies:	(none)
	*/

	//process input url parameters and allow only those that were permitted 

	//get name of the file
	$fileName = $_SERVER['SCRIPT_NAME'];
	//get file url parameters and split it by '&'
	$urlParamArr = explode('&', $_SERVER['QUERY_STRING']);

	//check if session exists
	//	see: http://stackoverflow.com/questions/3538513/detect-if-php-session-exists
	if( session_id() == '' || !isset($_SESSION) ){

		//initialize session
		require 'init__session.php';

		//initialize google api
		require 'init__gapi.php';

		//initialize mysql
		require 'init__mysql.php';

	}	//end if session exists

	//get permitted list of url parameters
	$permUrlParam = $_SESSION['consts']['params'][$fileName];

	//loop thru given url parameters
	for( $curParamIdx = 0; $curParamIdx < count($urlParamArr); $curParamIdx++ ){
		
		//split current name-value pair by '='
		$nameValPairArr = explode('=', urlParamArr[$curParamIdx]);

		//get current url parameter name
		$paramName = $nameValPairArr[0];
	}	//end loop thru url parameters
?>