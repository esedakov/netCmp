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

	//include library for file attributes class
	require_once 'lib__fattr.php';

	//include library for file location class
	require_once 'lib__floc.php';

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
		error_log("nc__db__isIORecordExist => ".$tmpQuery, 0);

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
		error_log("nc__db__createIORecord => ".$tmpQuery);

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
		error_log("nc__db__moveIOEntity => ".$tmpQuery, 0);

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
		$tmpQuery = "INSERT INTO netcmp_file_mgmt_file " .
						"(file_id,resource_type,location,name) " .
						"VALUES ($file_id, $resType, $loc, $name)";

		//test
		error_log("nc__db__setFileLocation => ".$tmpQuery, 0);

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//get file/folder id
		$tmpObjId = mysqli_insert_id($conn);

		//close connection
		nc__db__closeCon($conn);

	}	//end function 'nc__db__setFileLocation'

	//get file name for the specified file id
	//input(s):
	//	fileId: (integer) file id
	//output(s):
	//	(text) => file name
	function nc__db__getFileName($fileId){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT name FROM netcmp_file_mgmt_file WHERE file_id = $fileId";

		//test
		error_log("nc__db__getFileName => ".$tmpQuery, 0);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = "";

		//check if retrieved any record
		if( $qrs ){

			//get file name
			$tmpRes = $qrs->fetch_assoc()["name"];

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getFileName'

	//get list of folders in the specified folder id
	//input(s):
	//	prn_id: (text) id of the parent directory (if it is NULL, then this is ROOT dir)
	//output(s):
	//	array<folder_id:integer, file_attrs:nc__class__fattr> list of folders in the specified dir
	function nc__db__getFolders($prn_id){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT * FROM netcmp_file_mgmt_directory WHERE prn_id";

		//if parent id is NULL
		if( is_null($prn_id) || strtoupper($prn_id) == "NULL" ){

			//condition on NULL
			$tmpQuery .= " is NULL";

		} else {	//else, regular parent id

			//condition on regular integer
			$tmpQuery .= " = $prn_id";
		
		}	//end if parent id is NULL

		//test
		error_log("nc__db__getFolders => ".$tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init resulting array
		$tmpRes = array();

		//check if retrieved any record
		if( $qrs ){

			//loop thru query result records
			while( $row = $qrs->fetch_assoc() ){

				//add new record to the resulting array
				$tmpRes[ $row["id"] ] = new nc__class__fattr(
					//file/folder id
					$row["id"],
					//modification date
					$row["modified"],
					//folder type
					5,
					//file permissions
					$row["perm"],
					//file name
					$row["name"],
					//id of user that owns this file
					$row["owner_id"],
					//parent directory id
					$row["prn_id"],
					//is file suspended?
					$row["suspend"]
				);

			}	//end loop thru query result records

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getFolders'

	//return part of query string that conditions on directory id
	//input(s):
	//	prn_id: (text) directory id
	//output(s):
	//	(text) => part of query string
	function nc__db__getQueryCondOnDirId($prn_id){

		//if parent id is NULL
		if( is_null($prn_id) || strtoupper($prn_id) == "NULL" ){

			//condition on NULL
			return " is NULL";

		} else {	//else, regular parent id

			//condition on regular integer
			return " = $prn_id";
		
		}	//end if parent id is NULL

	}	//end function 'nc__db__getQueryCondOnDirId'

	//get list of files in the specified folder
	//input(s):
	//	prn_id: (text) id of parent directory OR NULL if root
	//output(s):
	//	array<file_id:integer, file_attrs:nc__class__fattr> list of files in the specified dir
	function nc__db__getFiles($prn_id){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT * FROM netcmp_file_mgmt_file WHERE dir_id".
					nc__db__getQueryCondOnDirId($prn_id);

		//test
		error_log("nc__db__getFiles => ".$tmpQuery, 0);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init resulting array
		$tmpRes = array();

		//check if retrieved any record
		if( $qrs ){

			//loop thru query result records
			while( $row = $qrs->fetch_assoc() ){

				//add new record to the resulting array
				$tmpRes[ $row["id"] ] = new nc__class__fattr(
					//file/folder id
					$row["id"],
					//modification date
					$row["modified"],
					//file type
					$row["type"],
					//file permissions
					$row["perm"],
					//file name
					$row["name"],
					//id of user that owns this file
					$row["owner_id"],
					//parent directory id
					$row["dir_id"],
					//is file suspended?
					$row["suspend"]
				);

			}	//end loop thru query result records

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getFiles'

	//input(s):
	//	fileId: (integer) file id
	//output(s):

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query

		//test

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = NULL;

		//check if retrieved any record
		if( $qrs ){

			//instantiate file attributes
				//file id
				$fileId,
	//get file/folder attributes for the specified file id
	//input(s):
	//	fId: (integer) file/folder id
	//	isFile: (boolean) is this a file or a folder
	//output(s):
	//	(nc__class__fattr) file/folder attributes
	//	or, null - if no file/folder was not found
	function nc__db__getIOEntryAttrs($fId, $isFile){

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT c.name,c.modified,c.perm,c.owner_id,c.suspend";

		//if retrieving attributes for a file
		if( $isFile ){

			//add 'type' and 'dir_id'
			$tmpQuery .= ",c.type,c.dir_id FROM netcmp_file_mgmt_file c ";

		} else {	//else, for a folder

			//add constant 5 for type and set dir_id with value of prn_id
			$tmpQuery .= ",5 as type,c.prn_id as dir_id FROM netcmp_file_mgmt_directory c ";

		}	//end if retrieving attributes for a file

		//if file/folder id is NULL
		if( is_null($fId) || strtoupper($fId) == "NULL" ){

			//if retrieving attributes for a file
			if( $isFile ){

				//add inner join to a directory table to narrow down to ROOT folder
				$tmpQuery .= "inner join netcmp_file_mgmt_directory p ( ".
								"p.id = c.dir_id AND ".
								"p.prn_id is NULL".
							 " )";

			} else {	//else, for a folder

				//add WHERE clause to condition to narrow down to ROOT folder
				$tmpQuery .= "WHERE c.prn_id is NULL";

			}	//end if retrieving attributes for a file

		} else {	//else, there is definitive file/folder id

			//condition on the given file/folder id
			$tmpQuery .= "WHERE c.id = $fId";

		}	//end if file/folder id is NULL

		//test
		error_log("nc__db__getIOEntryAttrs => ".$tmpQuery, 0);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = NULL;

		//check if retrieved any record
		if( $qrs ){

			//get data row
			$row = $qrs->fetch_assoc();

			//instantiate file attributes
			$tmpRes = new nc__class__fattr(
				//file id
				$fId,
				//modification date
				$row["modified"],
				//file/folder type
				$row["type"],
				//file permissions
				$row["perm"],
				//file name
				$row["name"],
				//id of user that owns this file
				$row["owner_id"],
				//parent directory id
				$row["dir_id"],
				//is file suspended?
				$row["suspend"]
			);

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getIOEntryAttrs'

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

		//init result
		$tmpRes = false;

		//if some attributes needs to be changed
		if( empty($tmpQuery) == false ){

			//establish connection
			$conn = nc__db__getDBCon();

			//complete query
			$tmpQuery = "UPDATE netcmp_file_mgmt_file SET " . $tmpQuery .
						"WHERE id = " . $id;

			//insert new record for file/directory entity
			$qrs = $conn->query($tmpQuery);

			//set result
			$tmpRes = empty($qrs) == false;

			//close connection
			nc__db__closeCon($conn);

		}	//end if attributes needs to be changed
		
		//test
		error_log("nc__db__updateIOAttrs => ".$tmpQuery, 0);

		//return boolean result
		return $tmpRes;

	}	//end function 'nc__db__updateIOAttrs'

?>