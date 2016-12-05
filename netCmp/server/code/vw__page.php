<!DOCTYPE html>
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
<html lang="en">

	<!-- start head -->
	<head>

		<!-- bootstrap required -->
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<!-- external libraries -->
		<!-- ES 2016-09-11 (b_debugger): added 2 stylesheets to make viewport DIVs resizable -->
		<link rel="stylesheet" href="../external/jquery/ui/1.12.0/themes/base/jquery-ui.css">
		<link rel="stylesheet" href="../external/resources/demos/styles.css">
		<!-- Bootstrap core CSS -->
		<link href="../external/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<!-- ES 2016-09-11 (b_debugger): added UI jquery library to make DIV resizable -->
		<script src="../external/jquery-ui.js"></script>
		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<script src="../external/bootstrap/js/bootstrap.min.js"></script>
		<!-- bootstrap required -->
		<meta name="description" content="">
		<meta name="author" content="">
		<link rel="icon" href="">
	</head>	<!-- end head -->

	<!-- start body -->
	<body>

	</body>	<!-- end body -->

</html>	<!-- end html -->