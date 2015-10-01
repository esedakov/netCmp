/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	check lexer
	Used by:	(testing)
	Dependencies:	lexer, token, type__token
**/

//global: lexer
var lx = new lexer();

//utility function for printing result of lexing input string
//input(s):
//	input => (String) input string that was fed to lexer
//	resultLexArr => (Array<Token>) resulting token array, produced by lexer
//	expTokTypes => (Array<Token_Type>) anticipated/expected array of token types
//output(s):
//	{String, bool} => {report on lexing given input string, success/fail}
function printAndCheckResults(input, expTokTypes) {
	//process input and get list of tokens
	var resultLexArr = lx.process(input);
	//initialize resulting message
	var msg = "";
	//print {{input}}
	msg += "message: " + input + "\r\n";
	//check if resulting and expected arrays are of the same length, if not error out and abort
	if( resultLexArr.length != expTokTypes.length ) {
		msg += "\tresulting array does not have correct number of elements, i.e. result.length = " + resultLexArr.length + ", whereas expected: " + expTokTypes.length + "\r\n";
		//abort => failure
		return { message: msg, success: false };
	}
	//init loop counter
	var i = 0;
	//loop thru lexed array
	while( i < resultLexArr.length ) {
		//print current type
		msg += "\tat [" + i + "] := " + resultLexArr[i].type.name;
		//check if this type matches what was expected
		var isMatching = resultLexArr[i].type == expTokTypes[i];
		msg += " => " + isMatching;
		//if does not match, then fail
		if( !isMatching ) {
			//abort
			return { message: msg, success: false };
		}
		//go to next element
		i++;
	}
	//return success
	return { message: msg, success: true };
};

//test single word
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function singleton() {
	return printAndCheckResults("word", [TOKEN_TYPE.TEXT]);
};

//test declaration statement
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function decl() {
	return printAndCheckResults("var int a_123;", 
		[TOKEN_TYPE.VAR, TOKEN_TYPE.INTTYPE, TOKEN_TYPE.TEXT, TOKEN_TYPE.SEMICOLON]);
};

//test assignment statement
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function assignment() {
	return printAndCheckResults("let a123 = 'hello world';",
		[TOKEN_TYPE.LET, TOKEN_TYPE.TEXT, TOKEN_TYPE.EQUAL, TOKEN_TYPE.SINGLEQUOTE, TOKEN_TYPE.TEXT, TOKEN_TYPE.TEXT, TOKEN_TYPE.SINGLEQUOTE, TOKEN_TYPE.SEMICOLON]);
};

//test assignment statement
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function multiple_stmts() {
	return printAndCheckResults("var i; var k; var j = 0; let k = j - true; let i = (k + j) * (k / j) - 123.987;",
		[TOKEN_TYPE.VAR, TOKEN_TYPE.TEXT, TOKEN_TYPE.SEMICOLON, 
		TOKEN_TYPE.VAR, TOKEN_TYPE.TEXT, TOKEN_TYPE.SEMICOLON,
		TOKEN_TYPE.VAR, TOKEN_TYPE.TEXT, TOKEN_TYPE.EQUAL, TOKEN_TYPE.NUMBER, TOKEN_TYPE.SEMICOLON,
		TOKEN_TYPE.LET, TOKEN_TYPE.TEXT, TOKEN_TYPE.EQUAL, TOKEN_TYPE.TEXT, TOKEN_TYPE.MINUS, TOKEN_TYPE.TRUE, TOKEN_TYPE.SEMICOLON,
		TOKEN_TYPE.LET, TOKEN_TYPE.TEXT, TOKEN_TYPE.EQUAL, TOKEN_TYPE.PARAN_OPEN, TOKEN_TYPE.TEXT, TOKEN_TYPE.PLUS, TOKEN_TYPE.TEXT, TOKEN_TYPE.PARAN_CLOSE, 
			TOKEN_TYPE.MULTIPLY, TOKEN_TYPE.PARAN_OPEN, TOKEN_TYPE.TEXT, TOKEN_TYPE.DIVIDE, TOKEN_TYPE.TEXT, TOKEN_TYPE.PARAN_CLOSE, TOKEN_TYPE.MINUS,
			TOKEN_TYPE.FLOAT, TOKEN_TYPE.SEMICOLON]);
};

//test assignment statement
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function run_tests_lexer() {
	//prompt
	alert("****starting testing lexer****");
	//init success flag
	var success = true;
	//initialize message string
	var msg = "";
	//initialize temporary result variable
	var testObj = null;
	//check if singleton passed?
	if( (testObj = singleton()).success == false ){
		alert(testObj.message);
		success = false;
	}
	//check if declaration passed?
	if( (testObj = decl()).success == false ){
		alert(testObj.message);
		success = false;
	}
	//check if assignment statements passed?
	if( (testObj = assignment()).success == false ){
		alert(testObj.message);
		success = false;
	}
	//check if multiple statements passed?
	if( (testObj = multiple_stmts()).success == false ){
		alert(testObj.message);
		success = false;
	}
	//return success flag
	return success;
};
