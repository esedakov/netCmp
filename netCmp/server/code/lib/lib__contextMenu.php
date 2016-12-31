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

			//output end of outter section for context menu
			echo '</ul></div>';

	}	//end function 'createContextMenu'

?>