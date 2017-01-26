<?php if(!isset($_SESSION)){session_start();} 
	/*
	Developer:	Eduard Sedakov
	Date:		2016-10-08
	Description:	process outter (JSON) request
	Used by:	none
	Dependencies:	none
	*/
	//http://stackoverflow.com/questions/768431/how-to-make-a-redirect-in-php
	function Redirect($url, $permanent = false)
	{
		if (headers_sent() === false)
		{
			header('Location: ' . $url, true, ($permanent === true) ? 301 : 302);
		}
		exit();
	}
	//start session variable
	//ES 2017-01-25 (b_patch01): moved to the very top of file
	//session_start();
	//print_r($_REQUEST);
	$_SESSION["data"] = $_POST["data"];
	//test: redirect to get parse data page
	Redirect('http://localhost/netCmp/server/code/parser/getParserData.php', false);
?>