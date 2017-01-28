<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-26
	Description:	display message box on the center of window (no close 'x' no moving, just for messaging purpose)
	Used by:		(vw__page)
	Dependencies:	(none)
	*/

?>

<div class="nc-progress-box" style="display: none;">
	<span class="nc-progress-msg"></span>
</div>

<script>

	<?php
	//show or hide progress message box
	//input(s): (none)
	//output(s): (none)
	?>
	function nc__progress__toggle(){

		<?php //show/hide progress message box ?>
		$(".nc-progress-box").toggle();

	};	<?php //end function 'nc__progress__toggle' ?>

	<?php
	//change message in the progress message box
	//input(s):
	//	txt: (text) changing message
	//output(s): (none)
	?>
	function nc__progress__changeMsg(txt){

		<?php //set message of progress box ?>
		$(".nc-progress-msg").html(txt);

	}	<?php //end function 'nc__progress__changeMsg' ?>

</script>
