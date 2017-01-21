<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	retrieve file from the server
	Used by:		(AJAX:vw__codeview)
	Dependencies:	(none)
	*/

	//check if POST has 'file_id' and 'file_type' are passed in
	if( array_key_exists('f', $_POST) && array_key_exists('t', $_POST) ){

		//include library for function 'nc__util__reInitSession'
		require_once './lib/lib__utils.php';

		//include library for function 'nc__db__getIOEntryAttrs' and 'nc__db__getFileLocation'
		require_once './lib/lib__db.php';

		//include library for permission constants
		require_once './lib/lib__fperm.php';

		//include library for function 'nc__io__getIOEntries'
		require_once './lib/lib__io.php';

		//re-initialize session
		nc__util__reInitSession();

		//get type of IO item
		$itemType = $_POST["t"];

		//get information from DB for this item file/folder
		$attr = nc__db__getIOEntryAttrs($_POST["f"], $itemType != 5);

		//if file was not found
		if( is_null($attr) ){

			//error
			die("file was not found");

		}	//end id file was not found

		//check if user has permissions to access file
		if( 
			//if file can be read by any user
			$attr->_fperm & NC__ENUM__FPERM::READ == NC__ENUM__FPERM::READ ||

			//or, if this is the owner of the file
			$attr->_ownerId == $_SESSION['consts']['user']['id']
		){

			//if file (not a folder)
			if( $itemType != "5" ){

				//get file location information
				$loc = nc__db__getFileLocation($_POST["f"]);

				//NOTE: right now we are only considering local storage option, i.e. not on git
				//NOTE: field 'location' is only used for GIT, to specify path url to the file
				//TODO: need to implement case for storing on the GITHUB
				
				//if an image (2)
				if( $itemType == "2" ) {

					//send back url for the image
					echo "http://".$_SERVER["SERVER_NAME"].":8080/public_folder/".$loc->_name;

				} else {	//else, if text/code file

					//compose abs file location string
					$tmpFileLoc = $_SESSION['consts']['pub_folder'] . $loc->_name;

					//if file type is an image
					if( $_POST["t"] == "2" ){

						//set content header to transfer image
						//	see: http://stackoverflow.com/a/1851856
						header('Content-Type: image/jpeg');
						header('Content-Length: ' . filesize($tmpFileLoc));
					
					}	//end if file type is an image

					//output file
					readfile($tmpFileLoc);

				}	//end if an image

			} else {	//if folder (assume that invoked from vw__openFileDialog.php)

				//log change of session
				nc__util__session("pr__getfile.php", "[file][open]", $_POST["f"]);

				//reset current folder for open-file dialog
				$_SESSION["file"]["open"] = $_POST["f"];

			}	//end if file (not a folder)

			//done transferring data, stop now
			exit;

		} else {	//if do not have access permissions

			//error
			die("missing access permissions");

		}	//end if user has permissions to access file

	} else {	//else, did not pass file id and type

		//error
		die("missing required POST attributes");

	}	//end if POST has 'file_id' and 'file_type' passed in

?>