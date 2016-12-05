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


	}	//end function 'nc__lib__getUser'


?>