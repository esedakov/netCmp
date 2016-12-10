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

	<form class="form-signin">

		<ul class="nav nav-pills nav-justified">
			<li role="presentation" class="nc-login-toggle-pills active"><a href="#">Login</a></li>
			<li role="presentation" class="nc-login-toggle-pills"><a href="#">Register</a></li>
		</ul>

		<hr class="featurette-divider">

		<label for="inputEmail" class="sr-only">Email address</label>
		<input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>

		
		<label for="inputPassword" class="sr-only">Password</label>
		<input type="password" id="inputPassword" class="form-control" placeholder="Password" required>

		<hr class="featurette-divider">
			
		<div class="checkbox">
			<label>
				<input type="checkbox" value="remember-me"> Remember me
			</label>
		</div>

	</form>	<!-- /form-signin -->

</div> <!-- /container -->