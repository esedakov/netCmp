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

		<!-- styles -->
		<style type="text/css">
			<?php //styles for vw__page.php, i.e. footer section and expand button ?>
			.pageFooter {
				background-color: #777;
				color: #ffffff;
				width: 100%;
				height: 5%;
				text-align: center;
				padding-top: 2px;
			}
			.expandView {
				float: right;
			}
			.expandView:hover {
				color: red;
			}
			<?php //styles for vw__toolbar.php, i.e. buttons in the toolbar on a side ?>
			.vertBarIcon {
				height: 115px;
				padding: 10%;
				text-align: center;
				background-color: #f9f9f9;
			}
			.vertBarIcon:hover {
				color: purple;
			}
			<?php //styles for vw__codeview.php, i.e. style the typed in code ?>
			.nc-lang-keyword {
				font-weight: bold;
				color: green;
			}
			.nc-type {
				color: purple;
				text-decoration: underline;
			}
			.nc-identifier {
				font-style: italic;
				color: blue;
			}
			.nc-constant-value {
				background-color: lightgray;
				color: red;
			}
			.nc-tab {
				margin-left: 2em;
			}
			.nc-editor-current-line {
				background-color: #f2dede;
			}
			.nc-line {
				display: block;
				min-height: 2ex;
			}
			.nc-console {
				background-color: #bb8181;
				width: 1em;
				height: 2ex;
				display: inline-block;
				top: 2px;
				opacity: 0.5;
			}
			.nc-emphasize-identifiers {
				font-weight: bold;
				font-size: 3ex;
			}
			.nc-current-word {
				/* nothing */
			}
			.nc-current-letter {
				background-color: aqua;
				border-right-color: red;
				border-right-style: solid;
				border-right-width: 2px;
			}
			.nc-comment {
				color: #a3cab6;
				/* subsequent styles override all other that are defined for SPANs */
				font-weight: normal;
				text-decoration: initial;
				font-style: initial;
				background-color: initial;
				font-size: initial;
			}
			.nc-comment-start {
				/* nothing */
			}
			.nc-comment-end {
				/* nothing */
			}
			.nc-comment-one-line {
				/* nothing */
			}
			.nc-clicked-element {
				border-width: 2px;
				border-color: red;
				border-style: solid;
			}
		</style>

	</head>	<!-- end head -->

	<!-- start body -->
	<body>

		<?php

			//if user is not logged in
			if( empty($lv_userInfo) ){

				//include library for dialogs
				require_once './lib/lib__dialog.php';

				//setup array of dialog attributes
				$tmpDlgAttrs = array();

				//set caption
				$tmpDlgAttrs["caption"] = "Please, login or register";

				//create dialog
				//$tmpDlgId = nc__dlg__create(
				//	"http://localhost:8080/netCmp/server/view__login.html",
				//	$tmpDlgAttrs
				//);

				$tmpLoginDlgId = nc__dlg__start($tmpDlgAttrs);
				require 'vw__login.php';
				nc__dlg__end();

			}	//end user is not logged in

		?>

		<!-- page container that occupies 90% of viewport's height -->
		<div class="container bs-glyphicons" style="height:90vh;">
			
			<!-- header -->
			<div class="header clearfix" style="height:5%;">

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
							title="User <?php vw__page__showUserName($lv_userInfo); ?>"
						>

							<!-- link for showing user information -->
							<a href="#" class="nc-login-register-button">

								<?php vw__page__showUserName($lv_userInfo); ?> <span 
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
			<hr class="featurette-divider">

			<!-- show expand view button on the right side -->
			<span 
				class="expandView glyphicon glyphicon-fullscreen" 
				aria-hidden="true"
				data-toggle="tooltip"
				data-placement="left"
				title="Full Screen"
			></span>
			
			<!-- show toolbar view -->
			<?php require 'vw__toolbar.php'; ?>

			<!-- start tail -->
			<footer class="pageFooter">

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

				// script for showing tooltip messages
				//	see: http://www.w3schools.com/bootstrap/bootstrap_tooltip.asp
			    $('[data-toggle="tooltip"]').tooltip();

			    <?php

			    	//if user is not logged in
			    	if( empty($lv_userInfo) ){

			    		//attach CLICK event to login/register button to open proper dialog
			    		echo "$('.nc-login-register-button').click(function(){" .
				    			"$('#" . $tmpLoginDlgId . "').modal();" .
				    		"});";

			    	}	//end if user is not logged in

			    ?>

			});
		</script>

		<!-- include JS script intended to format typed user code -->
		<?php require 'js__codeview.php'; ?>

		<!-- include JS script for dialog -->
		<?php require_once 'js__login.php'; ?>

	</body>	<!-- end body -->

</html>	<!-- end html -->