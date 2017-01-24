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

</div>