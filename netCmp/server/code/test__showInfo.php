<?php
	//include library for function 'nc__util__reInitSession'
	require_once './lib/lib__utils.php';
	//re-initialize session
	nc__util__reInitSession();
	var_dump($_SESSION);
	echo("\n=================================\n");
	//var_dump($GLOBALS);
?>