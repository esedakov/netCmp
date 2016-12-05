<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-31
	Description:	get user information
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//include functions for DB
	require 'lib__db.php';

	//get user information, entered during registration
	//input(s):
	//	id: user id
	//output(s):
	//	Array:
	//		name -> user name
	//		email -> user email
	//		created -> date at which account was created
	//		modified -> date at which account was last modified
	//		logo -> file id for logo image
	//		suspend -> is account suspended
	function nc__lib__getUser($id){

		//get connection object
		$conn = nc__db__getDBCon();

		//if id is invalid
		if( is_null($id) || empty($id) ){

			//error -- user id is invalid
			nc__util__error('(nc__lib__getUser:1) invalid user id');

		}	//end if id is invalid

		//retrieve data from DB about user
		$qrs = $conn->query(
			'SELECT '. 
				'name, email, created, modified, logo, suspend '.
			'FROM netcmp_access_user'.
			'WHERE id = '.$id
		);


	}	//end function 'nc__lib__getUser'


?>