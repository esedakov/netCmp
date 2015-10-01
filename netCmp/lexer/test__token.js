/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	check token
	Used by:	(testing)
	Dependencies:	token, type__token
**/

//test empty string
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__emptyString() {
	return Token("").type == TOKEN_TYPE.ERROR;
};

//test number (integer)
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__inumber() {
	//generate random number and convert to string
	var num = "" + Math.floor(Math.random() * 100);
	return Token(num).type == TOKEN_TYPE.NUMBER;
};

//test float number
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__fnumber() {
	//generate two random integer numbers
	var fnum = "" + Math.floor(Math.random() * 100) + "." + Math.floor(Math.random() * 100);
	return Token(fnum).type == TOKEN_TYPE.FLOAT;
};

//test text
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__text() {
	return Token("abc_def__ghi_jklmnop_qrt1234567890uvwxyzZYXWVUTRQPONMLKJIHGFEDCBA").type == TOKEN_TYPE.TEXT;
};

//test comments
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__comments() {
	return Token("/*").type == TOKEN_TYPE.COMMENTSTART &&
		Token("*/").type == TOKEN_TYPE.COMMENTEND &&
		Token("//").type == TOKEN_TYPE.COMMENT;
};

//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_tests_tokens() {
	//prompt
	alert("****starting testing tokens****");
	//initialze message string
	var msg = "";
	//check if empty string is handled correctly
	if( test__emptyString() == false ) {
		msg += "empty string is not handled correctly\r\n";
	}
	//check if empty string is handled correctly
	if( test__inumber() == false ) {
		msg += "integer number is not handled correctly\r\n";
	}
	//check if empty string is handled correctly
	if( test__fnumber() == false ) {
		msg += "floating point number is not handled correctly\r\n";
	}
	//check if empty string is handled correctly
	if( test__text() == false ) {
		msg += "text string is not handled correctly\r\n";
	}
	//return message
	return msg;
};
