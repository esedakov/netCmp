<?php
	/*
	Developer:	Eduard Sedakov
	Date:		2016-10-08
	Description:	process outter (JSON) request
	Used by:	none
	Dependencies:	none
	*/
	//print request structure
	session_start();
	//error_log(http_build_query($GLOBALS));
	//var_dump($GLOBALS);
	//var_dump($_SESSION);
	echo '<pre>' . var_export($_SESSION, true) . '</pre>';
	//error_log("==========================================================================");
	//error_log(http_build_query($_POST));
?>