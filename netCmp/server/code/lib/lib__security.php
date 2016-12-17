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

	//load public and private key
	//	see: http://stackoverflow.com/a/7920211
	//input(s): (none)
	//output(s): (none)
	function nc__secur__loadKeys(){

		//include global variables
		global $PUB_KEY, $PRV_KEY;

		//load public key
		$PUB_KEY = file_get_contents('/home/esedakov/netcmp/branches/b_server/netCmp/server/code/lib/public.pem');

		//set public key
		openssl_get_publickey($PUB_KEY);

		//load private key
		$tmpprv = file_get_contents('file:///home/esedakov/netcmp/branches/b_server/netCmp/server/code/lib/private.pem');

		//set private key
		$PRV_KEY = openssl_get_privatekey($tmpprv);

	}	//end function 'nc__secur__loadKeys'

?>