/**
	Developer:	Eduard Sedakov
	Date:		2015-10-14
	Description:	test file for parsing entities
	Used by:	(testing)
	Dependencies:	token, type__token
**/

//parent class
function parent(a,b){
	this._a = a;
	this._b = "_" + b + "-";
};
parent.prototype.foo = function(){
	return this._a + this._b;
};
parent.prototype.areEqual = function(another){
	//check that 'another' is an [object]
	if( typeof another == "object" ){
		//check that 'print' function is defined
		if( typeof another.foo == "function" ){
			//check that '_a' and '_b' are defined
			if( typeof another._a !== "undefined" && typeof another._b !== "undefined" ){
				//assume they are of the same types, so compare
				return another._a == this._a && another._b == this._b;
			}//end if _a and _b are defined
		}//end if print is defined
	}//end if another is an object
};
function child(a,b,c){
	//build parent relationship
	this.ctorParent(parent, a, b);
	//assign remaining argument
	this._c = "marco pollo";//c;
};
child.inheritFrom(parent);

//test empty string
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__util() {
	//maintain info whether tests failed or passed
	var testsPassed = true;
	//1. test inheritance
	//construct parent class
	var p = new parent("hello", "world!");
	//construct child (c <- p)
	var c = new child("hello", "world!", "marco?, pollo?");
	//call print on parent
	var res1 = p.foo();
	//call print on child
	var res2 = c.foo();
	//equalize child and parent (since _a and _b are equal, they should be be considered equal)
	var res3 = c.areEqual(p);
	//passed?
	if( res1 != res2 || !res3 ){
		//report
		alert("inheritance test failed");
		//test failed
		testsPassed = false;
	}
	//2. test hashing
	//test values
	var testVals = [123, 321, 231,
			456.123, 123.456, 143.256,
			"hello world", "world hello", "hello world!",
			true, false,
			["test", 9753, false], [], [[1,2,3],[4,5,6],7],
			{key: 'secret', value: 'unkown'}, {a:'secret', b: 'unkown'}, {}
	];
	//maintain results
	var testRes = {};
	//loop thru all test values and use hash function
	for( var i = 0; i < testVals.length; i++ ){
		//calculate hash result
		var tmpHashRes = testVals[i].hashCode();
		//check if there is already such result
		if( tmpHashRes in testRes ){
			//report
			alert("detected collision between " + testVals[i] +" and " + testRes[tmpHashRes] + " => " + tmpHashRes);
			//test failed
			testsPassed = false;
		} else {
			//include resulting value
			testRes[tmpHashRes] = testVals[i];
		}
	}
	return testsPassed;
};


//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_parsing_entities_tests() {
	//prompt
	alert("****starting testing tokens****");
	//test utilities
	alert("test__util returned: " + test__util());
};
