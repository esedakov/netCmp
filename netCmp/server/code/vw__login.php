<?php 
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	show login/register page
	Used by:		(vw__page)
	Dependencies:	(js__login)
	*/

	//ES 2017-02-28 (soko): include utils lib
	require_once "./lib/lib__utils.php";
	//ES 2017-02-28 (soko): global constant from utils library for specifying minimum  number of password characters
	global $nc__util__g__pass__minchars;

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
		
		<?php //ES 2017-02-28 (soko): create outter DIV to place hint that explains rules fot filling out password ?>
		<div class="nc-login-pwd-outter">

			<?php //hint box that is shown on the side on input label field to explain password criteria ?>
			<div class="nc-login-pwd-tooltip" style="display: table;">
				
				<?php //rule 1 - password must contain at least 1 capital letter ?>
				<span class="nc-login-pwd-tooltip-rule nc-login-pwd-one-upper-case">

					<?php //initially all rules are not satisfies, i.e. show red cross sign ?>
					<span class="glyphicon glyphicon-remove nc-unkown-file-color" style="margin-right: 5px; display: none;"></span>

					<?php //actual rule ?>
					password must contain at least 1 upper case letter

				</span>	<?php //end rule 1 ?>

				<?php //rule 2 - password must contain at least 1 lower case letter ?>
				<span class="nc-login-pwd-tooltip-rule nc-login-pwd-one-lower-case">

					<?php //initially all rules are not satisfies, i.e. show red cross sign ?>
					<span class="glyphicon glyphicon-remove nc-unkown-file-color" style="margin-right: 5px; display: none;"></span>

					<?php //actual rule ?>
					password must contain at least 1 lower case letter

				</span> <?php //end rule 2 ?>

				<?php //rule 3 - password must contain at least 1 digit ?>
				<span class="nc-login-pwd-tooltip-rule nc-login-pwd-one-digit">

					<?php //initially all rules are not satisfies, i.e. show red cross sign ?>
					<span class="glyphicon glyphicon-remove nc-unkown-file-color" style="margin-right: 5px; display: none;"></span>

					<?php //actual rule ?>
					password must contain at least 1 digit

				</span> <?php //end rule 3 ?>

				<?php //rule 4 - password must be of certain minimum length ?>
				<span class="nc-login-pwd-tooltip-rule nc-login-pwd-min-length">

					<?php //initially all rules are not satisfies, i.e. show red cross sign ?>
					<span class="glyphicon glyphicon-remove nc-unkown-file-color" style="margin-right: 5px; display: none;"></span>

					<?php //actual rule ?>
					password must be at least <?php echo $nc__util__g__pass__minchars ?> characters long

				</span> <?php //end rule 4 ?>

			</div>	<?php //end hint box that is shown on the side of input label ?>

			<?php //ES 2017-02-28 (soko): add new class to distinguish this label field from others on page ?>
			<label for="inputPassword" class="sr-only nc-login-pwd-label">Password</label>
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

		</div>	<?php //ES 2017-02-28 (soko): end outter DIV to place hint for password ?>

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
		
		<?php /* ES 2017-01-26 (b_aws_fix_01): remove (un-needed feature)
		<div class="checkbox">
			<label>
				<input 
					name="nc_user_remember_me"
					type="checkbox" 
					value="remember-me"
				> Remember me
			</label>
		</div>
		*/ ?>

		<?php //ES 2017-01-26 (b_aws_fix_01): allow user to retrieve lost password ?>
		<a href="#" onclick="nc__login__forgotPass();">forgot password</a>

		<hr class="featurette-divider">
		
		<?php //ES 2017-02-28 (soko): add class to select button with jquery ?>
		<button class="btn btn-lg btn-danger btn-block nc-login-user-submit-btn" type="submit">submit</button>
	
	</form>	<!-- /form-signin -->

</div> <!-- /container -->

<?php //ES 2017-01-26 (b_aws_fix_01): add script for function 'nc__login__forgotPass' ?>
<script>

	<?php //ES 2017-02-28 (soko): attach onFocus handler ?>
	$("input[name='nc_user_password']").on("focus keyup", function(){

		<?php //make tooltip non-transparent ?>
		$(".nc-login-pwd-tooltip").css("opacity", 1.0);

		<?php //update rules for password tooltip ?>
		nc__login__updatePwdTooltip();

	});

	<?php //ES 2017-02-28 (soko): if password field is not focused ?>
	$("input[name='nc_user_password']").on("focusout", function(){

		<?php //make it semi transparent ?>
		$(".nc-login-pwd-tooltip").css("opacity", 0.5);

	});

	<?php //ES 2017-02-28 (soko): update glyphicons inside password tooltip ?>
	function nc__login__updatePwdTooltip(){

		<?php //get value from the password field ?>
		var tmpVal = $("input[name='nc_user_password']").val();

		<?php //create associative set, where key: selector, value is boolean (whether rule satisfies it or not)
			//see: http://stackoverflow.com/a/2830891
		?>
		var tmpRules = {
			"nc-login-pwd-one-upper-case" : (/[A-Z]/.test(tmpVal)),
			"nc-login-pwd-one-lower-case" : (/[a-z]/.test(tmpVal)),
			"nc-login-pwd-one-digit" : (/[0-9]/.test(tmpVal)),
			"nc-login-pwd-min-length" : (tmpVal.length >= <?php echo $nc__util__g__pass__minchars ?>)
		};

		//should submit button be disabled
		var doDisableSubmit = false;

		<?php //loop thru rule set ?>
		for( var tmpCurRule in tmpRules ){

			<?php //get current span rule that has glyphicon ?>
			var tmpIconSpan = $("." + tmpCurRule + " > .glyphicon");

			<?php //remove all classes from the span (see: http://stackoverflow.com/a/16332546) ?>
			$(tmpIconSpan).removeClass();

			<?php //init class string to be assigned to the rule span ?>
			var tmpClsStr = "glyphicon glyphicon-";

			<?php //if current rule is satisfied ?>
			if( tmpRules[tmpCurRule] ){

				<?php //green check mark ?>
				tmpClsStr += "ok nc-folder-icon-color";

			} else {	<?php //else, rule is not satisfied ?>

				<?php //red class mark ?>
				tmpClsStr += "remove nc-unkown-file-color";

				<?php //disable submit button ?>
				doDisableSubmit = true;

			}	<?php //end if current rule is satisfied ?>

			<?php //assign class to the current rule ?>
			$(tmpIconSpan).attr('class', tmpClsStr);

			<?php //make rule visible ?>
			$(tmpIconSpan).css("display", "inline-block");

		}	<?php //end loop thru rule set ?>

		//if submit button should be disabled
		$(".nc-login-user-submit-btn").prop('disabled', doDisableSubmit);

	}	<?php //ES 2017-02-28 (soko): end function 'nc__login__updatePwdTooltip' ?>

	<?php 
	//send email to user with the password
	//input(s): (none)
	//output(s): (none)
	?>
	function nc__login__forgotPass(){

		<?php //get user name ?>
		var tmpUserName = $("#nc-login-input-name").val();

		<?php //if user name is not given ?>
		if( tmpUserName.length == 0 ){

			<?php //prompt user that this field is required ?>
			alert("Please, enter user name");

			<?php //indicate that username field is required ?>
			$("#nc-login-input-name").css("border", "5px solid red");

			<?php //quit ?>
			return;

		}	<?php //end if user name is not given ?>

		<?php //transfer request to server to send email ?>
		$.ajax({
			url: "pr__lostpass.php",
			method: "POST",
			data: {
				u: tmpUserName
			}
		}).done(function(data){
			alert(data);
		});

	}
</script>
