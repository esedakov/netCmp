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

	//get user password
	$tmpPass = $_POST["nc_user_password"];

	//check if password is not valid
	if( nc__util__isPasswordValid($tmpPass) == false ){

		//error -- (TODO) -- password is not valid
		nc__util__error("password should contain ".$nc__util__g__pass__minchars." characters that are limited to lower and upper letters as well as digits");

	}	//end if password is not valid

	//if registering new user
	if( $doRegNewUser ){

		//establish connection to db
		$conn = nc__db__getDBCon();

		//get user email
		$tmpEmail = $_POST["nc_user_email"];

		//if user email is not valid
		if( nc__util__isEmailValid($tmpName) ){

			//error -- (TODO) -- user email is not valid
			nc__util__error("registration process requires a valid user email");

		}	//end if user email is not valid

		//TODO: for now we would not have logo
		$tmpLogo = "NULL";

		//create new record in DB for this user
		$res = $conn->query(
			"INSERT INTO netcmp_access_user ".
			"(name,email,created,modified,pwd,logo,suspend)".
			" VALUES ".
			"(".
				"'".$tmpName."',".
				"'".$tmpEmail."',".
				"NOW(),".
				"NOW(),".
				"AES_ENCRYPT('".$tmpPass."', NetCmpEncCert),".
				"".$tmpLogo.",".
				"1".		//suspended, until it is confirmed otherwise
			")"
		);

		//check if query did not succeed
		if( $res !== TRUE ){

			//error -- (TODO) -- could not create new user record
			nc__util__error("failed to created new user record");

		}	//end if query did not succeed

		//close DB connection
		nc__db__closeCon($conn);

		//try to send email to the specified address
		mail(
			$tmpEmail,
			"Please, activate your new account!",
			"If you had created account at NetCMP, please click link below to complete registration process; otherwise, ignore this email. To activate account: ".$_SERVER["SERVER_NAME"]."/pr__register.php?e=".$tmpEmail
		);

	}	//end if registering new user
