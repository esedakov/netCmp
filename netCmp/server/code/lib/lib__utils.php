<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-08
	Description:	database utility functions
	Used by:		(everything)
	Dependencies:	(none)
	*/

	//CONSTANTS:
	//	1. minimum number of characters in the user name
	$nc__util__g__username__minchars = 5;
	//	2. minimum number of characters in the password
	$nc__util__g__pass__minchars = 7;
	//	3. max number of characters in the IO entry name
	$nc__util__g__IOEntry_maxchars = 511;

	//redirect to another page
	//see: http://stackoverflow.com/questions/353803/redirect-to-specified-url-on-php-script-completion
	//input(s):
	//	path: (text) partial path (starting from 'netcmp' folder) to the redirected file
	//output(s): (none)
	function nc__util__redirect($path){

		//output function name
		nc__util__func('utils', 'nc__util__redirect');

		ob_start(); // ensures anything dumped out will be caught

		// clear out the output buffer
		while (ob_get_status()) 
		{
		    ob_end_clean();
		}

		//replace '\\' with '/'
		str_replace('\\', '/', $path);

		// no redirect
		header( "Location: $path" );

	}	//end function 'nc__util__redirect'

	//get currently displayed PHP file name from the server information
	//input(s): (none)
	//output(s):
	//	(text) => currently shown PHP file name
	function nc__util__getPHPFileName(){

		//output function name
		nc__util__func('utils', 'nc__util__getPHPFileName');

		//get PHP full file path
		$tmpFullPath = $_SERVER['SCRIPT_NAME'];

		//index last '/' in the full file path after which file name follows
		$tmpSlashIdx = strrpos($tmpFullPath, "/");

		//index last '.' after which file extension follows
		$tmpDotIdx = strrpos($tmpFullPath, ".");

		//return only PHP file name
		return substr($tmpFullPath, $tmpSlashIdx + 1, $tmpDotIdx - $tmpSlashIdx - 1);

	}	//end function 'nc__util__getPHPFileName'

	//report error and abort execution
	//input(s):
	//	msg: (text) error message
	//output(s): (none)
	function nc__util__error($msg){

		//output function name
		nc__util__func('utils', 'nc__util__error');

		//report error message and kill process
		die( "error: " . $msg );

	}	//end function 'nc__util__error'

	//report message (do not abort execution)
	//input(s):
	//	msg: (text) message to report
	//output(s): (none)
	function nc__util__log($msg){

		//report message
		error_log($msg . "\r\n", 3, $_SESSION['consts']['log']['dbg']['path']);

	}	//end function 'nc__util__log'

	//if necessary output library function name
	//input(s):
	//	lib: (text) library name ackronym
	//	name: (text) function name
	//output(s): (none)
	function nc__util__func($lib, $name){

		//if SESSION is set
		if( isset($_SESSION) ){

			//if this library needs to output
			if( $_SESSION['consts']['log']['dbg']['libs'][$lib] ){

				//output function name
				nc__util__log("invoked library ".$lib." function: ".$name);

			}	//end if this library needs to output

		}	//end if SESSION is set

	}	//end function 'nc__util__func'

	//if necessary output query statement
	//input(s):
	//	funcName: (text) name of function, where query got invoked
	//	qStmt: (text) query statement
	//output(s): (none)
	function nc__util__query($funcName, $qStmt){

		//if session is set
		if( isset($_SESSION) ){

			//if should dump query
			if( $_SESSION['consts']['log']['dbg']['query'] ){

				//output query statement with function name
				nc__util__log($funcName . " => " . $qStmt);

			}	//end if should dump query

		}	//end if session is set

	}	//end function 'nc__util__query'

	//if necessary log changes to the session
	//input(s):
	//	loc: (text) name of file/function, where change was made
	//	key: (text) session key that was altered
	//	val: (text) new value (if any)
	//output(s): (none)
	function nc__util__session($loc, $key, $val){

		//if session is set
		if( isset($_SESSION) ){

			//if should record change of session
			if( $_SESSION['consts']['log']['dbg']['session'] ){

				//log the change
				nc__util__log("CHANGED SESSION: " . $loc . " => " . $key . " = {" . $val . "}");

			}	//end if should record change of session

		}	//end if session is set

	}	//end function 'nc__util__session'

	//check if FORM field is not set by the user
	//input(s):
	//	fieldName: (text) field name
	//output(s):
	//	(boolean) => TRUE if field is set, FALSE if empty (not set)
	function nc__util__isFieldSet($fieldName){

		//output function name
		nc__util__func('utils', 'nc__util__isFieldSet');

		//check if field exists among POST fields and it is not empty
		return array_key_exists($fieldName, $_POST) && !empty($_POST[$fieldName]);

	}	//end function 'nc__util__isFieldSet'

	//check if user name is valid
	//input(s):
	//	userName: (text) string for user name
	//	beUnique: (boolean) should user name be checked for uniqness
	//output(s):
	//	(boolean) => TRUE if user name is valid, FALSE if otherwise
	function nc__util__isUserNameValid($userName, $beUnique){

		//output function name
		nc__util__func('utils', 'nc__util__isUserNameValid');

		//explicitly state that using global var
		global $nc__util__g__username__minchars;

		//if user name is not valid
		if( 

			//check if user name is not long enough
			strlen($userName) < $nc__util__g__username__minchars ||

			//check if user name contains any character(s) other then letters and numbers
			//	see: http://www.w3schools.com/php/php_form_url_email.asp
			!preg_match("/^[a-zA-Z0-9]*$/", $userName) ||

			//check uniqness of user name is necessary
			(
				//if need to check uniqness
				$beUnique &&

				//is user name is not unique (i.e. user name is used, already)
				nc__db__isUserExist($userName) === true
			)
		){

			//failed -- user name is not valid
			return false;

		}

		//success -- user name is valid
		return true;

	}	//end function 'nc__util__isUserNameValid'

	//is root folder
	//	ES 2017-01-21 (b_file_hierarchy): COmments only: this function does not actually
	//		check if this is a root folder, instead it checks if given value, which does 
	//		not really equal to root's directory id, should actaully refere to root, i.e.
	//		0, "NULL", or NULL
	//input(s):
	//	id: (text) string to identify root folder
	//output(s):
	//	(boolean) => TRUE:root, FALSE:otherwise
	function nc__util__isRoot($id){

		//output function name
		nc__util__func('utils', 'nc__util__isRoot');

		return is_null($id) || $id == 0 || strtoupper($id) == "NULL";

	}	//end function 'nc__util__isRoot'

	//check if given io entry name is valid
	//input(s):
	//	name: (text) io entry name
	//output(s):
	//	(boolean) => (TRUE) if name is valid, (FALSE) otherwise
	function nc__util__isIOEntryNameValid($name){

		//allow usage of global veriable
		global $nc__util__g__IOEntry_maxchars;

		//output function name
		nc__util__func('utils', 'nc__util__isIOEntryNameValid');

		return  //not too long
				strlen($name) < $nc__util__g__IOEntry_maxchars &&
				//not empty
				strlen($name) > 0 &&
				//allow letters, digits, and '.'
				preg_match("/^[a-zA-Z0-9\.]*$/", $name);

	}	//end function 'nc__util__isIOEntryNameValid'

	//check if email is valid
	//input(s):
	//	email: (text) user email
	//output(s):
	//	(boolean) => TRUE: if email is valid, FALSE: otherwise
	function nc__util__isEmailValid($email){

		//output function name
		nc__util__func('utils', 'nc__util__isEmailValid');

		//if email is not valid
		//	see: http://stackoverflow.com/a/12026863
		if( !filter_var($email, FILTER_VALIDATE_EMAIL) ){

			//failed -- email is not valid
			return false;

		}

		//success -- email is formatted correctly, but it still is left to check
		//	whether it exists. This can only be accomplished by sending an email
		return true;

	}	//end function 'nc__util__isEmailValid'

	//check if password is valid
	//input(s):
	//	pass: (text) user password
	//output(s):
	//	(boolean) => TRUE: if password is valid, FALSE: otherwise
	function nc__util__isPasswordValid($pass){

		//output function name
		nc__util__func('utils', 'nc__util__isPasswordValid');

		//explicitly state that using global var
		global $nc__util__g__pass__minchars;

		//if password is not valid
		if(

			//check if password is not long enough
			strlen($pass) < $nc__util__g__pass__minchars ||

			//check if password does not contain lower case letter
			!preg_match("/[a-z]/", $pass) ||

			//check if password does not contain upper case letter
			!preg_match("/[A-Z]/", $pass) ||

			//check if password does not contain digit
			!preg_match("/[0-9]/", $pass) ||

			//check if password contains characters other then letters and digits
			!preg_match("/^[a-zA-Z0-9]*$/", $pass)

		){

			//failed -- password is not valid
			return false;

		}

		//success -- password is valid
		return true;

	}	//end function 'nc__util__isPasswordValid'

	//re-initialize session (important for POSTed files)
	//	see: http://stackoverflow.com/a/7237051
	//inpur(s): (none)
	//output(s): (none)
	function nc__util__reInitSession(){

		//output function name
		nc__util__func('utils', 'nc__util__reInitSession');

		//check if session does not exist already
		if(!isset($_SESSION)){

			//create session
			session_start();

		}	//end if session does not exist already

	}	//end function 'nc__util__reInitSession'

	//is user is not logged in
	//input(s): (none)
	//output(s):
	//	(boolean) => TRUE: if not logged in, FALSE: otherwise
	function nc__util__isNotLoggedIn(){

		//output function name
		nc__util__func('utils', 'nc__util__isNotLoggedIn');

		//check and return flag whether user id is set
		return empty($_SESSION['consts']['user']['id']);

	}	//end function 'nc__util__isNotLoggedIn'

	//allow user to perform an AJAX call to retrieve list of files/folders and reset
	//	open-fila dialog with these file/folder entities
	//input(s):
	//	url: (text) url to use for AJAX call
	//	dlgId: (text) dialog id
	//	execWhenDone: (js script) execute when AJAX request completed
	//output(s): (none)
	function nc__util__ajaxToResetOpenFileDlg($url, $dlgId, $execWhenDone){

		//output function name
		nc__util__func('utils', 'nc__util__ajaxToResetOpenFileDlg');

		echo "$.ajax({".
				"url: '".$url."', ".
				"method: 'POST', ".
				"data: {} ".
			 "}).done(function(data){ ".

				//replace dialog content with received HTML 
				'$("#'.$dlgId.'").find(".nc-dialog-outter").html(data);';

				echo $execWhenDone;

		echo "});";	//end getting dialog content HTML

	}	//end function 'nc__util__ajaxToResetOpenFileDlg'

	//make icons large in open-file dialog
	//input(s): (none)
	//output(s):
	//	(text) => js script to make icons large
	function nc__util__makeIconsLarge(){

		//output function name
		nc__util__func('utils', 'nc__util__makeIconsLarge');

		return 'if( $(".nc-dialog-outter").attr("nc-icon-size") == "1" ){'.
					'enlarge_icon_size();'.
				'}';

	}	//end function 'nc__util__makeIconsLarge'

	//get class name of icon for the specified IO entity type
	//input(s):
	//	type: (integer) type of IO entity
	//	insideRoot: (boolean) optional flag that checks if folder is inside root or not
	//			it is not used for non-folder cases!
	//output(s):
	//	(text) => class name of the icon
	function nc__util__getIconClassName($type, $insideRoot){

		//ES 2017-01-21 (b_file_hierarchy): output function name
		nc__util__func('utils', 'nc__util__getIconClassName');

		//start class name
		$res = "glyphicon-";

		//complete class name to depict proper file type icon
		switch( $type ){
			//text file
			case 1:
				$res .= "text-size";
				break;
			//image file
			case 2:
				$res .= "picture nc-img-icon-color";
				break;
			//code file
			case 3:
				$res .= "file";
				break;
			//CFG file (a.k.a. project as a whole)
			case 4:
				$res .= "random nc-cfg-icon-color";
				break;
			//folder case
			case 5:
				//ES 2017-01-21 (b_file_hierarchy): if inside root folder
				if( $insideRoot ){
					//ES 2017-01-21 (b_file_hierarchy): represent folders inside root as projects
					$res .= "expand";
				} else {	//ES 2017-01-21 (b_file_hierarchy): original case: regular folder
					//(original case): regular folder
					$res .= "book nc-folder-icon-color";
				}	//ES 2017-01-21 (b_file_hierarchy): end if inside root folder
				break;
			//unkown
			default:
				$res .= "exclamation-sign nc-unkown-file-color";
				break;
		}

		//return resulting class name
		return $res;

	}	//end function 'nc__util__getIconClassName'

	//ES 2017-01-22 (b_dbg_app): modularized code for closing dialog from 'js__codeview.php' file
	//input(s):
	//	dlgId: (text) dialog id to close
	//output(s): (none)
	function nc__util__closeDlg($dlgId){

		echo "$('#".$dlgId."').on('hidden.bs.modal', function(){".
			//if is now hidden
			//ES 2017-01-21 (b_file_hierarchy): moved global var 'vw__codeview__ofdDlgId' into session
			"if( $('#".$dlgId."').is(':visible') == false ){".
				//disable codeview input editor
				"toggleCodeViewInputEditor(true);".
			"}".
		 "});";

	}	//end function 'nc__util__closeDlg'

	//ES 2017-01-26 (b_aws_fix_01): moved code from vw__user.php. This code attaches click events for two icons
	//	that compress/expand cetain parts of the table (header, whole)
	//input(s):
	//	cls1: (text) class name for which to attach click handler # 1
	//	cls2: (text) class name for which to attach click handler # 2
	//	sel1: (text) jquery selector # 1 -- what to toggle when arrow up/down is clicked
	//	sel2: (text) jquery selector # 2 -- what to toggle when horiz bar at the right side is clicked
	//output(s): (none)
	function nc__util__handleCompressExpandIcons($cls1, $cls2, $sel1, $sel2){

		echo "$(document).on('click', '.".$cls1."', function(){".
			//find surrounding panel
			//"var tmpPanel = $(this).closest('.panel');".
			//find internal 'panel-body', which depicts type description
			//"var tmpTypeDesc = $(tmpPanel).find('".$sel1."');".
			"var tmpTypeDesc = $(this).closest('.panel-heading').next();".
			//toggle 'panel-body'
			"$(tmpTypeDesc).toggle();".
			//if this toggle button shows arrow down
			"if( $(this).hasClass('glyphicon-menu-down') ) {".
				//remove class for arrow down
				"$(this).removeClass('glyphicon-menu-down');".
				//add class for arrow upwards
				"$(this).addClass('glyphicon-menu-up');".
			"} else {".
				//remove class for arrow upwards
				"$(this).removeClass('glyphicon-menu-up');".
				//add class for arrow down
				"$(this).addClass('glyphicon-menu-down');".
			"}".	//end if this toggle button shows arrows down
		"});".
		"$(document).on('click', '.".$cls2."', function(){".
			//find surrounding panel
			"var tmpPanel = $(this).closest('.panel');".
			//find inner table
			"var tmpTbl = $(tmpPanel).find('".$sel2."');".
			//toggle table
			"$(tmpTbl).toggle();".
			//find type description
			"var tmpTypeDesc = $(tmpPanel).find('.panel-body');".
			//also make sure that type description is hidden
			"$(tmpTypeDesc).hide();".
		"});";

	}	//end function 'nc__util__handleCompressExpandIcons'

	//ES 2017-01-27 (b_aws_fix_01): create progress bar component (hidden)
	//input(s):
	//	id: (text) unique identifier for progress bar
	//output(s): (none)
	function nc__util__createProgressBar($id){

		//output progress bar (hidden initially)
		echo 	"<div class='progress nc-progress-bar' style='display: none;'>".
				"<div ".
					"class='progress-bar progress-bar-success progress-bar-striped' ".
					"id='".$id."' ".
					"role='progressbar' ".
					"aria-valuenow='0' ".
					"aria-valuemin='0' ".
					"aria-valuemax='100' ".
				//ES 2017-02-15 (soko): center percent inside progress bar and increase font size
				"><div class='nc-progress-bar-percent'>0%</div></div>".
			"</div>";

	}	//end function 'nc__util__createProgressBar'

	//2017-01-27 (b_aws_fix_01): create js script to change value of progress bar
	//input(s):
	//	id: (text) id of progress bar
	//output(s): (none)
	function nc__util__createScriptProgressBar($id){

		echo	"function nc__progress__update(val){".
				"$('#".$id."').attr('aria-valuenow', val);".
				"$('#".$id."').html(val + ' %');".
				"$('#".$id."').css('width', val+'%');".
			"};".
			"function nc__progress__show(){".
				"$('#".$id."').closest('.nc-progress-bar').show();".
			"};".
			"function nc__progress__hide(){".
				"$('#".$id."').closest('.nc-progress-bar').hide();".
			"};";

	}	//end function 'nc__util__createScriptProgressBar'

?>
