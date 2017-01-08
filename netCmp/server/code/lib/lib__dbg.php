<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-08
	Description:	utility functions for debug
	Used by:		(test)
	Dependencies:	(none)
	*/

	//print header row for dump table (used solely by 'nc__dbg__printDump')
	//input(s):
	//	row: (php set) any row of the table to display
	//	doPrintKeys: (boolean) should print keys or values
	//output(s): (none)
	function nc__dbg__printHeaderTblRow($row, $doPrintKeys){

		//if this is not (associative) array
		//	see: http://stackoverflow.com/a/173479
		if( is_array($row) == false ){

			//quit
			return;

		}	//end if this is not (associative) array


	}	//end function 'nc__dbg__printHeaderTblRow'

?>