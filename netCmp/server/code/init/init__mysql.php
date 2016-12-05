<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	init\test mysql
	Used by:		init__request
	Dependencies:	(none)
	*/

	//start mysql access
	$conn = mysql_connect(
		'localhost', 
		$_SESSION['consts']['db']['username'],		//username
		$_SESSION['consts']['db']['password']		//password
	);

	//if connection error
	if ($conn->connect_error) {

		//could not connect to database
	    die("Connection failed: " . $conn->connect_error);

	}	//end if connection error

	//init sql statement for updating google api information if needed
	$sqlUpdGApi = '';

	//if google file for images has been created
	if( $gapi_images != '' ){

		//create SET statement for updating file id for file 'images'
		$sqlUpdGApi .= "SET img_file_id = '" . $gapi_images . "' ";

	}	//end if google file for images has been created

	//if google file for texts has been created
	if( $gapi_texts != '' ){

		//create SET statement for updating file id for file 'texts'
		$sqlUpdGApi .= ($sqlUpdGApi == '' ? '' : ',') . "SET img_file_id = '" . $gapi_texts . "' ";

	}	//end if google file for texts has been created

	//if need to update table that stores google api information
	if( $sqlUpdGApi != '' ){

		//complete sql statement
		$sqlUpdGApi = 'UPDATE netcmp_google_api ' . $sqlUpdGApi;

		//if sql statement did not execute successfully
		if ($conn->query($sqlUpdGApi) === FALSE) {

			//could not update database
			die("Could not initialize google api table " . $conn->error);

		}	//end if sql statement did not execute successfully

	}	//end if need to update table that stores google api information

?>