<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-31
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

		//retrieve data from DB about user
		$qrs = $conn->query(
			'SELECT '. 
				'name, email, created, modified, logo, suspend '.
			'FROM netcmp_access_user '.
			'WHERE id = '.$id
		);

		//create resulting array, which will be returned back to the caller
		$res = array();

		//if query is not empty
		if( $qrs ){

			//loop thru query result set (qrs) to populate resulting array
			while( $row = $qrs->fetch_assoc() ){

				//if retrieved more then one user (with the same id)
				if( !empty($res) ){

					//error -- user has several entries in DB
					nc__util__error('(nc__lib__getUser:2) multiple DB entries with same user id');

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