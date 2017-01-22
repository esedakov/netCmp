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

	//show toolbar view
	require_once 'vw__toolbar.php';

	//include utils library for function 'nc__util__log' 
	require_once './lib/lib__utils.php';

	//include library for dialogs
	require_once './lib/lib__dialog.php';

	//indicate that we loaded vw__page
	nc__util__log("loading vw__page.php");

	//get user
	$lv_userInfo = nc__lib__getUser($_SESSION['consts']['user']['id'], false);

	//if user is not logged in
	if( empty($lv_userInfo) ){

		//include library for dialogs
		require_once './lib/lib__dialog.php';

	}	//end if user is not logged in

	//setup function for showing user name
	//input(s): (none)
	//output(s):
	//	(text) => caption for login/user_name button
	//	for usage see: http://stackoverflow.com/a/10499554
	//	for func declaration, see: http://stackoverflow.com/a/20959784
	$vw__page__showUserName = function(){
		
		//if user logged in
		if( empty($lv_userInfo) ){
			return 'Login';
		} else {	//else, user is not logged in
			return $lv_userInfo['name'];
		}
	
	};	//end function 'vw__page__showUserName'

	//declare var for login dialog id
	$vw__page__loginDlgId = "";

	//create login dialog
	//input(s): (none)
	//output(s): (none)
	function vw__page__createLoginDialog(){

		//if user is not logged in
		if( empty($lv_userInfo) ){

			//need to use global var
			global $vw__page__loginDlgId;

			//setup array of dialog attributes
			$tmpDlgAttrs = array();

			//set caption
			$tmpDlgAttrs["caption"] = "Please, login or register";

			//create dialog for loggin
			$vw__page__loginDlgId = nc__dlg__start($tmpDlgAttrs);
			require 'vw__login.php';
			nc__dlg__end();

		}	//end user is not logged in

	};	//end function 'vw__page__createLoginDialog'

	//add JQuery script to attach click event for 'login' button
	//input(s): (none)
	//output(s):
	//	(text) => string that represents click event attacher to login button
	//	for usage see: http://stackoverflow.com/a/10499554
	//	for func declaration, see: http://stackoverflow.com/a/20959784
	$vw__page__setupLoginButton = function() {

		//if user is not logged in
		if( empty($lv_userInfo) ){

			//need to use global var
			global $vw__page__loginDlgId;

			//attach CLICK event to login/register button to open proper dialog
			return "$('.nc-login-register-button').click(function(){" .
					"$('#" . $vw__page__loginDlgId . "').modal();" .
				"});";

		}	//end if user is not logged in

	};	//end function 'vw__page__setupLoginButton'

	//add JQuery script to attach click event to expand view button
	//input(s): (none)
	//output(s):
	//	(text) => string that represents click event attacher to expand view button
	//	for usage see: http://stackoverflow.com/a/10499554
	//	for func declaration, see: http://stackoverflow.com/a/20959784
	$vw__page__setupExpandViewButton = function(){

		//attach CLICK event to expand view in order to hide/show header and footer
		return "$('.expandView').click(function(){" .
				//flag: are we expanding (i.e. it is shrinked now) or shrinking
				"var tmpDoExp = $('.header-component').css('display') != 'none';" .
				//acknowledge server that view was changed
				"$.ajax({" .
					"url: 'pr__expandview.php'," .
					"dataType: 'JSON'," .
					"type: 'POST'," .
					"data: {'e':tmpDoExp}" .
				"});" .
				//toggle header
				"$('.header-component').toggle();" .
				//toggle dividing line between header and remaining page body
				//"$('.page-header-divider').toggle();" .
				//toggle footer
				"$('.pageFooter').css('height', (tmpDoExp ? '' : '5%'));" .
				//"$('.pageFooter').toggle();" .
				//expand/shrink toolbar
				"$('.nc-toolbar-column').css('height', (tmpDoExp ? '100' : '85') + '%');" .
				//expand/shrink page view
				"$('.page-container').css('height', (tmpDoExp ? '92' : '90') + 'vh');" .
				"$('.page-container').css('width', (tmpDoExp ? '99vw' : ''));" .
			"});";

	};	//end function '$vw__page__setupExpandViewButton'

	//create alert message box to inform of post back
	//input(s): (none)
	//output(s):
	//	(text) => string that represents call to alert command to inform postback message
	//	for usage see: http://stackoverflow.com/a/10499554
	//	for func declaration, see: http://stackoverflow.com/a/20959784
	$vw__page__createPostBackAlert = function() {

		//if post back
		if( array_key_exists('postback', $_SESSION) && array_key_exists('message', $_SESSION['postback']) ){

			//get postback message
			$tmpPostBackMsg = $_SESSION['postback']['message'];

			//log change of session
			nc__util__session("vw__page.php", "unset [postback]", "");

			//reset postback
			unset($_SESSION['postback']);

			//show message
			return "alert('".$tmpPostBackMsg."');";

		}	//end if post back

	};	//end function 'vw__page__createPostBackAlert'

	//create page header
	//input(s):
	//	dlgs: (array<functionoids>) array of function pointers for creating dialogs
	//output(s): (none)
	function vw__page__createHeader($dlgs) {

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
		<!-- ES 2017-01-18: include CSS for depicting treeview -->
		<link rel="stylesheet" href="../../external/jstree/themes/default/style.min.css" />
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
		<!-- ES 2017-01-18: include JS for depicting treeview -->
		<script src="../../external/jstree/jstree.min.js"></script>
		<!-- bootstrap required -->
		<meta name="description" content="">
		<meta name="author" content="">
		<!-- ES 2017-01-21 (b_file_hierarchy): set up a value to avoid error with double page loading -->
		<link rel="icon" href="http://localhost:8080/public_folder/EMB.jpg">

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

		//loop thru array of dialog constructors
		foreach( $dlgs as $dlgName => $ctorDlg ){

			//invoke dialog function ctor
			$ctorDlg();

		}	//end loop thru array of dialog constructors

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
		//require 'js__codeview.php';

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
