<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-19
	Description:	file 
	Used by:		(lib_db)
	Dependencies:	(lib_fperm)
	*/

	//include file/folder permissions
	require_once 'lib__fperm.php';

	//create class to represent file/folder attributes, which are used for DB updates
	class nc__class__fattr {

		//file/folder id
		//	type: integer
		public $_id;

		//file/folder type
		//	type: integer
		//		1 - text
		//		2 - image
		//		3 - code
		//		4 - CFG
		//		5 - folder
		public $_type;

		//modification date
		//	type: PHP DATETIME
		public $_date;

		//file/folder permissions
		//	type: NC__ENUM__FPERM
		public $_fperm;

		//file/folder name
		//	type: TEXT
		public $_name;

		//id of the owner
		//	type: INT
		public $_ownerId;

		//parent directory id
		//	type: INT
		public $_dirId;

		//flag: is suspended
		//	type: BOOL
		public $_isSuspended;

		//constructor
		//	see: http://php.net/manual/en/language.oop5.basic.php#85220
		//input(s):
		//	date
		//	fperm
		//	name
		//	ownerId
		//	dirId
		//	isSuspended
		//output(s): (none)
		public function __construct($id, $date, $type, $fperm, $name, $ownerId, $dirId, $isSuspended){

			//output function name
			nc__util__func('class', 'nc__class__fattr');

			//assign data fields
			$this->_id = $id;
			$this->_date = strtotime($date);
			$this->_type = intval($type);
			$this->_fperm = NC__ENUM__FPERM::fromStr($fperm);
			$this->_name = $name;
			$this->_ownerId = intval($ownerId);
			$this->_dirId = intval($dirId);
			$this->_isSuspnded = $isSuspended == "1";
		
		}	//end constructor

		//stringify operator
		//	see: http://php.net/manual/en/language.oop5.basic.php#85220
		//input(s): (none)
		//output(s):
		//	(text) => textual representation of file/folder attributes
		public function __tostring() {

			//convert to string
			//	for datetime to string, see: http://stackoverflow.com/a/10569065
			return  "{" .
					//"date: " . $this->_date->format("Y-m-d H:i:s") . ";" .
					"perm: " . NC__ENUM__FPERM::toStr($this->_fperm) . ";" .
					"name: " . $this->_name . ";" .
					"owner:" . $this->_ownerId . ";" .
					"dir:" . $this->_dirId . ";" .
					"suspend:" . $this->_isSuspnded .
					"}";

		}	//end operator stringify

		//Note: there is no equality operator, so instead convert object to string
		//	via __tostring() operator and then compare it with another object,
		//	presumably of the same type.
		//	see: http://stackoverflow.com/a/4947754

	}	//end class 'nc__class__fattr'

?>