<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		init__request
	Dependencies:	(none)
	------------------------------------
	Variables:
		gapi_images		google file id (if it got created)
		gapi_texts		google file id (if it got created)
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