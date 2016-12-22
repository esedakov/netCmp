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

		//close connection
		nc__db__closeCon($conn);

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

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT id FROM netcmp_file_mgmt_file " .
					"WHERE name = '$name' AND dir_id = $dirId";

		//test
		echo "nc__db__isIORecordExist => ".$tmpQuery;

		//retrieve file id
		$qrs = $conn->query($tmpQuery);

		//init result flag
		$tmpRes = false;

		//check if retrieved any record
		if( $qrs ){

			//success
			$tmpRes = true;

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__isIORecordExist'

	//create file or folder record
	//input(s):
	//	name: (text) file or folder name
	//	dirId: (integer) directory id, where file or folder will reside
	//	perms: (fperm) file or folder permissions
	//	ownerId: (integer) user that created this file or folder
	//	type: (integer) file type
	//		1: any non-code text file (such as readme, etc ...)
	//		2: image file
	//		3: code file
	//		4: cfg file
	//		5: other (folder)
	//output(s):
	//	(integer) => file/folder id
	function nc__db__createIORecord($name, $dirId, $perms, $ownerId, $type){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "INSERT INTO netcmp_file_mgmt_file " .
						"(name,dir_id,created,modified,perm,owner_id,type,suspend) " .
						"VALUES ('$name', $dirId, NOW(), NOW(), $perms, $ownerId, $type, 0)";

		//test
		echo "nc__db__createIORecord => ".$tmpQuery;

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//get file/folder id
		$tmpObjId = mysqli_insert_id($conn);

		//close connection
		nc__db__closeCon($conn);

		//return id for the new file/folder
		return $tmpObjId;

	}	//end function 'nc__db__createIORecord'

	//move file/folder to the specified parent directory
	//input(s):
	//	id: (integer) file/folder id
	//	dirId: (integer) new parent directory id (do not change if -1)
	//	name: (text) new file name (do not change if '')
	//output(s):
	//	(boolean) => TRUE:success, FALSE:failure
	function nc__db__moveIOEntity($id, $dirId, $name){

		//establish connection
		$conn = nc__db__getDBCon();

		//init SET portion of the UPDATE query
		$tmpQuery = "";

		//if new parent directory id is not -1
		if( $dirId != -1 ){

			//add change for parent directory id
			$tmpQuery .= "dir_id = ".$dirId." ";

		}	//end if new parent directory id is not -1

		//if name is not empty string
		if( empty($name) == false ){

			//if need to separate UPDATE SET fields 'dir_id' from 'name'
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add change for name
			$tmpQuery .= "name = ".$name." ";

		}	//end if name is not empty string

		//complete query
		$tmpQuery = "UPDATE netcmp_file_mgmt_file SET " . $tmpQuery .
					"WHERE id = " . $id;

		//test
		echo "nc__db__moveIOEntity => ".$tmpQuery;

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//result: is update succeeded
		$tmpRes = empty($qrs) == false;

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__moveIOEntity'

	//link DB file entry with actual file location
	//input(s):
	//	fileId: (integer) file id
	//	resType: (integer) resource type identifier, where file is stored
	//				0: locally on this server
	//				1: externally on the GIT
	//	loc: (text) location parameter
	//				if locally stored, then this is a path to the file (w/o file name)
	//				if externall stored, then this is a url (w/o file name)
	//	name: (text) file name
	//output(s): (none)
	function nc__db__setFileLocation($fileId, $resType, $loc, $name){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "INSERT INTO netcmp_file_mgmt_file_location " .
						"(file_id,resource_type,location,name) " .
						"VALUES ($file_id, $resType, $loc, $name)";

		//test
		echo "nc__db__setFileLocation => ".$tmpQuery;

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//get file/folder id
		$tmpObjId = mysqli_insert_id($conn);

		//close connection
		nc__db__closeCon($conn);

	}	//end function 'nc__db__setFileLocation'

	//update file or folder attributes: modified date, perms, name, ownerId, dirId, suspend
	//input(s):
	//	id: (integer) file or folder id
	//	attrs: (fattr) file attributes
	//output(s):
	//	(boolean) => TRUE if success, FALSE if failure
	function nc__db__updateIOAttrs($id, $attrs){

		//initialize query string
		$tmpQuery = "";

		//if modification date changed
		if( is_null($attrs._date) == false ){

			//add assignment
			$tmpQuery .= "modified = ".$attrs._date." ";

		}

		//if access/modification permissions changed
		if( is_null($attrs._fperm) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";

			}

			//add assignment
			$tmpQuery .= "perm = ".$attrs._fperm." ";
			
		}

		//if name changed
		if( is_null($attrs._name) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "name = '".$attrs._name."' ";
			
		}

		//if owner changed
		if( is_null($attrs._ownerId) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "owner_id = ".$attrs._ownerId." ";
			
		}

		//if parent directory id changed
		if( is_null($attrs._dirId) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "dir_id = ".$attrs._dirId." ";
			
		}

		//if suspend flag changed
		if( is_null($attrs._isSuspended) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "suspend = ".$attrs._isSuspended." ";
			
		}

		//if some attributes are required to be changed
		if( empty($tmpQuery) == false ){

			//establish connection
			//$conn = nc__db__getDBCon();

			//complete query
			$tmpQuery = "UPDATE netcmp_file_mgmt_file SET " . $tmpQuery .
						"WHERE id = " . $id;

			//insert new record for file/directory entity
			//$qrs = $conn->query($tmpQuery);

			//get file/folder id
			//$tmpObjId = mysqli_insert_id($conn);

			//close connection
			//nc__db__closeCon($conn);

		}
		
		//test
		echo "nc__db__updateIOAttrs => ".$tmpQuery;

	}	//end function 'nc__db__updateIOAttrs'

?>