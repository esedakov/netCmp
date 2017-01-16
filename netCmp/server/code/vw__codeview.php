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
			'open-save-file-dialog' => function(){

				global $vw__codeview__ofdDlgId;

				//setup array of dialog attributes
				$tmpDialogAttrs = array();

				//set caption
				$tmpDialogAttrs["caption"] = "Select a file...";

				//create dialog for selecting a file
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
			<!-- first document -->
			<li role="presentation" class="active"><a href="#">New Document*</a></li>
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

	<?php //when single clicked on any file icon then trigger this event (vw__openFileDialog) ?>
	$(document).on("click", ".nc-io-entry-format", function(){

		<?php //remove class 'nc-io-entry-icon-selected' from all other ?>
		$(".nc-io-entry-icon-selected").removeClass("nc-io-entry-icon-selected");
		
		<?php //add class 'nc-io-entry-icon-selected' to this file icon ?>
		$(this).addClass("nc-io-entry-icon-selected");
	
	});	<?php //end trigger click event ?>

	//TODO: we need to handle click on submit button for selecting a file

	<?php //click event for file icon in open-save-file dialog (vw__openFileDialog.php) ?>
	$(document).on("dblclick", ".nc-io-entry-icon", function(){
		
		<?php //get file/folder id ?>
		var t1 = $(this).attr("f");

		<?php //get file/folder type ?>
		var t2 = $(this).attr("t");

		<?php //get file name ?>
		var t3 = $(this).attr("n");

		<?php
			//get request mode
			echo "var t4 = $('#".$vw__codeview__ofdDlgId."').attr('m');";
		?>

		<?php //if opening a file ?>
		if( t4 == "1" ){

			<?php //send request to the server ?>
			$.ajax({
				url: 'pr__getfile.php',
				method: 'POST',
				data: {'f':t1, 't':t2}
			}).done(function(data){

				<?php //if this a code/text file (not a folder=5) ?>
				if( t2 == "3" || t2 == "1" ){

					<?php //break retrieved code file into lines by newline char ?>
					var t4 = data.split(/\r?\n/);

					<?php //init tabulation set for opened file ?>
					var t5 = [];

					<?php //loop as many times as there are lines in the opened file ?>
					for( var l = 0; l < t4.length; l++ ){

						<?php //add start of line tabulation info for each line of saved file ?>
						t5.push([0,0]);

					}	<?php //end loop as many times as there are lines in the opened file ?>
					
					<?php //store file inside file tab set ?>
					g_files[t3] = {

						<?php //split by newline (see: http://stackoverflow.com/a/21895354) ?>
						code: t4,
						line: t4.length - 1,
						letter: 0,
						tabs: t5

					};

					<?php //create new tab ?>
					openCodeViewTab(2, t3, t1);

					<?php 
						//close open-save-file dialog
						echo 'toggleOpenSaveFileDlg(0, false);';
					?>

				} else if( t2 == "2" ){	<?php //else, if image file ?>

					<?php //save image base64 code inside g_files ?>
					g_files[t3] = {

						<?php //store image string as a whole in a new attribute 'img' ?>
						img: data,

						<?php //store nothing for attribute 'code' ?>
						code: [],

						<?php //place default values for remaining attributes ?>
						line: 0,
						letter: 0,
						tabs: [[0,0]]
					};

					<?php //create new tab for image file and pass image file name ?>
					openCodeViewTab(3, t3, t1);

					<?php 
						//close open-save-file dialog
						echo 'toggleOpenSaveFileDlg(0, false);';
					?>

				} else {	<?php //else, if folder or CFG (a.k.a project folder) ?>

					<?php 
						//get dialog content HTML
						nc__util__ajaxToResetOpenFileDlg(

							//url to invoked in AJAX call
							"vw__openFileDialog.php", 

							//dialog id
							$vw__codeview__ofdDlgId,

							//code to be executed upon completion of AJAX call
							nc__util__makeIconsLarge()
						);
					?>

				}	<?php //end if file (not a folder) ?>
		
			});	<?php //end trigger AJAX event -- DONE function ?>
	
		} else if( t4 == "2" ){	<?php //else, if saving a file to the server ?>

			<?php //ensure that saved file is either a code or a text file ?>
			if( t2 != "3" && t2 != "1" ){

				<?php //error ?>
				alert("ERROR: attempting to save a non-code and non-text file!");

				<?php //quit ?>
				return;

			}	<?php //end if saved file is neither code nor text file ?>

			<?php //compose a single string for all code/text lines of currently rendered file ?>
			var tmpWholeCnt = g_code.join("\n");

			<?php
				//save a file via AJAX call
				nc__io__ajaxSaveFile("t1", "t2", "tmpWholeCnt");
			?>

			<?php 
				//close open-save-file dialog
				echo 'toggleOpenSaveFileDlg(0, false);';
			?>

			<?php //get reference to the tab's hyperlink ?>
			var tmpTabCap = $(".nav-tabs > li[role='presentation'][class='active'] > a");

			<?php //if saved a new tab document ?>
			if( $(tmpTabCap).hasAttr("f") ){

				<?php //change tab name to selected file name ?>
				$(tmpTabCap).html(t3);

			}	<?php // end if saved a new tab document ?>

		}	<?php //end if opening a file ?>
	
	});	<?php //end click event for open-save-file dialog ?>

</script>

<?php

	//include JS script intended to format typed user code
	require 'js__codeview.php';

	//create page footer
	vw__page__createFooter();

?>