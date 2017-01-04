<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	compose context menu
	Used by:		(vw__codeview)
	Dependencies:	(none)
	*/

	//create context menu
	//Inputs:
	//	menu (array<id:integer, caption:text>) identify elements of context menu and which
	//		ids are to be returned upon a click event on any of such elements
	//	onClickHandler (js function) function to trigger when menu item is clicked
	//		Note: clicked element's id is passed in to this function.
	//	cls (text) CSS class of HTML objects that will be right-clicked to open this menu
	//	uniqId (text) context menu unique id
	//	ignoreCls (text) CSS class to ignore when handling right click
	//output(s): (none)
	//	see: http://jsbin.com/iGaHAtu/2/edit?html,css,js,output
	//	see: http://stackoverflow.com/a/18667012
	function createContextMenu($menu, $onClickHandler, $cls, $uniqId, $ignoreCls){

		//if 'menu' or 'onClickHandler' or 'cls' or 'uniqId' are/is not passed in
		if( isset($menu) == false || isset($onClickHandler) == false || isset($cls) == false ||
			isset($uniqId) == false ){

			//error
			die("one of required input parameters is not defined");

		}	//end if 'menu' or 'onClickHandler' are not passed in

		//flag: is menu empty
		$tmpIsMenuNotEmpty = (empty($menu) == false);

		//if menu is not empty
		if( $tmpIsMenuNotEmpty ){

			//create outter section for context menu
			echo '<div id="'.$uniqId.'" class="nc-context-menu dropdown clearfix">'.
					'<ul class="nc-drop-down-menu dropdown-menu" role="menu" aria-labelledby="dropdownMenu">';

		}	//end if menu is not empty

		//loop thru menu items
		foreach( $menu as $elemId => $caption ){

			//if caption is empty
			if( $caption == "" ){

				//output menu divider
				echo '<li class="divider"></li>';
			
			} else {	//else, regular menu element

				//output menu elememt
				echo '<li><a tabindex="-1" el="'.$elemId.'" href="#">'.$caption.'</a></li>';

			}	//end if caption is empty

		}	//end loop thru menu items

		//if menu is not empty
		if( $tmpIsMenuNotEmpty ){

			//output end of outter section for context menu
			echo '</ul></div>';

			//create JS script section for handling opening event of context menu
			echo '<script>'.
					//store reference of right clicked item
					'var g_ctxmenu_target = null;'.
					//when right click (event:contextmenu) dialog's body content
					'$("body").on("contextmenu", "'.$cls.'", function(e){'.
						//close all content menus
						'$(".nc-context-menu").hide();';
						
					//if there is class for ignored objects
					if( isset($ignoreCls) && $ignoreCls != "" ){

						//check if right-clicked item is inside ignored object
			echo 		'if( $(e.target).closest("'.$ignoreCls.'").length > 0 ){'.
							//quit handler
							'return false;'.
						'}';

					}	//end if there is class for ignored objects

						//get position of dialog
			echo 		'var tp = $("#'.$uniqId.'").closest(".modal-content").offset();'.
						//change CSS styles of context menu
						'$("#'.$uniqId.'").css({'.
							//show context menu
							'display: "block",'.
							//position context menu at location when cursor clicked
							'left: (e.pageX - tp.left),'.
							'top: (e.pageY - tp.top),'.
							//move context menu on top of all other things
							// see: http://stackoverflow.com/a/19905570
							'"z-index": 9999'.
						'});'.
						//set target
						'g_ctxmenu_target = $(e.target).closest("'.$cls.'")[0];'.
						//do not show actual context menu
						'return false;'.
					'});'.
					//handle left-click at dialog
					'$("body").on("click", "'.$cls.'", function(){'.
						//hide context menu
						'$("#'.$uniqId.'").hide();'.
					'});'.
					'$("#'.$uniqId.'").on("click", "a", function(){'.
						//hide context menu
						'$("#'.$uniqId.'").hide();'.
						//invoke given handler and pass it clicked element id
						$onClickHandler.'($(this).attr("el"), g_ctxmenu_target);'.
					'});'.
				 '</script>';
		
		}	//end if menu is not empty

	}	//end function 'createContextMenu'

?>