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

?>