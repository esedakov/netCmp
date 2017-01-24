<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-09
	Description:	show toolbar page to navigate thru website features
	Used by:		(vw__page)
	Dependencies:	(none)
	*/

	//ES 2017-01-22 (b_dbg_app): load enum for views
	require_once './lib/lib__view.php';

	//start toolbar
	//input(s): (none)
	//output(s): (none)
	function nc__toolbar__start() {
		
		//compose and output html string
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOT_1"
<script>
	//toggle views
	//input(s):
	//	n: (text) part of class name for the corresponding section
	//output(s): (none)
	function ncToolBarShowView(n){
		//hide all views
		$(".nc-component-view").hide();
		//show specified view
		$(".nc-" + n + "-win").show();
	};	//end function 'ncToolBarShowView'
</script>
<div class="nc-toolbar-column row bs-glyphicons" style="height:85%; width:100%;">
	<div class="col-xs-1 col-md-1" style="height:100%;">
		<!-- see: http://stackoverflow.com/questions/18192114/how-to-use-vertical-align-in-bootstrap -->
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Variables"
			>
				<span 
					class="glyphicon glyphicon-tower" 
					aria-hidden="true"

					onclick="ncToolBarShowView('vars');"
				
				></span>
			</div>
		</div>
		<!--<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Project"
			>
				<span 
					class="glyphicon glyphicon-tasks" 
					aria-hidden="true"
				></span>
			</div>
		</div>-->
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Files & Folders"
			>
				<span 
					class="glyphicon glyphicon-folder-open" 
					aria-hidden="true"

					onclick="ncToolBarShowView('fileexp');"

				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Users"
			>
				<span 
					class="glyphicon glyphicon-user" 
					aria-hidden="true"

					onclick="ncToolBarShowView('userinfo');"

				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="User Interface"
			>
				<span 
					class="glyphicon glyphicon-compressed" 
					aria-hidden="true"

					onclick="ncToolBarShowView('interface');"

				></span>
			</div>
		</div>
		<!--<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Messages"
			>
				<span 
					class="glyphicon glyphicon-comment" 
					aria-hidden="true"
				></span>
			</div>
		</div>-->
		<hr class="featurette-divider">
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Application"
			>
				<span 
					class="glyphicon glyphicon-font" 
					aria-hidden="true"

					onclick="ncToolBarShowView('app');"

				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Debugger"
			>
				<span 
					class="glyphicon glyphicon-record" 
					aria-hidden="true"

					onclick="ncToolBarShowView('dbg');"

				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Code"
			>
				<span 
					class="glyphicon glyphicon-pencil" 
					aria-hidden="true"

					onclick="ncToolBarShowView('codeview');"

				></span>
			</div>
		</div>
		<hr class="featurette-divider">
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Run"
			>
				<span 
					class="glyphicon glyphicon-play" 
					aria-hidden="true"
				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Stop"
			>
				<span 
					class="glyphicon glyphicon-stop" 
					aria-hidden="true"
				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Restart"
			>
				<span 
					class="glyphicon glyphicon-repeat" 
					aria-hidden="true"
				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Pause"
			>
				<span 
					class="glyphicon glyphicon-pause" 
					aria-hidden="true"
				></span>
			</div>
		</div>
	</div>
	<div class="col-xs-11 col-md-11" style="height:100%">
		<div class="row" style="height:100%;">
			<div class="col-xs-10 col-md-10" style="height:100%; width:100%;">
				<div style="height: 100%;">
__EOT_1;

	}	//end function 'nc__toolbar__start'

	//end toolbar
	//input(s): (none)
	//output(s): (none)
	function nc__toolbar__end() {
		
		//compose and output html string
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOT_2"
				</div>
			</div>
		</div>
	</div>
</div>
__EOT_2;

	}	//end function 'nc__toolbar__end'

?>