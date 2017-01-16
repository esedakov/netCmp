<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	js for switching login and register tabs
	Used by:		(vw__page)
	Dependencies:	(vw__login)
	*/
?>
<script type="text/javascript">

	//when document loads
	$(document).ready(function(){

		//hide 'name'
		$("#nc-login-label-email,#nc-login-input-email").hide();
		
		//hide logo file selector
		$("#nc-login-logo-file-selector").hide();

		$(".nc-login-toggle-pills").on("click", function(){

			//check if clicked already active tab
			if( $(this).hasClass("active") ){

				//ignore this click
				return;

			}	//end if clicked already active tab
			
			//remove 'active' from all LIs
			$(".nc-login-toggle-pills").removeClass("active");
			
			//set class "active" for this LI
			$(this).addClass("active");

			//if clicked on register tab
			if( $(this).find("a").html() == "Register" ){

				//add 'required' field to this element
				$("#nc-login-input-email").attr("required", "required");

			} else {	//else, if clicked 'login'

				//remove 'required'
				$("#nc-login-input-email").removeAttr("required");
			
			}	//end if clicked on register tab

			//toggle 'name'
			$("#nc-login-label-email,#nc-login-input-email").toggle();

			//toggle logo file selector
			$("#nc-login-logo-file-selector").toggle();

		});

	});

</script>