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

	//include utils
	require_once './lib/lib__utils.php';

	//start toolbar
	//input(s): (none)
	//output(s): (none)
	function nc__toolbar__start() {

		//determine if user is not logged in
		$lv__isLoggedIn = nc__util__isNotLoggedIn() == false;

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

				//ES 2017-01-26 (b_aws_fix_01): invoke function to update variables (vw__vars.php)
				nc__vars__update_table();

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

	//derived from keypress-handler in dbg.js
	//exec command: start(1), stop(2), restart(3), pause(4), next(5), step in(6)
	//input(s):
	//	val: (integer) type of invoked command
	//output(s): (none)
	function ncToolBarCommand(val){

		//get debugger (do not need to pass any values)
		var tmpDbg = dbg.getDebugger();

		//depending on the type of command
		switch(val){

			//start
			case 1:

				//if started
				if( g_started ){

					//set debugger mode to be run non-stop
					tmpDbg.getDFS()._mode = DBG_MODE.NON_STOP;

				} else {	//else, has not started yet

					//start debugger
					//do not RUN, it will be done after this switch
					//g_int.run(g_int._curFrame);

					//confirm that debugger started
					g_started = true;

				}	//end if started

				break;

			//stop
			case 2:
			
				//stop debugger
				tmpDbg.quitDebugger();

				//ES 2017-01-26 (b_aws_fix_01): delete interpreter instance
				g_int = null;

				break;

			//restart
			case 3:

				//reset static and non-static fields, the current frame,
				//	and load variables
				entity.__interp.restart();

				break;

			//pause
			case 4:

				//try to pause by setting debugging mode to step in
				tmpDbg.getDFS()._mode = DBG_MODE.STEP_IN;

				break;

			//next
			case 5:

				//set debugger to be in STEP_OVER mode
				tmpDbg.getDFS()._mode = DBG_MODE.STEP_OVER;

				break;

			//step in
			case 6:

				//set debugger to be in STEP_IN mode
				tmpDbg.getDFS()._mode = DBG_MODE.STEP_IN;

				break;

		}	//end switch -- depending on the type of command

		//declare var for returned value from RUN function
		var tmpRunVal;

		//if returning function value from stepped in function
		if( tmpDbg.getDFS()._val != 0 ){
		
			//invoke run and pass in return value
			entity.__interp.run(tmpDbg.getDFS()._frame, tmpDbg.getDFS()._val);
		
			//reset return value to 0
			tmpDbg.getDFS()._val = 0;
		
		} else {	//regular execution
		
			//invoke interpreter's run function
			tmpRunVal = entity.__interp.run(tmpDbg.getDFS()._frame);
		
		}
		
		//if return value from RUN function is defined and NULL
		if( 
			//make sure that RUN returned smth
			typeof tmpRunVal != "undefined" &&
			
			//make sure RUN function quit
			tmpRunVal == null && 
			
			//call stack is not empty
			tmpDbg._callStack.length > 0 &&

			//make sure it is not EXIT command
			tmpDbg._callStack[tmpDbg._callStack.length - 1]._funcCall != null
		){

			//pop last entry from call stack
			var tmpLstCallStk = tmpDbg._callStack.pop();

			//get functinoid id for the completed function call
			var tmpFuncId = tmpLstCallStk._funcCall._funcRef._id;
			
			//get function call object
			var tmpFuncCallObj = tmpLstCallStk._frame._funcsToFuncCalls[tmpFuncId];
			
			//get return value from completed function call
			tmpDbg.getDFS()._val = tmpFuncCallObj._returnVal;
			
			//re-draw cursor
			tmpDbg.showCursor();
		
		}	//end if return value from RUN function is defined and NULL

	};	//end function 'ncToolBarCommand'
</script>
<div class="nc-toolbar-column row bs-glyphicons" style="height:85%; width:100%;">
	<div class="col-xs-1 col-md-1" style="height:100%;">
__EOT_1;
//ES 2017-01-25 (b_patch01): end heredoc to display toolbar only if user is logged in

		//ES 2017-01-25 (b_patch01): check if user is logged in
		if($lv__isLoggedIn){

//ES 2017-01-25 (b_patch01): display toolbar
echo <<<"__EOT_3"
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

					onclick="ncToolBarCommand(1);"
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

					onclick="ncToolBarCommand(2);"
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

					onclick="ncToolBarCommand(3);"
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

					onclick="ncToolBarCommand(4);"
				></span>
			</div>
		</div>
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
__EOT_3;
//ES 2017-01-25 (b_patch01): end toolbar

		}	//ES 2017-01-25 (b_patch01): end if user is logged in

//ES 2017-01-25 (b_patch01): start actual page view
echo <<<"__EOT_4"
	</div>
	<div class="col-xs-11 col-md-11" style="height:100%">
		<div class="row" style="height:100%;">
			<div class="col-xs-10 col-md-10" style="height:100%; width:100%;">
				<div style="height: 100%;">
__EOT_4;
//ES 2017-01-25 (b_patch01): end actual page view

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
