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
//	arr: (Array<Object>) => array of objects that are either basic types OR parsing 
//		objects (if neither, then function will omit the array entry)
//output(s):
//	(string) => string representation of array
function arrToStr(arr) {
	//initialize resulting string
	var res = "Array[";
	//loop thru array elements
	for( var index = 0; index < arr.length; index++ ){
		res += (index > 0 ? ", " : "") + objToStr(arr[index]);
	}
	return res + "]";
};

//convert JS hash map tp string
//input(s):
//	hm: (HashMap<Key:String, Value:Object>) => hashmap to be converted to string representation
//output(s):
//	(string) => string representation of hashmap
function hashMapToStr(hm){
	//init result
	var res = "HashMap{";
	//init if have not processed hashmap, yet
	var isFirst = true;
	//loop thru keys
	for( var key in hm ){
		res += (isFirst ? "" : ", ") + "key:" + key + " => value: " + objToSTr(hm[key]);
	}
	return res + "}";
};

//convert object to string
//input(s):
//	obj: (Object) => reference to the object to be printed
//output(s):
//	(string) => string representation
function objToStr(obj){
	//initialize result
	var result = "";
	//by type
	switch(typeof obj){
	case "number":
	case "string":
	case "boolean":
		result = obj;
		break;
	case "undefined":
		result = "{{undefined}}";
		break;
	case "function":
		result = "((function::" + obj.toString() + "))";
		break;
	case "object":	//null, object (i.e. array, hashmap)
		//identify it it is a NULL
		if( obj === null ){
			result = "((null))";
			break;
		}
		//if it is an array
		if( Array.isArray(obj) ) {
			result = arrToStr(obj);
			break;
		}
		//if not, then check that this object has function 'getTypeName'
		if( typeof obj.getTypeName === 'function' ){
			//check that it is one of parsing objects - by type of object
			switch(obj.getTypeName().value){
			case 1: //argument
			case 2: //block
			case 3:	//scope
			case 4:	//command
			case 5:	//symbol
			case 6: //type
			case 7: //value
			case 8:	//result
			case 9:	//result entity type
			case 10: //functinoid
				result = "<" + obj.getTypeName().name + ":" + obj._id + ">";
				break;
			//other: treat as if they are hashmaps
			default:
				result = hashMapToStr(obj);
				break;
			}
		}
		break;
	}
	return result;
};
