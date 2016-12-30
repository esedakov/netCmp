<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-19
	Description:	file/folder access and modification permissions
	Used by:		(lib_db), (lib_io)
	Dependencies:	(none)
	*/

	//create an abstract class as a workaround for enumeration
	//	see: http://stackoverflow.com/a/254543
	abstract class NC__ENUM__FPERM {

		//read/access permission
		const READ = 1;		//0001

		//write permission
		const WRITE = 2;	//0010

		//delete permission
		const DELETE = 4;	//0100

		//move or rename permission
		const MOVE = 8;		//1000

		//convert constant values into textual representations
		//input(s):
		//	constObj: (NC__ENUM__FPERM:READ/WRITE/DELETE/MOVE) permission constant
		//output(s):
		//	(text) textual representation
		public static function toStr($constObj){

			return  ((($constObj & 1) == 1) ? "READ_" : "") .
					((($constObj & 2) == 2) ? "WRITE_" : "") .
					((($constObj & 4) == 4) ? "DEL_" : "") .
					((($constObj & 8) == 8) ? "MOVE" : "");

		}	//end function 'toStr'


	}	//end of class 'NC__ENUM__FPERM'

?>