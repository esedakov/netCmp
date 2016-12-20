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
		mysqli_close($conn);

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
		$qrs = $conn->query("SELECT id FROM netcmp_access_user WHERE name = '".$userName."'");

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

	//check if given password is correct for the specified user name
	//input(s):
	//	pwd: (text) password
	//	name: (text) user name
	//output(s):
	//	(boolean) => TRUE if password matches, FALSE otherwise
	function nc__db__isPasswordCorrect($pwd, $name){

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query("SELECT AES_DECRYPT(pwd, '".$_SESSION['consts']['db']['key']."') as p FROM netcmp_access_user WHERE name = '".$name."'");

		//check if user password was retrieved successfully
		if( $qrs ){

			//get the password
			$tmpDbPassword = $qrs->fetch_assoc()["p"];

			//if user password is matching
			if( $pwd == $tmpDbPassword ){

				//success
				return true;

			}	//end if user password is matching

		}	//end if user is found

		//failure
		return false;

	}	//end function 'nc__db__isPasswordCorrect'

	//check if file or folder record exists
	//input(s):
	//	name: (text) file or folder name
	//	dirId: (integer) directory id, where file or folder will reside
	//output(s):
	//	(boolean) => TRUE:if it exists, FALSE: otherwise
	function nc__db__isIORecordExist($name, $dirId){


	}	//end function 'nc__db__isIORecordExist'

	//create file or folder record
?>