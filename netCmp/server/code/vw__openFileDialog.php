<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-27
	Description:	show open file dialog contents
	Used by:		(vw__codeview)
	Dependencies:	(io)
	*/

	//include library for function 'nc__util__reInitSession'
	require_once './lib/lib__utils.php';
	//include library for function 'nc__io__getIOEntries'
	require_once './lib/lib__io.php';
	//include security library for 'nc__secur__encode' and 'nc__secur__encrypt'
	require_once './lib/lib__security.php';
	//include context menu library
	require_once './lib/lib__contextMenu.php';

	//re-initialize session
	nc__util__reInitSession();

	//get file entries
	//	TODO: for now always getting entries from the ROOT
	$tmpAllIOEntries = nc__io__getIOEntries($_SESSION["file"]["open"]);

	//create context menu for general use (create items and get parent folder properties)
	createContextMenu(
		//array of context menu elements (id => caption)
		array(
			"1" => "create folder",
			"2" => "create text file",
			"3" => "create code file",
			"4" => "",
			"5" => "properties"
		),
		//function name to handle click on menu element
		'onIoViewModeClick',
		//container class that where right-click (event:contextmenu) takes place 
		'.nc-open-file-dialog',
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

	//create outer div
	echo '<div class="nc-open-file-dialog" style="width: 100%;">';

	//create section for viewing modes
	echo '<div class="row bs-glyphicons nc-io-view-modes">';

	//show two viewing modes for large and small icons at the right side
	echo '<div class="col-xs-12 col-md-12">';

	//start DIV for showing parent folder name
	echo '<div ';

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
				'<span class="glyphicon nc-io-entry-icon glyphicon-';

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

				//write file name
				echo '" f="'.$fileAttrs->_id.'" t="'.$tmpType.'" n="'.$fileAttrs->_name.
					'" style="padding-right: 5px;"></span>'.
				'<span class="glyphicon-class nc-io-entry-caption">'.$fileAttrs->_name.'</span>'.
			 '</div>';

	}	//end loop thru array of files

	//end list of files and outer DIV browsing view
	echo '</div></div>';

	//end outer div
	echo '</div>';

	//create JS script for enlarging and diminishing file icons and captions
	echo '<script>'.
			//store id of the last dragged file/folder
			'var tmpLastDraggedIOEnt = "";'.
			//make all file items draggable
			'$(".nc-io-entry-format").draggable({ '.
				//not outside of dialog
				//	see: http://stackoverflow.com/a/13232920
				//	see: http://stackoverflow.com/a/8084833
				'containment: $(".nc-open-file-dialog"), '.
				//handle event when dragging stops
				//	see: http://api.jqueryui.com/draggable/
				'start: function(event,ui){'.
					//save id of the last dragged file element
					'tmpLastDraggedIOEnt = $(this).find(".glyphicon").attr("f");'.
				'}'.
			'});'.
			//when icon for enlarging is clicked
			'$(".nc-view-icons-lrg").click('.
				'function(){'.
					//enlarge icon and place caption under the icon
					'$(".nc-io-entry-icon").css({'.
						'"font-size":"50px", '.
						'"float":"right"'.
					'});'.
					'$(".nc-io-entry-caption").css({'.
						'"float":"right", '.
						'"clear":"both"'.
					'});'.
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
				'}'.
			');'.
		'</script>';

?>