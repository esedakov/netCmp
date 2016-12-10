<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-10
	Description:	library of dialog functions
	Used by:		(vw__page)
	Dependencies:	(lib__utils)
	*/	//start dialog

	//start dialog
	//input(s):
	//	src: (text) page url that should be displayed inside this dialog
	//	attrs: (array<>) set of attributes, list of possible attributes include:
	//		- id: (text) unique id for this dialog to referenced by jquery
	//		- caption: (text) caption, displayed in the dialog's header
	//		- headCol: (text) header's color
	//		- headTxtCol: (text) header's text color
	//		- headTxtSize: (text) header's text size
	//		- needClose: (boolean) need a close button
	//		- needMove: (boolean) need dialog to move
	//		- needRefresh: (boolean) need top parent page to be refreshed upon closing this dialog
	//output(s):
	//	(text) => dialog id
	function nc__dlg__start($attrs){

		//check if 'caption' is not defined among attributes
		if( array_key_exists("caption", $attrs) == false ){

			//define default caption
			$attrs["caption"] = "dialog";

		}	//end if 'caption' is not defined among attributes

		//check if 'headCol' is not defined among attributes
		if( array_key_exists("headCol", $attrs) == false ){

			//define default header's color
			$attrs["headCol"] = "#5cb85c";

		}	//end if 'headCol' is not defined among attributes

		//check if 'headTxtCol' is not defined among attributes
		if( array_key_exists("headTxtCol", $attrs) == false ){

			//define default header's text color
			$attrs["headTxtCol"] = "white";

		}	//end if 'headTxtCol' is not defined among attributes

		//check if 'headTxtSize' is not defined among attributes
		if( array_key_exists("headTxtSize", $attrs) == false ){

			//define default header's text size
			$attrs["headTxtSize"] = "30px";

		}	//end if 'headTxtSize' is not defined among attributes

		//check if 'needClose' is not defined among attributes
		if( array_key_exists("needClose", $attrs) == false ){

			//define flag -- need close button
			$attrs["needClose"] = true;

		}	//end if 'needClose' is not defined among attributes

		//check if 'needMove' is not defined among attributes
		if( array_key_exists("needMove", $attrs) == false ){

			//define flag -- need dialog to be moveable
			$attrs["needMove"] = true;

		}	//end if 'needMove' is not defined among attributes

		//check if 'needRefresh' is not defined among attributes
		if( array_key_exists("needRefresh", $attrs) == false ){

			//define flag -- need top parent window to be refereshed
			$attrs["needRefresh"] = false;

		}	//end if 'needRefresh' is not defined among attributes

		//check if 'id' is not defined among attributes
		if( array_key_exists("id", $attrs) == false ){

			//define unique id based on the page name and random number
			$attrs["id"] = nc__util__getPHPFileName() . "__dlg__" . rand(1000,100000);

		}	//end if 'id' is not defined among attributes

		//if need to move
		if( $attrs["needMove"] || $attrs["needRefresh"] ){

			//create JS section for making this dialog movable
			echo "<script>" .
					"$(document).ready(function(){";

						//if need to be movable
						if( $attrs["needMove"] ){

							//make div draggable
							echo "$('#" . $attrs["id"] . "').draggable();";
						}

						//if need to refresh on exit
						if( $attrs["needRefresh"] ){

							//make close button refresh top window
							echo "$('#" . $attrs["id"] . "').find('.close').click(" .
									"function(e){" .
										"top.location.href = '';" .
									"}" .
								");";
						}

					echo "});" .
				"</script>";

		}	//end if need to move

		//start dialog's bounding DIV (ends in another function)
		echo "<div class='modal fade' id='" . $attrs["id"] . "' role='dialog'>" .

				//dialog body (ends in another function)
				"<div class='modal-dialog'>" .

					//compose dialog content window (ends in another function)
					"<div class='modal-content'>" .

						//compose dialog header
						"<div style='" .

							//set header's background color
							"background-color: " . $attrs["headCol"] . ";" .
							//set header's text color
							"color: " . $attrs["headTxtCol"] . ";" .
							//set header's font size
							"font-size: " . $attrs["headTxtSize"] . ";" .
							//set padding around header
							"padding: 10px 20px;" .

						"'>";

		//if need to be closeable
		if( $attrs["needClose"] ){

							//close button for dialog
							echo "<button type='button' class='close' data-dismiss='modal'>x</button>";

		}	//end if need to be closeable

							//caption
							echo "<h4>" . $attrs["caption"] . "</h4>" .

						//end dialog header
						"</div>" .

						//start content body (ends in another function)
						"<div style='display: flex; margin: 20px;'>";

		//return dialog id
		return $attrs["id"];

	}	//end function 'nc__dlg__start'

	//end dialog
	//input(s): (none)
	//output(s): (none)
	function nc__dlg__end(){

						//end dialog for content body (starts in another function)
						echo "</div>" .

					//end dialog content window (starts in another function)
					"</div>" .

				//end dialog body (starts in another function)
				"</div>" .

			//end end dialog bounding DIV (starts in another function)
			"</div>";

	}	//end function 'nc__dlg__end'

?>