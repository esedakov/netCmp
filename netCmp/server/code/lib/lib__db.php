<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-08
	Description:	utility functions for using with DB
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//include general utility functions
	require_once 'lib__utils.php';

	//get database connection object
	//input(s): (none)
	//output(s):
	//	conn: (DB connection object) established connection object with mysql
	function nc__db__getDBCon(){

		//get mysql connection object
		$conn = mysqli_connect(
			'localhost', 
			$_SESSION['consts']['db']['username'],		//username
			$_SESSION['consts']['db']['password'],		//password
			"netcmp"
		);

		//if not connected
		if( !$conn ){

			//error -- not connected
			nc__util__error('(getDBCon:1) cannot connect to database');

		}	//end if not connected

		//return connection object back to caller
		return $conn;

	}	//end function 'getDBCon'

	//close connection with DB
	//input(s):
	//	conn: (DB connection object) established connection object with mysql
	//output(s): (none)
	function nc__db__closeCon($conn){

		//close connection
		mysql_close($conn);

	}	//end function 'nc__db__closeCon'

	//is there user with exact given name
	//input(s):
	//	userName: (text) user name
	//output(s):
	//	(integer) => id existing user OR -1 if there is no such user
	function nc__db__isUserExist($userName){

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query('SELECT id FROM netcmp_access_user WHERE name = '.$userName);

		//initialize return id
		$tmpResId = -1;

		//if user is found
		if( $qrs ){

			//get results row
			$row = $qrs->fetch_assoc();

			//retrieve user id
			$tmpResId = $row['id'];

		}	//end if user is found

		//close connection
		nc__db__closeCon($conn);

		//return user id
		return $tmpResId;

	}	//end function 'nc__db__isUserExist'
?>