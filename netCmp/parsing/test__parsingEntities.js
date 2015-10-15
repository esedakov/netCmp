/**
	Developer:	Eduard Sedakov
	Date:		2015-10-14
	Description:	test file for parsing entities
	Used by:	(testing)
	Dependencies:	token, type__token
**/

//parent class
function parent(){//a,b){
	this._a = "hello";//a;
	this._b = "world";//"_" + b + "-";
};
parent.prototype.print = function(){
	alert(this._a + this._b);
};
parent.prototype.areEqual = function(another){
	//check that 'another' is an [object]
	if( typeof another == "object" ){
		//check that 'print' function is defined
		if( typeof another.print == "function" ){
			//check that '_a' and '_b' are defined
			if( typeof another._a !== "undefined" && typeof another._b !== "undefined" ){
				//assume they are of the same types, so compare
				return another._a == this._a && another._b == this._b;
			}//end if _a and _b are defined
		}//end if print is defined
	}//end if another is an object
};
function child(){//a,b,c){
	//build parent relationship
	this.ctorParent(parent);//, a, b);
	//assign remaining argument
	this._c = "marco pollo";//c;
};
child.inheritFrom(parent);
child.prototype.fullPrint = function(){
	//invoke parent's print
	this.print();
	//now print '_c'
	alert(this._c);
};

//test empty string
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__util() {
	//1.test inheritance
	//construct parent class
	var p = new parent();//"hello", "world!");
	//construct child (c <- p)
	var c = new child();//"hello", "world", "marco?, pollo?");
	//call print on parent
	p.print();
	//call print on child
	c.print();
	//equalize child and parent (since _a and _b are equal, they should be be considered equal)
	c.areEqual(p);
};


//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_parsing_entities_tests() {
	//prompt
	alert("****starting testing tokens****");
	//test utilities
	test__util();
};
