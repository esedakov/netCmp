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

		//ES 2017-01-22 (b_dbg_app): declare variables for VIEW constants
		//	since heredoc does not allow usage of static constants inside
		//	see: http://stackoverflow.com/a/6288470
		$VW_VARS = NC__ENUM__VIEW::VARS;
		$VW_FILEEXP = NC__ENUM__VIEW::FILEEXP;
		$VW_USER = NC__ENUM__VIEW::USER;
		$VW_STYLE = NC__ENUM__VIEW::STYLE;
		$VW_APP = NC__ENUM__VIEW::APP;
		$VW_DBG = NC__ENUM__VIEW::DBG;
		$VW_CODE = NC__ENUM__VIEW::CODE;
		
		//compose and output html string
		//	see: http://stackoverflow.com/a/23147015
echo <<<"__EOT_1"
<script>
	//ES 2017-01-22 (b_dbg_app): identifier for the currently opened view
	//	It is set with the use enum 'NC__ENUM__VIEW'
	var g_view_mode = {$VW_CODE};	//initially, codeview opened

	//toggle views
	//input(s):
	//	n: (text) part of class name for the corresponding section
	//output(s): (none)
	function ncToolBarShowView(n){
		
		//hide all views
		$(".nc-component-view").hide();
		
		//show specified view
		$(".nc-" + n + "-win").show();
		
		//ES 2017-01-22 (b_dbg_app): depending on view string identifier
		switch(n){
			
			//variable view
			case "vars":
				g_view_mode = {$VW_VARS};
				break;

			//file explorer view
			case "fileexp":
				g_view_mode = {$VW_FILEEXP};
				break;

			//user information view
			case "userinfo":
				g_view_mode = {$VW_USER};
				break;

			//user interface (style) view
			case "interface":
				g_view_mode = {$VW_STYLE};
				break;

			//application view
			case "app":
				g_view_mode = {$VW_APP};
				break;

			//debugging view
			case "dbg":
				g_view_mode = {$VW_DBG};
				break;

			//code view
			case "codeview":
				g_view_mode = {$VW_CODE};
				break;

		}	//end switch -- depenging on view string identifier
	
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
		<!--<div class="row vertBarIcon" style="height:5%">
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
		</div>-->
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
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Next"
			>
				<span 
					class="glyphicon glyphicon-circle-arrow-right" 
					aria-hidden="true"

					onclick="ncToolBarCommand(5);"
				></span>
			</div>
		</div>
		<div class="row vertBarIcon" style="height:5%">
			<div 
				class="col-xs-12 col-md-12"
				data-toggle="tooltip"
				data-placement="right"
				title="Step In"
			>
				<span 
					class="glyphicon glyphicon-circle-arrow-down" 
					aria-hidden="true"

					onclick="ncToolBarCommand(6);"
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