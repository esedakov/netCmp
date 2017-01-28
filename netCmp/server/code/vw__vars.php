<?php 
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-26
	Description:	view of variables (only renders during debugging stage)
	Used by:		(vw__main)
	Dependencies:	(none)
	*/

	//include utils for function 'nc__util__handleCompressExpandIcons'
	require_once './lib/lib__utils.php';

?>

<div 
	class="nc-vars-win nc-component-view panel panel-default bs-glyphicons"
	style="height:100%; display: none;"
>

	<?php //header row for showing type name ?>
	<div 
		class="panel-heading row nc-vars-header"
		style="background-color:#444444; color:white; font-weight:bold;"
	>

		<?php //show type name ?>
		<p class="col-xs-11 col-md-11 nc-vars-type-name">

			TYPE DEFINITION

			<?php //icon to toggle description ?>
			<span 
				class="glyphicon nc-vars-toggle-desc glyphicon-menu-down" 
				aria-hidden="true"
			></span>

			<?php //show icon to compress and expand list of types ?>
			<div class="col-xs-1 col-md-1">

				<?php //show icon ?>
				<span
					class="glyphicon glyphicon-minus nc-vars-collapse-all-desc"
					aria-hidden="true"

					<?php //show icon on the right side ?>
					style="float:right;"
				></span>

			</div>	<?php //end icon to compress and expand list of types ?>

		</p>	<?php //end type name ?>

	</div>	<?php //end header row for showing type name ?>

	<?php //show type definition ?>
	<div class="panel-body nc-vars-definition">

		<?php //initially, inform user to click on variable or its type to show its defintion here ?>
		<p>View variable type definition by clicking on that variable's name or its corresponding type</p>

	</div>	<?php //end type definition ?>

	<?php //show variable information in tabular format ?>
	<table class="table table-striped" style="display: table;">

		<thead class="nc-vars-table-header">

			<?php //initially, inform user to start debugging to use this view ?>
			<tr><th>To use this view, please launch debugger for any program</th></tr>

		</thead>

		<?php //initially, no data shown for non-running program ?>
		<tbody class="nc-vars-table-tbody"></tbody>

	</table>	<?php //end show variable information in tabular format ?>

</div>

<script>
	$(document).ready(function(){
		<?php

		//attach click handlers for arrow up/down and horiz bar at the right side of table header
		//	in order to compress/expand table portions
		nc__util__handleCompressExpandIcons(
			"nc-vars-toggle-desc",			//class name to attach click handler # 1
			"nc-vars-collapse-all-desc",		//class name to attach click handler # 2
			".panel-body",	//what to toggle by click handler # 1 (arrow up/down in the header)
			"table"			//what to toggle by click handler # 2 (horiz bar at the right side of header)
		);

		?>
	});

	<?php
	//to update variables displaye inside table and types in table's header
	//input(s): (none)
	//output(s): (none)
	?>
	function nc__vars__update_table(){

		<?php //if interpreter is setup AND debugger is running AND frame stack is not empty ?>
		if( g_int != null && g_started && Object.keys(g_int._stackFrames).length > 0 ){

			<?php //add first row to the table
				//1. var name => text -- (e)._symbol._name
				//2. type => type (parser/obj__type.js) -- (e)._type 
				//3. value => content (interpreter/obj__content.js) -- (e)._value
				//4. func => text -- (e)._symbol._scope._funcDecl._name
			?>
			$(".nc-vars-table-header").html(
				"<tr>" +
					"<th>variable name</th>" +
					"<th>type</th>" +
					"<th>declared location</th>" +
					"<th>value</th>" +
				"</tr>"
			);

			<?php //remove table header ?>
			$(".nc-vars-header").remove();
			$(".nc-vars-definition").remove();

			<?php //init associative array for variable names via their unique entity id ?>
			var tmpVars = {}; 

			<?php //init associative array of types ?>
			var tmpTypes = {};

			<?php //loop thru frame stack ?>
			for( var tmpFrmIdx in g_int._stackFrames ){

				<?php //get frame object ?>
				var tmpFrm = g_int._stackFrames[tmpFrmIdx];

				<?php //loop thru entities of currently iterated frame ?>
				for( var tmpEntIdx in tmpFrm._symbsToVars ){

					<?php //get entity object ?>
					tmpEnt = tmpFrm._symbsToVars[tmpEntIdx];

					<?php //if entity has been added already ?>
					if( tmpEntIdx in tmpVars ){

						<?php //skip this entity ?>
						continue;

					}	<?php //end if entity has been added already ?>

					<?php //store info about this entity ?>
					tmpVars[tmpEntIdx] = 0;

					<?php //init scope type, where entity was declared: object OR function ?>
					tmpIsF = tmpEnt._symbol._scope._funcDecl != null;

					<?php //init caption for the scope ?>
					tmpCap = tmpIsF ? tmpEnt._symbol._scope._funcDecl._name : tmpEnt._symbol._scope._typeDecl._name;

					<?php //convert value to string representation ?>
					tmpVal = tmpEnt._type._type == OBJ_TYPE.CUSTOM.value.value ? contToStr(tmpEnt._value) : tmpEnt._value.toString();

					<?php //add new row to the table ?>
					$(".nc-vars-table-tbody").append(
						"<tr>" +
							"<td>" + tmpEnt._symbol._name + "</td>" +
							"<td>" + tmpEnt._type._name + "</td>" +
							"<td>" + (tmpIsF ? "func: " : "obj: ") + tmpCap + "</td>" +
							"<td>" + tmpVal + "</td>" +
						"</tr>"
					);

					<?php //if type of entity has been added ?>
					if( tmpEnt._type._id in tmpTypes ){

						<?php //skip this type ?>
						continue;

					}	<?php //end if type of entity has been added ?>

					<?php //compose string that would represent table header for type definition ?>
					var tmpTypeDef = "<div class='panel-body nc-vars-definition'><p>";

					<?php //add type to the set ?>
					tmpTypes[tmpEnt._type._id] = 0;

					<?php //if there are fields in this entity ?>
					if( Object.keys(tmpEnt._type._fields).length > 0 ){

						<?php //loop thru data fields of the type ?>
						for( tmpFieldName in tmpEnt._type._fields ){

							<?php //add this field ?>
							tmpTypeDef += "<span class='glyphicon glyphicon-arrow-right'>&nbsp;" + 
								tmpFieldName + ": " +
								tmpEnt._type._fields[tmpFieldName].type._name +
							      "</span><br />";

						}	<?php //end loop thru data fields ?>

					} else {	<?php //else, if no fields in entity ?>

						<?php //specify caption that there are no fields in this entity ?>
						tmpTypeDef += "No visible fields found";

					}	<?php //end if there are fields in the entity ?>

					<?php //close <p> and <div> ?>
					tmpTypeDef += "</p></div>";

					<?php //compose and add table header for type caption ?>
					var tmpTypeText ="<div " +
								"class='panel-heading row nc-vars-header' " +
								"style='background-color:#444444; color:white; font-weight:bold;' " +
							">" +
								"<p class='col-xs-11 col-md-11 nc-vars-type-name'>" +
									tmpEnt._type._name +
									"<span " +
										"class='glyphicon nc-vars-toggle-desc glyphicon-menu-down' " +
										"aria-hidden='true'" +
									"></span>" +
									"<div class='col-xs-1 col-md-1'>" +
										"<span " +
											"class='glyphicon glyphicon-minus nc-vars-collapse-all-desc' " +
											"aria-hidden='true' " +
											"style='float: right;'" +
										"</span>" +
									"</div>" +
								"</p>" +
							"</div>" + tmpTypeDef;

					<?php //add type to the table header ?>
					$(".nc-vars-win").prepend(tmpTypeText);

				}	<?php //end loop thru entities of currenly iterated frame ?> 

			}	<?php //end loop thru frame stack ?>

		}	<?php //end if interpreter is setup and running ?>

	};	<?php //end function 'nc__vars__update_table' ?>

	<?php //function for converting content/entity to string representation ?>
	function contToStr(o){

		<?php //init resulting string ?>
		var tmpRes = "{type: " + o._type._name + " => ";

		<?php //init flag that indicates whether this is a first iteration or subsequent ?>
		var tmpIsFirst = true;

		<?php //loop thru value fields ?>
		for( var tmpFieldName in o._value ){

			<?php //if not the first iteration ?>
			if( !tmpIsFirst ){

				<?php //add comma separator ?>
				tmpRes += ", ";

			}	<?php //end if not the first iteration ?>

			<?php //no longer first iteration ?>
			tmpIsFirst = false;

			<?php //add new field name to result string and recursively determine its value ?>
			tmpRes += tmpFieldName + " -- " + contToStr(o._value[tmpFieldName]);

		}	<?php //end loop thru value fields ?>

		<?php //end set and return result ?>
		return tmpRes + "}";

	}	<?php //end function 'contToStr' ?>

</script>
