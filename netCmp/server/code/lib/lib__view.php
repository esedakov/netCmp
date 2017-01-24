<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-22
	Description:	view identifiers
	Used by:		(toolbar), (codeview), (debugger)
	Dependencies:	(none)
	*/

	//create an abstract class as a workaround for enumeration
	//	see: http://stackoverflow.com/a/254543
	abstract class NC__ENUM__VIEW {

		//variable view
		const VARS = 1;		//0000001 = 1

		//file and folders view (fileexp)
		const FILEEXP = 2;	//0000010 = 2

		//user information view
		const USER = 4;		//0000100 = 4

		//interface styles view
		const STYLE = 8;	//0001000 = 8

		//application view
		const APP = 2;		//0010000 = 16

		//debugging view
		const DBG = 4;		//0100000 = 32

		//code view
		const CODE = 8;		//1000000 = 64

		//convert constant values into textual representations
		//input(s):
		//	constObj: (NC__ENUM__VIEW) view constants
		//output(s):
		//	(text) textual representation
		public static function toStr($constObj){

			return  ((($constObj & 1) == 1) ? "VARS_" : "") .
					((($constObj & 2) == 2) ? "FILEEXP_" : "") .
					((($constObj & 4) == 4) ? "USER_" : "") .
					((($constObj & 8) == 8) ? "STYLE_" : "") .
					((($constObj & 2) == 16) ? "APP_" : "") .
					((($constObj & 4) == 32) ? "DBG_" : "") .
					((($constObj & 8) == 64) ? "CODE" : "");

		}	//end function 'toStr'

		//construct constant value from string
		//input(s):
		//	val: (text) text that represents a view constant
		//output(s):
		//	(NC__ENUM__VIEW) => resulting view constant value
		public static function fromStr($val){

			//convert to integer value
			$tmpIntVal = intval($val);

			//init resulting value
			$tmpRes = 0;

			//if VARS
			if( ($tmpIntVal & 1) == 1 ){

				//set VARS
				$tmpRes += NC__ENUM__VIEW::VARS;

			}	//end VARS

			//if FILE EXPLORER
			if( ($tmpIntVal & 2) == 2 ){

				//set FILEEXP
				$tmpRes += NC__ENUM__VIEW::FILEEXP;

			}	//end FILE EXPLORER

			//if USER
			if( ($tmpIntVal & 4) == 4 ){

				//set USER
				$tmpRes += NC__ENUM__VIEW::USER;

			}	//end USER

			//if STYLE
			if( ($tmpIntVal & 8) == 8 ){

				//set STYLE
				$tmpRes += NC__ENUM__VIEW::STYLE;

			}	//end STYLE

			//if APPLICATION
			if( ($tmpIntVal & 16) == 16 ){

				//set APP
				$tmpRes += NC__ENUM__VIEW::APP;

			}	//end APPLICATION

			//if DEBUGGING
			if( ($tmpIntVal & 32) == 32 ){

				//set DBG
				$tmpRes += NC__ENUM__VIEW::DBG;

			}	//end DEBUGGING

			//if CODE
			if( ($tmpIntVal & 64) == 64 ){

				//set CODE
				$tmpRes += NC__ENUM__VIEW::CODE;

			}	//end CODE

			//return resulting value
			return $tmpRes;

		}	//end function 'fromStr'

	}	//end of class 'NC__ENUM__VIEW'

?>