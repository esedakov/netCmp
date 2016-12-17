<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		(everyone)
	Dependencies:	(none)
	*/

	//include utility functions
	require_once __DIR__.'/../lib/lib__utils.php';

	//include utility functions
	require_once __DIR__.'/../lib/lib__security.php';

	//process input url parameters and allow only those that were permitted 

	//get name of the file
	$fileName = nc__util__getPHPFileName($_SERVER['SCRIPT_NAME']);

	//get file url parameters and split it by '&'
	$urlParamArr = explode('&', $_SERVER['QUERY_STRING']);

	//check if session exists
	//	see: http://stackoverflow.com/questions/3538513/detect-if-php-session-exists
	if( session_id() == '' || !isset($_SESSION) ){

		//initialize session
		require 'init__session.php';

		//initialize mysql
		require 'init__mysql.php';

		//check if folder with publicly accessible folders not exists
		if( !is_dir($_SESSION['consts']['pub_folder']) ){
			
			//create this folder
			mkdir( $_SESSION['consts']['pub_folder'], 0777 );

		}	//end if folder with publicly accessible folders not exists

	}	//end if session exists

	//get permitted list of url parameters
	$permUrlParam = $_SESSION['consts']['params'][$fileName];

	//loop thru given url parameters
	for( $curParamIdx = 0; $curParamIdx < count($urlParamArr); $curParamIdx++ ){
		
		//split current name-value pair by '='
		$nameValPairArr = explode('=', $urlParamArr[$curParamIdx]);

		//get current url parameter name
		$paramName = $nameValPairArr[0];

		//compose unique variable name
		$varName = "u".$paramName;

		//if this variable acceptable
		if( 
			//if this variable name is among defined url parameters
			array_key_exists($paramName, $permUrlParam) &&
			//AND it is not yet declared
			array_key_exists($varName, $GLOBALS) == false
		){

			//init current url parameter value
			$paramVal = '';

			//if there is a value
			if( count($nameValPairArr) > 1 ){

				//set value
				$paramVal = $nameValPairArr[1];

			}	//end if there is a value

			//if needs to be decoded
			if( $permUrlParam[$paramName]['enc'] ){

				//decode variable value
				$paramVal = nc__secur__decode($paramVal);

			}	//end if needs to be decoded

			//if needs to be decrypted
			if( $permUrlParam[$paramName]['crypt'] ){

				//decrypt variable value
				$paramVal = nc__secur__decrypt($paramVal);

			}	//end if needs to be decoded

			//if range of values listed AND determined value is not acceptable
			if( array_key_exists('val', $permUrlParam[$paramName]) == true &&
				array_key_exists($paramVal, $permUrlParam[$paramName]['val']) == false ){

				//error
				die("url parameter '$paramName' is not accepted. Aborting!");

			}	//end if determined value is acceptable
			
			//define new variable
			$GLOBALS[$varName] = $paramVal;

		}	//end if this variable acceptable

	}	//end loop thru url parameters

?>