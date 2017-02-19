<?php if(!isset($_SESSION)){session_start();}  
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-11
	Description:	login and if necessary register new user
	Used by:		(vw__login)
	Dependencies:	(lib__db),(lib__utils)
	*/

	//include library for db function 'nc__db__getDBCon'
	require_once './lib/lib__db.php';

	//include library for utility functions
	require_once './lib/lib__utils.php';

		//include library for 'nc__secur__encrypt' function
	require_once './lib/lib__security.php';

	//re-initialize session
	nc__util__reInitSession();

	//if any required field is not set
	if(
		//if user name is not specified
		nc__util__isFieldSet("nc_user_name") == false ||

		//if password is not specified
		nc__util__isFieldSet("nc_user_password") == false 
	) {

		//error -- (TODO) -- user user name or password is not specified
		nc__util__error("user name or password is not set during login/registration step");

	}	//end if any required fields is not set

	//do register new user, i.e. is user name specified and it is not empty
	$doRegNewUser = nc__util__isFieldSet("nc_user_email");

	//get user user name
	$tmpName = $_POST["nc_user_name"];

	//check if user name is not valid (formatted incorrectly)
	if( nc__util__isUserNameValid($tmpName, $doRegNewUser) == false ){

		//error -- (TODO) -- user name is not valid
		nc__util__error("user name is not valid");

	}	//end if user name is not valid

	//get user password
	$tmpPass = $_POST["nc_user_password"];

	//check if password is not valid
	if( nc__util__isPasswordValid($tmpPass) == false ){

		//error -- (TODO) -- password is not valid
		nc__util__error("password should contain ".$nc__util__g__pass__minchars." characters that are limited to lower and upper letters as well as digits");

	}	//end if password is not valid

	//establish connection to db
	$conn = nc__db__getDBCon();

	//if registering new user
	if( $doRegNewUser ){

		//get user email
		$tmpEmail = $_POST["nc_user_email"];

		//if user email is not valid
		if( nc__util__isEmailValid($tmpName) ){

			//error -- (TODO) -- user email is not valid
			nc__util__error("registration process requires a valid user email");

		}	//end if user email is not valid

		//TODO: for now we would not have logo
		$tmpLogo = "NULL";

		//compose query for insert new user
		$tmpQuery = "INSERT INTO netcmp_access_user ".
			"(name,email,created,modified,pwd,logo,suspend)".
			" VALUES ".
			"(".
				"'".$tmpName."',".
				"'".$tmpEmail."',".
				"NOW(),".
				"NOW(),".
				"AES_ENCRYPT('".$tmpPass."', '".$_SESSION['consts']['db']['key']."'),".
				"".$tmpLogo.",".
				"1".		//suspended, until it is confirmed otherwise
			")";

		//create new record in DB for this user
		$res = $conn->query($tmpQuery);

		//get id of created user
		$tmpDBUserId = mysqli_insert_id($conn);

		//check if query did not succeed
		if( $res !== TRUE ){

			//error -- (TODO) -- could not create new user record
			nc__util__error("failed to created new user record");

		}	//end if query did not succeed

		//close DB connection
		nc__db__closeCon($conn);

		//try to send email to the specified address
		//	TODO: for ubuntu see: http://askubuntu.com/questions/47609/how-to-have-my-php-send-mail
		//						=> http://askubuntu.com/a/47618
		//		also, see: http://stackoverflow.com/a/37549402
		mail(
		$tmpEmail,
		"Please, activate your new account!",
                "<html>".
                        "<head>".
                                "<title>Activating new account</title>".
                        "</head><body>".
                                "<div style='width:100%; background-color:#c7bfe6; display: table;'>".
                                        "<img src='http://www.netcmp.net/pub/EMB.jpg' style='float: left;display: table-cell;'>".
                                        "<p style='float: right;font-size: 2.8em;display: table-cell;font-weight: bold;color: brown;margin-right: 5%;'>".
                                                "Network Compiler".
                                        "</p>".
                                "</div>".
                                "<div style='width:100%;display:table;font-size:xx-large;font-family: monospace;'>".
                                        "<p>Hello, <strong>".$tmpName."</strong>!</p>".
                                        "<p style='margin-top: 1em;'>".
                                                "Thank you for registring at NetCMP! ".
                                                "There is just one more step to fulfill the registration process, by following this ".
                                                "<a href='http://".$_SERVER["SERVER_NAME"].substr($_SERVER["SCRIPT_NAME"], 0, strrpos($_SERVER["SCRIPT_NAME"], "/"))."/pr__register.php?k=".nc__secur__encode(nc__secur__encrypt($tmpDBUserId))."'>link</a> ".
                                                "to confirm your email address.".
                                        "</p>".
                                        "<p>Kindest regards,</p>".
                                        "<p style='font-weight: bold;'>Eduard Sedakov ".
                                                '(<a href=\'mailto:fs.netcmp@gmail.com\'>mail</a>)&nbsp;'.
                                                "(<a href='http://www.netcmp.net'>website</a>)".
                                        "</p>".
                                "</div>".
                        "</body>".
                "</html>",
                "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: fs.netcmp@gmail.com\r\n"
		);

	} else if( nc__db__isPasswordCorrect($tmpPass, $tmpName) == false ) {	//else, if password does not match

		//log session modification
		nc__util__session("post__login.php", "[postback][nc_user_name]", $tmpName);

		//set postback data
		$_SESSION['postback'] = array();
		$_SESSION['postback']['nc_user_name'] = $tmpName;
		$_SESSION['postback']['message'] = "incorrect user name and/or password combination. please, try again!";

		//load referrer page
		nc__util__redirect( $_SERVER['HTTP_REFERER'] );

		//stop execution of this page
		die("");

	}	//end if registering new user

	//get user id
	$tmpUserId = nc__db__isUserExist($tmpName);

	//if user was not found
	if( $tmpUserId == -1 ){

		//error -- user not found
		nc__util__error("given user name does not exist");

	}

	//log change of session
	nc__util__session("post__login.php", "[consts][user][id]", $tmpUserId);

	//update session
	$_SESSION['consts']['user']['id'] = $tmpUserId;

	//transfer to main page
	nc__util__redirect("vw__main.php");

?>