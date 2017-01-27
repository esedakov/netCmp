<?php 
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-25
	Description:	view for displaying info about user
	Used by:		(vw__main)
	Dependencies:	(none)
	*/

	//include library for 'nc__lib__getUser' function
	require_once './lib/lib__getUserInfo.php';

	//include utils
	require_once './lib/lib__utils.php';

	//include db for function 'nc__db__getProgramList'
	require_once './lib/lib__db.php';

	//try to retrieve global var 'lv_userInfo' defined in vw__page.php
	//global $lv_userInfo;

	//if user information has not been retrieved
	if( isset($lv_userInfo) ){

		//get user
		$lv_userInfo = nc__lib__getUser($_SESSION['consts']['user']['id'], false);

	}	//end if user info not retrieved

	//get project information list done by this user
	$lv_prjInfoList = nc__db__getProgramList();

echo <<<"__UOT_01"
	<div
		class="nc-userinfo-win nc-component-view"
		style="height:100%; display: none;"
	>
		<table 
			class="bs-glyphicons" 
			style="width:90%; margin-bottom: 20px;"
		>
			<tr class="row">
				<td class="logo-unkown-style col-xs-3 col-md-3">
					<span class="logo-border glyphicon glyphicon-pawn" aria-hidden="true"></span>
				</td>
				<td class="col-xs-9 col-md-9" style="padding-left:5%;">
					<h1 style="text-decoration: underline; font-weight: bold;">{$lv_userInfo['name']}</h1>
					<div class="row">
						<div class="col-xs-5 col-md-5" style="font-weight: bold;">email:</div>
						<div class="col-xs-7 col-md-7">{$lv_userInfo['email']}</div>
					</div>
					<div class="row">
						<div class="col-xs-5 col-md-5" style="font-weight: bold;">created:</div>
						<div class="col-xs-7 col-md-7">{$lv_userInfo['created']}</div>
					</div>
					<div class="row">
						<div class="col-xs-5 col-md-5" style="font-weight: bold;">modified:</div>
						<div class="col-xs-7 col-md-7">{$lv_userInfo['modified']}</div>
					</div>
					<form action="post__user.php" method="post">
						<div class="row">
							<div class="col-xs-12 col-md-12" style="font-weight: bold;">Change password:</div>
						</div>
						<div class="row">
							<div class="col-xs-1 col-md-1"></div>
							<div class="col-xs-4 col-md-4" style="font-weight: bold;">new:</div>
							<div class="col-xs-7 col-md-7">
								<input type="password" name="npwd">
							</div>
						</div>
						<div class="row">
							<div class="col-xs-1 col-md-1"></div>
							<div class="col-xs-4 col-md-4" style="font-weight: bold;">old:</div>
							<div class="col-xs-7 col-md-7">
								<input type="password" name="opwd">
							</div>
						</div>
						<hr class="featurette-divider" style="margin: 3% 0;">
						<div class="row">
							<div class="col-xs-5 col-md-5"></div>
							<div class="col-xs-7 col-md-7">
								<input type="submit" name="submit">
							</div>
						</div>
					</form>
				</td>
			</tr>
		</table>
		<div class="panel panel-default bs-glyphicons">
			<div class="row panel-heading" style="background-color:#444444; color:white; margin: 0px; font-weight:bold;">
				<p class="col-xs-11 col-md-11">
					List of projects<span 
						class="glyphicon glyphicon-menu-down type-description-toggle-button" 
						aria-hidden="true"
					></span>
				</p>
				<div 
					class="col-xs-1 col-md-1"
				>
					<span
						class="glyphicon glyphicon-minus collapse-type-table-content" 
						aria-hidden="true"
						style="float:right;"
					></span>
				</div>
			</div>
			<div class="row panel-body" style="background-color:#dddddd; margin: 0px;">
				<p class="col-xs-12 col-md-12">Projects that you have implemented</p>
			</div>
			<table class="table table-striped">
				<thead style="background-color:purple; color:white;">
					<tr>
						<th>project name</th>
						<th>created</th>
						<th>number of code files *.nc</th>
						<th>owner</th>
						<th>permissions</th>
					</tr>
				</thead>
				<tbody>
__UOT_01;
	
	//loop thru projects
	foreach( $lv_prjInfoList as $tid => $tinfo ){

		//output row of project information
		echo "<tr>".
				"<th scope='row'>".$tinfo['dir_name']."</th>".
				"<td>".$tinfo['created']."</td>".
				"<td>".$tinfo['num_files']."</td>".
				"<td>".$tinfo['user_name']."</td>".
				"<td>".$tinfo['perm']."</td>".
			"</tr>";

	}	//end loop thru projects

echo <<<"__UOT_02"
				</tbody>
			</table>
		</div>
	</div>

	<script type="text/javascript">
		$(document).ready(function(){
__UOT_02;
/*ES 2017-01-26 (b_aws_fix_01): move JQuery code in function 'nc__util__handleCompressExpandIcons'
	to be able to use it inside vw__vars.php for expand/collapse icons
		    $('.type-description-toggle-button').click(function(){
		    	//find surrounding panel
		    	var tmpPanel = $(this).closest('.panel');
		    	//find internal 'panel-body', which depicts type description
		    	var tmpTypeDesc = $(tmpPanel).find('.panel-body');
		    	//toggle 'panel-body'
		    	$(tmpTypeDesc).toggle();
		    	//if this toggle button shows arrow down
		    	if( $(this).hasClass('glyphicon-menu-down') ) {
		    		//remove class for arrow down
		    		$(this).removeClass('glyphicon-menu-down');
		    		//add class for arrow upwards
		    		$(this).addClass('glyphicon-menu-up');
		    	} else {
		    		//remove class for arrow upwards
		    		$(this).removeClass('glyphicon-menu-up');
		    		//add class for arrow down
		    		$(this).addClass('glyphicon-menu-down');
		    	}	//end if this toggle button shows arrows down
		    });
		    $('.collapse-type-table-content').click(function(){
				//find surrounding panel
		    	var tmpPanel = $(this).closest('.panel');
		    	//find inner table
		    	var tmpTbl = $(tmpPanel).find('table');
		    	//toggle table
		    	$(tmpTbl).toggle();
		    	//find type description
		    	var tmpTypeDesc = $(tmpPanel).find('.panel-body');
		    	//also make sure that type description is hidden
		    	$(tmpTypeDesc).hide();
		    });
ES 2017-01-26 (b_aws_fix_01): end moved code in function 'nc__util__handleCompressExpandIcons' */

//ES 2017-01-26 (b_aws_fix_01): attach handlers for expand/collapse icons inside table header
nc__util__handleCompressExpandIcons(
	"type-description-toggle-button", 	//class name to attach click handler # 1
	"collapse-type-table-content", 		//class name to attach click handler # 2
	".panel-body", 		//what to toggle by click handler # 1 (arrow up/down in the header)
	"table"			//what to toggle by click handler # 2 (horiz bar at the right side of header)
);

echo <<<"__UOT_03"
		});
	</script>
__UOT_03;

?>
