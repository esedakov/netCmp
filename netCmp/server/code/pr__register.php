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
	if( array_key_exists("uk", $GLOBALS) ){

		//establish connection to the database
		$conn = nc__db__getDBCon();

		//unsuspend user with specified email address to complete registration process
		$res = $conn->query('UPDATE netcmp_access_user SET suspend = 0 WHERE id = '.$uk);

		//close connection
		nc__db__closeCon($conn);

		//check if query did not succeed
		if( $res !== TRUE ){

			//error -- (TODO) -- could not update user record
			nc__util__error("failed to complete user registration");

		}	//end if query did not succeed

	}	//end if email parameter has been passed in

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>COMPLETED USER REGISTRATION</title>
	</head>
	<body>
		<h1>
			<?php
				
				//set prefix for message
				$prefix = "";

				//if user registered successfully
				if( $res === TRUE ){
					$prefix = "SUCCESSFULLY ";
				} else {	//if failed to register
					$prefix = "FAILED TO ";
				}

				//print message
				echo $prefix."REGISTER ACCOUNT!";
			?>
		</h1>
	</body>
</html>