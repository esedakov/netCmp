<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	show login page
	Used by:		(vw__page)
	Dependencies:	(js__codeview)
	*/

	//include page view
	require_once 'vw__page.php';

	//include library for dialogs
	require_once './lib/lib__dialog.php';

	//init dialog id for selecting a file
	$vw__codeview__ofdDlgId = 0;

	//create page header
	vw__page__createHeader(
		array(
			'open-file-dialog' => function(){

				global $vw__codeview__ofdDlgId;

				//setup array of dialog attributes
				$tmpDialogAttrs = array();

				//set caption
				$tmpDialogAttrs["caption"] = "Select a file...";

				//create dialog for loggin
				$vw__codeview__ofdDlgId = nc__dlg__start($tmpDialogAttrs);
				require 'vw__openFileDialog.php';
				nc__dlg__end();

			}
		)
	);

?>
<div class="row">
	<div class="col-xs-12 col-md-12">
		<ul class="nav nav-tabs">
			<!-- TODO: for now it is hardcoded file tabs, later will need to actually create
					mechanism for creating new files, closing existing, and opening files -->
			<li role="presentation" class="active"><a href="#">myFile_4.nc</a></li>
		</ul>
	</div>
</div>
<div class="row">
	<div class="col-xs-12 col-md-12">
		<!--<textarea class="jumbotron" style="height:65vh;">-->
		<!--<code contenteditable="true" style="height:65vh;">
		</code>-->
		<div class="nc-input-editor">
			<span class="nc-line nc-editor-current-line">
				<span class="nc-current-word">
					<span class="nc-current-letter"></span>
				</span>
			</span>
		</div>
	</div>
</div>

<script type="text/javascript">

	<?php //click event for file icon in open-file dialog (vw__openFileDialog.php) ?>
	$(document).on("click", ".nc-io-entry-icon", function(){
		
	
	});	<?php //end click event for open-file dialog ?>

</script>

<?php

	//include JS script intended to format typed user code
	require 'js__codeview.php';

	//create page footer
	vw__page__createFooter();

?>