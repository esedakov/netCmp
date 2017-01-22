<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016=10-31
	Description:	login\register user
	Used by:		(everything)
	Dependencies:	(none)
	***********************************
	Derived from bootstrap example: http://getbootstrap.com/examples/signin/
	*/
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<link rel="stylesheet" type="text/css" href="../external/joint.css">
		
		<!-- ES 2016-09-11 (b_debugger): added 2 stylesheets to make viewport DIVs resizable -->
		<link rel="stylesheet" href="../external/jquery/ui/1.12.0/themes/base/jquery-ui.css">
		<link rel="stylesheet" href="../external/resources/demos/styles.css">
		
		<!-- Bootstrap core CSS -->
		<link href="../external/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<script src="../external/jquery.min.js"></script>
		<script src="../external/lodash.min.js"></script>
		<script src="../external/backbone-min.js"></script>
		<script src="../external/joint.js"></script>
		
		<!-- ES 2016-09-11 (b_debugger): added UI jquery library to make DIV resizable -->
		<script src="../external/jquery-ui.js"></script>
		
		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<script src="../external/bootstrap/js/bootstrap.min.js"></script>
		
		<!-- COPIED STARTING FROM HERE -->
		<meta name="description" content="signin to account">
		<meta name="author" content="esedakov">
		<link rel="icon" href="../ball.png">

		<title>Signin or Register</title>

		<!-- Custom styles for this template -->
		<link href="../external/bootstrap/css/signin/signin.css" rel="stylesheet">

	</head>

	<body>

		<div class="container">

			<form class="form-signin">

				<ul class="nav nav-pills nav-justified">
					<li role="presentation" class="active"><a href="#">Login</a></li>
					<li role="presentation"><a href="#">Register</a></li>
				</ul>

				<h2 class="form-signin-heading">Please, sign in</h2>

				<label for="inputEmail" class="sr-only">Email address</label>
				<input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>

				<label for="inputName" id="labelName" class="sr-only">Name</label>
				<input type="name" id="inputName" class="form-control" placeholder="User Name">
				
				<label for="inputPassword" class="sr-only">Password</label>
				<input type="password" id="inputPassword" class="form-control" placeholder="Password" required>

				<div class="form-group" id="logoFileSelector">
					<label for="userlogofile">Logo</label>
					<input type="file" id="userlogofile">
					<p class="help-block">Optionally, select image logo</p>
				</div>
					
				<div class="checkbox">
					<label>
						<input type="checkbox" value="remember-me"> Remember me
					</label>
				</div>
				
				<button class="btn btn-lg btn-danger btn-block" type="submit">submit</button>
			
			</form>	<!-- /form-signin -->

		</div> <!-- /container -->

		<script type="text/javascript">

			$(document).ready(function(){

				//hide 'name'
				$("#labelName,#inputName").hide();
				//hide logo file selector
				$("#logoFileSelector").hide();

				$("li").on("click", function(){
					
					//remove 'active' from all LIs
					$("li").removeClass("active");
					//set class "active" for this LI
					$(this).addClass("active");

					//toggle 'name'
					$("#labelName,#inputName").toggle();

					//toggle logo file selector
					$("#logoFileSelector").toggle();

				});

			});

		</script>

	</body>
</html>