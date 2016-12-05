<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	show header (user info + about) and tail (company) parts of the html page
	Used by:		(init)
	Dependencies:	(none)
	*/

	//get user
	$lv_userArr = nc__lib__getUser($_SESSION['consts']['user']['id']);

?>
<!-- start html -->