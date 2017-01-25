<?php if(!isset($_SESSION)){session_start();}  
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-25
	Description:	change user information
	Used by:		(vw__user)
	Dependencies:	(lib__db),(lib__utils)
	*/

	//include library for db function 'nc__db__isPasswordCorrect', 
	//	'nc__db__changePassword', 'nc__db__getUserName'
	require_once './lib/lib__db.php';

	//include library for utility functions
	require_once './lib/lib__utils.php';

	//re-initialize session
	nc__util__reInitSession();

	//if 'npwd' or 'opwd' are not given
	if( !nc__util__isFieldSet("npwd") || !nc__util__isFieldSet("opwd") ){

		//error
		nc__util__error("need to submit both new and old password");

	}	//end if 'npwd' or 'opwd' are not given

	//assign vars for new and old password
	$lv__old = $_POST["opwd"];
	$lv__new = $_POST["npwd"];

	//if new or old password is not valid
	if( nc__util__isPasswordValid($lv__old) == false ||
		nc__util__isPasswordValid($lv__new) == false ){

		//error -- typed password is not valid
		nc__util__error("password should contain ".$nc__util__g__pass__minchars." characters that are limited to lower and upper letters as well as digits");

	}	//end if password is not valid

	//get user name
	$lv__userName = nc__db__getUserName($_SESSION['consts']['user']['id']);

	//if old password is not correct
	if( nc__db__isPasswordCorrect($lv__old, $lv__userName) == false ){

		//error -- password is not correct
		nc__util__error("password does not match");

	}	//end if old password is not correct

	//change password
	nc__db__changePassword($lv__new);

	//load referrer page
	nc__util__redirect( $_SERVER['HTTP_REFERER'] );