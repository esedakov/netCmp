<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-22
	Description:	debugger view
	Used by:		(vw__main)
	Dependencies:	(none)
	*/

	//load codeview JS component, for function 'toggleOpenSaveFileDlg'
	require_once './js__codeview.php';

?>

<div 
	id="dbg_viewport" 
	class="nc-dbg-win nc-component-view" 
	style="height:100%; display: none;"
>

	<div
		id="dbg_holder"
		style="width: 100%; height: 100%; overflow: scroll; position: relative;">
	</div>

</div></div>

<script type="text/javascript">
	
	<?php //store parser instance ?>
	var g_int = null;

	<?php //flag that indicates whether interpreter started ?>
	var g_started = false;

	<?php //store dimensions of the debugging viewport ?>
	var g_dbg_w = 1600;
	var g_dbg_h = 55600;

	<?php //store id of DIV where to show CFG ?>
	var g_dbg_id = 'dbg_holder';

	//invoked from the codeview 'enterkey' event handler to process
	//	'^O'  key combination to choose which project to compile
	//	Note: It will open OSFD with root level and each project
	//	folder dbclick will trigger debugging of the code
	//input(s): (none)
	//output(s): (none)
	function nc__dbg__open(){

		//open OSFD to choose project
		toggleOpenSaveFileDlg('3', true);

	};	//end function 'nc__dbg__open'


	//invoked from the codeview 'enterkey' event handler to process
	//	'S' key combination to save debugging data to the server
	//input(s): (none)
	//output(s): (none)
	function nc__dbg__save(){

		var objPull = prepParsingData();

		///send data to the server using jquery POST method
		/*$.post(
			'pr__receive.php',
			objPull,

			function(data, status, xhr){

				//if success
				if( status == "success" ){
					//TODO: do smth when transfer completed successfully
				} else {	//else, error took place
					//create error alert
					alert("error: " + xhr.status + xhr.statusText);
				}

			},

			"json"
		);*/
		$.ajax({
			url: 'pr__receive.php',
			method: 'POST',

			data: {

				<?php //project folder id ?>
				'f': id,

				<?php //set of data to save on server ?>
				'd': objPull

			}
		}).done(function(data){

			//TODO: alert user if saving has not succeed

		});	<?php //end AJAX -- done function ?>

	};	//end function 'nc__dbg__save'

	//invoked from the codeview 'enterkey' event handler to process
	//	'^X' key combination to close opened CFG view (null it out)
	//input(s): (none)
	//output(s): (none)
	function nc__dbg__close(){

		//test
		alert("not implemented");
		
		//TODO: null out all interpreter and parsing data

		//TODO: close CFG and application run result

	}	//end function 'nc__dbg__close'

	<?php

		//add hanlder for closing open-project dialog
		nc__util__closeDlg(

			//dialog id for opening a project
			$_SESSION['consts']['vw__codeview']['opdDlgId']
		
		);

	?>

</script>