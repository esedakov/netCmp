<?php if(!isset($_SESSION)){session_start();}  
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-27
	Description:	show open file dialog contents
	Used by:		(vw__codeview)
	Dependencies:	(io), (security), (contextMenu)
	*/

	//include library for function 'nc__util__reInitSession'
	require_once './lib/lib__utils.php';
	//include library for function 'nc__io__getIOEntries'
	require_once './lib/lib__io.php';
	//include security library for 'nc__secur__encode' and 'nc__secur__encrypt'
	require_once './lib/lib__security.php';
	//include context menu library
	require_once './lib/lib__contextMenu.php';
	//ES 2017-01-22 (b_dbg_app): include dialog library to include moved
	//	function 'nc__openFileDialog__makeDraggable' into that file
	require_once './lib/lib__dialog.php';

	//global var from vw__codeview.php
	//ES 2017-01-21 (b_file_hierarchy): moved global var 'vw__codeview__ofdDlgId' into session
	//global $vw__codeview__ofdDlgId;

	//re-initialize session
	nc__util__reInitSession();

	//get file entries
	$tmpAllIOEntries = nc__io__getIOEntries($_SESSION["file"]["open"]);

	//ES 2017-01-24 (b_dbg_app): include only once commented code below for
	//	creating context menus to avoid collissions if this file happens to
	//	be used more then once
	require_once 'pre__openFileDialog.php';

	/* ES 2017-01-24 (b_dbg_app): move code into pre__openFileDialog.php
	//create context menu for general use (create items and get parent folder properties)
	createContextMenu(
		//array of context menu elements (id => caption)
		array(
			"1" => "create folder",
			"2" => "create text file",
			"3" => "create code file",
			"4" => "upload image from client",
			"" => "",
			"5" => "properties"
		),
		//function name to handle click on menu element
		'onIoViewModeClick',
		//container class that where right-click (event:contextmenu) takes place 
		'.nc-open-save-file-dialog',
		//unique id for the context menu
		'nc_cntx_menu_general',
		//ignore objects with this classes when handling right-click (event:contextmenu)
		'.nc-io-entry-format'
	);

	//create context menu for specific itme
	createContextMenu(
		//array of context menu elements (id => caption)
		array(
			"6" => "create copy here",
			"7" => "delete",
			"8" => "rename",
			"9" => "",
			"10" => "properties"
		),
		//function name to handle click on menu element
		'onIoViewModeClick',
		//container class that where right-click (event:contextmenu) takes place 
		'.nc-io-entry-format',
		//unique id for the context menu
		'nc_cntx_menu_entry_specific',
		//no ignored class
		''
	);
	ES 2017-01-24 (b_dbg_app): end move code into pre__openFileDialog.php */

	//create outer div
	echo '<div class="nc-open-save-file-dialog" style="width: 100%;">';

	//create file browsing resource
	echo "<input type='file' id='nc_upload_file_from_client' style='display:none;'>";

	//create section for viewing modes
	echo '<div class="row bs-glyphicons nc-io-view-modes">';

	//show two viewing modes for large and small icons at the right side
	echo '<div class="col-xs-12 col-md-12">';

	//start DIV for showing parent folder name
	echo '<div ';

	nc__util__log("about to call nc__db__getIOEntryAttrs;");

	//get name of the directory for which retrieving files/folders
	$tmpOwnerDirInfo = nc__db__getIOEntryAttrs($_SESSION["file"]["open"], false);

	//flag: is not a root folder
	$tmpIsNotRootFolder =	is_null($tmpOwnerDirInfo->_dirId) == false &&
							$tmpOwnerDirInfo->_dirId != 0;

	//if not root folder
	if( $tmpIsNotRootFolder ){

		//show left arrow to indicate that we can navigate outside
		echo 'class="glyphicon glyphicon-arrow-left" id="nc_to_dir_up"';
	
	}	//end if root folder

	//output parent folder name
	echo '><b style="padding-left: 5px;">'.$tmpOwnerDirInfo->_name.'</b></div>';

	//show mode for large icons
	echo '<div class="glyphicon glyphicon-resize-full nc-view-icons-lrg nc-fileopen-icon"></div>';

	//show mode for small icons
	echo '<div class="glyphicon glyphicon-resize-small nc-view-icons-sml nc-fileopen-icon"></div>';

	//show refresh browsing view icon
	echo '<div class="glyphicon glyphicon-refresh nc-view-refresh nc-fileopen-icon"></div>';

	//end section for viewing modes
	echo '</div></div>';

	//create outer DIV section for showing file browsing view
	echo '<div class="row bs-glyphicons nc-io-entry-view">';

	//create list of file icons (i.e. glyphicons)
	echo '<div class="col-xs-12 col-md-12">';

	//loop thru array of files
	foreach( $tmpAllIOEntries as $fileId => $fileAttrs ){

		//store file type
		$tmpType = $fileAttrs->_type;

		//create file icon
		echo '<div class="nc-io-entry-format">'.
				//ES 2017-01-18 (b_file_hierarchy): remove 'glyphicon-' since it is part of class
				//	name, and thus more logical to move it in 'nc__util__getIconClassName' as well
				'<span class="glyphicon nc-io-entry-icon ';

					/* ES 2017-01-18 (b_file_hierarchy): moved into function 'nc__util__getIconClassName'
						to remove possible code duplication with pr__getFileHierarchyData.php
					//complete class name to depict proper file type icon
					switch( $tmpType ){
						//text file
						case 1:
							echo "text-size";
							break;
						//image file
						case 2:
							echo "picture nc-img-icon-color";
							break;
						//code file
						case 3:
							echo "file";
							break;
						//CFG file (a.k.a. project as a whole)
						case 4:
							echo "random nc-cfg-icon-color";
							break;
						//folder case
						case 5:
							echo "book nc-folder-icon-color";
							break;
						//unkown
						default:
							echo "exclamation-sign nc-unkown-file-color";
							break;
					}
					*/

					//ES 2017-01-18 (b_file_hierarchy): output icon class name
					//ES 2017-01-21 (b_file_hierarchy):  add second argument to determine whether parent
					//	folder is a root folder
					echo nc__util__getIconClassName($tmpType, $fileAttrs->_dirId == $_SESSION['consts']['root_id']);

				//write file name
				echo '" f="'.$fileAttrs->_id.'" t="'.$tmpType.'" n="'.$fileAttrs->_name.
					'" style="padding-right: 5px;"></span>'.
				'<span class="glyphicon-class nc-io-entry-caption">'.$fileAttrs->_name.'</span>'.
			 '</div>';

	}	//end loop thru array of files

	//end list of files and outer DIV browsing view
	echo '</div></div>';

	//create a separator from file viewing section
	echo '<hr class="page-header-divider featurette-divider">';

	//create an empty section for displaying file/folder properties
	echo '<div class="nc-view-fproperties-section"></div>';

	//create section for file name textbox and submit button
	echo '<div class="row bs-glyphicons">';

	//create file name textbox
	echo '<input class="col-xs-11 col-md-11 nc-io-file-name-box" type="text" />';

	//end section for textbox and submit button
	echo '</div>';

	//end outer div
	echo '</div>';

	//ES 2017-01-24 (b_dbg_app): make sure that commented out code below
	//	gets included only once
	require_once 'aux__openFileDialog.php';

	/* ES 2017-01-24 (b_dbg_app): moved to a aux__openFileDialog.php, since this
		file can be included more then once, and that will cause collission
		between functions with the same name. In result, each such function may
		be triggered more then once (i.e. number of collissions).
	//create JS script for enlarging and diminishing file icons and captions
	echo '<script>'.
			//add handler for file uploading from client
			//	see: http://stackoverflow.com/a/36198572
			'$("#nc_upload_file_from_client").on("change", function(){'.
				//check if there is a file
				'if( typeof this.files == "undefined" || this.files.length == 0 ){'.
					//error
					'alert("No image file was selected! Aborting.");'.
					//quit now
					'return;'.
				'}'.
				//make sure that uploaded file is an image
				'if( this.files[0].type.match("image.*") == false ){'.
					//error
					'alert("Please, upload an image file only!");'.
					//quit now
					'return;'.
				'}'.
				//create file reader
				'var tmpFR = new FileReader();'.
				//async onCapture file information
				'tmpFR.onload = function(e){'.
					//invoke AJAX call to move IO entity into folder
					'$.ajax({'.
						'url: "pr__processIORequest.php",'.
						'method: "POST", '.
						'data: {'.
							'"method":"4", '.				//4 - upload an image file
							'"extra": e.target.result'.		//base64 image file data
						"}".
					'}).done(function(data){'.
						//replace dialog content with received HTML 
						//ES 2017-01-21 (b_file_hierarchy): move global var 'vw__codeview__ofdDlgId' into session
						'$("#'.$_SESSION['consts']['vw__codeview']['ofdDlgId'].'").find(".nc-dialog-outter").html(data);'.
					'});'.
				'};'.	//end async onCapture file information
				//read file from client machine
				'tmpFR.readAsDataURL(this.files[0]);'.
			'});'.
			//store id of the last dragged file/folder
			'var tmpLastDraggedIOEnt = "";'.
			//make all file items draggable
			nc__openFileDialog__makeDraggable(
				//selector for element to be draggable
				'.nc-io-entry-format',
				//selector for parent element to be containment boundary for draggable item
				'.nc-open-save-file-dialog'
			).
			//make all folders with DROP event to catch any file that is moved inside them
			'$(".nc-folder-icon-color").closest(".nc-io-entry-format").on({'.
				'drop: function(){'.
					//get id of the target (trg) folder on which we dropped an item
					'var trg = $(this).find(".glyphicon").attr("f");'.
					//get type of the dragged item
					'var tdr = $(".nc-io-entry-icon[f="+tmpLastDraggedIOEnt+"]")'.
						'.attr("t");'.
					'alert(tdr);'.
					//invoke AJAX call to move IO entity into folder
					'$.ajax({'.
						'url: "pr__processIORequest.php",'.
						'method: "POST", '.
						"data: {".
							"'method':'12', ".				//11 - move file or a folder
							"'id': tmpLastDraggedIOEnt, ".	//moved file/folder id
							"'type': tdr, ".					//ignore file type (use '0')
							"'extra': trg".					//target folder
						"}".
					'}).done(function(data){'.
						//remove this moved item
						'$('.
							//get file/folder items
							'".nc-io-entry-format > '.
							//narrow down by dragged file/folder item id
							'.nc-io-entry-icon[f=\'"+tmpLastDraggedIOEnt+"\']"'.
						')'.
						'.closest(".nc-io-entry-format").remove();'.
					'});'.
				'}'.
			'});'.
			//handle filtering of files displayed, based on the typed name in the textbox
			'$(".nc-io-file-name-box").on("keyup", function(e){'.
				//show all file/foldes
				'$(".nc-io-entry-format").show();'.
				//get text from file name textbox
				'var tmpSelTxt = $(".nc-io-file-name-box").val();'.
				//hide those file/folder icons that do not contain text in textbox
				'$(".nc-io-entry-format:not(:contains("+tmpSelTxt+"))").hide();'.
			'});'.
			//handler for clicked context menu elements
			'function onIoViewModeClick (e, t){'.
				//initialize set to be send to server
				'var tmpIOData = {};'.
				//set method code
				'tmpIOData.method = e;'.
				//try get SPAN '.nc-io-entry-icon'
				'var tmpSpanIOEntry = $(t).find(".nc-io-entry-icon");'.
				//if SPAN '.nc-io-entry-icon' was found
				'if( tmpSpanIOEntry.length > 0 ){'.
					//get IO entity (file/folder) id
					'tmpIOData.id = $(tmpSpanIOEntry).attr("f");'.
					//get IO entity type
					'tmpIOData.type = $(tmpSpanIOEntry).attr("t");'.
				'}'.
				//if upload a file from local PC
				'if( e == 4 ){'.
					//open file browsing dialog
					'$("#nc_upload_file_from_client").click();'.
					//quit now
					'return;'.
				'}'.
				//if renaming a file/folder
				'if( e == 8 ){'.
					//get caption SPAN
					'var tmpCapSp = $(tmpSpanIOEntry).parent().find(".nc-io-entry-caption");'.
					//get text caption
					'var tmpCapTxt = $(tmpCapSp).html();'.
					//create a textbox inside caption span and set its value to text caption
					'$(tmpCapSp).html('.
						'"<input '.
							'type=\'text\' '.
							'class=\'nc-io-rename-textbox\''.
							'value=\'"+tmpCapTxt+"\' '.
						'/>"'.
					');'.
					//set focus on added textbox
					'$(tmpCapSp).find(".nc-io-rename-textbox").focus();'.
					//add onChange event for rename textbox
					'$(".nc-io-rename-textbox").change(function(){'.
						//set new name as an 'extra' parameter
						'tmpIOData.extra = $(this).val();'.
						//perform AJAX call to rename file/folder
						'$.ajax({'.
							'url: "pr__processIORequest.php",'.
							'method: "POST", '.
							'data: tmpIOData'.
						'}).done(function(data){'.
							//change name
							'$(tmpCapSp).html(tmpIOData.extra);'.
						'})'.
					'});'.
					//quit now
					'return;'.
				'}'.	//end if renaming a file/folder
				//get dialog DIV that surrounds dialog content
				'var tmpDlgOutterDiv = $(t).closest(".nc-dialog-outter");'.
				//perform AJAX call
				'$.ajax({'.
					'url: "pr__processIORequest.php",'.
					'method: "POST", '.
					'data: tmpIOData'.
				'}).done(function(data){'.
					//if outputing file/folder properties
					'if( tmpIOData.method == 5 || tmpIOData.method == 10 ){'.
						//replace contents of property dialog
						'$(".nc-view-fproperties-section").html(data);'.
					'} else {'.	//else, any other request
						//replace dialog content with received HTML 
						'$(tmpDlgOutterDiv).html(data);'.
					'}'.	//end if outputing file/folder properties
				'})'.
				//update content of dialog
			'};'.
			//enlarge file icons
			'function enlarge_icon_size(){'.
				//enlarge icon and place caption under the icon
				'$(".nc-io-entry-icon").css({'.
					'"font-size":"50px", '.
					'"float":"right"'.
				'});'.
				'$(".nc-io-entry-caption").css({'.
					'"float":"right", '.
					'"clear":"both"'.
				'});'.
				//save information about size of icons
				'$(".nc-dialog-outter").attr("nc-icon-size", "1");'.
			'};'.
			//refresh view
			'function refresh_browsing_view(){'.
				'$(".nc-io-entry-format").css({'.
					'top: "", '.
					'left: "" '.
				'});'.
			'};'.
			//when icon for refreshing is clicked
			'$(".nc-view-refresh").click('.
				'function(){'.
					//refresh browsing view
					'refresh_browsing_view();'.
				'}'.
			');'.
			//when icon for enlarging is clicked
			'$(".nc-view-icons-lrg").click('.
				'function(){'.
					//enlarge icon and place caption under the icon
					'enlarge_icon_size();'.
				'}'.
			');'.
			//when icon for diminishing is clicked
			'$(".nc-view-icons-sml").click('.
				'function(){'.
					//diminish icon and place caption back to original (to the right of icon)
					'$(".nc-io-entry-icon").css({'.
						'"font-size":"", '.
						'"float":"none"'.
					'});'.
					'$(".nc-io-entry-caption").css({'.
						'"float":"none", '.
						'"clear":"none"'.
					'});'.
					//save information about size of icons
					'$(".nc-dialog-outter").attr("nc-icon-size", "0");'.
				'}'.
			');';
	
		//if not a root folder
		if( $tmpIsNotRootFolder ){

			//set up click event for navigating one folder up
			echo '$(document).on("click", "#nc_to_dir_up",'.
					'function(){';
			
			//output AJAX call to retrieve files/folders for the specified directory
			//	and replace current dialog content with this new navigation view
			nc__util__ajaxToResetOpenFileDlg(

				//url to invoke for AJAX call
				"pr__levelup.php", 
				
				//dialog id
				//ES 2017-01-21 (b_file_hierarchy): moved global var 'vw__codeview__ofdDlgId' into session
				$_SESSION['consts']['vw__codeview']['ofdDlgId'],

				//code to be executed upon completion of AJAX call
				nc__util__makeIconsLarge()
			);

			//if need to enlarge icon size
			
			//finish up click event and associated triggering function
			echo 	'}'.
				 ');';

		}	//end if not root folder

	echo '</script>';
	ES 2017-01-24 (b_dbg_app): end moved to a aux__openFileDialog.php */

	/* ES 2017-01-22 (b_dbg_app): move function into ./lib/lib__dialog.php
	//make given element(s) draggable
	//input(s):
	//	drg: (text) => jquery selector for element to be draggable
	//	par: (text) => jquery selector for element to be contained inside
	//output(s):
	//	(text) => js code
	function nc__openFileDialog__makeDraggable($drg, $par){

		//make all file items draggable
		return '$("'.$drg.'").draggable({ '.
			//not outside of dialog
			//	see: http://stackoverflow.com/a/13232920
			//	see: http://stackoverflow.com/a/8084833
			'containment: $("'.$par.'"), '.
			//handle event when dragging stops
			//	see: http://api.jqueryui.com/draggable/
			'start: function(event,ui){'.
				//save id of the last dragged file element
				'tmpLastDraggedIOEnt = $(this).find(".glyphicon").attr("f");'.
			'}'.
		'});';

	}	//end function  'nc__openFileDialog__makeDraggable'
	ES 2017-01-22 (b_dbg_app): end move function */

?>
