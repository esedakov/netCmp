<?php if(!isset($_SESSION)){session_start();} 
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	init\test mysql
	Used by:		init__request
	Dependencies:	(none)
	*/

	//include DB functions
	require __DIR__.'/../lib/lib__db.php';

	//start mysql access to test if DB is accessible
	nc__db__getDBCon();

?>