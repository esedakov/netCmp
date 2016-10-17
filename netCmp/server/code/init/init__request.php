<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		(everyone)
	Dependencies:	(none)
	*/

	//process input url parameters and allow only those that were permitted 

	//get name of the file
	$fileName = $_SERVER['SCRIPT_NAME'];
	//get file url parameters and split it by '&'
	$urlParamArr = explode('&', $_SERVER['QUERY_STRING']);