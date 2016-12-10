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
		$("#nc-login-label-name,#nc-login-input-name").hide();
		
		//hide logo file selector
		$("#nc-login-logo-file-selector").hide();

		$(".nc-login-toggle-pills").on("click", function(){
			
			//remove 'active' from all LIs
			$(".nc-login-toggle-pills").removeClass("active");
			
			//set class "active" for this LI
			$(this).addClass("active");

			//toggle 'name'
			$("#nc-login-label-name,#nc-login-input-name").toggle();

			//toggle logo file selector
			$("#nc-login-logo-file-selector").toggle();

		});

	});

</script>