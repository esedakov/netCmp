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