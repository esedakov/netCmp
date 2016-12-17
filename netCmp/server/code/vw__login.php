<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	show login/register page
	Used by:		(vw__page)
	Dependencies:	(js__login)
	*/

	//initialize user name
	$tmpUserName = "";

	//initialize post back message (if any)
	$tmpPostBackMsg = "";

	//check if this is postback
	if( array_key_exists('postback', $_SESSION) ){

		//assign user name from postback
		$tmpUserName = $_SESSION['postback']['nc_user_name'];

	}	//end if postback exists
?>
<div class="container">

	<form class="form-signin" action="post__login.php" method="post">

		<ul class="nav nav-pills nav-justified">
			<li role="presentation" class="nc-login-toggle-pills active"><a href="#">Login</a></li>
			<li role="presentation" class="nc-login-toggle-pills"><a href="#">Register</a></li>
		</ul>

		<hr class="featurette-divider">

		<label for="nc-login-input-name" id="nc-login-label-name" class="sr-only">Name</label>
		<input 
			type="name" 
			id="nc-login-input-name"
			name="nc_user_name" 
			class="form-control" 
			placeholder="User Name"
			<?php

				//if post back user name
				if( $tmpUserName != "" ){

					//assign value to be post back user name
					echo 'value="'.$tmpUserName.'" \n';

					//draw red border around user name input field
					echo 'style="border: 1px solid red;" \n';

				}	//end if post back user name
			
			?>
		>
		
		<label for="inputPassword" class="sr-only">Password</label>
		<input 
			type="password" 
			id="inputPassword"
			name="nc_user_password" 
			class="form-control" 
			placeholder="Password" 
			<?php

			//if post back user name
			if( $tmpUserName != "" ){

				//draw red border around password input field
				echo 'style="border: 1px solid red;" \n';

			}	//end if post back user name

			?>
			required
		>

		<label for="nc-login-label-email" class="sr-only">Email address</label>
		<input 
			type="email" 
			id="nc-login-input-email" 
			name="nc_user_email"
			class="form-control" 
			placeholder="Email address" 
			autofocus
		>

		<div class="form-group" id="nc-login-logo-file-selector">
			<label for="userlogofile">Logo</label>
			<input 
				type="file" 
				id="userlogofile"
				name="nc_user_logo_file"
			>
			<p class="help-block">Optionally, select image logo</p>
		</div>

		<hr class="featurette-divider">
			
		<div class="checkbox">
			<label>
				<input 
					name="nc_user_remember_me"
					type="checkbox" 
					value="remember-me"
				> Remember me
			</label>
		</div>

		<hr class="featurette-divider">
		
		<button class="btn btn-lg btn-danger btn-block" type="submit">submit</button>
	
	</form>	<!-- /form-signin -->

</div> <!-- /container -->