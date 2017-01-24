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
