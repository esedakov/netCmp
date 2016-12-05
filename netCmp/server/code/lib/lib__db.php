<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-31
	Description:	utility functions for using with DB
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//include general utility functions
	require 'lib__utils.php'

	//get database connection object
	//input(s): (none)
	//output(s):
	//	conn: (DB connection object) established connection object with mysql
	function nc__db__getDBCon(){

		//get mysql connection object
		$conn = mysql_connect(
			'localhost', 
			$_SESSION['consts']['db']['username'],		//username
			$_SESSION['consts']['db']['password']		//password
		);

	}	//end function 'getDBCon'
?>