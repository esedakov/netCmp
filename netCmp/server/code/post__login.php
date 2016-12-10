<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-11
	Description:	login and if necessary register new user
	Used by:		(vw__login)
	Dependencies:	(lib__db),(lib__utils)
	*/

	//include library for db function 'nc__db__getDBCon'
	require_once './lib/lib__db.php';

	//include library for utility functions
	require_once './lib/lib__utils.php';

	//if any required field is not set
	if(
		//if user name is not specified
		nc__util__isFieldSet("nc_user_name") == false ||

		//if password is not specified
		nc__util__isFieldSet("nc_user_password") == false 
	) {

		//error -- (TODO) -- user user name or password is not specified
		nc__util__error("user name or password is not set during login/registration step");

	}	//end if any required fields is not set

	//do register new user, i.e. is user name specified and it is not empty
	$doRegNewUser = nc__util__isFieldSet("nc_user_email");

	//get user user name
	$tmpName = $_POST["nc_user_name"];

	//check if user name is not valid (formatted incorrectly)
	if( nc__util__isUserNameValid($tmpName, $doRegNewUser) == false ){

		//error -- (TODO) -- user name is not valid
		nc__util__error("user name is not valid");

	}	//end if user name is not valid
