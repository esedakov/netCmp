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

		//output function name
		nc__util__func('security', 'nc__secur__loadKeys');

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

	//encrypt string
	//input(s):
	//	str: (text) text string to encrypt
	//output(s):
	//	(text) => encrypted string
	function nc__secur__encrypt($str){

		//output function name
		nc__util__func('security', 'nc__secur__encrypt');
	
		//include global key
		//TODO: needs to be moved into DB (encrtypted)
		global $PUB_KEY;

		//check if public key is not set
		if( $PUB_KEY == '' ){

			//setup public and private keys
			nc__secur__loadKeys();

		}	//end if public key is not set

		$encrtypted = '';

		if (openssl_public_encrypt($str, $encrypted, $PUB_KEY))
			return $encrypted;
		else
			throw new Exception('Unable to encrypt data. Perhaps it is bigger than the key size?');

	}	//end function 'nc__secur__encrypt'

	//decrypt string
	//input(s):
	//	str: (text) text string to decrypt
	//output(s):
	//	(text) => decrypted string
	function nc__secur__decrypt($str){

		//output function name
		nc__util__func('security', 'nc__secur__decrypt');

		//include global key
		//TODO: needs to be moved into DB (encrtypted)
		global $PRV_KEY;

		//check if private key is not set
		if( $PRV_KEY == '' ){

			//setup public and private keys
			nc__secur__loadKeys();

		}	//end if private key is not set

		$decrypted = '';

		if (openssl_private_decrypt($str, $decrypted, $PRV_KEY))
			return $decrypted;
		else
			throw new Exception('nc__secur__decrypt: could not decrypt');

	}	//end function 'nc__secur__decrypt'

	//encode string
	//input(s):
	//	str: (text) text string to encode
	//output(s):
	//	(text) => encoded string
	function nc__secur__encode($str){

		//output function name
		nc__util__func('security', 'nc__secur__encode');

		//return encoded string
		return base64_encode($str);

	}	//end function 'nc__secur__encode'

	//decode string
	//input(s):
	//	str: (text) text string to encode
	//output(s):
	//	(text) => encoded string
	function nc__secur__decode($str){

		//output function name
		nc__util__func('security', 'nc__secur__decode');

		//return decoded string
		return base64_decode($str);

	}	//end function 'nc__secur__decode'

?>