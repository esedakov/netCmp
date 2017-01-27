<?php
	//retrieve existing session
	session_start();
	//clean session
	session_unset();
	//clean message.log
	unlink("/var/www/html/pub/message.log");
	//create a new one
	fopen("/var/www/html/pub/message.log", "w");
?>
