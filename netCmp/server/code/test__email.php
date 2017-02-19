<?php
	$tmpEmail = "esedakov@msn.com";

	echo "about to send mail";

	if( mail(
		$tmpEmail,
		"Please, activate your new account!",
		"<html>".
			"<head>".
				"<title>Activating new account</title>".
			"</head><body>".
				"<div style='width:100%; background-color:#c7bfe6; display: table;'>".
					"<img src='http://www.netcmp.net/pub/EMB.jpg' style='float: left;display: table-cell;'>".
					"<p style='float: right;font-size: 2.8em;display: table-cell;font-weight: bold;color: brown;margin-right: 5%;'>".
						"Network Compiler".
					"</p>".
				"</div>".
				"<div style='width:100%;display:table;font-size:xx-large;font-family: monospace;'>".
					"<p>Hello, <strong>esedakov</strong></p>".
					"<p style='margin-top: 1em;'>".
						"Thank you for registring at NetCMP! ".
						"There is just one more step to fully complete the registration process, by following this ".
						"<a href='#'>link</a> ".
						"to confirm email address.".
					"</p>".
					"<p>Kindest regards,</p>".
					"<p style='font-weight: bold;'>Eduard Sedakov ".
						"(<a href='mailto:fs.netcmp@gmail.com'>mail</a>)&nbsp;".
						"(<a href='http://www.netcmp.net'>website</a>)".
					"</p>".
				"</div>".
			"</body>".
		"</html>",
		"MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: fs.netcmp@gmail.com\r\n"
	) == false ){

		echo error_get_last();

	}

	echo "already done!";

?>
