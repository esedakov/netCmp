<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2016-12-30
	Description:	file location
	Used by:		(lib_db)
	Dependencies:	(none)
	*/

	//create class to represent file location
	class nc__class__flocation {

		//file id
		//	type: INTEGER
		public $_id;

		//on which resource does this file reside
		//	0: local server
		//	1: git
		//	type: INTEGER
		public $_type;

		//location path
		//	type: TEXT
		public $_path;

		//actual file name
		//	type: TEXT
		public $_name;

		//constructor
		//input(s):
		//	id
		//	type
		//	path
		//	name
		//output(s): (none)
		public function __construct($id, $type, $path, $name){

			//output function name
			nc__util__func('class', 'nc__class__flocation');

			//assign data fields
			$this->_id = $id;
			$this->_type = $type;
			$this->_path = $path;
			$this->_name = $name;

		}	//end constructor

		//stringify operator
		//	see: http://php.net/manual/en/language.oop5.basic.php#85220
		//input(s): (none)
		//output(s):
		//	(text) => textual representation of file/folder attributes
		public function __tostring() {

			//convet to string
			return "{".
						"id:".$this->_id.
						"type:".$this->_type.
						"path:".$this->_path.
						"name:".$this->_name.
					"}";

		}	//end operator stringify

		//Note: there is no equality operator, so instead convert object to string
		//	via __tostring() operator and then compare it with another object,
		//	presumably of the same type.
		//	see: http://stackoverflow.com/a/4947754

	}	//end class 'nc__class__flocation'

?>