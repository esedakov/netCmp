<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-22
	Description:	main view that combines all other
	Used by:		(none)
	Dependencies:	(codeview), (page), (fileexp)
	*/

	//include page view
	require_once 'vw__page.php';

	//include library for dialogs
	require_once './lib/lib__dialog.php';

	//create page header
	vw__page__createHeader(
		array(

			'open-save-file-dialog' => function(){

				//ES 2017-01-21 (b_file_hierarchy): moved this global value into session
				//global $vw__codeview__ofdDlgId;

				//setup array of dialog attributes
				$tmpDialogAttrs = array();

				//set caption
				$tmpDialogAttrs["caption"] = "Select a file...";

				//create dialog for selecting a file
				//ES 2017-01-21 (b_file_hierarchy): changed '$vw__codeview__ofdDlgId' to session var
				$_SESSION['consts']['vw__codeview']['ofdDlgId'] = nc__dlg__start($tmpDialogAttrs);
				require 'vw__openFileDialog.php';
				nc__dlg__end();

			}
		)
	);

	//include codeview
	require 'vw__codeview.php';

	//include file explorer
	require 'vw__fileexp.php';

	//include debugging view
	require 'vw__dbg.php';

	//include application view
	require 'vw__app.php';

	//create page footer
	vw__page__createFooter();

?>