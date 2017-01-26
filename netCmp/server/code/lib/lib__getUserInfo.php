<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-08
	Description:	get user information
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//include functions for DB
	require_once 'lib__db.php';

	//get user information, entered during registration
	//input(s):
	//	id: user id
	//	doThrowError: if encounter error, should it be thrown or not
	//output(s):
	//	Array:
	//		name -> user name
	//		email -> user email
	//		created -> date at which account was created
	//		modified -> date at which account was last modified
	//		logo -> file id for logo image
	//		suspend -> is account suspended
	function nc__lib__getUser($id, $doThrowError){

		//get connection object
		$conn = nc__db__getDBCon();

		//if id is invalid
		if( is_null($id) || empty($id) ){

			//if should throw error
			if( $doThrowError ){

				//error -- user id is invalid
				nc__util__error('(nc__lib__getUser:1) invalid user id');

			} else {	//else, do not throw error

				return array();

			}	//end if should throw error

		}	//end if id is invalid

		//ES 2017-01-25 (b_patch01): moved into a separate statement, so that
		//	query could be printed to the logs
		//compose query
		$tmpQuery = 'SELECT '. 
				'name, email, created, modified, logo, suspend '.
			'FROM netcmp_access_user '.
			'WHERE id = '.$id;

		//ES 2017-01-25 (b_patch01): output query
		nc__util__query("nc__lib__getUser", $tmpQuery);

		//retrieve data from DB about user
		//ES 2017-01-25 (b_patch01): move query statement into a variable to
		//	print it to the logs
		$qrs = $conn->query($tmpQuery);

		//create resulting array, which will be returned back to the caller
		$res = array();

		//if query is not empty
		//ES 2017-01-25 (b_patch01): make sure that num records is more then 0
		if( $qrs && $qrs->num_rows > 0 ){

			//loop thru query result set (qrs) to populate resulting array
			while( $row = $qrs->fetch_assoc() ){

				//if retrieved more then one user (with the same id)
				if( !empty($res) ){

					//if should throw error
					if( $doThrowError ){

						//error -- user has several entries in DB
						nc__util__error('(nc__lib__getUser:2) multiple DB entries with same user id');

					} else {	//else, do not throw error

						return array();

					}	//end if should throw error

				}	//end if more then one user

				//transfer data from qrs into resulting array
				$res['name'] = $row['name'];
				$res['email'] = $row['email'];
				$res['created'] = $row['created'];
				$res['modified'] = $row['modified'];
				$res['logo'] = $row['logo'];
				$res['suspend'] = $row['suspend'];

			}	//end loop thru qrs to populate res

		}	//end if query is not empty
	
		//return resulting array with user information in it
		return $res;

	}	//end function 'nc__lib__getUser'


?>