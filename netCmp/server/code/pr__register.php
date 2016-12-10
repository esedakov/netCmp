<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-11
	Description:	complete registration of a new user
	Used by:		(post__login)
	Dependencies:	(init__request),(lib__db)
	*/

	//process incoming url parameters
	require_once './init/init__request.php';

	//include library for DB functions
	require_once './lib/lib__db.php';

	//check if email parameter has been passed in (it should be 'ue')
	if( array_key_exists("ue", $GLOBALS) ){

	}	//end if email parameter has been passed in
