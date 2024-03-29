<?php if(!isset($_SESSION)){session_start();} 
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	initialize constants
	Used by:		init__request
	Dependencies:	(none)
	*/

	//create session
	//ES 2017-01-25 (b_patch01): moved to the very top of file
	//session_start();

	//declare array of viewing parameters
	$_SESSION['view'] = array();

		//flag to capture page viewing mode: is view expanded (true) or shrinked (false)
		$_SESSION['view']['mode'] = 'true';
		//flag to show (true) or not render (false) toolbar
		$_SESSION['view']['showtoolbar'] = 'true';

	//declare array of file parameters
	$_SESSION['file'] = array();

		//set path where to let user select files in a open-save-file-dialog
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
		//ES 2017-01-25 (b_patch01): not logged in as anyone
		$_SESSION['consts']['user']['id'] = '0';
		//reserve session variable for user plan
		$_SESSION['consts']['user']['plan'] = '';
		//reserve session variable for currently visited page
		$_SESSION['consts']['user']['page'] = '';
		//ES 2017-02-06 (soko): show login dialog when user is not logged in
		$_SESSION['consts']['user']['showlogin'] = '1';
		//ES 2017-02-06 (soko): redirect to this page upon login
		$_SESSION['consts']['user']['redirectUponLogin'] = 'vw__main.php';

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

		//url parameters for file explorer view page
		$_SESSION['consts']['params']['vw__fileexp'] = array();

		//url parameters for main view page
		$_SESSION['consts']['params']['vw__main'] = array();

		//ES 2017-02-06 (soko): include test file for experimenting with sokoban game created in js
		$_SESSION['consts']['params']['vw__s'] = array();

		//url parameters for getting file hierarchy data to depict tree of files and folders
		$_SESSION['consts']['params']['pr__getFileHierarchyData'] = array();

				//is this parameter encoded?
				$_SESSION['consts']['params']['pr__getFileHierarchyData']['f']['enc'] = false;
				//is this parameter encrypted?
				$_SESSION['consts']['params']['pr__getFileHierarchyData']['f']['crypt'] = false;
				//is this parameter required?
				$_SESSION['consts']['params']['pr__getFileHierarchyData']['f']['req'] = true;

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
	$_SESSION['consts']['pub_folder'] = '/var/www/html/pub/';

	//create set for logging information
	$_SESSION['consts']['log'] = array();

		//debug information
		$_SESSION['consts']['log']['dbg'] = array();

			//set path for file that logs debugging information
			$_SESSION['consts']['log']['dbg']['path'] = '/var/www/html/pub/message.log';

			//should output queries
			$_SESSION['consts']['log']['dbg']['query'] = true;

			//should log changes to session
			$_SESSION['consts']['log']['dbg']['session'] = true;

			//which library functions to log
			$_SESSION['consts']['log']['dbg']['libs'] = array();

				//database
				$_SESSION['consts']['log']['dbg']['libs']['db'] = true;

				//utils
				$_SESSION['consts']['log']['dbg']['libs']['utils'] = true;

				//IO
				$_SESSION['consts']['log']['dbg']['libs']['io'] = true;

				//security
				$_SESSION['consts']['log']['dbg']['libs']['security'] = true;

				//debug
				$_SESSION['consts']['log']['dbg']['libs']['dbg'] = true;

				//class helpers
				$_SESSION['consts']['log']['dbg']['libs']['class'] = true;

	//set root id
	$_SESSION['consts']['root_id'] = '1';

	//ES 2017-01-21 (b_file_hierarchy): moved global var 'vw__codeview__ofdDlgId' inside SESSION
	//	This var stores dialog id for opening and saving files
	$_SESSION['consts']['vw__codeview']['ofdDlgId'] = '0';

	//ES 2017-01-22 (b_dbg_app): save value of dialog for opening projects (opd)
	$_SESSION['consts']['vw__codeview']['opdDlgId'] = '0';

?>
