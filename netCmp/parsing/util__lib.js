/**
	Developer:	Eduard Sedakov
	Date:		2015-10-02
	Description:	variety of auxilary functions that facilitate work of parser
	Used by:	(any class)
	Dependencies:	util__sha256.js
**/

//==========inheritance==========
//call parent constructor
//input(s):
//	parentClass: (Object) => class to inherit from
//output(s): (none)
//ES 2015-11-29 (Issue 1, b_vis): change function declaration. Former approach
//made 'inheritFrom' accessible to all JS objects, new approach is a just a regular
//JS function, so it no longer can be run from any object's scope. Has to be invoked
//like a regular JS function. This is needed to use jointJS viewport constructor.
//Object.prototype.ctorParent = function(parentClass) {
function ctorParent(it, parentClass){
	//initialize array of arguments passed used by parent constructor
	var arrParClsArgs = [];
	//compose array of arguments passed for parent class constructor
	//ES 2015-11-29 (Issue 1, b_vis): since I added a new argument 'it', so 
	//constructor arguments for parent class would start from index '2' (3rd 
	//argument), unlike previously, when it was starting from index '1' (2nd arg)
	for( var i = 2; i < arguments.length; i++ ) {
		//add argument
		arrParClsArgs.push(arguments[i]);
	}
	//call parent constructor with composed arguments
	//ES 2015-11-29 (Issue 1, b_vis): replace 'this' with a function argument 'it'.
	//Because function has been changed from being run inside object scope to a
	//stand-alone function, so 'this' now has to be passed via argument 'it'.
	parentClass.apply(it, arrParClsArgs);
};
//inherite this class (referred by Object) from specified parent class
//input(s):
//	parentClass: (Object) => class to inherit from
//output(s): (none)
//ES 2015-11-29 (Issue 1, b_vis): change function declaration. Former approach
//made 'inheritFrom' accessible to all JS objects, new approach is a just a regular
//JS function, so it no longer can be run from any object's scope. Has to be invoked
//like a regular JS function. This is needed to use jointJS viewport constructor. 
//Object.prototype.inheritFrom = function(parentClass){
function inheritFrom(it, parentClass){
	//inherite from parent class
	//ES 2015-11-29 (Issue 1, b_vis): replace 'this' with a function argument 'it'.
	//Because function has been changed from being run inside object scope to a
	//stand-alone function, so 'this' now has to be passed via argument 'it'.
	it.prototype = Object.create(parentClass.prototype);
};

//==========hashing==========
//generate hashing string for specified object
//input(s):
//	obj: (Object) => object (of any type) that needs to be hashed
//output(s):
//	(string) => hash value
//ES 2015-11-29 (Issue 1, b_vis): change function declaration. Former approach
//made 'inheritFrom' accessible to all JS objects, new approach is a just a regular
//JS function, so it no longer can be run from any object's scope. Has to be invoked
//like a regular JS function. This is needed to use jointJS viewport constructor.
//Object.prototype.hashCode = function() {
function hashCode(it){
	//ES 2015-11-29 (Issue 1, b_vis): replace 'this' with a function argument 'it'.
	//Because function has been changed from being run inside object scope to a
	//stand-alone function, so 'this' now has to be passed via argument 'it'.
	return Sha256.hash(JSON.stringify(it));
};

//==========collection==========
//check if it is a collection
//input(s):
//	obj: (object) object to be checked if it is a collection
//output(s):
//	boolean => is this a collection object
function isCollection(obj){
	return typeof obj == "object" && obj !== null;
}

//check if collection is empty
//input(s):
//	obj: (collection) collection object to be checked if it is empty
//output(s):
//	boolean => is this an empty array/hashmap
function isEmptyCollection(obj){
	return isCollection(obj) && (					//if it is a non-nullable object AND
		(Array.isArray(obj) && obj.length == 0) ||	//it is an empty array, OR
		jQuery.isEmptyObject(obj)					//it is an empty hashmap
	);
};

//get first element from a collection
//input(s):
//	obj: (collection) collection object from which first element is extracted
//output(s):
//	object	=> first element of the collection
//			=> NULL, if there is no first element in the collection OR it is not a collection
function firstCollectionElem(obj){
	//get first element, if any
	var elem = $(obj).first();
	//check if collection is empty (i.e. has no first element)
	if( elem.length == 0 ){
		//return null if it is empty
		return null;
	}
	//return first element
	return elem[0];
};

//get last element from a collection
//input(s):
//	obj: (collection) collection object from which to retrieve last element
//output(s):
//	object	=> last element of the collection
//			=> NULL, if collection is empty
function lastCollectionElem(obj){
	//get first element, if any
	var elem = $(obj).last();
	//check if collection is empty (i.e. has no first element)
	if( elem.length == 0 ){
		//return null if it is empty
		return null;
	}
	//return first element
	return elem[0];
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
	//ES 2016-09-17 (b_dbg_test): shorten the text (needed for debugger to display
	//	content of complex objects compactly)
	var res = "HM{";
	//init if have not processed hashmap, yet
	var isFirst = true;
	//check if hashmap is not empty
	if( Object.keys(hm).length > 0 ){
		//loop thru keys
		$.each(
			hm, 
			function(key, value){
				//ES 2016-09-17 (b_dbg_test): if value has 'getTypeName' function AND
				//	it is either ENTITY or CONTENT
				if( typeof value.getTypeName === "function" &&
					(
						value.getTypeName() == RES_ENT_TYPE.CONTENT ||
						value.getTypeName() == RES_ENT_TYPE.ENTITY
					)
				){
					//reset value to be actual content's value
					value = interpreter.getContentObj(value)._value;
				}	//ES 2016-09-17 (b_dbg_test): end if 'getTypeName' and either ENTITY or CONTENT
				//convert value
				var val = objToStr(value);
				//check if val is not empty string
				if( val.length != 0 ){
					//compose string
					res += (isFirst ? "" : ", ") + key + " => " + val;
					//ensure it is not the first key
					isFirst = false;
				}	//end if cal is not empty string
			}	//end iterative function to loop thru hashmap
		);	//end loop thru hashmap
	}	//end if hashmap is not empty
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
		//ES 2016-09-17 (b_dbg_test): make sure to convert object (integer/boolean) to string
		result = "" + obj;
		break;
	case "undefined":
		result = "{{undefined}}";
		break;
	case "function":
		//result = "((function::" + obj.toString() + "))";
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
			case 8:	//result
			case 9:	//result entity type
			case 10: //functinoid
				result = "<" + obj.getTypeName().name + ":" + obj._id + 
					("_name" in obj ? ", name: " + obj._name : "") +
					("_type" in obj ? ", type: " + obj._type.name : "") + ">";
				break;
			case 7: //value
				result += obj.toString();
				break;
			//other: treat as if they are hashmaps
			default:
				throw new Error("unkown type converted to a string");
			}
		} else {
			result = hashMapToStr(obj);
		}
		break;
	}
	return result;
};

//get index of the element inside container
//input(s):
//	arrayContainer: (Array) container under consideration where element needs to be found
//	element: entry inside container whose index needs to be determined
//output(s):
//	(integer) position of the element inside container
//	-1 if not found
//NOTE: no comparison function is given, so using just regular '==' operator 
function indexOfElement(arrayContainer, element){
	//loop thru elements of container
	var index = 0;
	for( ; index < arrayContainer.length; index++ ){
		//compare currently iterated array entry to the given element
		if( arrayContainer[index] == element ){
			//if found, return index
			return index;
		}
	}
	//not found, return -1
	return -1;
};	//end function 'indexOfElement'

//ES 2016-09-10 (b_debugger): get compact text representation for the given object
//input(s):
//	obj: most types of objects, allowed in this interpreter/parser
//output(s):
//	(text) => compact text representation for this object
function getCompactTxt(obj){
	//init text that would represent resulting command value
	var tmpTxtResVal = "";
	//if object is not defined
	if( typeof obj == "undefined" ){
		tmpTxtResVal = "undefined";
	} else if( obj == null ){	//if object is null
		tmpTxtResVal = "null";
	} else {
		//depending on type of resulting command value
		switch( obj.getTypeName().value ){
			case 2: 	//block
				tmpTxtResVal = "blk__" + obj._id;
				break;
			case 3: 	//scope
				tmpTxtResVal = "scp__" + obj._id;
				break;
			case 4: 	//command
				tmpTxtResVal = "cmd__" + obj._id;
				break;
			case 5: 	//symbol
				tmpTxtResVal = "sy__" + obj._name + ":" + obj._id;
				break;
			case 6: 	//type
				tmpTxtResVal = "sy__" + obj._name + ":" + obj._id;
				break;
			case 10: 	//function
				tmpTxtResVal = "func__" + obj._name + ":" + obj._id;
				break;
			case 14: 	//entity
				tmpTxtResVal = "ent: " + obj.toString();
				break;
			case 15: 	//content
				tmpTxtResVal = "cont: " + obj.toString();
				break;
			case 16: 	//frame
				tmpTxtResVal = "fr__" + obj._id;
				break;
			default:
				tmpTxtResVal = "unkown";
				break;
		}	//end switch depending on the type of object
	}	//end if object is not defined
	return tmpTxtResVal;
};	//end function 'getCompactTxt'