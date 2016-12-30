<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	show login page
	Used by:		(vw__page)
	Dependencies:	(js__codeview)
	*/

	//include page view
	require_once 'vw__page.php';


	//create page header
	vw__page__createHeader();

?>
<div class="row">
	<div class="col-xs-12 col-md-12">
		<ul class="nav nav-tabs">
			<!-- TODO: for now it is hardcoded file tabs, later will need to actually create
					mechanism for creating new files, closing existing, and opening files -->
			<li role="presentation" class="active"><a href="#">myFile_4.nc</a></li>
		</ul>
	</div>
</div>
<div class="row">
	<div class="col-xs-12 col-md-12">
		<!--<textarea class="jumbotron" style="height:65vh;">-->
		<!--<code contenteditable="true" style="height:65vh;">
		</code>-->
		<div class="nc-input-editor">
			<span class="nc-line nc-editor-current-line">
				<span class="nc-current-word">
					<span class="nc-current-letter"></span>
				</span>
			</span>
		</div>
	</div>
</div>

<?php

	//include JS script intended to format typed user code
	require 'js__codeview.php';

	//create page footer
	vw__page__createFooter();

?>