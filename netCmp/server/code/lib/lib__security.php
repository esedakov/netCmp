<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-11
	Description:	library functions for encrypting/decrypting/encoding/decoding
						see: http://stackoverflow.com/a/30189841
	Used by:		(everything)
	Dependencies:	(lib__utils)
	*/

	//include library for utility functions
	require_once 'lib__utils.php';

	//encryption/decryption method
	const METHOD = 'aes-256-ctr';

	//public key
	$PUB_KEY = '';

	//private key
	$PRV_KEY = '';
?>