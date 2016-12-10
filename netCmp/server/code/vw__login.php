<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	show login/register page
	Used by:		(vw__page)
	Dependencies:	(js__login)
	*/
?>
<div class="container">

	<form class="form-signin" action="post__login.php" method="post">

		<ul class="nav nav-pills nav-justified">
			<li role="presentation" class="nc-login-toggle-pills active"><a href="#">Login</a></li>
			<li role="presentation" class="nc-login-toggle-pills"><a href="#">Register</a></li>
		</ul>

		<hr class="featurette-divider">

		<label for="inputEmail" class="sr-only">Email address</label>
		<input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>

		<label for="nc-login-input-name" id="nc-login-label-name" class="sr-only">Name</label>
		<input type="name" id="nc-login-input-name" class="form-control" placeholder="User Name">
		
		<label for="inputPassword" class="sr-only">Password</label>
		<input type="password" id="inputPassword" class="form-control" placeholder="Password" required>

		<div class="form-group" id="nc-login-logo-file-selector">
			<label for="userlogofile">Logo</label>
			<input type="file" id="userlogofile">
			<p class="help-block">Optionally, select image logo</p>
		</div>

		<hr class="featurette-divider">
			
		<div class="checkbox">
			<label>
				<input type="checkbox" value="remember-me"> Remember me
			</label>
		</div>

		<hr class="featurette-divider">
		
		<button class="btn btn-lg btn-danger btn-block" type="submit">submit</button>
	
	</form>	<!-- /form-signin -->

</div> <!-- /container -->