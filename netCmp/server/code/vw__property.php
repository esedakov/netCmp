<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-18
	Description:	show file/folder properties
	Used by:		(vw__codeview)
	Dependencies:	(db), (fperm)
	*/

	//include db library
	require_once './lib/lib__db.php';

	//inlcude file/folder permissions library
	require_once './lib/lib__fperm.php';

	//inlcude file/folder attributes library
	require_once './lib/lib__fattr.php';

	//display in a table properties for the specified file/folder
	//input(s):
	//	id: (fattr) file/folder attributes object
	//output(s):
	//	(string) => html table in a text representation
	function showIOEntryProperties($attr){

		//if did not get any attributes
		if( is_null($attr) ){

			//respond an empty string
			return "";

		}	//end if did not get any attributes

		//initialize resulting string
		$res = "<table class='nc-prop-table'><thead><tr>".
				"<th class='nc-prop-table-cell-name'>".
					"attribute caption".
				"</th>".
				"<th class='nc-prop-table-cell-value'>".
					"value".
				"</th></tr></thead><tbody>";

		//print name
		$res .= "<tr><td>name:</td>".
				"<td class='nc-prop-table-cell-value'>".$attr->_name."</td></tr>";

		//print modification date
		//	see: http://stackoverflow.com/a/20617295
		$res .= "<tr><td>modified:</td>".
				"<td class='nc-prop-table-cell-value'>".
					date("Y-m-d H:i:s", $attr->_date).
				"</td></tr>";
		
		//print start of a row for a type of file or folder
		$res .= "<tr><td>type:</td><td class='nc-prop-table-cell-value'>";

		//depending on the type
		switch($attr->_type){
			
			//if text file
			case 1:
				$res .= "text file";
				break;

			//if image file
			case 2:
				$res .= "image file";
				break;

			//if code file
			case 3:
				$res .= "code file";
				break;

			//if Control-Flow-Graph
			case 4:
				$res .= "CFG";
				break;

			//if a folder
			case 5:
				$res .= "folder";
				break;

			default:
				$res .= "unkown type";
			break;

		}	//end switch - depending on the type

		//end row for a type of file or folder
		$res .= "</td></tr>";

		//print permissions of a file or folder
		$res .= "<tr><td>permissions:</td>".
				"<td class='nc-prop-table-cell-value'>".
					NC__ENUM__FPERM::toStr($attr->_fperm).
				"</td></tr>";

		//compose text value for issuspended flag
		$tmpIsSuspended = $attr->_isSuspended ? "true" : "false";

		//print suspend flag
		$res .= "<tr><td>suspended:</td>".
				"<td class='nc-prop-table-cell-value'>".$tmpIsSuspended."</td></tr>";

		//get user name
		$tmpUserName = nc__db__getUserName($attr->_ownerId);

		//if user name is NULL
		if( is_null($tmpUserName) ){

			//reset to "unkown"
			$tmpUserName = "unkown";

		}	//end if user name is NULL

		//print user name that owns this file
		$res .= "<tr><td>user name:</td>".
				"<td class='nc-prop-table-cell-value'>".$tmpUserName."</td></tr>";

		//get attributes for the parent directory
		$parDirAttr = nc__db__getIOEntryAttrs($attr->_dirId, false);

		//init var for parent directory name
		$parName = "undefined!";

		//if parent directory attributes is not null
		if( is_null($parDirAttr) == false ){

			//set parent directory name
			$parName = $parDirAttr->_name;

		}	//end if parent directory attributes is not null

		//print name of parent directory id
		$res .= "<tr><td>parent DIR name:</td>".
				"<td class='nc-prop-table-cell-value'>".$parName."</td></tr>";

		//end table
		$res .= "</tbody></table>";

		//return resulting html table text representation
		return $res;

	}	//end function 'showIOEntryProperties'