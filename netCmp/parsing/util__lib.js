/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	variety of auxilary functions that facilitate work of parser
	Used by:	(any class)
	Dependencies:	util__sha256.js
**/

//==========inheritance==========
//inherite this class (referred by Object) from specified parent class
//input(s):
//	parentClass: (Object) => class to inherit from
//output(s): (none)
Object.prototype.inheriteFrom = function(parentClass) {
	//initialize array of arguments passed used by parent constructor
	var arrParClsArgs = [];
	//compose array of arguments passed for parent class constructor
	for( var i = 1; i < arguments.length; i++ ) {
		//add argument
		arrParClsArgs.push(arguments[i]);
	}
	//call parent constructor with composed arguments
	parentClass.apply(this, arrParClsArgs);
	//inherite from parent class
	this.prototype = Object.create(parentClass.prototype);
};

//==========hashing==========
//generate hashing string for specified object
//input(s):
//	obj: (Object) => object (of any type) that needs to be hashed
//output(s):
//	(string) => hash value
Object.prototype.hashCode = function() {
	Sha256.hash(JSON.stringify(this));
};

//==========toString conversions==========
//convert array of parsing objects to string
//input(s):
//	arr: array of objects that are either basic types OR parsing objects (if neither, then function will omit the array entry)
//output(s):
//	(string) => string representation of array
function arrToStr(arr) {
	//initialize resulting string
	var res = "Array[";
	//loop thru array elements
	for( var index = 0; index < arr.length; index++ ){
		//by type
		switch(typeof arr[index]){
		case "number":
		case "string":
		case "boolean":
			res += arr[index];
			break;
		case "undefined":
			res += "{{undefined}}";
			break;
		case "function":
			res += "((function::" + arr[index].toString() + "))";
			break;
		case "object":	//null, object (i.e. array, hashmap)
			//identify it it is a NULL
			if( arr[index] === null ){
				res += "((null))";
				break;
			}
			//if not, then check that this object has function 'getTypeName'
			if( typeof arr[index].getTypeName === 'function' ){
				//check that it is one of parsing objects - by type of object
				switch(arr[index].getTypeName().value){
				case 1: //argument
				case 2: //block
				case 3:	//scope
				case 4:	//command
				case 5:	//symbol
				case 6: //type
				case 7: //value
				case 8:	//result
				case 9:	//result entity type
					res += "<" + arr[index].getTypeName().name + ":" + arr[index]._id + ">";
					break;
				//other object type (skip)
				default:
					res += "((skip:" + arr[index].getTypeName().value;
					break;
				}
			}
			break;
		}
	}
};
