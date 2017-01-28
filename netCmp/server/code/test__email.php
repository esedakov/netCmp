<?php
	$tmpEmail = "esedakov@msn.com";

	echo "about to send mail";

	if( mail(
		$tmpEmail,
		"Please, activate your new account!",
		"If you had created account at NetCMP, please click link below to complete registration process; otherwise, ignore this email."
	) == false ){

		echo error_get_last();

	}

	echo "already done!";

?>
