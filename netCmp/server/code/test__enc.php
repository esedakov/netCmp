<?php

	//include encryption lib
	require './lib/lib__security.php';

	//encrypt 'hello world!'
	$tmpEncVal = nc__secur__encode(nc__secur__encrypt('hello world!'));

	//print encrypted value
	echo "encrypted data: {".$tmpEncVal."}";

	//print decrypted data
	echo "decrypted data: {".nc__secur__decrypt(nc__secur__decode($tmpEncVal))."}";

?>
