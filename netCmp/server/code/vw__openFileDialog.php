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
	$tmpAllIOEntries = nc__io__getIOEntries("NULL");

	//create outer div
	echo '<div style="width: 100%;">';

	//create section for viewing modes
	echo '<div class="row bs-glyphicons nc-io-view-modes">';

	//show two viewing modes for large and small icons at the right side
	echo '<div class="col-xs-12 col-md-12">';

	//show mode for large icons
	echo '<div class="glyphicon glyphicon-resize-full nc-view-icons-lrg nc-io-view-icon"></div>';

	//show mode for small icons
	echo '<div class="glyphicon glyphicon-resize-small nc-view-icons-sml nc-io-view-icon"></div>';

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
				echo '" f="'.$fileAttrs->_id.'" t="'.$tmpType.'" style="padding-right: 5px;"></span>'.
				'<span class="glyphicon-class nc-io-entry-caption">'.$fileAttrs->_name.'</span>'.
			 '</div>';

	}	//end loop thru array of files

	//end list of files and outer DIV browsing view
	echo '</div></div>';

	//end outer div
	echo '</div>';

	//create JS script for enlarging and diminishing file icons and captions
	echo '<script>'.
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