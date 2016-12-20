<!DOCTYPE html>
<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-17
	Description:	show header (user info + about) and tail (company) parts of the html page
	Used by:		(init)
	Dependencies:	(none)
	*/

	//perform setup and initialize incoming variables
	require_once 'init/init__request.php';

	//include library for 'nc__lib__getUser' function
	require_once './lib/lib__getUserInfo.php';

	//get user
	$lv_userInfo = nc__lib__getUser($_SESSION['consts']['user']['id'], false);

	//setup function for showing user name
	//input(s): (none)
	//output(s): (none)
	function vw__page__showUserName($info){
		
		//if user logged in
		if( empty($info) ){
			echo 'Login';
		} else {	//else, user is not logged in
			echo $info['name'];
		}
	
	}	//end function 'vw__page__showUserName'

?>
	//create page header
	//input(s): (none)
	//output(s): (none)
	function vw__page__createHeader() {

		//include global variables
		//	see: http://stackoverflow.com/a/6100395
		global $vw__page__createPostBackAlert;
		global $vw__page__showUserName;

		//compose and output html string for page view
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOF_1"
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
		<link rel="stylesheet" type="text/css" href="../../external/joint.css">
		<!-- ES 2016-09-11 (b_debugger): added 2 stylesheets to make viewport DIVs resizable -->
		<link rel="stylesheet" href="../../external/jquery/ui/1.12.0/themes/base/jquery-ui.css">
		<link rel="stylesheet" href="../../external/resources/demos/styles.css">
		<!-- Bootstrap core CSS -->
		<link href="../../external/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<script src="../../external/jquery.min.js"></script>
		<script src="../../external/lodash.min.js"></script>
		<script src="../../external/backbone-min.js"></script>
		<script src="../../external/joint.js"></script>
		<!-- ES 2016-09-11 (b_debugger): added UI jquery library to make DIV resizable -->
		<script src="../../external/jquery-ui.js"></script>
		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<script src="../../external/bootstrap/js/bootstrap.min.js"></script>
		<!-- bootstrap required -->
		<meta name="description" content="">
		<meta name="author" content="">
		<link rel="icon" href="">

__EOF_1;

		//include page CSS styles
		require 'css__page.php';

echo <<<"__EOF_2"

	</head>	<!-- end head -->

	<!-- start body -->
	<body>
__EOF_2;

		//create declaration for loggin dialog
		vw__page__createLoginDialog();

		//compose and output html string for page view
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOF_3"
		<!-- page container that occupies 90% of viewports height -->
		<div class="page-container container bs-glyphicons" style="height:90vh;">
			
			<!-- header -->
			<div class="header-component clearfix" style="height:5%;">

				<!-- leave some empty space from the top -->
				<div style="height:20%;"></div>

				<!-- quick information button bar -->
				<nav>

					<!-- list of buttons in the button bar -->
					<ul class="nav nav-pills pull-right">

						<!-- ABOUT website button -->
						<li 
							role="presentation" 
							data-toggle="tooltip"
							data-placement="bottom"
							title="About NetCmp Project"
						>

							<!-- link for showing website information -->
							<a href="#">
								About <span 
									class="glyphicon glyphicon-home" 
									aria-hidden="true"
								></span>
							</a>	<!-- end link for showing website information -->

						</li>	<!-- end ABOUT website button -->

						<!-- USER information button -->
						<li 
							role="presentation"
							data-toggle="tooltip"
							data-placement="bottom"
							title="User {$vw__page__showUserName()}"
						>

							<!-- link for showing user information -->
							<a href="#" class="nc-login-register-button">

								{$vw__page__showUserName()} <span 
									class="glyphicon glyphicon-magnet" 
									aria-hidden="true"
								></span>
							</a>	<!-- end link for showing user information -->

						</li>	<!-- end user information button -->

					</ul>	<!-- end list of buttons in the button bar -->

				</nav>	<!-- end quick information button bar -->

				<!-- website logo -->
				<h3>
					<span 
						class="glyphicon glyphicon-equalizer" 
						aria-hidden="true"
						data-toggle="tooltip"
						data-placement="right"
						title="Network Compiler"
					></span>&nbsp;NetCmp
				</h3>	<!-- end website logo -->

			</div>	<!-- end head -->

			<!-- show dividing line that separates head from the middle part -->
			<hr class="page-header-divider featurette-divider">

			<!-- show expand view button on the right side -->
			<span 
				class="expandView glyphicon glyphicon-fullscreen" 
				aria-hidden="true"
				data-toggle="tooltip"
				data-placement="left"
				title="Full Screen"
			></span>
__EOF_3;

		//start toolbar
		nc__toolbar__start();

	}	//end function 'vw__page__createHeader'

	//function for showing page footer
	//input(s): (none)
	//output(s): (none)
	function vw__page__createFooter() {

		//include global variables
		//	see: http://stackoverflow.com/a/6100395
		global $vw__page__createPostBackAlert;
		global $vw__page__setupLoginButton;
		global $vw__page__setupExpandViewButton;

		//end toolbar
		nc__toolbar__end();

		//compose and output html string
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOF_4"
			<!-- start tail -->
			<footer class="pageFooter" style="height: 5%;">

				<!-- company information -->
				<p class="bs-glyphicons">

					<!-- company name -->
					<span 
						class="glyphicon glyphicon-copyright-mark" 
						aria-hidden="true"
					></span> Meduza, Inc. 2016

					<!-- button for contacting me back -->
					<span 
						class="glyphicon glyphicon-envelope" 
						aria-hidden="true"
						data-toggle="tooltip"
						data-placement="top"
						title="Contact me"
						style="padding: 0 10px;"
					></span>

					<!-- button for showing terms of usage and privacy information -->
					<span 
						class="glyphicon glyphicon-sunglasses" 
						aria-hidden="true"
						data-toggle="tooltip"
						data-placement="top"
						title="Privacy & Terms"
					></span>

				</p>	<!-- end company information -->

			</footer>	<!-- end tail -->

		</div>	<!-- end page container -->

		<script>

			$(document).ready(function(){

				{$vw__page__createPostBackAlert()}

				// script for showing tooltip messages
				//	see: http://www.w3schools.com/bootstrap/bootstrap_tooltip.asp
			    $('[data-toggle="tooltip"]').tooltip();

			    {$vw__page__setupLoginButton()}

			    {$vw__page__setupExpandViewButton()}

			});
		</script>
__EOF_4;

		//include JS script intended to format typed user code
		require 'js__codeview.php';

		//include JS script for dialog
		require_once 'js__login.php';

		//show debug information
		//	TODO: remove at production
		//require 'test__showInfo.php';

		//compose and output html string
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOF_5"

	</body>	<!-- end body -->

</html>	<!-- end html -->
__EOF_5;

	}	//end function 'vw__page__createFooter'

?>
