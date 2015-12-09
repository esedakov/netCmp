/**
	Developer:	Eduard Sedakov
	Date:		2015-12-05
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

//-----------------------------------------------------------------------------
// language EBNF
//-----------------------------------------------------------------------------

/*
PROGRAM: { FUNC_DEF | OBJ_DEF }* '.'
FUNC_DEF: 'function' TYPE ':' IDENTIFIER '(' [ FUNC_ARGS ] ')' '{' [ STMT_SEQ ] '}'
			e.g. function void foo ( integer a ) { ... }
OBJ_DEF: 'object' [ '<' TEMP_ARGS '>' ] IDENTIFIER [ ':' TYPE ] '{' [ OBJ_STMTS ] '}'
			e.g. object <int K> foo : parentFoo { ... }
FUNC_ARGS: TYPE_INST	//function arguments
TEMP_ARGS: TYPE_INST	//template arguments
OBJ_STMTS: SINGLE_OBJ_STMT { ',' SINGLE_OBJ_STMT }*
SINGLE_OBJ_STMT: DATA_FIELD_DECL | FUNC_DEF
DATA_FIELD_DECL: TYPE ':' IDENTIFIER
STMT_SEQ: STMT { ';' STMT }*
STMT: ASSIGN | VAR_DECL | FUNC_CALL | IF | WHILE_LOOP | RETURN | BREAK | CONTINUE
ASSIGN: 'let' DESIGNATOR '=' EXP
VAR_DECL: 'var' TYPE DESIGNATOR [ '=' EXP ]
FUNC_CALL: 'call' DESIGNATOR '(' [ FUNC_ARGS_INST ] ')'
FUNC_ARGS_INST: LOGIC_EXP { ',' LOGIC_EXP }*
IF: 'if' LOGIC_EXP '{' [ STMT_SEQ ] '}' [ 'else' '{' [ STMT_SEQ ] '}' ]
WHILE_LOOP: 'while' LOGIC_EXP '{' [ STMT_SEQ ] '}'
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

//obj_def:
//	=> syntax: 'object' [ '<' TEMP_ARGS '>' ] IDENTIFIER [ ':' TYPE ] '{' [ OBJ_STMTS
//					] '}'
//	=> semantic: 
//		TEMP_ARGS represents list of templates
//		IDENTIFIERs: first represents object name
//		TYPE: represents parent object
parser.prototype.process__objectDefinition = function(){
	//check if 'object' keyword starts object's definition
	if( this.isCurrentToken(TOKEN_TYPE.OBJECT) == false ){
		//this is not object definition, fail
		return FAILED_RESULT;
	}
	//consume 'object'
	this.next();
	//initialize array of template declarations
	var objDef_tempArr = [];
	//check if '<' is current token
	if( this.isCurrentToken(TOKEN_TYPE.LESS) == true ){
		//process template declarations
		objDef_tempArr = this.getIdentifierTypeList(
			-1,							//variable number of function arguments
			TOKEN_TYPE.LESS,			//opened paranthesis
			TOKEN_TYPE.GREATER,			//closed paranthesis
			true						//throw error on failure
		);	//produces: Array<{'id', 'type'}>
	}
	//try to parse identifier
	var objDef_id = this.process__identifier();
	//check if identifier faile to parse
	if( objDef_id == null ){
		//bug in user code
		this.error("missing identifier in the object declaration");
	}
	//initialize parent object for this object
	var objDef_prnRef = null;
	//check if next token is colon (':')
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == true ){
		//that means this object has a parent
		//consume ':'
		this.next();
		//parse type
		var objDef_typeRes = this.process__type();
		//check if parent type is parsed not successfully
		if( objDef_typeRes.success == false ){
			//unkown type
			this.error("parent object type is unknown; check spelling");
		}
		//extract type
		objDef_prnRef = objDef_typeRes.get(RES_ENT_TYPE.TYPE, false);
	}
	//make sure that next token is code open bracket ('{')
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//missing code open paranthesis
		this.error("missing '{' in the object definition");
	}
	//consume '{'
	this.next();
	//create object type
	var objDef_newTypeInst = new type(
		objDef_id, OBJ_TYPE.OBJ_CUSTOM, this.getCurrentScope(false)
	);
	//try to parse content of object
	this.process__objectStatements(objDef_newTypeInst);
	//if it did not crash that should mean statements were processed successfully
	//next token should be closing code bracket
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("missing '}' in the object definition");
	}
	//compose result set
	var objDef_resSet = {};
	objDef_resSet['name'] = objDef_id;
	objDef_resSet['parent'] = objDef_prnRef;
	objDef_resSet['templates'] = objDef_tempArr;
	return new Result(true, objDef_resSet);
};	//end function 'process__objectDefinition'

//obj_stmts:
//	=> syntax: SINGLE_OBJ_STMT { ',' SINGLE_OBJ_STMT }*
//	=> semantic: last object statement should not be have ',' at the end
//input(s):
//	t: (TYPE) => new object type whose data and method fields are being processed
parser.prototype.process__objectStatements = function(t){
	//init flag - is sequence non empty, i.e. has at least one statement
	var atLeastOneStmtProcessed = false;
	//init result variable to keep track of return value from object statement function
	var objStmtSeqRes = null;
	//loop thru statements
	do {
		//try to parse statement
		if( (objStmtSeqRes = this.process__singleObjectStatement(t)).success == false ) {
			//if sequence is non empty
			if( atLeastOneStmtProcessed ){
				//then, this is a bug in user code, since ',' is not followed
				//by a statement
				this.error("58457346822");
			}
			//otherwise, current tokens are not described by sequence of object statements
			//so, return failure
			return FAILED_RESULT;
		}
		//assert that there is at least one object statement processed
		atLeastOneStmtProcessed = true;
		//check if the next token is not ','
		if( this.isCurrentToken(TOKEN_TYPE.COMMA) == false ){
			//if no ',' found, then we reached the end of sequence, quit loop
			break;
		}
		//consume ','
		this.next();
	} while(true);	//end loop thru statements
	//send result back to caller
	return objStmtSeqRes;
};	//end function 'process__objectStatement'

//single_obj_stmt:
//	=> syntax: DATA_FIELD_DECL | FUNC_DEF
//	=> semantic: either data or method field
//input(s):
//	t: (TYPE) => new object type
parser.prototype.process__singleObjectStatement = function(){
	//init parsing result
	var singleObjStmtRes = null;
	//try two kinds of object statements
	if(
		//try to parse data field
		(singleObjStmtRes = this.process__dataFieldDeclaration()).success == false &&

		//try to parse function field
		(singleObjStmtRes = this.process__functionDefinition(t)).success == false
	){
		//failed to process single object statement
		return FAILED_RESULT;
	}
	//return result of single object statement
	return singleObjStmtRes;
};	//end function 'process__singleObjectStatement'

//data_field_decl:
//	=> syntax: TYPE ':' IDENTIFIER
//	=> semantic: no special semantics
parser.prototype.process__dataFieldDeclaration = function(){
	//initialize hash map to collect important data field information
	var dtFieldInfo = {};
	//try to process type
	var dtFldDeclRes_Type = this.process__type();
	//if type was not processed successfully
	if( dtFldDeclRes_Type.success == false ){
		//it is not data field, fail
		return FAILED_RESULT;
	}
	//get the type
	dtFieldInfo['type'] = dtFldDeclRes_Type.get(RES_ENT_TYPE.TYPE, false);
	//make sure that the next token is colon (':')
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == false ){
		//we have already processed type, so we cannot just fail
		//it must be bug in user code
		this.error("missing ':' in object's data field declaration");
	}
	//consume ':'
	this.next();
	//try to parse identifier
	var dtFldDeclRes_Id = this.process__identifier();
	//check if identifier parsing failed
	if( dtFldDeclRes_Id == null ){
		//bug in user code, it must be identifier
		this.error("missing identifier after ':' in object's data field declaration");
	}
	//save identifier
	dtFieldInfo['id'] = dtFldDeclRes_Id;
	//return data field information to the caller
	return new Result(
		true,
		dtFieldInfo
	);
};	//end function 'process__dataFieldDeclaration'

//func_def:
//	=> syntax: 'function' TYPE ':' IDENTIFIER '(' [ FUNC_ARGS ] ')' '{' [ STMT_SEQ ] '}'
//	=> semantic: statement sequence is postponed in processing until all function
//			and type definitions are processed
//input(s):
//	t: type where to declare this function
parser.prototype.process__functionDefinition = function(t){
	//ensure that first token is 'function'
	if( this.isCurrentToken(TOKEN_TYPE.FUNC) == false ){
		//first token is not a function, so fail
		return FAILED_RESULT;
	}
	//consume 'function'
	this.next();
	//get function return type
	var funcDefRes_RetType = this.process__type();
	//check that type has been processed correctly
	if( funcDefRes_RetType.success == false ){
		//function is missing return type specifier, error
		this.error("missing type specifier in function definition");
	}
	//try to get processed type (returned result is an array)
	var funcRetType = funcDefRes_RetType.get(RES_ENT_TYPE.TYPE, false);
	//check that array contains (exactly) one item
	if( funcRetType.length == 1 ){
		//assign type to a variable
		funcRetType = funcRetType[0];
	} else {
		//type processing failed to return type
		this.error("could not process return type specifier in function definition");
	}
	//check that the next token is colon (':')
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == false ){
		//missing colon
		this.error("missing colon in function definition");
	}
	//consume colon (':')
	this.next();
	//get function name
	var funcName = this.process__identifier();
	//check that function name was processed incorrectly
	if( funcName == null ){
		//failed to parse function name
		this.error("failed to parse function name in function definition");
	}
	//check that the next token is '(' (open paranthesis)
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//missing open paranthesis
		this.error("missing open paranthesis in function definition");
	}
	//get current scope (false: do not remove scope from the stack)
	var funcDefCurScp = this.getCurrentScope(false);
	//determine function type from the name
	var funcDefNameType = functinoid.detFuncType(funcName);
	//create function object
	var funcDefObj = new functinoid(
		funcName,			//function name
		funcDefCurScp,		//scope around function
		funcDefNameType,	//function type derived from the name
		funcRetType			//return type
	);
	//if type was passed in, where this function should be declared
	if( t ){
		//add function to the given type
		t.addMethod(funcName, funcDefObj);
	}
	//process function arguments
	var funcDefRes_FuncArgs = this.getIdentifierTypeList(
		-1,							//variable number of function arguments
		TOKEN_TYPE.PARAN_OPEN,		//opened paranthesis
		TOKEN_TYPE.PARAN_CLOSE,		//closed paranthesis
		true						//throw error on failure
	);
	//loop thru function arguments and create appropriate symbols and commands
	for( var i = 0; i < funcDefRes_FuncArgs.length; i++ ){
		//get current function argument instance
		var tmpCurArg = funcDefRes_FuncArgs[i];
		//get argument name
		var tmpName = tmpCurArg.id.get(RES_ENT_TYPE.TEXT, false);
		//ensure that name was found
		if( tmpName.length == 0 ){
			this.error("5784578937");
		}
		//assign argument name
		tmpName = tmpName[0];
		//get type
		var tmpType = tmpCurArg.type.get(RES_ENT_TYPE.TYPE, false);
		//ensure that type was found
		if( tmpType.length == 0 ){
			this.error("9898947784782");
		}
		//assign argument type
		tmpType = tmpType[0];
		//create symbol for this function argument
		var tmpFuncArgSymb = new symbol(
			tmpName,			//argument name
			tmpType,			//argument type
			funcDefObj._scope	//function's scope
		);
		//add argument to function
		funcDefObj._scope.addSymbol(tmpFuncArgSymb);
		//create POP command for this argument
		var pop_cmd_curArg = funcDefObj._scope._current.createCommand(
			COMMAND_TYPE.POP,		//command for retrieving argument from the stack
			[],						//command takes no arguments
			[tmpFuncArgSymb]		//symbol representing current function argument
		);
	}
	//check if next token is code-bracket-open (i.e. '{')
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//if not, then fail
		this.error("22449293787892");
	}
	//consume '{'
	this.next();
	//get token index for closing paranthesis ('}') and check if it was found
	//initialize counter for curly brackets ('{' and '}'), which is incremented
	//whenever we find '{' and decrement when find '}'. Set the counter at 1
	var cntCurlyBrackets = 1;	//priorly found '{' starts function code segment
	//initialize separate token indexes for traversing tokens
	var curTkIdx = this._curTokenIdx;
	//loop thru sets of tokens, until temporary 'current token index' is still valid
	while( curTkIdx >= this._tokens.length ){
		//check if current token is opening curly bracket
		if( this._tokens[curTkIdx].type.value == TOKEN_TYPE.CODE_OPEN.value ){
			//found code open bracket, increment counter
			cntCurlyBrackets++;
		} else if( this._tokens[curTkIdx].type.value == TOKEN_TYPE.CODE_CLOSE.value ){
			//found code close bracket, decrement counter
			cntCurlyBrackets--;
		}	//end if current toke is code open bracket
		//quit loop, when we find closing curly bracket for function code
		if( cntCurlyBrackets == 0 ){
			break;
		}	//end if token index is valid
		//increment to the next token
		curTkIdx++;
	}	//end loop thru token set
	//check if we found '}' that closes function code body
	if( curTkIdx != 0 ){
		//reached the end of program, but have not found closing bracket for
		//this function, this has to be a user code bug
		this.error("missing '}' for function code block");
	}
	//if there is a code inside function, then create task
	if( this._curTokenIdx + 1 != curTkIdx ){
		//create function body block where goes the actual code
		//	Note: the current block is designed for function arguments
		var tmpFuncBodyBlk = funcDefObj._scope.createBlock(true);
		//create task
		this.addTask(
			this._curTokenIdx,	//token that follows first '{'
			curTkIdx,			//token that corresponds '}'
			funcDefObj._scope,	//function's scope
			tmpFuncBodyBlk		//function body block
		);
	}
	//ensure that the next token is '}'
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//close code bracket not found, this is parser's errors
		this.error("parser error => 873986278946736473643786");
	}
	//consume '}'
	this.next();
	//remove function scope from the stack
	this._stackScp.pop();
	//create result set
	var tmpResSet = {};
	//include function reference to the result set
	tmpResSet[RES_ENT_TYPE.FUNCTION.value] = funcDefObj;
	//return function instance
	return new Result(
		true,		//success
		tmpResSet	//result set that contains function reference
	);
};	//end func_def

//parse through list of type-identifier pairs (e.g. 'int K', 'Array<text> s', ...)
//	and return resulting array
//input(s):
//	cnt: (integer) => expected number of type-identifier pairs to process. If this
//		argument is '-1' then parse as many pairs as possible
//	start: (TOKEN_TYPE) => type of token, which starts the list of type-identifier pairs
//	end: (TOKEN_TYPE) => type of token, which ends the list of type-identifier pairs
//	doErrorOnFailure: (boolean) should this function trigger error, if any rule fails:
//		1. number of type-identifier pairs does not match given count (i.e. 'cnt')
//		2. either start or end token type does not match parsed tokens
//output(s):
//	(Array<{id: TEXT, type: TYPE}>) => array of hasmaps, where each hashmap represents
//		single type-identifier pair. For example, 'int k' => {id:'k', type:INT}
parser.prototype.getIdentifierTypeList = 
	function(cnt, start, end, doErrorOnFailure){
	//init array for storing type-identifier pair list
	var typeIdArr = [];
	//ensure that the first token is as specified by START
	if( this.isCurrentToken(start) == false ){
		//if it is not START and caller wants any failure trigger error
		if( doErrorOnFailure ){
			this.error("1283728372");
		}
		//if no need to raise error, then simply return empty array
		return [];
	}//end if current token is START
	//consume next token
	this.next();
	//init counter to count iterations
	var i = 0;
	while( cnt == -1 || i < cnt ){
		//if it is not 0th element, then ensure that there is a ',' (separator)
		//	needed between adjacent elements in the identifier-type list
		if( i > 0 ){
			//check that current token is comma
			if( this.isCurrentToken(TOKEN_TYPE.COMMA) == false ){
				//there are no more list element to process
				//if do not need to find an exact number of elements in the list
				//then we have to quit now
				if( cnd == -1 ){
					break;
				}
				//on the other hand, if need fixed number of list elements
				//and this count has not been yet satisfied, then function
				//failed at finding correct amount of list elements
				//if need to fail with error
				if( doErrorOnFailure ){
					this.error("7487384788378");
				}
				//otherwise, return empty array
				return [];
			}
			//if it is comma, then consume it
			this.next();
		}	//end if it is not 0th element
		//expecting list elements to be of the following format: TYPE IDENTIFIER
		//try process type
		var typeIdRes_type = this.process__type();
		//check if type was not processed successfully
		if( typeIdRes_type.success == false ){
			//type parsing failed
			//if it is 0th element, then this list can be empty
			if( i == 0 ){
				//if so, then just quit loop
				break;
			} else {
				//otherwise, we have already consumed ',' and there should be
				//type-identifier element. If there is no such element pair,
				//then this user code bug
				if( doErrorOnFailure ) {
					this.error("3246736786673");
				}
				return [];
			}	//end if it is 0th element
		}	//end if type parsing failed
		//try to parse identifier
		var typeIdRes_id = this.process__identifier();
		//check if identifier is not processed successfully
		if( typeIdRes_id == null ){
			//this is user code bug
			if( doErrorOnFailure ){
				this.error("3847932779824");
			}
			return [];
		}	//end if id was not processed successfully
		//add type-identifier to the list
		typeIdArr.push({id: typeIdRes_id, type: typeIdRes_type});
		//increment element counter
		i++;
	}	//end loop thru type-identifier pair list
	//check that the next token matches END
	if( this.isCurrentToken(END) == false ){
		//if user code bug, should be errored
		if( doErrorOnFailure ){
			this.error("2837282798651");
		}
		//otherwise, simply return empty list
		return [];
	}
	//consume END
	this.next();
	//return array of processed type-identifier pairs
	return typeIdArr;
};	//end function 'getIdentifierTypeList'

//stmt:
//	=> syntax: ASSIGN | VAR_DECL | FUNC_CALL | IF | WHILE_LOOP | RETURN 
//				| BREAK | CONTINUE
//	=> semantic: try various statements and return first that succeeds
parser.prototype.process_statement = function(){
	//init parsing result
	var stmtRes = null;
	//try various kinds of statements
	if(
		//process assignment statement
		(stmtRes = this.process__assign()).success == false &&

		//process variable declaration statement
		(stmtRes = this.process__variableDeclaration()).success == false &&

		//process function call statement
		(stmtRes = this.process__functionCall()).success == false &&

		//process if statement statement
		(stmtRes = this.process__if()).success == false &&

		//process while loop statement
		(stmtRes = this.process__while()).success == false &&

		//process return statement
		(stmtRes = this.process__return()).success == false &&

		//process break statement
		(stmtRes = this.process__break()).success == false &&

		//process continue statement
		(stmtRes = this.process__continue()).success == false
	){
		//failed to process statement
		return FAILED_RESULT;
	}
	//send result back to caller
	return stmtRes;
};	//end stmt

//stmt_seq:
//	=> syntax: STMT { ';' STMT }*
//	=> semantic: last statement does not have ';' at the end, this way my
//		parser figures out that it finished processing sequence successfully.
parser.prototype.process__sequenceOfStatements = function(){
	//init flag - is sequence non empty, i.e. has at least one statement
	var isSeqNonEmpty = false;
	//init result variable to keep track of return value from statement function
	var stmtSeqRes = null;
	//loop thru statements
	do{
		//try to parse statement
		if( (stmtSeqRes = this.process__statement()).success == false ){
			//if sequence is non empty
			if( isSeqNonEmpty ){
				//then, this is a bug in user code, since ';' is not followed
				//by a statement (see semantic notes for this function)
				this.error("94738783939");
			}
			//otherwise, current tokens are not described by sequence of statements
			//so, return failure
			return FAILED_RESULT;
		}
		//assert that sequence is non-empty
		isSeqNonEmpty = true;
		//check if the next token is not ';'
		if( this.isCurrentToken(TOKEN_TYPE.SEMICOLON) == false ){
			//if no ';' found, then we reached the end of sequence, quit loop
			break;
		}
		//if there is ';', then consume it
		this.next();
	} while(true);	//end loop thru statements
	//send result back to caller
	return stmtSeqRes;
};	//end stmt_seq

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
			(progRes = this.process__functionDefinition(null)).success == false &&

			//process tokens as object definition
			(progRes = this.process__objectDefinition()).success == false
		){
			//failed to process program, quit
			return FAILED_RESULT;
		}
		//*** for function, we may need to create a symbol in global scope
		//*** for objects, we may need to create a symbol in global scope
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
};	//end program