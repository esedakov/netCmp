<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-19
	Description:	record expand/shrink page view
	Used by:		(AJAX:vw__page)
	Dependencies:	(lib__utils.php)
	*/

	//include library for function 'nc__util__reInitSession'
	require_once './lib/lib__utils.php';

	//re-initialize session
	nc__util__reInitSession();

	//log change of session
	nc__util__session("pr__logout.php", "[consts][user][id]", "0");

	//log out, by reseting user id to 0
	$_SESSION["consts"]['user']["id"] = 0;

?>