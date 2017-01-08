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

		//get type of data
		$tmpDataType = gettype($data);

		//depending on the type of data
		switch($tmpDataType){

			//if singleton
			case "boolean":
			case "integer":
			case "double":
			case "string":

				//print type and value
				echo "<span class='nc-dbg-singleton-value'>".
							$tmpDataType . " => {" . $data . "}" .
					 "</span>";

				break;

			//if NULL
			case "NULL":

				//print NULL string
				echo "<span class='nc-dbg-other-value'>NULL</span>";

				break;

			//if object or array
			case "object":
			case "array":

				//start table
				echo "<table><tbody>";

				//is this a sequential array
				//	see: http://stackoverflow.com/a/173479
				$tmpIsSeqArray = array_keys($data) === range(0, count($data) - 1);

				//test
				//var_dump(array_keys($data));

				//if array is empty
				if( empty($data) ){

					//print caption that array is empty
					echo "<tr><th>array is empty</th></tr>";

				} else {	//else, array is not empty

					//if sequential array, then print header row
					if( $tmpIsSeqArray ){

						nc__dbg__printHeaderTblRow($data[0], true);

					}	//end if sequential array

					//loop thru data
					foreach( $data as $fieldName => $fieldValue ){

						//start row
						echo "<tr>";

						//display field name
						echo "<td class='nc-dbg-field-name'>".$fieldName."</td>";

						//if need to print row of field values
						if( 
							//if field value is an array
							is_array($fieldValue) &&

							//if this field is an associative array
							!$tmpIsSeqArray 

						){
							//start cell
							echo "<td><table>";

							//print header row
							nc__dbg__printHeaderTblRow(array_keys($fieldValue), false);

							//start new row for actual data values
							echo "<tr>";

							//loop thru array items
							foreach( $fieldValue as $tmpFieldName => $tmpFieldValue ){

								//start new cell
								echo "<td>";

								//print value
								nc__dbg__printDumpFieldValue($tmpFieldValue);

								//end cell
								echo "</td>";

							}	//end loop thru array items
							
							//end row for data value
							echo "</tr>";

							//end cell
							echo "</table></td>";

						} else {	//else, associative array or object

							//start field value cell
							echo "<td>";

							//print field value
							nc__dbg__printDumpFieldValue($fieldValue);

							//end field value cell
							echo "</td>";

						}	//end if sequential array

						//end row
						echo "</tr>";

					}	//end loop thru data

				}	//end if array is empty

				//end table
				echo "</tbody></table>";

				break;

			//if resource or anything else
			default:

				//start span
				echo "<span class='nc-dbg-other-value'>";

				//dump resource
				var_dump($data);

				//end span
				echo "</span>";

			break;

		}	//end switch -- depending on the type of data

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