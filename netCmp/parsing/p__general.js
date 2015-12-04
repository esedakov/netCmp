/**
	Developer:	Eduard Sedakov
	Date:		2015-12-03
	Description:	generic parsing functions, which are used by every parsing component
	Used by:	(testing)
	Dependencies: {lexer},{parsing types},{parsing obj}
**/

//class offsers general parsing functions to go through lexed code
//input(s):
//	code: (text) => string representing of code to parse
//output(s): (none)
function parser(code){
	//make sure that code is not empty string
	if( fileName == "" ){
		throw new Error("784789749832");
	}
	//save code in the form of array, sliced by new line character, such that each
	//array item represents a code line
	this._code = fileName.split('\n');
	//create new lexer
	var l = new lexer();
	//process given file into a set of tokens
	this._tokens = l.process(code);
	//initialize parsing variables
	this._curTokenIdx = 0;	//current token index
	this._curLine = 0;		//current code line (for error reporting) number
	this._curLineToken = 0;	//currently analyzed token index on the current line
	this._gScp = null;		//global scope
	//first create program with global scope
	var prog = new program();
	//setup global scope
	this._gScp = prog.getGlobalScope();
	//TODO: perform initialization of all types
};