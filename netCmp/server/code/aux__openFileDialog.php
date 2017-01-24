<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-24
	Description:	moved code from vw__openFileDialog.php
	Used by:		(vw__openFileDialog.php)
	Dependencies:	(needs to be used only from vw__openFileDialog.php)
	*/

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

?>