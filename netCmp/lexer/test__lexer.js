/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	check lexer
	Used by:	(testing)
	Dependencies:	lexer, token, type__token
**/

//global: lexer
var lx = lexer();

//utility function for printing result of lexing input string
//input(s):
//	input => (String) input string that was fed to lexer
//	resultLexArr => (Array<Token>) resulting token array, produced by lexer
//	expTokTypes => (Array<Token_Type>) anticipated/expected array of token types
//output(s):
//	{String, bool} => {report on lexing given input string, success/fail}
function printAndCheckResults(input, resultLexArr, expTokTypes) {
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
		var isMatching = resultLexArr[i].type == expTokTypes[i].type;
		msg += " => " + isMatching;
		//if does not match, then fail
		if( !isMatching ) {
			//abort
			return { message: msg, success: false };
		}
	}
	//return success
	return { message: msg, success: true };
};

//test single word
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function singleton() {
	return printAndCheckResults("word", lx.process("word"), [TOKEN_TYPE.TEXT]);
};

//test declaration statement
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function decl() {
	return printAndCheckResults("var int a_123;", 
		lx.process("var int a_123"),
		[TOKEN_TYPE.VAR, TOKEN_TYPE.INTTYPE, TOKEN_TYPE.TEXT, TOKEN_TYPE.SEMICOLON]);
};

//test assignment statement
//input(s): none
//output(s):
//	{message, success} => {message that describes returned token types, is lexing successful}
function assignment() {
	return printAndCheckResults("let a123 = 'hello world';",
		lx.process("let a123 = 'hello world'"),
		[TOKEN_TYPE.LET, TOKEN_TYPE.TEXT, TOKEN_TYPE.EQUAL, TOKEN_TYPE.SINGLEQUOTE, TOKEN_TYPE.TEXT, TOKEN_TYPE.TEXT, TOKEN_TYPE.SINGLEQUOTE, TOKEN_TYPE.SEMICOLON]);
};

//test assignment statement
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function run_tests() {
	//initialize message string
	var msg = "";
	//initialize temporary result variable
	var testObj = null;
	//check if singleton passed?
	if( (testObj = singleton()).success == false ){
		alert(testObj.message);
	}
};
