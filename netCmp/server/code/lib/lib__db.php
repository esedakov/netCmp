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

		//output function name
		nc__util__func('db', 'nc__db__isUserExist');

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query("SELECT id FROM netcmp_access_user WHERE name = '".$userName."'");

		//initialize return id
		$tmpResId = -1;

		//if user is found
		if( $qrs && $qrs->num_rows > 0 ){

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

	//get user name
	//input(s):
	//	id: (integer) user id
	//output(s):
	//	(text) => user name
	//	null => if does not exist
	function nc__db__getUserName($id){

		//output function name
		nc__util__func('db', 'nc__db__getUserName');

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query("SELECT name FROM netcmp_access_user WHERE id = ".$id);

		//initialize return id
		$tmpResName = NULL;

		//if user is found
		if( $qrs && $qrs->num_rows > 0 ){

			//get results row
			$row = $qrs->fetch_assoc();

			//retrieve user id
			$tmpResName = $row['name'];

		}	//end if user is found

		//close connection
		nc__db__closeCon($conn);

		//return user id
		return $tmpResName;

	}	//end function 'nc__db__getUserName'

	//check if given password is correct for the specified user name
	//input(s):
	//	pwd: (text) password
	//	name: (text) user name
	//output(s):
	//	(boolean) => TRUE if password matches, FALSE otherwise
	function nc__db__isPasswordCorrect($pwd, $name){

		//output function name
		nc__util__func('db', 'nc__db__isPasswordCorrect');

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query("SELECT AES_DECRYPT(pwd, '".$_SESSION['consts']['db']['key']."') as p FROM netcmp_access_user WHERE name = '".$name."'");

		//check if user password was retrieved successfully
		if( $qrs && $qrs->num_rows > 0 ){

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

	//change password for the current user
	//input(s):
	//	pwd: (text) new password
	//output(s): (none)
	function nc__db__changePassword($pwd){

		//output function name
		nc__util__func('db', 'nc__db__changePassword');

		//establish connection
		$conn = nc__db__getDBCon();

		//select user with specified user name
		$qrs = $conn->query(
			"UPDATE netcmp_access_user ".
			"SET pwd = AES_ENCRYPT('".$pwd."', '".$_SESSION['consts']['db']['key']."') ".
			"WHERE id = ".$_SESSION['consts']['user']['id']
		);

		//close connection
		nc__db__closeCon($conn);

	}	//end function 'nc__db__changePassword'

	//check if file or folder record exists
	//input(s):
	//	name: (text) file or folder name
	//	dirId: (integer) directory id, where file or folder will reside
	//	isFile: (boolean) is this a file (TRUE) or a folder (FALSE)
	//output(s):
	//	(boolean) => TRUE:if it exists, FALSE: otherwise
	function nc__db__isIORecordExist($name, $dirId, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__isIORecordExist');

		//establish connection
		$conn = nc__db__getDBCon();

		//init table name
		$tmpTblName = "netcmp_file_mgmt_directory ";

		//if file
		if( $isFile ){

			//reset table name
			$tmpTblName = "netcmp_file_mgmt_file ";

		}	//end if file

		//compose query
		$tmpQuery = "SELECT id FROM " . $tmpTblName .
					"WHERE name = '$name' AND dir_id " . nc__db__getQueryCondOnDirId($dirId);

		//output query
		nc__util__query("nc__db__isIORecordExist", $tmpQuery);

		//retrieve file id
		$qrs = $conn->query($tmpQuery);

		//init result flag
		$tmpRes = false;

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//success
			$tmpRes = true;

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__isIORecordExist'

	//ES 2017-01-21 (b_file_hierarchy): create new program
	//input(s):
	//	id: (integer) directory id, where program's files will be stored
	//output(s):
	//	(integer) => program id
	function nc__db__createProgram($id){

		//output function name
		nc__util__func('db', 'nc__db__createProgram');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "INSERT INTO netcmp_prs_prog " .
			"(dir_id, suspend) " .
			"VALUES ($id, 0)";

		//output query
		nc__util__query("nc__db__createProgram", $tmpQuery);

		//insert new record for file/directory entity
		$conn->query($tmpQuery);

		//get file/folder id
		$tmpObjId = mysqli_insert_id($conn);

		//close connection
		nc__db__closeCon($conn);

		//return id for the new file/folder
		return $tmpObjId;

	}	//ES 2017-01-21 (b_file_hierarchy): end function 'nc__db__createProgram'

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

		//output function name
		nc__util__func('db', 'nc__db__createIORecord');

		//establish connection
		$conn = nc__db__getDBCon();

		//init table name
		$tmpTblName = "netcmp_file_mgmt_file";

		//init field name for parent directory id
		$tmpDirIdFldName = "dir_id,";

		//init field name for type
		$tmpTypeFldName = "type,";

		//init value for type field
		$tmpTypeVal = $type.",";

		//if creating a folder
		if( $type == '5' ){

			//reset table name
			$tmpTblName = "netcmp_file_mgmt_directory";

			//reset field name or directory id
			$tmpDirIdFldName = "prn_id,";

			//there is no type field in directory table, so reset field name and value to ''
			$tmpTypeFldName = "";
			$tmpTypeVal = "";

		}	//end if creating a folder

		//compose query
		$tmpQuery = "INSERT INTO " . $tmpTblName . " " .
			"(name,".$tmpDirIdFldName."created,modified,perm,owner_id,".$tmpTypeFldName."suspend) " .
			"VALUES ('$name', $dirId, NOW(), NOW(), $perms, $ownerId,".$tmpTypeVal."0)";

		//output query
		//ES 2017-01-22 (b_dbg_app): add ':1' to function name in query log to
			//	separate it from the another query log
		nc__util__query("nc__db__createIORecord:1", $tmpQuery);

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//get file/folder id
		$tmpObjId = mysqli_insert_id($conn);


		//ES 2017-01-22 (b_dbg_app): if this is folder or code file
		if( $type == '5' || $type == '3' ){
			
			//compose query
			//	see: http://stackoverflow.com/a/10644192
			$tmpQuery = "INSERT INTO netcmp_file_mgmt_io_to_project ".
				"(id,type,fld_id,prj_id) ";

			//ES 2017-01-24 (b_dbg_app): if new folder is inside root
			if( $type == '5' && $dirId == $_SESSION['consts']['root_id'] ){

				//create project
				$prjId = nc__db__createProgram($tmpObjId);

				//add up remaining query
				$tmpQuery .= "VALUES ($tmpObjId, $type, $dirId, $prjId)";

			//else, if this is a regular folder (not in root) or any code file
			} else {

				//select project id from the folder record
				$tmpQuery .= "SELECT $tmpObjId, $type, $dirId, prj_id FROM ".
				"netcmp_file_mgmt_io_to_project WHERE ".
					"type = 5 AND id = $dirId";

			}	//ES 2017-01-24 (b_dbg_app): end if new folder is inside root

			//ES 2017-01-24 (b_dbg_app): log query
			nc__util__query("nc__db__createIORecord:2", $tmpQuery);

			//ES 2017-01-24 (b_dbg_app): insert new record that links IO entry to project
			$conn->query($tmpQuery);

		}	//ES 2017-01-22 (b_dbg_app): end if this is folder or code file

		//close connection
		nc__db__closeCon($conn);

		//return id for the new file/folder
		return $tmpObjId;

	}	//end function 'nc__db__createIORecord'

	//move file/folder to the specified parent directory
	//input(s):
	//	id: (integer) file/folder id
	//	dirId: (integer) new parent directory id (do not change if -1)
	//	isFIle: (boolean) do move a file (TRUE) or a folder (FALSE)
	//output(s):
	//	(boolean) => TRUE:success, FALSE:failure
	function nc__db__moveIOEntity($id, $dirId, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__moveIOEntity');

		//establish connection
		$conn = nc__db__getDBCon();

		//init SET portion of the UPDATE query
		$tmpQuery = "";

		//if new parent directory id is not -1
		if( $dirId != -1 ){

			//init string to name a parent directory id field
			$tmpFieldName = "prn_id";

			//if moving a file
			if( $isFile ){

				//reset field name
				$tmpFieldName = "dir_id";

			}	//end if moving a file

			//add change for parent directory id
			$tmpQuery .=  $tmpFieldName . nc__db__getQueryCondOnDirId($dirId) . " ";

		}	//end if new parent directory id is not -1

		//init string for table name
		$tmpTblName = "netcmp_file_mgmt_directory";

		//if moving a file
		if( $isFile ){

			//reset table name
			$tmpTblName = "netcmp_file_mgmt_file";

		}	//end if moving a file

		//complete query
		$tmpQuery = "UPDATE " . $tmpTblName . " SET " . $tmpQuery .
					"WHERE id = " . $id;

		//output query
		nc__util__query("nc__db__moveIOEntity", $tmpQuery);

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//result: is update succeeded
		$tmpRes = $qrs ? true :  false;

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

		//output function name
		nc__util__func('db', 'nc__db__setFileLocation');

		//establish connection
		$conn = nc__db__getDBCon();

		//change path parameter to contain double slash
		$loc = str_replace("/", "//", $loc);
		$loc = str_replace("\\", "\\\\", $loc);

		//compose query
		$tmpQuery = "INSERT INTO netcmp_file_mgmt_file_location " .
						"(file_id,resource_type,location,name) " .
						//TODO: for locally stored files, location is not used
						//	it can be used for remoted stored to specify url
						"VALUES ($fileId, $resType, '', '".$name."')";

		//output query
		nc__util__query("nc__db__setFileLocation", $tmpQuery);

		//insert new record for file/directory entity
		$qrs = $conn->query($tmpQuery);

		//get file/folder id
		//$tmpObjId = mysqli_insert_id($conn);

		//close connection
		nc__db__closeCon($conn);

	}	//end function 'nc__db__setFileLocation'

	//get file name for the specified file id
	//input(s):
	//	fileId: (integer) file id
	//output(s):
	//	(text) => file name
	function nc__db__getFileName($fileId){

		//output function name
		nc__util__func('db', 'nc__db__getFileName');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT name FROM netcmp_file_mgmt_file WHERE file_id = $fileId";

		//output query
		nc__util__query("nc__db__getFileName", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = "";

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

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

		//output function name
		nc__util__func('db', 'nc__db__getFolders');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT * FROM netcmp_file_mgmt_directory WHERE prn_id";

		//specify parent id condition
		$tmpQuery .= nc__db__getQueryCondOnDirId($prn_id);

		//ES 2017-01-21 (b_file_hierarchy): select only non-suspended folders
		$tmpQuery .= " AND suspend = 0";

		//output query
		nc__util__query("nc__db__getFolders", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init resulting array
		$tmpRes = array();

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

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

		//output function name
		nc__util__func('db', 'nc__db__getQueryCondOnDirId');

		//if parent id is NULL
		if( nc__util__isRoot($prn_id) ){

			//condition on NULL
			return " is NULL";

		} else {	//else, regular parent id

			//condition on regular integer
			return " = $prn_id";
		
		}	//end if parent id is NULL

	}	//end function 'nc__db__getQueryCondOnDirId'

	//get list of file/folder ids stored in the specified directory
	//input(s):
	//	prn_id: (text) id of the parent directory OR NULL if root
	//	doGetFiles: (boolean) should get files
	//	doGetDirs: (boolean) should get folders
	//output(s):
	//	array<id:integer, attributes:nc__class__fattr> list of io entries in the specified dir
	function nc__db__getIOEntriesInDirectory($prn_id, $doGetFiles, $doGetDirs){

		//output function name
		nc__util__func('db', 'nc__db__getIOEntriesInDirectory');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "";

		//if should get files
		if( $doGetFiles ){

			//get files
			$tmpQuery = 
				"SELECT ".
					"f.id,f.name,f.dir_id,f.modified,f.perm,f.owner_id,f.type,f.suspend ".
				"FROM netcmp_file_mgmt_file f ".
				"WHERE dir_id".nc__db__getQueryCondOnDirId($prn_id)." AND suspend = 0";

		}	//end if should get files

		//if should get folders
		if( $doGetDirs ){

			//if getting files as well
			if( $doGetFiles ){

				//unite two queries
				$tmpQuery .= " UNION ALL ";

			}	//end if getting files as well

			//get folders
			$tmpQuery .=
				"SELECT ".
					"d.id,d.name,d.prn_id as dir_id,d.modified,d.perm,d.owner_id,5 as type,d.suspend ".
				"FROM netcmp_file_mgmt_directory d ".
				"WHERE prn_id".nc__db__getQueryCondOnDirId($prn_id);

		}	//end if should get folders

		//output query
		nc__util__query("nc__db__getIOEntriesInDirectory", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init resulting array
		$tmpRes = array();

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//loop thru query result records
			while( $row = $qrs->fetch_assoc() ){

				//specify prefix that is 'd' for directory and 'f' for file
				$tmpPrefix = $row["type"] == "5" ? "d" : "f";

				//add new record to the resulting array
				$tmpRes[ $tmpPrefix . $row["id"] ] = new nc__class__fattr(
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

	}	//end function 'nc__db__getIOEntriesInDirectory'

	//get list of files in the specified folder
	//input(s):
	//	prn_id: (text) id of parent directory OR NULL if root
	//output(s):
	//	array<file_id:integer, file_attrs:nc__class__fattr> list of files in the specified dir
	function nc__db__getFiles($prn_id){

		//output function name
		nc__util__func('db', 'nc__db__getFiles');

		return nc__db__getIOEntriesInDirectory($prn_id, true, false);

	}	//end function 'nc__db__getFiles'

	//get array of full file names for requested file ids
	//input(s):
	//	fileIds: (array<integer>) array of file ids
	//output(s):
	//	array<file_id:integer => full_file_path:text) map file id to full file path
	function nc__db__getFullFilePaths($fileIds){

		//output function name
		nc__util__func('db', 'nc__db__getFullFilePaths');

		//initialize empty resulting array
		$tmpRes = array();

		//if array of files ids is empty
		if( empty($fileIds) ){

			//quit with empty array
			return $tmpRes;

		}	//end if array of file ids is empty

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT * FROM netcmp_file_mgmt_file_location WHERE file_id in (";

		//loop thru array of file ids
		foreach( $fileIds as $idx => $id ){

			//if not the first index
			if( $idx > 0 ){

				//add comma separator between subsequent file ids in the query
				$tmpQuery .= ",";

			}	//end if not the first index

			//add file id to the query
			$tmpQuery .= $id;

		}	//end loop thru array of file ids

		//complete query
		$tmpQuery .= ")";

		//output query
		nc__util__query("nc__db__getFullFilePaths", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//loop thru query result records
			while( $row = $qrs->fetch_assoc() ){

				//add key value pair: file_id:integer => full_file_path:text
				//TODO: for now considering only local file storage
				$tmpRes[$row['file_id']] = $_SESSION['consts']['pub_folder'] . $row['name'];

			}	//end loop thru query result records

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getFullFilePaths'

	//get file location information
	//input(s):
	//	fileId: (integer) file id
	//output(s):
	//	(nc__class__flocation) => file location information
	function nc__db__getFileLocation($fileId){

		//output function name
		nc__util__func('db', 'nc__db__getFileLocation');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT * FROM netcmp_file_mgmt_file_location WHERE file_id = $fileId";

		//output query
		nc__util__query("nc__db__getFileLocation", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = NULL;

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//get row of data
			$row = $qrs->fetch_assoc();

			//instantiate file attributes
			$tmpRes = new nc__class__flocation(
				//file id
				$fileId,
				//type of resource, where this file is stored
				$row["resource_type"],
				//location path
				$row["location"],
				//file name
				$row["name"]
			);

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return file name
		return $tmpRes;

	}	//end function 'nc__db__getFileLocation'

	//check if file/folder exists with the given name in the specified directory
	//input(s):
	//	pid: (text) directory id or NULL if root
	//	name: (text) name of file/folder that should be checked for existance
	//	isFile: (boolean) is this a file or a folder
	//output(s):
	//	(boolean) => TRUE if file/folder with this name exists, FALSE otherwise
	function nc__db__checkIfExistsByName($pid, $name, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__checkIfExistsByName');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT id FROM netcmp_file_mgmt_";

		//if it is a file
		if( $isFile ){

			//complete database name
			$tmpQuery .= "file ";

		} else {	//else, it is a folder

			//complete database name
			$tmpQuery .= "directory ";

		}	//end if it is a file

		//specify name condition
		$tmpQuery .= "WHERE name = " . $name;

		//output query
		nc__util__query("nc__db__checkIfExistsByName", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result to be false, i.e. no such file/folder exists
		$tmpRes = false;

		//check if retrieved any record
		if( $qrs && $qrs->num_rows !== 0 ){

			//file/folder exists with the given name
			$tmpRes = true;

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__checkIfExistsByName'

	//check if file/folder exists by ID
	//input(s):
	//	id: (integer) file or folder id (if root, specify id not NULL)
	//	isFile: (boolean) is it a file (TRUE) or a folder (FALSE)
	//output(s):
	//	(boolean) => TRUE:exists, FALSE:does not exist
	function nc__db__checkIfExistsById($id, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__checkIfExistsById');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT name FROM netcmp_file_mgmt_";

		//if it is a file
		if( $isFile ){

			//complete database name
			$tmpQuery .= "file ";

		} else {	//else, it is a folder

			//complete database name
			$tmpQuery .= "directory ";

		}	//end if it is a file

		//specify id condition
		$tmpQuery .= "WHERE id = " . $id;

		//output query
		nc__util__query("nc__db__checkIfExistsById", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result to be false, i.e. no such file/folder exists
		$tmpRes = false;

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//file/folder exists with the given name
			$tmpRes = true;

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__checkIfExistsById'

	//get file/folder attributes for the specified file id
	//input(s):
	//	fId: (integer) file/folder id
	//	isFile: (boolean) is this a file or a folder
	//output(s):
	//	(nc__class__fattr) file/folder attributes
	//	or, null - if no file/folder was not found
	function nc__db__getIOEntryAttrs($fId, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__getIOEntryAttrs('.$fId.','.$isFile.')');

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
		if( is_null($fId) || $fId == 0 || strtoupper($fId) == "NULL" ){

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

		//output query
		nc__util__query("nc__db__getIOEntryAttrs", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result string to be returned
		$tmpRes = NULL;

		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

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
	//	isFile: (boolean) is it a file or a folder
	//output(s):
	//	(boolean) => TRUE if success, FALSE if failure
	function nc__db__updateIOAttrs($id, $attrs, $isFile){

		//output function name
		nc__util__func('db', 'nc__db__updateIOAttrs');

		//initialize query string
		$tmpQuery = "";

		//if modification date changed
		if( is_null($attrs->_date) == false ){

			//add assignment
			$tmpQuery .= "modified = ".$attrs->_date." ";

		}

		//if access/modification permissions changed
		if( is_null($attrs->_fperm) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";

			}

			//add assignment
			$tmpQuery .= "perm = ".$attrs->_fperm." ";
			
		}

		//if name changed
		if( is_null($attrs->_name) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "name = '".$attrs->_name."' ";
			
		}

		//if owner changed
		if( is_null($attrs->_ownerId) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "owner_id = ".$attrs->_ownerId." ";
			
		}

		//if parent directory id changed
		if( is_null($attrs->_dirId) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= ($isFile ? "dir" : "prn")."_id = ".$attrs->_dirId." ";
			
		}

		//if suspend flag changed
		if( is_null($attrs->_isSuspended) == false ){

			//if updated another field(s)
			if( empty($tmpQuery) == false ){

				//add comma
				$tmpQuery .= ",";
				
			}

			//add assignment
			$tmpQuery .= "suspend = ".($attrs->_isSuspended ? "1" : "0")." ";
			
		}

		//init result
		$tmpRes = false;

		//if some attributes needs to be changed
		if( empty($tmpQuery) == false ){

			//establish connection
			$conn = nc__db__getDBCon();

			//init table name
			$tmpTblName = "netcmp_file_mgmt_file";

			//if updating a folder
			if( $isFile == false ){

				//reset table name
				$tmpTblName = "netcmp_file_mgmt_directory";

			}	//end if updating a folder

			//complete query
			$tmpQuery = "UPDATE ".$tmpTblName." SET " . $tmpQuery .
						"WHERE id = " . $id;

			//insert new record for file/directory entity
			$qrs = $conn->query($tmpQuery);

			//set result
			$tmpRes = empty($qrs) == false;

			//close connection
			nc__db__closeCon($conn);

		}	//end if attributes needs to be changed
		
		//output query
		nc__util__query("nc__db__updateIOAttrs", $tmpQuery);

		//return boolean result
		return $tmpRes;

	}	//end function 'nc__db__updateIOAttrs'

	//ES 2017-01-22 (b_dbg_app): get ids for code files that belong to specified project
	//input(s):
	//	id: (integer) (project) folder id
	//output(s):
	//	(text) => list of code file ids
	function nc__db__getProjectCodeFiles($id){

		//output function name
		nc__util__func('db', 'nc__db__getProjectCodeFiles');

		//establish connection
		$conn = nc__db__getDBCon();

		//compose query
		$tmpQuery = "SELECT id FROM netcmp_file_mgmt_io_to_project".
						" WHERE type = 3 AND fld_id = $id";

		//output query
		nc__util__query("nc__db__getProjectCodeFiles", $tmpQuery);

		//execute query
		$qrs = $conn->query($tmpQuery);

		//init result to be empty file id list
		$tmpRes = "";
		
		//check if retrieved any record
		if( $qrs && $qrs->num_rows > 0 ){

			//loop thru query result records
			while( $row = $qrs->fetch_assoc() ){

				//if resulting list is not empty
				if( strlen($tmpRes) != 0 ){

					//add comma delimeter
					$tmpRes .= ",";

				}	//end if resulting list is not empty

				//add file id
				$tmpRes .= $row['id'];

			}	//end loop thru query result records

		}	//end if retrieved any record

		//close connection
		nc__db__closeCon($conn);

		//return result
		return $tmpRes;

	}	//end function 'nc__db__getProjectCodeFiles'

?>