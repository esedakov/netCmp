<?php
	//inlcude file/folder attributes library
	require_once './lib/lib__fattr.php';
	//include property page
	require_once './vw__property.php';
	//re-initialize session
	nc__util__reInitSession();
	//get attributes for the specified file
	$tmpAttr = nc__db__getIOEntryAttrs('1', false);
	//start page
	echo "<html><head><title>Test</title></head><body>";
	//output property for the file with specified id
	echo showIOEntryProperties($tmpAttr);
	//end page
	echo "</body></html>";
?>