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
		public $_isSuspnded;

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
		public __construct($date, $fperm, $name, $ownerId, $dirId, $isSuspended){

			//assign data fields
			$this->_date = $date;
			$this->_fperm = $fperm;
			$this->_name = $name;
			$this->_ownerId = $ownerId;
			$this->_dirId = $dirId;
			$this->_isSuspnded = $isSuspended;
		
		}	//end constructor

	}	//end class 'nc__class__fattr'

?>