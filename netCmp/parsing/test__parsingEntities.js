/**
	Developer:	Eduard Sedakov
	Date:		2015-10-14
	Description:	test file for parsing entities
	Used by:	(testing)
	Dependencies:	token, type__token
**/

//test empty string
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__util() {
	//maintain info whether tests failed or passed
	var testsPassed = true;
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
