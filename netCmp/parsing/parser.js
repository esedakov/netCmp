/**
	Developer:	Eduard Sedakov
	Date:		2015-12-03
	Description:	parsing components
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
	//make sure that set of resulting tokens is not empty
	if( this._tokens.length == 0 ){
		throw new Error("345367576445");
	}
	//initialize parsing variables
	this._curTokenIdx = 0;	//current token index
	this._curLineIdx = 0;		//current code line (for error reporting) number
	this._curLineToken = 0;	//currently analyzed token index on the current line
	this._gScp = null;		//global scope
	//first create program with global scope
	var prog = new program();
	//setup global scope
	this._gScp = prog.getGlobalScope();
	//make sure that global scope is set correctly
	if( this._gScp == null || this._gScp._owner !== null ){
		throw new Error("12837862728");
	}
	//initialize task scheduling queue
	this._taskQueue = [];
	//stack of scopes
	this._stackScp = [];
	//include global scope in the stack
	this.addCurrentScope(this._gScp);
	//TODO: perform initialization of all types
};	//end constructor 'parser'

//-----------------------------------------------------------------------------
// General parsing functions
//-----------------------------------------------------------------------------

//get current token
//input(s): (none)
//output(s):
//	(token) => current token OR if index of current token is not valid, then the last
//			available token in lexed code
parser.prototype.current = function(){
	//if current token is not valid
	if( this._curTokenIdx > 0 && this._curTokenIdx < this._tokens.length ){
		//make sure that set of tokens is not empty
		if( this._tokens.length == 0 ){
			throw new Error("8784734678638");
		}
		//reset to the last available token
		this._curTokenIdx = this._tokens.length - 1;
	}	//end if current token is not valid
	//access and return current token
	return this._tokens[this._curTokenIdx];
};	//end function 'current' to access current token

//check if the current token is of given type
//input(s):
//	tknTp: (TOKEN_TYPE) type of the token to check with current token type
//output(s):
//	(boolean) => {true} if current token matches given type, and {false} otherwise
parsing.prototype.isCurrentToken = function(tknTp){
	//compare current token with given token type
	return this.current().type.value == tknTp.value;
};	//end function 'isCurrentToken'

//advance to next token and update any parsing variables
//input(s): (none)
//output(s):
//	(boolean) => {true} if successfully advanced to the next token, {false} otherwise
parser.prototype.next = function(){
	//advance to the next token
	this._curTokenIdx++;
	//next token on the current line
	this._curLineToken++;
	//loop while current token is a new line
	while( this.current().type.value == TOKEN_TYPE.NEWLINE.value ){
		//skip to next token
		this._curTokenIdx++;
		//increase current line index
		this._curLineIdx++;
		//reset index of token on the current line
		this._curLineToken = 0;
		//check that we have not exceeded the token set
		if( this._curTokenIdx >= this._tokens.length ){
			//then, there are no more tokens to process
			return false;
		}
	}
	//if reached this line, then successfully, advanced to next token
	return true;
};	//end function 'next' to advance to next token

//general method for reporting parsing error
//input(s):
//	errMsgTxt: (text) => error text message
//output(s): (none)
parser.prototype.error = function(errMsgTxt){
	//throw error
	throw new Error("error " + errMsgTxt + " => on line : " + 
		this._curLineIdx + ", token index : " +
		this._curLineToken
	);
};	//end function 'error'

//-----------------------------------------------------------------------------
// Stack of scopes to track current scope and order of previously analyzed
//-----------------------------------------------------------------------------

//get current scope
//input(s):
//	doPopScope: (boolean) => should current scope be poped/removed from stack?
//output(s): (scope) last scope entry in the stack, which should be the
//	most recently added scope to the stack, i.e. currently used scope
parser.prototype.getCurrentScope = function(doPopScope){
	//initialize variable for last entry in scope stack
	var lastEntr = null;
	//make sure that scope stack is not empty
	if( this._stackScp.length > 0 ){
		//get last entry in the stack
		lastEntr = this._stackScp[this._stackScp.length - 1];
		//should last entry be removed
		if( doPopScope ){
			//remove current scope from the stack
			this._stackScp.pop();
		}
	}
	//return last entry, if such exists
	return lastEntr;
};	//end function 'getCurrentScope'

//add scope to the stack
//input(s): (scope) new scope to be added to the stack
//output(s): (none)
parser.prototype.addCurrentScope = function(scp){
	//add scope to the stack
	this._stackScp.push(scp);
};	//end function 'addCurrentScope'

//re-initialize stack of scopes to contain only global scope
//input(s): (none)
//output(s): (none)
parser.prototype.reInitScopeStack = function(){
	//reset stack of scopes
	this._stackScp = [ this._gScp ];
};	//end function 'reInitScopeStack'
//-----------------------------------------------------------------------------
// parsing task scheduling
//-----------------------------------------------------------------------------
// Description:
//	Parsing process has to be split into 2 general phases: (1) definitions and
//	(2) code.
//	1 - in this phase, all objects (a.k.a. types) and function definitions are
//	registered, without actually parsing thru their function code segments.
//	2 - second phase is designated for actual code parsing. That is when code
//	inside functions is processed, so this phase can also be called as function
//	code handling phase.
// Reason:
//	I want all types (a.k.a. object definitions) and function definitions to be
//	registered (available in parser memory) when I start going thru actual code,
//	so that: (1) I can do type checking, (2) catch undefined type or function
//	usage bugs.
//-----------------------------------------------------------------------------

//add scheduling task to process code snippet later on (in 2nd phase)
//input(s):
//	start: starting token index for postponed code snippet
//	end: ending token index for postponed code snippet
//	scp: current scope where this code snippet was discovered
//	blk: starting block for this code snippet
//output(s): (none)
parser.prototype.addTask = function(start, end, scp, blk){
	//add new task entry
	this._taskQueue.push({

		//save information to restart processing, later on
		start: start,
		end: end,
		scp: scp,
		blk: blk,

		//also save indexes for token in the current line, and current line index
		curLnTkn: this._curLineToken,
		curLnIdx: this._curLineIdx
	});
};	//end function 'addTask'

//reset parsing state variables to the given state
//input(s):
//	tk: (task; there is no such object, actually) => hashmap with several fields
//		that allow to mimic parsing state needed to process code block
parser.prototype.loadTask = function(tk){
	//reset current token
	this._curTokenIdx = tk.start;
	//re-initialize stack of scopes
	this.reInitScopeStack();
	//add current scope to the stack
	this.addCurrentScope(tk.scp);
	//reset current block
	this.getCurrentScope(false)._current = tk.blk;
};	//end function 'loadTask'

//process given file into a set of tokens
	this._tokens = l.process(code);
	//make sure that set of resulting tokens is not empty
	if( this._tokens.length == 0 ){
		throw new Error("345367576445");
	}
	//initialize parsing variables
	this._curTokenIdx = 0;	//current token index
	this._curLineIdx = 0;		//current code line (for error reporting) number
	this._curLineToken = 0;	//currently analyzed token index on the current line
	this._gScp = null;		//global scope
	//first create program with global scope
	var prog = new program();
	//setup global scope
	this._gScp = prog.getGlobalScope();
	//make sure that global scope is set correctly
	if( this._gScp == null || this._gScp._owner !== null ){
		throw new Error("12837862728");
	}
	//initialize task scheduling queue
	this._taskQueue = [];
	//stack of scopes
	this._stackScp = [];

//-----------------------------------------------------------------------------
// language EBNF
//-----------------------------------------------------------------------------

/*
PROGRAM: { FUNC_DEF | OBJ_DEF }* '.'
FUNC_DEF: 'function' TYPE ':' IDENTIFIER '(' FUNC_ARGS ')' '{' STMT_SEQ '}'
			e.g. function void foo ( integer a ) { ... }
OBJ_DEF: 'object' '<' TEMP_ARGS '>' IDENTIFIER ':' IDENTIFIER '{' OBJ_STMTS '}'
			e.g. object <int K> foo : parentFoo { ... }
FUNC_ARGS: TYPE_INST	//function arguments
TEMP_ARGS: TYPE_INST	//template arguments
OBJ_STMTS: [ SINGLE_OBJ_STMT { ',' SINGLE_OBJ_STMT }* ]
SINGLE_OBJ_STMT: DATA_FIELD_DECL | FUNC_DEF
DATA_FIELD_DECL: TYPE ':' IDENTIFIER
STMT_SEQ: [ STMT { ';' STMT }* ]
STMT: ASSIGN | VAR_DECL | FUNC_CALL | IF | WHILE_LOOP | RETURN | BREAK | CONTINUE
ASSIGN: 'let' DESIGNATOR '=' EXP
VAR_DECL: 'var' TYPE DESIGNATOR [ '=' EXP ]
FUNC_CALL: 'call' DESIGNATOR '(' FUNC_ARGS_INST ')'
FUNC_ARGS_INST: [ LOGIC_EXP { ',' LOGIC_EXP }* ]
IF: 'if' LOGIC_EXP '{' STMT_SEQ '}' [ 'else' '{' STMT_SEQ '}' ]
WHILE_LOOP: 'while' LOGIC_EXP '{' STMT_SEQ '}'
RETURN: 'return' EXP
BREAK: 'break'
CONTINUE: 'continue'
LOGIC_EXP: LOGIC_TERM { '|' LOGIC_TERM }*
LOGIC_TERM: REL_EXP { '&' REL_EXP }*
REL_EXP: EXP [ REL_OP EXP ]
REP_OP: '==' | '=<' | '<' | '>' | '>=' | '<>'
EXP: TERM { ('+' | '-') TERM }*
TERM: FACTOR { ('*' | '/') factor }*
FACTOR: DESIGNATOR | SINGLETON | FUNC_CALL | '(' LOGIC_EXP ')'
SINGLETON: INT | FLOAT | TEXT | BOOL
INT: { '0' | ... | '9' }*
FLOAT: INT '.' INT 	//not accurate, but it is handled by LEXER anyway
TEXT: '"' { #ANY_SYMBOL# }* '"'
BOOL: 'true' | 'false'
DESIGNATOR: IDENTIFIER [ '[' LOGIC_EXP ']' ] [ '.' DESIGNATOR ]
TYPE: IDENTIFIER [ '<' TYPE { ',' TYPE }* '>' ]
TYPE_INST: [ TYPE IDENTIFIER { ',' TYPE IDENTIFIER }* ]	//type instantiation exp
IDENTIFIER: { 'a' | ... | 'z' | 'A' | ... | 'Z' | '0' | ... | '9' | '_' }*
*/

//-----------------------------------------------------------------------------
// parsing components
//-----------------------------------------------------------------------------

//program:
//	=> syntax: { function | object_definition }*
//	=> semantic: function 'main' should be provided by the user, or a fake
//			main function will be created by interpreter and it simply will
//			quit right away (i.e. do nothing)
parser.prototype.process__program = function(){
	//phase 1 -- process defintions, and add tasks for statement sequence
	//	to process them later on, in the second phase

	//Try to parse program
	do{
		//init variable for keeping track of result returned by parsing functions
		var progRes = null;
		//check if program cannot be processed, i.e. it is neither 
		//	function nor object definitions
		if(
			//process tokens as function definition
			(progRes = this.process__functionDefinition()).success == false &&

			//process tokens as object definition
			(progRes = this.process__objectDefinition()).success == false
		){
			//failed to process program, quit
			return FAILED_RESULT;
		}
		//check if the next token is '.'
		if( this.isCurrentToken(TOKEN_TYPE.PERIOD) ){
			//found end of program, so break out of loop
			break;
		} else if( this.isCurrentToken(TOKEN_TYPE.SEMICOLON) ){
			//consume this token (skip to the next token)
			this.next();
		}
	} while(true);	//end loop to parse program

	//Phase # 2 -- process function code snippets

	//init index for looping thru tasks and process
	var curTaskIdx = 0;
	//loop thru tasks and process each one of them
	for( ; curTaskIdx < this._taskQueue.length; curTaskIdx++ ){
		//load currently iterated task into parser
		this.loadTask(this._taskQueue[curTaskIdx]);
		//execute statements for this code snippet
		this.seqStmts();
	}	//end loop thru tasks
};