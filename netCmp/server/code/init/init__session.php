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
		//how to setup google api: https://developers.google.com/+/web/samples/php
		//google: project id = netcmp-146118
		//google: project name = netcmp
		//google: client id:  553877684601-obu1hedstenc0mj0olbpm193e4s0b6bk.apps.googleusercontent.com
		//google: client secret:   PvILwgxm6lTFqqTkHYR74WIr  
		//TODO: I have setup API to be used from localhost, but need to be changed to real URL later

	//
?>