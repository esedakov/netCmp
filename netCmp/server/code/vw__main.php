<?php if(!isset($_SESSION)){session_start();}  
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

			//ES 2017-01-22 (b_dbg_app): add ',' to insert additional dialog below
			},

			//ES 2017-01-22 (b_dbg_app): create additional dialog for choosing
			//	project, which to compile and execute (^O in debugging view)
			'open-project-dialog' => function(){

				//setup array of dialog structures
				$tmpDialogPrjAttrs = array();

				//set caption
				$tmpDialogPrjAttrs["caption"] = "Select project to debug";

				//save value of current directory
				$tmpCurDirVal = $_SESSION["file"]["open"];

				//reset value of current directory to the root folder
				$_SESSION["file"]["open"] = $_SESSION['consts']['root_id'];

				//create dialog for selecting a file
				$_SESSION['consts']['vw__codeview']['opdDlgId'] = nc__dlg__start($tmpDialogPrjAttrs);
				require 'vw__openFileDialog.php';
				nc__dlg__end();

				//reset current directory back to its former value
				$_SESSION['file']['open'] = $tmpCurDirVal;

			}
		)
	);

	//ES 2017-01-25 (b_patch01): bound page content to prevent it from overflowing
	echo "<div style='height:100%; overflow: auto;'>";

	//ES 2017-01-25 (b_patch01): if user is logged in
	if( $_SESSION['consts']['user']['id'] > 0 ){

		//include codeview
		require 'vw__codeview.php';

		//include file explorer
		require 'vw__fileexp.php';

		//include debugging view
		require 'vw__dbg.php';

		//include application view
		require 'vw__app.php';

		//ES 2017-01-25 (b_patch01): include user view
		require 'vw__user.php';

		//ES 2017-01-26 (b_aws_fix_01): include variables view
		require 'vw__vars.php';

		//ES 2017-01-26 (b_aws_fix_01): include message box
		require 'vw__progress.php';

	//ES 2017-02-06 (soko): if user is not logged in
	} else {

		//redirect to this page upon login
		$_SESSION['consts']['user']['redirectUponLogin'] = substr($_SERVER["SCRIPT_FILENAME"], strrpos($_SERVER["SCRIPT_FILENAME"], "/") + 1);

		//set to show toolbar
		$_SESSION['view']['showtoolbar'] = 'true';

	}	//ES 2017-01-25 (b_patch01): end if user is logged in

	//ES 2017-01-25 (b_patch01): terms and conditions
	require 'vw__terms.php';

	//ES 2017-01-25 (b_patch01): end bound page content to prevent from overflowing
	echo "</div>";

	//create page footer
	vw__page__createFooter();

?>
