<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-08
	Description:	utility functions for debug
	Used by:		(test)
	Dependencies:	(none)
	*/


	//display data field value (used solely by 'nc__dbg__printDump')
	//input(s):
	//	data: any php item
	//output(s): (none)
	function nc__dbg__printDumpFieldValue($data){


	}	//end function 'nc__dbg__printDumpFieldValue'

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

		//print row tag
		echo "<tr class='nc-dbg-table-header'>";

		//if need to print keys
		if( $doPrintKeys ){

			//print index cell
			echo "<th>index</th>";

		}	//end if need to print keys

		//loop thru field of the row
		foreach( $row as $fieldName => $val ){

			//print field name
			echo "<th>" . ($doPrintKeys ? $fieldName : $val) . "</th>";

		}	//end loop thru field of the row

		//print end row tag
		echo "</tr>";

	}	//end function 'nc__dbg__printHeaderTblRow'

?>