/**
	Developer:	Eduard Sedakov
	Date:		2015-10-14
	Description:	test utilities
	Used by:	(testing)
	Dependencies:	util__lib, util__sha256, util__type__entity
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
	var testRes = [];
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
			testRes.push({'key': tmpHashRes, 'value': testVals[i]});
		}
	}
	//now loop thru test results and hash values again (need to get same key)
	for( var j = 0; j < testRes.length; j++ ){
		//get key
		var key = testRes[j].key;
		//hash value
		var hashVal = testRes[j].value.hashCode();
		//compare key with produced hash value => if not equal then report
		if( hashVal !== key ){
			//report
			alert("does not hash to same value again for key: " + key);
			//test failed
			testsPassed = false;
		}
	}
	//3. test array and hashMap to string conversion
	var testRes_2 = [[],			//Array[]
			 [123],			//Array[123]
			 [true, 9, 0.1],	//Array[true, 9, 0.1]
			 [{key: 'text', value: 123},712],	//Array[HashMap{key => text, value => 123}, 712]
			 [[1,2,3],{key:1, term:2, value: 3},{key: {id:123, name: "alex"}}, 0.1]
			//Array[Array[1,2,3], HashMap{key => 1, term => 2, value => 3}, HashMap{key => HashMap{id => 123, name => alex}}, 0.1]
	];
	var testVal_2 = ["Array[]", 
			 "Array[123]",
			 "Array[true, 9, 0.1]",
			 "Array[HashMap{key => text, value => 123}, 712]",
			 "Array[Array[1, 2, 3], HashMap{key => 1, term => 2, value => 3}, HashMap{key => HashMap{id => 123, name => alex}}, 0.1]"];
	//loop thru elements and convert to string
	for( var i = 0; i < testRes_2.length; i++ ){
		//convert test to string
		var tmpStr = arrToStr(testRes_2[i]);
		//check if string was converted correctly
		if( testVal_2[i] !== tmpStr ){
			//report
			alert("string conversion failed at element: " + i + ", result: " + tmpStr + ", while expecting: " + testVal_2[i]);
			//test failed
			testPassed = false;
		}
	}
	//return success/fail flag
	return testsPassed;
};


//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_util_tests() {
	//prompt
	alert("****starting testing utilities****");
	//test utilities
	alert("test__util returned: " + test__util());
};
