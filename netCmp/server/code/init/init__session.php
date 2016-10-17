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

	//set current user information
	$_SESSION['consts']['user'] = array();

		//reserve session variable for user id
		$_SESSION['consts']['user']['id'] = '';
		//reserve session variable for user plan
		$_SESSION['consts']['user']['plan'] = '';
		//reserve session variable for currently visited page
		$_SESSION['consts']['user']['page'] = '';
		//

	//set url parameters for PHP files (if it is not mentioned here, then it takes no params)
	$_SESSION['consts']['params'] = array();

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

	//initialize online (virtual) drive constants
	$_SESSION['consts']['drive'] = array();

		//set company name that provides virtual drive service
		$_SESSION['consts']['drive']['company'] = 'google';
		//set google API information
		$_SESSION['consts']['drive']['api'] = array();

			//set path to the folder with credentials, which stores authorization token
			$_SESSION['consts']['drive']['api']['credentials'] = '~/.credentials/token.json';
			//set path to file with client secret information
			$_SESSION['consts']['drive']['api']['client'] = '/secret.json';
			//set scope information
			$_SESSION['consts']['drive']['api']['scopes'] = array();

				//set read/write access to google drive files
				$_SESSION['consts']['drive']['api']['scopes']['0'] = Google_Service_Drive::DRIVE;

			//set spreadsheet information
			$_SESSION['consts']['drive']['api']['spreadsheet'] = array();

				//reserve session variable for google file id that maintains image files
				$_SESSION['consts']['drive']['api']['spreadsheet']['img'] = '';
				//reserve session variable for google file id that maintains text files
				$_SESSION['consts']['drive']['api']['spreadsheet']['txt'] = '';

		//set user account username
		$_SESSION['consts']['drive']['username'] = 'fs.netcmp';
		//set user account password
		$_SESSION['consts']['drive']['password'] = 'yiO41Ppqs09ZyIiy1i7';
		//set user account information constants
		$_SESSION['consts']['drive']['account'] = array();

			//set user first name - File
			$_SESSION['consts']['drive']['account']['firstname'] = 'File';
			//set user last name - Sys
			$_SESSION['consts']['drive']['account']['lastname'] = 'Sys';
			//set user dob - 19 feb 1990 (02.19.1990)
			$_SESSION['consts']['drive']['account']['dob'] = '02.19.1990';
			//set user gender - male
			$_SESSION['consts']['drive']['account']['gender'] = 'male';
		//how to setup google api: https://developers.google.com/+/web/samples/php
		//google: project id = netcmp-146118
		//google: project name = netcmp
		//google: client id:  553877684601-obu1hedstenc0mj0olbpm193e4s0b6bk.apps.googleusercontent.com
		//google: client secret:   PvILwgxm6lTFqqTkHYR74WIr  
		//TODO: I have setup API to be used from localhost, but need to be changed to real URL later

	//
?>