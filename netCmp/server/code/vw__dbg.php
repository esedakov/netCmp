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

	//ES 2017-01-27 (b_aws_fix_01): include utils for creating progress bar
	require_once './lib/lib__utils.php';

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

</div>

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

	<?php
		//compile project
		//input(s):
		//	id: (integer) project folder id
		//output(s): (none)
	?>
	function nc__dbg__cmp(id){

		<?php //get name of the file that is currently opened ?>
		var tmpCurFileName = 
			$(".nav-tabs > li[role='presentation'][class='active']")
			.find("a")
			.text();

		<?php //if file is inside g_files ?>
		if( tmpCurFileName in g_files ){

			<?php //save file inside g_file ?>
			g_files[tmpCurFileName] = {
				code: g_code,
				line: g_curLineNum,
				letter: g_curLetterNum,
				tabs: g_tabs
			};

		}	<?php //end if file is inside g_file ?>

		<?php //get ids of files that are opened in code view ?>
		var tmpFileInfo = $(".nc-codeview-win")
			
			<?php //get all code view tabs ?>
			.find("li[role='presentation'] > a")

			<?php //get file ids 
				//see: http://stackoverflow.com/a/2754033
			?>
			.map(function(){

				<?php //get file id ?>
				var t = $(this).attr("f");

				<?php //ignore tabs where no file associated ?>
				if(typeof t == "undefined"){

					<?php //return empty ?>
					return [];

				}

				<?php //return combination of id and caption ?>
				return t+"/"+$(this).html();

			})
			.get();

		<?php //init associate array for id => caption ?>
		var tmpIdToCapArr = [];

		<?php //loop thru received combinations ?>
		for(var tmpComb in tmpFileInfo){

			<?php //split by delimeter '/', i.e. ID/CAP ?>
			var tmpArr = tmpComb.split('/');

			<?php //add new entry in associative array ?>
			tmpIdToCapArr[tmpArr[0]] = tmpArr[1];

		}	<?php //end loop thru received combinations ?>

		<?php //get all file ids for the project via ajax call ?>
		$.ajax({
			url: 'pr__getprojectfiles.php',
			method: 'POST',

			data: {

				<?php //only id for the selected project folder ?>
				'f':id,

				<?php //get only ids of files that belong to project ?>
				'i': true
			
			}

		}).done(function(data){

			<?php //split received data into array of file ids ?>
			var tmpNeedToLoadFileIds = data.split(",");

			<?php //associative array of file ids => file name that
					//are in this project and loaded in code view ?>
			var tmpCodeViewFileIdToCapArr = [];

			<?php //identify those files that are not opened in the
				//codeview, and load them from the server ?>
			for( var tmpFileId in Object.keys(tmpIdToCapArr) ){

				<?php //determine index of file id inside array
						//of files that need to be loaded ?>
				var tmpIdx = tmpNeedToLoadFileIds.indexOf(tmpFileId);

				<?php //if file is already in code view ?>
				if( tmpIdx != -1 ){

					<?php //do not load this file, del it from array ?>
					tmpNeedToLoadFileIds.splice(tmpIdx, 1);

					<?php //add this file to array ?>
					tmpCodeViewFileIdToCapArr[tmpIdx] = tmpIdToCapArr[tmpIdx];

				}	<?php //end if file is already in code view ?>

			}	<?php //end loop thru array of file ids ?>

			<?php //load files that are not in codeview ?>
			$.ajax({
				url: 'pr__getprojectfiles.php',
				method: 'POST',

				data: {

					<?php //project folder id ?>
					'f': id,

					<?php //specify list of requested file ids ?>
					'l': tmpNeedToLoadFileIds.join(","),

					<?php //get file contents not ids ?>
					'i': false
				}
			}).done(function(data){

				<?php //loop thru project files that in code view ?>
				for( var tmpFileId in Object.keys(tmpCodeViewFileIdToCapArr) ){

					<?php //get file name ?>
					var tmpFileName = tmpCodeViewFileIdToCapArr[tmpFileId];

					<?php //if file is in g_files ?>
					if( tmpName in g_files ){

						<?php //if file is empty or is image ?>
						if( g_files[tmpName].code.length == 0 ){

							<?php //skip this file ?>
							continue;

						}	<?php //end if file is empty or image ?>

						<?php //add file content ?>
						data += "\r\n" + g_files[tmpName].code;

					}	<?php //end if file is in g_files ?>

				}	<?php //end loop thru codevirew project files ?>

				<?php //init var for code string free from comments ?>
				var tmpData = "";

				<?php //flag: has multiline comment began ?>
				var tmpIsMLineCom = false;

				<?php //remove all comments ?>
				$.each(

					<?php //split code by newline characters ?>
					data.split('\n'), 
					
					<?php //iterate thru each line ?>
					function(key,val){

						<?php //add EOF ?>
						val += "\n";

						<?php //find index of single line comment start(if any) ?>
						var m = val.indexOf("//");

						<?php //remove single line comments ?>
						var t = val.substring(

							<?php //substring starting from beginning ?>
							0,

							<?php //till the start of comment '//'
									//or till the end of line ?>
							( m < 0 ? val.length : m )

						);

						<?php //if ending of multiline comment ?>
						if( t.indexOf('*/') != -1 ){

							<?php //de-assert flag for m-comment ?>
							tmpIsMLineCom = false;

							<?php //if line has '/*' ?>
							if( t.indexOf('/*') != -1 ){

								<?php //try to remove /*...*/ comments ?>
								t = t.replace(/\/\*.*\*\//,"");

							} else {	<?php //else, line has no '/*' ?>

								<?php //remove first half till '*/' ?>
								t = t.substring(

									<?php //after '*/' till end ?>
									t.indexOf("*/") + 2

								);

							}	<?php //end if line has '/*' ?>

						}	<?php //end if ending multiline comment ?>

						<?php //if line is inside multiline comment ?>
						if( tmpIsMLineCom ){

							<?php //skip line ?>
							tmpData += "";

							<?php //quit this iteration ?>
							return;

						}	<?php //end if line is inside m-comment ?>

						<?php //if starting of multiline comment ?>
						if( t.indexOf('/*') != -1 ){

							//assert flag for multiline comment
							tmpIsMLineCom = true;

							<?php //try to remove /*...*/ comments ?>
							t = t.replace(/\/\*.*[\*\/|\n]/,"");

						}	<?php //end if starting multiline comment ?>

						<?php //if string does not contain new line AND
								//it is not empty ?>
						if( t.indexOf('\n') == -1 && 
							$.trim(t).length > 0 
						){

							<?php //append at the end of line ?>
							t += "\n";

						}	<?php //end if string has no new line ?>

						<?php //store resulting line ?>
						tmpData += t;
					}
				);

				<?php //create new instance of parser and feed
						//with the code string ?>
				g_int = new interpreter(
					tmpData, 
					g_dbg_w, 
					g_dbg_h, 
					g_dbg_id
				);

			});	<?php //end AJAX -- done function ?>

		});	<?php //end AJAX -- done function ?>

	};	<?php //end function 'nc__dbg__cmp' ?>

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

	//ES 2016-10-08 (b_db_init): communicate parser data to server
	//input(s): (none)
	//output(s):
	//	objPull: (JSON) data to transfer
	function comToServ(){
		//create pull of objects to send to the server
		var objPull = [];
		//add scopes to the object pull
		objPull = objPull.concat(
			$.map(
				getValues(scope.__library),
				function( elem, idx ){
					//init object defintition for this scope
					var objId = null;
					//if this scope represents function
					if( elem._funcDecl != null ){
						objId = elem._funcDecl._id;
					}
					//if this scope represents type
					if( elem._typeDecl != null ){
						objId = elem._typeDecl._id;
					}
					return {
						'id': elem._id,
						'kind': RES_ENT_TYPE.SCOPE.value,
						'prn_id': (elem._owner != null ? elem._owner._id : null),
						'type': elem._type.value,
						'name': null,
						'obj_id': objId,
						'start': elem._start._id,
						'end': elem._end != null ? elem._end._id : null
					}
				}
			)
		);
		//add blocks and commands to the object pull
		$.map(
			getValues(block.__library),
			function( elem, idx ){
				objPull.push({
					'id': elem._id,
					'kind': RES_ENT_TYPE.BLOCK.value,
					'prn_id': (elem._owner != null ? elem._owner._id : null),
					'type': null,
					'name': null,
					'related_scp_id': elem._relatedScope != null ? elem._relatedScope._id : null

				});
				//loop thru commands of this block and them to object pull
				objPull = objPull.concat($.map(
					elem._cmds,
					function( elem2, idx2 ){
						return {
							'id': elem2._id,
							'kind': RES_ENT_TYPE.COMMAND.value,
							'prn_id': elem2._blk._id,
							'type': elem2._type,
							'name': null
						}
					})
				);
			}
		);
		//add types, and values to the object pull
		objPull = objPull.concat(
			$.map(
				[].concat(
					getValues(type.__library)
				).concat(
					getValues(value.__library)
				),
				function( elem, idx ){
					//init name value
					var tmpName = null;
					var tmpOwnerId = null;
					//if this element is a function
					if( elem.getTypeName() == RES_ENT_TYPE.TYPE ){
						tmpName = elem._name;
						tmpOwnerId = elem._scope._id;
					//if this element is a value
					} else if( elem.getTypeName() == RES_ENT_TYPE.VALUE ){
						tmpName = JSON.stringify(elem._value);
					}
					//init owner
					return {
						'id': elem._id,
						'kind': elem.getTypeName().value,
						'prn_id': tmpOwnerId,
						'type': ('_type' in elem ? elem._type : null),
						'name': tmpName
					};
				}
			)
		);
		//initialize associative array of symbols
		var tmpSymbMap = {};
		//loop thru scopes to add functions and symbols to object pull
		for( var tmpCurScpId in scope.__library ){
			//get scope object
			var tmpCurScp = scope.__library[tmpCurScpId];
			//if this scope is a function
			if( tmpCurScp._funcDecl != null ){
				//add this function to the object pull
				objPull = objPull.concat(
					{
						'id': tmpCurScp._funcDecl._id,
						'kind': RES_ENT_TYPE.FUNCTION.value,
						'prn_id': tmpCurScp._funcDecl._scope != null ? tmpCurScp._funcDecl._scope._id : null,
						'type': tmpCurScp._funcDecl._func_type.value,
						'name': tmpCurScp._funcDecl._name,
						'ret_type_id': tmpCurScp._funcDecl._return_type._id
					}
				);
			}	//end if this scope is a stand alone function
			//loop thru symbols of this scope
			for( var tmpCurSymbName in tmpCurScp._symbols ){
				//get symbol object
				var tmpSymb = tmpCurScp._symbols[tmpCurSymbName];
				//check if this symbol is not yet inside associative array of symbols
				if( !(tmpSymb._id in tmpSymbMap) ){
					//add symbol id to the symbol associative array
					tmpSymbMap[tmpSymb._id] = null;
					//add symbol to the object pull
					objPull.push({
						'id': tmpSymb._id,
						'kind': RES_ENT_TYPE.SYMBOL.value,
						'prn_id': null,
						'type': tmpSymb._type,
						'name': tmpSymb._name
					});
				}	//end if this symbol is not yet inside associative array of symbols
			}	//end loop thru symbols
		}	//end loop thru scopes

		//return parsing data
		return objPull;

	};	//end function 'comToServ'

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
