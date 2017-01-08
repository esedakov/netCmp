<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		init__request
	Dependencies:	(none)
	*/

	//create session
	session_start();

	//declare array of viewing parameters
	$_SESSION['view'] = array();

		//flag to capture page viewing mode: is view expanded (true) or shrinked (false)
		$_SESSION['view']['mode'] = 'true';

	//declare array of file parameters
	$_SESSION['file'] = array();

		//set path where to let user select files in a open-file-dialog
		$_SESSION['file']['open'] = '1';	//root

	//declare array of constant values
	$_SESSION['consts'] = array();

	//initialize database constants
	$_SESSION['consts']['db'] = array();

		//set database username
		$_SESSION['consts']['db']['username'] = 'cmpadmin';
		//set password for the specified username
		$_SESSION['consts']['db']['password'] = 'hu6r6a1196ku552n';
		//set name of database
		$_SESSION['consts']['db']['database'] = 'netcmp';
		//set MySQL encryption/decryption key constant
		$_SESSION['consts']['db']['key'] = 'gHrRrrrY71xabYHh366101uuip7909gGi';

	//set current user information
	$_SESSION['consts']['user'] = array();

		//reserve session variable for user id
		$_SESSION['consts']['user']['id'] = '1';
		//reserve session variable for user plan
		$_SESSION['consts']['user']['plan'] = '';
		//reserve session variable for currently visited page
		$_SESSION['consts']['user']['page'] = '';
		//

	//set url parameters for PHP files (if it is not mentioned here, then it takes no params)
	$_SESSION['consts']['params'] = array();

		//url parameters for outter page (shows header and tail)
		$_SESSION['consts']['params']['vw__page'] = array();

		//url parameters for page that validates user registration
		$_SESSION['consts']['params']['pr__register'] = array();

			//set information for parameter 'k' (encrypted user id)
			$_SESSION['consts']['params']['pr__register']['k'] = array();

				//is this parameter encoded?
				$_SESSION['consts']['params']['pr__register']['k']['enc'] = true;
				//is this parameter encrypted?
				$_SESSION['consts']['params']['pr__register']['k']['crypt'] = true;
				//is this parameter required?
				$_SESSION['consts']['params']['pr__register']['k']['req'] = true;

		//url parameters for code view page
		$_SESSION['consts']['params']['vw__codeview'] = array();

		//url parameters for main page
		$_SESSION['consts']['params']['view__main'] = array();

			//set information for 'mode' parameter
			$_SESSION['consts']['params']['view__main']['mode'] = array();

				//is this parameter encoded?
				$_SESSION['consts']['params']['view__main']['mode']['enc'] = false;
				//is this parameter encrypted?
				$_SESSION['consts']['params']['view__main']['mode']['crypt'] = false;
				//is this parameter required?
				$_SESSION['consts']['params']['view__main']['mode']['req'] = true;
				//default value (if any)
				$_SESSION['consts']['params']['view__main']['mode']['def'] = '11';
				//all allowed values
				$_SESSION['consts']['params']['view__main']['mode']['val'] = array();

					//'00' - no debug and no app view
					$_SESSION['consts']['params']['view__main']['mode']['val']['00'] = '';
					//'01' - no debug but app view
					$_SESSION['consts']['params']['view__main']['mode']['val']['01'] = '';
					//'10' - debug but no app view
					$_SESSION['consts']['params']['view__main']['mode']['val']['10'] = '';
					//'11' - debug and app views
					$_SESSION['consts']['params']['view__main']['mode']['val']['11'] = '';

	//set path to the folder, where publicly accessible fildes will be stored
	$_SESSION['consts']['pub_folder'] = 'C:\\Apache24\\htdocs\\public_folder\\';

	//create set for logging information
	$_SESSION['consts']['log'] = array();

		//debug information
		$_SESSION['consts']['log']['dbg'] = array();

			//set path for file that logs debugging information
			$_SESSION['consts']['log']['dbg']['path'] = 'C:\\Apache24\\logs\\message.log';

	//set root id
	$_SESSION['consts']['root_id'] = '2';

?>