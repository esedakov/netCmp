<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-18
	Description:	retrieve file hierarchy from the server
	Used by:		(AJAX:vw__fileExp.php)
	Dependencies:	(db), (fattr), (utils)
	*/

	//process incoming url parameters
	require_once './init/init__request.php';

	//check if POST has 'file_id' is passed in
	if( array_key_exists("uf", $GLOBALS) ){

		//include library for function 'nc__util__reInitSession'
		require_once './lib/lib__utils.php';

		//include library for function 'nc__db__getIOEntryAttrs' and 'nc__db__getFileLocation'
		require_once './lib/lib__db.php';

		//include library for permission constants
		require_once './lib/lib__fperm.php';

		//include library for attributes
		require_once './lib/lib__fattr.php';

		//set type of returning data to be json
		//	see:http://stackoverflow.com/a/4064468
		header('Content-Type: application/json');

		//re-initialize session
		nc__util__reInitSession();

		//get information from DB for this item file/folder
		$attr = nc__db__getIOEntryAttrs($uf, false);

		//if folder was not found
		if( is_null($attr) ){

			//error
			die("file was not found");

		}	//end id folder was not found

		//check if user has permissions to access folder
		if( 
			//if folder can be read by any user
			$attr->_fperm & NC__ENUM__FPERM::READ == NC__ENUM__FPERM::READ ||

			//or, if this is the owner of the folder
			$attr->_ownerId == $_SESSION['consts']['user']['id']
		){

			//get files and folders inside this parent directory
			$tmpEntArr = nc__db__getIOEntriesInDirectory($uf, true, true);

			//create resulting json object
			$res = array();

			//loop thru internal entries
			foreach( $tmpEntArr as $entId => $entInfo ){

				//create new entry
				$tmpEntry = array();

				//specify id
				$tmpEntry['id'] = $entInfo->_type."_".$entInfo->_id;

				//specify name
				$tmpEntry['text'] = $entInfo->_name;

				//ES 2017-01-21 (b_file_hierarchy): init flag to check if inside root folder
				$tmpIsParRootFld = false;

				//if folder
				if(  $entInfo->_type == "5" ){

					//it may have children
					$tmpEntry['children'] = true;

					//ES 2017-01-21 (b_file_hierarchy): determine if this is a root folder
					$tmpIsParRootFld = $uf == $_SESSION['consts']['root_id'];

				}

				if( $uf == 0 ){

					//specify parent
					$tmpEntry['parent'] = $uf == 0 ? '#' : $uf;

				}

				//specify icon
				//ES 2017-01-21 (b_file_hierarchy): add new argument that checks if showing
				//	entries inside root folder
				$tmpEntry['icon'] = "glyphicon ".nc__util__getIconClassName($entInfo->_type, $tmpIsParRootFld);

				//specify type
				//$tmpEntry['type'] = nc__util__getIconJSTreeTypeName($entInfo->_type);

				//include this entry in json
				array_push($res, $tmpEntry);

			}	//end loop thru internal entries

			//output JSON
			//	see: http://stackoverflow.com/a/682282
			echo json_encode($res);

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