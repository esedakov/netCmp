/**
	Developer:	Eduard Sedakov
	Date:		2015-12-05
	Description:	parsing components
	Used by:	(testing)
	Dependencies: {lexer},{parsing types},{parsing obj}, {logic tree}
**/

//class offsers general parsing functions to go through lexed code
//input(s):
//	code: (text) => string representing of code to parse
//output(s): (none)
function parser(code){
	//make sure that code is not empty string
	if( code == "" ){
		throw new Error("784789749832");
	}
	//save code in the form of array, sliced by new line character, such that each
	//array item represents a code line
	this._code = code.split('\n');
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
	create__integerType(this._gScp);
	create__realType(this._gScp);
	create__booleanType(this._gScp);
	create__textType(this._gScp);
	//create logic tree
	this.logTree = new LTree();
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
	if( this._curTokenIdx < 0 || this._curTokenIdx >= this._tokens.length ){
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
parser.prototype.isCurrentToken = function(tknTp){
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

//decrement token back
//input(s): (none)
//output(s): (none)
parser.prototype.prev = function(){
	//decrement index of current token by 1
	this._curTokenIdx--;
	//decrement token index on the current line
	this._curLineToken--;
	//loop while current token is a new line
	while( this._curTokenIdx > 0 && 
			this.current().type.value == TOKEN_TYPE.NEWLINE.value ){
		//skip to previous token
		this._curTokenIdx--;
		//decrement current line index
		this._curLineIdx--;
		//reset token index of the current line
		this._curLineToken = -1;
	}
	//if need to setup value of token index on current line
	if( this._curLineToken == -1 ){
		//reset index to 0
		this._curLineToken = 0;
		//init temporaru counter of current token
		var tmpCurTkIdx = this._curTokenIdx;
		//loop back until we find NEW LINE or start of the code
		while( tmpCurTkIdx > 0 && this._tokens[tmpCurTkIdx] != TOKEN_TYPE.NEWLINE ){
			//increment by 1 until we find NEWLINE or start of the code
			//this way we will reset the value of token index on current line
			this._curLineToken++;
		}	//end loop till find NEWLINE or start of code
	}	//end if need to setup token index on current line
};	//end function 'prev'

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
//output(s):
//	associative array representing new task
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
FUNC_CALL: 'call' ACCESS '(' [ FUNC_ARGS_INST ] ')'
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
TERM: ACCESS { ('*' | '/' | 'mod') ACCESS }*
ACCESS: FACTOR [ '.' (IDENTIFIER:functinoid_name | ACCESS) ]
FACTOR: DESIGNATOR | SINGLETON | FUNC_CALL | '(' LOGIC_EXP ')'
SINGLETON: INT | FLOAT | TEXT | BOOL
INT: { '0' | ... | '9' }*
FLOAT: INT '.' INT 	//not accurate, but it is handled by LEXER anyway
TEXT: '"' { #ANY_SYMBOL# }* '"'
BOOL: 'true' | 'false'
DESIGNATOR: IDENTIFIER { '[' LOGIC_EXP ']' }*
TYPE: IDENTIFIER [ '<' TYPE { ',' TYPE }* '>' ]
TYPE_INST: [ TYPE IDENTIFIER { ',' TYPE IDENTIFIER }* ]	//type instantiation exp
IDENTIFIER: { 'a' | ... | 'z' | 'A' | ... | 'Z' | '0' | ... | '9' | '_' }*
*/

//-----------------------------------------------------------------------------
// parsing components
//-----------------------------------------------------------------------------

//logic_exp:
//	=> syntax: LOGIC_TERM { '|' LOGIC_TERM }*
//	=> semantic: (none)
parser.prototype.process__logicExp = function(){
	//create result variable
	var logExpRes = null;
	//try to parse access expression
	if( (logExpRes = this.process__logicTerm()).success == false ){
		//fail
		return FAILED_RESULT;
	}
	//get current block
	var logExp_curBlk = this.getCurrentScope()._current;
	//get type of left operand
	var logExp_type = logExpRes.get(RES_ENT_TYPE.TYPE, false);
	//reference non-terminal node
	var logExp_nt = null;
	//if next token is '|'
	if( this.isCurrentToken(TOKEN_TYPE.OR) ){
		//if left logic operand is not boolean
		if( logExp_type._type !== OBJ_TYPE.BOOL ){
			//it is not a boolean expression, error
			this.error("4364725364573222323");
		}	//end if left logic operand is not boolean
		//create logic non-terminal
		logExp_nt = this.logTree.addNonTerminal(
			LOGIC_OP.OR,	//operator-or
			null			//parent isn't known
		);
		//get logic node representing left logic operand
		var logExp_ln = logExpRes.get(RES_ENT_TYPE.LOG_NODE, false);
		//check that terminal node was found
		if( logExp_ln == null ){
			this.error("left operand of OR operator has to be boolean");
		}
		//add retrieved terminal to the non-terminal node
		logExp_nt.addChild(logExp_ln);
	}	//end if next token is '|'
	//loop while next token is '|'
	while( this.isCurrentToken(TOKEN_TYPE.OR) ){
		//consume '|'
		this.next();
		//try to parse last logic operand operand, so far
		var logExp_lastOperand = this.process__logicTerm();
		//ensure that last operand processed successfully
		if( logExp_lastOperand.success == false ){
			//error
			this.error("4364276378426347683");
		}
		//get type of last processed operand
		var logExp_typeOfLastOperand = logExp_lastOperand.get(RES_ENT_TYPE.TYPE, false);
		//ensure that the operand is boolean
		if( logExp_typeOfLastOperand._type != OBJ_TYPE.BOOL ){
			this.error("boolean operand is required in a logic OR-expression");
		}	//end if type checking
		//get terminal for this last operand
		var tmp_terminal = logExp_lastOperand.get(RES_ENT_TYPE.LOG_NODE, false);
		//ensure that terminal was retrieved successfully
		if( tmp_terminal == null ){
			//if not successfully, then error
			this.error("909384932898948329");
		}
		//add terminal to the non-terminal node
		logExp_nt.addChild(tmp_terminal);
	}	//end loop to process '|'
	//check if non-terminal was created
	if( logExp_nt !== null ){
		//create new result set to specify non-terminal node
		logExpRes = new Result(true, [])
			.addEntity(RES_ENT_TYPE.TYPE, logExp_typeOfLastOperand)
			.addEntity(RES_ENT_TYPE.LOG_NODE, logExp_nt);
	}
	//return result set to the caller
	return logExpRes;
};	//end logicExp

//logic_term:
//	=> syntax: REL_EXP { '&' REL_EXP }*
//	=> semantic: (none)
parser.prototype.process__logicTerm = function(){
	//create result variable
	var logTermRes = null;
	//try to parse access expression
	if( (logTermRes = this.process__relExp()).success == false ){
		//fail
		return FAILED_RESULT;
	}
	//get current block
	var logTerm_curBlk = this.getCurrentScope()._current;
	//get type of left operand
	var logTerm_type = logTermRes.get(RES_ENT_TYPE.TYPE, false);
	//reference non-terminal node
	var logTerm_nt = null;
	//if next token is '&'
	if( this.isCurrentToken(TOKEN_TYPE.AND) ){
		//if left logic operand is not boolean
		if( logTerm_type._type !== OBJ_TYPE.BOOL ){
			//it is not a boolean expression, error
			this.error("78437894782397984");
		}	//end if left logic operand is not boolean
		//create logic non-terminal
		logTerm_nt = this.logTree.addNonTerminal(
			LOGIC_OP.AND,	//operator-and
			null			//parent isn't known
		);
		//get terminal representing left logic operand
		var logTerm_t = logTermRes.get(RES_ENT_TYPE.LOG_NODE, false);
		//check that terminal node was found
		if( logTerm_t == null ){
			this.error("left operand of AND operator has to be boolean");
		}
		//add retrieved terminal to the non-terminal node
		logTerm_nt.addChild(logTerm_t);
	}	//end if next token is '&'
	//loop while next token is '&'
	while( this.isCurrentToken(TOKEN_TYPE.AND) ){
		//consume '&'
		this.next();
		//try to parse last logic operand operand, so far
		var logTerm_lastOperand = this.process__relExp();
		//ensure that last operand processed successfully
		if( logTerm_lastOperand.success == false ){
			//error
			this.error("8473896826423");
		}
		//get type of last processed operand
		var logTerm_typeOfLastOperand = logTerm_lastOperand.get(RES_ENT_TYPE.TYPE, false);
		//ensure that the operand is boolean
		if( logTerm_typeOfLastOperand._type != OBJ_TYPE.BOOL ){
			this.error("boolean operand is required in a logic AND-expression");
		}	//end if type checking
		//get terminal for this last operand
		var tmp_terminal = logTerm_lastOperand.get(RES_ENT_TYPE.LOG_NODE, false);
		//ensure that terminal was retrieved successfully
		if( tmp_terminal == null ){
			//if not successfully, then error
			this.error("437854327589427395");
		}
		//add terminal to the non-terminal node
		logTerm_nt.addChild(tmp_terminal);
	}	//end loop to process '&'
	//check if non-terminal was created
	if( logTerm_nt !== null ){
		//create new result set to specify non-terminal node
		logTermRes = new Result(true, [])
			.addEntity(RES_ENT_TYPE.TYPE, logTerm_typeOfLastOperand)
			.addEntity(RES_ENT_TYPE.LOG_NODE, logTerm_nt);
	}
	//return result set to the caller
	return logTermRes;
};	//end logicTerm

//rel_op:
//	=> syntax: '==' | '=<' | '<' | '>' | '>=' | '<>'
//	=> semantic: does not return RESULT, instead just command type
//output(s):
//	(COMMAND_TYPE) => resulting command type
parser.prototype.process__relOp = function(){
	var c = null;
	//determine type of jump command
	if( this.isCurrentToken(TOKEN_TYPE.LESS) ){
		c = COMMAND_TYPE.BLT;
	} else if( this.isCurrentToken(TOKEN_TYPE.LESSEQ) ){
		c = COMMAND_TYPE.BLE;
	} else if( this.isCurrentToken(TOKEN_TYPE.EQ) ){
		c = COMMAND_TYPE.BEQ;
	} else if( this.isCurrentToken(TOKEN_TYPE.NEQ) ){
		c = COMMAND_TYPE.BNE;
	} else if( this.isCurrentToken(TOKEN_TYPE.GREATER) ){
		c = COMMAND_TYPE.BGT;
	} else if( this.isCurrentToken(TOKEN_TYPE.GREATEREQ) ){
		c = COMMAND_TYPE.BGE;
	}
	//check to make sure that one of jump commands was successful
	if( c !== null ){
		//consume comparison operator
		this.next();
	}
	//return command type
	return c;
};	//end relOp

//rel_exp:
//	syntax => EXP [ REL_OP EXP ]
//	semantic => (none)
parser.prototype.process__relExp = function(){
	//process expression
	var relExp_res = this.process__exp();
	//check if expression was processed successfully
	if( relExp_res.success == false ){
		//fail
		return FAILED_RESULT;
	}
	//try to check for relational operator
	var relOpCmdType = this.process__relOp();
	//check if relational operator processed successfully
	if( relOpCmdType == null ){
		//then, this is not a relational expression => return just expression result
		return relExp_res;
	}
	//process right hand side expression
	var relExp_rh_exp = this.process__exp();
	//check if expression processed successfully
	if( relExp_rh_exp.success == false ){
		//this is a code error
		this.error("983074032749273847");
	}
	//get command representing left hand side expression
	var relExp_lh_cmd = relExp_res.get(RES_ENT_TYPE.COMMAND, false);
	//get command representing right hadn side expression
	var relExp_rh_cmd = relExp_rh_exp.get(RES_ENT_TYPE.COMMAND, false);
	//get current block
	var relExp_curBlk = this.getCurrentScope()._current;
	//create jump command with the command type specified by relational operator
	var relExp_compCmd = relExp_curBlk.createCommand(
		relOpCmdType,					//command type
		[relExp_lh_cmd, relExp_rh_cmd],	//left and right hand side relational expressions
		[]								//no associated symbols
	);
	//create new current block, since this block is ended with a jump instruction
	//	Note: do not connect previous and new blocks together; block connections
	//	will be handled by the logical tree component
	this.getCurrentScope().createBlock(true);	//pass 'true' to set new block as current
	//create terminal node in the logic tree
	var relExp_termNode = this.logTree.addTerminal(
		relExp_curBlk._cmds[0],	//first command in the block (starting command)
		relExp_compCmd,			//jump command
		null					//at this point there is no parent node, yet
	);
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, relExp_compCmd)
		.addEntity(RES_ENT_TYPE.TYPE, 
			new type("boolean", OBJ_TYPE.BOOL, this._gScp))
		.addEntity(RES_ENT_TYPE.LOG_NODE, relExp_termNode);
};	//end relExp

//exp:
//	=> syntax: TERM { ('+' | '-') TERM }*
//	=> semantic: (none)
parser.prototype.process__exp = function(){
	//create result variable
	var expRes = null;
	//try to parse term expression
	if( (expRes = this.process__term()).success == false ){
		//fail
		return FAILED_RESULT;
	}
	//get current block
	var exp_curBlk = this.getCurrentScope()._current;
	//get type of processed term expression
	var exp_type = expRes.get(RES_ENT_TYPE.TYPE, false);
	//init flag that determines which arithmetic operator used: '+' or '-'
	var exp_isAdd = false;
	//if next token is '+' or '-'
	if( 
		(exp_isAdd = this.isCurrentToken(TOKEN_TYPE.PLUS)) || 
		this.isCurrentToken(TOKEN_TYPE.MINUS) ){
		//determine type of functinoid
		var tmpFuncType = exp_isAdd ? FUNCTION_TYPE.ADD : FUNCTION_TYPE.SUB;
		//ensure that type of first operand supports addition or subtraction
		if( exp_type.checkIfFundMethodDefined(tmpFuncType) == false ){
			this.error("first operand does not support " + 
				(exp_isAdd ? "addition" : "subtraction") + " operator");
		}	//end if first operand supports addition/subtraction
	}	//end if next token is '+' or '-'
	//loop while next token is '+' or '-'
	while(
		(exp_isAdd = this.isCurrentToken(TOKEN_TYPE.PLUS)) ||
		this.isCurrentToken(TOKEN_TYPE.MINUS)
	){
		//consume '+' or '-'
		this.next();
		//try to parse last arithmetic operand, so far
		var exp_lastOperand = this.process__term();
		//ensure that last operand processed successfully
		if( exp_lastOperand.success == false ){
			//error
			this.error("2478347238947832");
		}
		//get type of last processed operand
		var exp_typeOfLastOperand = exp_lastOperand.get(RES_ENT_TYPE.TYPE, false);
		//determine type of functinoid
		var tmpFuncType = exp_isAdd ? FUNCTION_TYPE.ADD : FUNCTION_TYPE.SUB;
		//ensure that addition/subtraction operator is supported by an operand
		if( exp_typeOfLastOperand.checkIfFundMethodDefined(tmpFuncType) == false ){
			this.error("operand does not support " + 
				(exp_isAdd ? "addition" : "subtraction") + " operator");
		}	//end if type checking
		//determine command type
		var exp_cmdType = exp_isAdd ? COMMAND_TYPE.ADD : COMMAND_TYPE.SUB;
		//get command representing left and right operands
		var tmpLeftCmd = expRes.get(RES_ENT_TYPE.COMMAND, false);
		var tmpRightCmd = exp_lastOperand.get(RES_ENT_TYPE.COMMAND, false);
		//check if either command is null
		if( tmpLeftCmd == null || tmpRightCmd == null ){
			//error
			this.error("894738294793287");
		}
		//compose list of operands for addition/artithmetic operation
		var exp_cmdArgs = [ tmpLeftCmd, tmpRightCmd ];
		//create arithmetic command
		var tmpResCmd = exp_curBlk.createCommand(
			exp_cmdType,
			exp_cmdArgs,
			[]
		);
		//create new result
		expRes = new Result(true, [])
			.addEntity(RES_ENT_TYPE.COMMAND, tmpResCmd);
	}	//end loop to process '+' or '-' operators
	//specify type
	expRes.addEntity(RES_ENT_TYPE.TYPE, exp_type);
	//return result set
	return expRes;
};	//end expression

//term:
//	=> syntax: ACCESS { ('*' | '/' | 'mod') ACCESS }*
//	=> semantic: (none)
parser.prototype.process__term = function(){
	//create result variable
	var termRes = null;
	//try to parse access expression
	if( (termRes = this.process__access()).success == false ){
		//fail
		return FAILED_RESULT;
	}
	//get current block
	var term_curBlk = this.getCurrentScope()._current;
	//get type of processed access expression
	var term_type = termRes.get(RES_ENT_TYPE.TYPE, false);
	//init hashmap that determines which arithmetic operator used: '*' or '/' or 'mod'
	//this hashmap will contain following fields: 'id', 'name', 'ftype', 'ctype'
	var term_op = {};	//1: multiplication, 2: division, 3: mod
	//if next token is '*' or '/' or 'mod'
	//	check if 'id' is 0, i.e. it is not term operation
	if( (term_op = this.process__termOperator()).id != 0 ){
		//ensure that type of first operand supports multiplication or division
		if( term_type.checkIfFundMethodDefined(term_op.ftype) == false ){
			this.error("first operand does not support " + term_op.name + " operator");
		}	//end if first operand supports multiplication/division
	}	//end if next token is '*' or '/' or 'mod'
	//loop while next token is '*' or '/' or 'mod'
	while( (term_op = this.process__termOperator()).id != 0 ){
		//consume '*' or '/'
		this.next();
		//try to parse last arithmetic operand, so far
		var term_lastOperand = this.process__access();
		//ensure that last operand processed successfully
		if( term_lastOperand.success == false ){
			//error
			this.error("8473896826423");
		}
		//get type of last processed operand
		var term_typeOfLastOperand = term_lastOperand.get(RES_ENT_TYPE.TYPE, false);
		//perform a minimal type checking to ensure that numeric operands
		//	are being multiplied or divided
		if( term_typeOfLastOperand.checkIfFundMethodDefined(term_op.ftype) == false ){
			this.error("operand does not support " + term_op.name + " operator");
		}	//end if type checking
		//get type of left operand
		var tmpLeftObjType = termRes.get(RES_ENT_TYPE.TYPE, false);
		if( tmpLeftObjType == null ){
			this.error("49347239857298725");
		}
		//make sure that both left and right operands are of the same type or
		//	if different, then they are represented by INTEGER and REAL
		if( term_typeOfLastOperand._id != tmpLeftObjType._id ){
			//check to make sure that left operand is either INTEGER or REAL
			if( term_typeOfLastOperand._type.value != OBJ_TYPE.INT.value &&
				term_typeOfLastOperand._type.value != OBJ_TYPE.REAL.value ){
				this.error("left operand does not pass type check for arithmetic expression");
			}
			//check to make sure that right operand is either INTEGER or REAL
			if( tmpLeftObjType._type.value != OBJ_TYPE.INT.value &&
				tmpLeftObjType._type.value != OBJ_TYPE.REAL.value ){
				this.error("right operand does not pass type check for arithmetic expression");
			}
		}	//end if left and right operands are of the same type
		//get command representing left and right operands
		var tmpLeftCmd = termRes.get(RES_ENT_TYPE.COMMAND, false);
		var tmpRightCmd = term_lastOperand.get(RES_ENT_TYPE.COMMAND, false);
		//check if either command is null
		if( tmpLeftCmd == null || tmpRightCmd == null ){
			//error
			this.error("897489734398437");
		}
		//compose list of operands for multiplication
		var term_cmdArgs = [ tmpLeftCmd, tmpRightCmd ];
		//create arithmetic command
		var tmpResCmd = term_curBlk.createCommand(
			term_op.ctype,	//command type
			term_cmdArgs,	//command arguments
			[]				//no symbols associated with this command
		);
		//create new result
		termRes = new Result(true, [])
			.addEntity(RES_ENT_TYPE.COMMAND, tmpResCmd)
			.addEntity(RES_ENT_TYPE.TYPE, term_typeOfLastOperand);
	}	//end loop to process '*' or '/' operators
	return termRes;
};	//end term

//determine if it is an airthmetic operator and which kind. The possible kinds:
//	0: not arithmetic operator
//	1: multiplication
//	2: division
//	3: module
//input(s): (none)
//output(s):
//	(HashMap) =>
//		id: (integer) number representing arithmetic operator
//		name: (text) string representing title of operation
//		ftype: (FUNCTION_TYPE) functinoid type
//		ctype: (COMMAND_TYPE) command type
parser.prototype.process__termOperator = function(){
	//result for storing integer representation of arithmetic operator
	var arithmeticOpRes = 0;
	if(
		(arithmeticOpRes = (this.isCurrentToken(TOKEN_TYPE.MULTIPLY) ? 1 : 0)) == 1 ||
		(arithmeticOpRes = (this.isCurrentToken(TOKEN_TYPE.DIVIDE) ? 2 : 0)) == 2 ||
		(arithmeticOpRes = (this.isCurrentToken(TOKEN_TYPE.MOD) ? 3 : 0)) == 3
	){
		//initialize operation name, function type, and command type
		var opName = "";
		var funcType = null;
		var cmdType = null;
		//depending on the type of arithmetic operation
		switch(arithmeticOpRes){
			case 1:
				opName = "multiplication";
				funcType = FUNCTION_TYPE.MUL;
				cmdType = COMMAND_TYPE.MUL;
				break;
			case 2:
				opName = "division";
				funcType = FUNCTION_TYPE.DIV;
				cmdType = COMMAND_TYPE.DIV;
				break;
			case 3:
				opName = "module"
				funcType = FUNCTION_TYPE.MOD;
				cmdType = COMMAND_TYPE.MOD;
				break;
		}
		//if at least one of operators matched
		return {
			id: arithmeticOpRes,
			name: opName,
			ftype: funcType,
			ctype: cmdType
		};
	}
	//if no operators matched
	return {id: 0};
};	//end function for processing term operator

//factor
//	=> syntax: DESIGNATOR | SINGLETON | FUNC_CALL | '(' LOGIC_EXP ')'
//	=> semantic: (none)
parser.prototype.process__factor = function(){
	//init parsing result
	var factorRes = null;
	//try various kinds of statements
	if(
		//process assignment statement
		(factorRes = this.process__designator()).success == false &&

		//process variable declaration statement
		(factorRes = this.process__singleton()).success == false &&

		//process function call statement
		(factorRes = this.process__functionCall()).success == false &&

		//process if statement statement
		(factorRes = this.process__logicExp()).success == false
	){
		//failed to process statement
		return FAILED_RESULT;
	}
	//send result back to caller
	return factorRes;
};	//end factor

//singleton:
//	=> syntax: INT | FLOAT | TEXT | BOOL
//	=> semantic: this function process constant values of 4 basic types; it
//		does not process variables of these types, just constants
parser.prototype.process__singleton = function(){
	//initialize variable that would store value
	var snglVal = null;
	//init status variables that maintain starting state of current singleton
	var snglIsTrue = false;
	var snglIsDoubleQuote = false;
	//initialize variable for storing type of value
	var snglType = null;
	//check if current token is TRUE or FALSE (handle BOOL type)
	if( (snglIsTrue = this.isCurrentToken(TOKEN_TYPE.TRUE)) || 
		this.isCurrentToken(TOKEN_TYPE.FALSE) ){
		//create value for boolean value
		snglVal = value.createValue(snglIsTrue);
		//set type to be boolean
		snglType = new type("boolean", OBJ_TYPE.BOOL, this._gScp);
	//check if current token is (single or double) quotation mark (handle TEXT)
	} else if( (snglIsDoubleQuote = this.isCurrentToken(TOKEN_TYPE.DOUBLEQUOTE)) ||
				this.isCurrentToken(TOKEN_TYPE.SINGLEQUOTE) ) {
		//consume starting quote
		this.next();
		//make sure that the next token is TEXT
		if( this.isCurrentToken(TOKEN_TYPE.TEXT) == false ){
			this.error("expecting string between quotes");
		}
		//now current token represents a text string => create value for it
		snglVal = value.createValue(this.current().text);
		//consume this token
		this.next();
		//now make sure that there is ending quote
		if( this.isCurrentToken(snglIsDoubleQuote ? TOKEN_TYPE.DOUBLEQUOTE : TOKEN_TYPE.SINGLEQUOTE) == false ){
			//if not, then fail
			this.error("expecting ending quote symbol");
		}
		//set type to be text
		snglType = new type("text", OBJ_TYPE.TEXT, this._gScp);
	} else {
		//this has to be numeric singleton - integer or float
		//initialize variable to store value
		var snglVal = 1;
		//if current token is a negative sign
		if( this.isCurrentToken(TOKEN_TYPE.MINUS) ){
			//consume '-'
			this.next();
			//set value to negative one
			snglVal = -1;
		}
		//retrieve numeric value
		if( this.isCurrentToken(TOKEN_TYPE.NUMBER) ){	//if this is an integer
			//set integer value
			snglVal = snglVal * parseInt(this.current().text);
			//set type to be integer
			snglType = new type("integer", OBJ_TYPE.INT, this._gScp);
		} else if( this.isCurrentToken(TOKEN_TYPE.FLOAT) ){	//if this is a real
			//set real value
			snglVal = snglVal * parseFloat(this.current().text);
			//set type to be real
			snglType = new type("real", OBJ_TYPE.REAL, this._gScp);
		} else {	//if not a numeric
			//if there was a negative sign, then decrement token back
			if( snglVal == -1 ){
				this.prev();
			}
			//fail
			return FAILED_RESULT;
		}	//end if current token is an integer
	}	//end if current token is a boolean value (TRUE or FALSE)
	//consume last processed token
	this.next();
	//get current block
	var snglCurBlk = this.getCurrentScope()._current;
	//create NULL command for this constant
	var snglNullCmd = snglCurBlk.createCommand(
		COMMAND_TYPE.NULL,			//null command type
		[snglVal],					//processed value
		[]							//symbols
	);
	//return result
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, snglNullCmd)
		.addEntity(RES_ENT_TYPE.TYPE, snglType);
};	//end singleton

//func_call:
//	=> syntax: 'call' ACCESS '(' [ FUNC_ARGS_INST ] ')'
//	=> semantic: ACCESS identifies function name, which can be part of another object
//			(e.g. foo.goo.functionName) that is why it has to be access. It is not
//			possible to store function pointers in array of hashmap, so ACCESS cannot
//			in this case process array index brackets or it would semantic error
parser.prototype.process__functionCall = function(){
	//check if the current token is not 'call'
	if( this.isCurrentToken(TOKEN_TYPE.CALL) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'call'
	this.next();
	//parse thru function name expression to get functinoid and possibly command
	//	representing object that contains this functinoid in its definition
	var funcCall_AccRes = this.process__access();
	//access is suposse to return a functionoid in the result set
	var funcRef = funcCall_AccRes.get(RES_ENT_TYPE.FUNCTION,  false);
	//if functinoid is not found, then this is error
	if( funcRef == null ){
		this.error("attempting to call non-functinoid entity");
	}
	//ensure that the next token is open paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//fail
		this.error("expecting '(' after functinoid name");
	}
	//consume '('
	this.next();
	//try to process function arguments
	process__funcArgs();	//it does not matter what it returns
	//now, ensure that the current token in closing paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == false ){
		//fail
		this.error("expecting ')' in the function call statement, after argument list");
	}
	//consume ')'
	this.next();
	//get current block
	var funcCall_curBlk = this.getCurrentScope()._current;
	//create CALL command
	var funcCall_callCmd = funcCall_curBlk.createCommand(
		COMMAND_TYPE.CALL,		//call command type
		[],
		[]
	);
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, funcCall_callCmd)
		.addEntity(RES_ENT_TYPE.FUNCTION, funcRef)
		.addEntity(RES_ENT_TYPE.TYPE, funcRef._return_type);
};

//access:
//	=> syntax: FACTOR [ '.' (IDENTIFIER:functinoid_name | ACCESS) ]
//	=> semantic: if there is a period syntax with the field name following after,
//			then, we either access data field variable using DESIGNATOR or a
//			function using IDENTIFIER
parser.prototype.process__access = function(){
	//parse factor
	var accRes = this.process__factor();
	//check if factor got processed successfully
	if( accRes.success == false ){
		//fail
		return FAILED_RESULT;
	}
	//try to parse '.'
	if( this.isCurrentToken(TOKEN_TYPE.PERIOD) == true ){
		//consume '.'
		this.next();
		//so, we are processing field/function of some custom type object
		//	we need to set this custom type's scope to be current so that
		//	all fields and functions defined in this scope could be found
		//	by designator function call, below
		//Get symbol for the processed factor
		var accFactorSymbol = accRes.get(RES_ENT_TYPE.SYMBOL, false);
		//make sure that symbol was found
		if( accFactorSymbol == null ){
			this.error("326453485238767");
		}
		//get current scope
		var acc_curScp = this.getCurrentScope();
		//get type of this symbol
		var accFactorSymbolType = accFactorSymbol._type;
		//set this type's scope as a curent scope
		this.addCurrentScope(accFactorSymbolType._scope);
		//initialize access argument
		var accArg = null;
		//if current token is an identifier and it is a function name in the given type
		if( this.isCurrentToken(TOKEN_TYPE.IDENTIFIER) == true &&
			this.current().text in accFactorSymbolType._methods ){
			//assign functinoid reference as access argument
			accArg = accFactorSymbolType._methods[this.current().text];
			//create and save result
			accRes = new Result(true, [])
				.addEntity(RES_ENT_TYPE.FUNCTION, accArg)
				.addEntity(RES_ENT_TYPE.SYMBOL, accFactorSymbol)
				.addEntity(RES_ENT_TYPE.TYPE, tmpFunc[RES_ENT_TYPE.FUNCTION.value]._return_type);
		} else {	//if it is not a function of given type
			//try to parse designator (Note: we should not declare any variable
			//	right now, so pass 'null' for the function argument type)
			accRes = this.process__designator(null);
			//make sure that designator was processed successfully
			if( accRes.success == false ){
				//error
				this.error("437623876878948");
			}
			//get command representing designator
			accArg = accRes.get(RES_ENT_TYPE.COMMAND, false);
			//make sure that there is a command
			if( accArg == null ){
				this.error("839578957875973");
			}
			//remove command from the result set, because it should be
			//replaced by LOAD command later on
			accRes.removeAllEntitiesOfGivenType(RES_ENT_TYPE.COMMAND);
		}	//end if it is a function of given type
		//get last definition of command for this symbol
		acc_defSymbCmd = accFactorSymbol.getLastDef();
		//create ADDA command for determining address of element to be accessed
		var acc_addaCmd = acc_curScp._current.createComand(
			COMMAND_TYPE.ADDA,
			[
				acc_defSymbCmd,		//last definition of factor
				accArg				//element to be accessed
			],			//arguments
			[]			//no symbols atatched to addressing command
		);
		//create LOAD command for retrieving data element from array/hashmap
		acc_loadCmd = acc_curScp._current.createCommand(
			COMMAND_TYPE.LOAD,
			[
				acc_addaCmd			//addressing command
			],			//argument
			[]			//no symbols
		);
		//add LOAD command to the result set
		accRes.addEntity(RES_ENT_TYPE.COMMAND, acc_loadCmd);
		//remove type's scope from the stack
		this._stackScp.pop();
	}
	//return result set
	return accRes;
};	//end access

//func_args_inst:
//	=> syntax: LOGIC_EXP { ',' LOGIC_EXP }*
//	=> semantic: (none)
parser.prototype.process__funcArgs = function(){
	//init flag - is sequence of arguments non empty, i.e. has at least one argument
	var isSeqNonEmpty = false;
	//init result variable to keep track of return value
	var funcArgRes = null;
	//get current block
	var funcArg_curBlk = this.getCurrentScope()._current;
	//loop thru statements
	do{
		//try to parse statement
		if( (funcArgRes = this.process__logicExp()).success == false ){
			//if sequence is non empty
			if( isSeqNonEmpty ){
				//then, this is a bug in user code, since ',' should be followed
				//	by another expression for a function argument
				this.error("2174899679612");
			}
			//otherwise, this is not a function argument list, so fail
			return FAILED_RESULT;
		}
		//get command representing expression
		var funcArg_cmd = funcArgRes.get(RES_ENT_TYPE.COMMAND, false);
		//create PUSH command to push argument on the stack
		funcArg_curBlk.createCommand(
			COMMAND_TYPE.PUSH,		//push function argument on the stack
			[funcArg_cmd],			//command represening expression
			[]						//no symbols associated with this command
		);
		//assert that sequence is non-empty
		isSeqNonEmpty = true;
		//check if the next token is not ','
		if( this.isCurrentToken(TOKEN_TYPE.COMMA) == false ){
			//if no ',' found, then we reached the end of sequence, quit loop
			break;
		}
		//consume ',' and process next function argument expression
		this.next();
	} while(true);	//end loop thru function arguments
	//send result back to caller
	return funcArgRes;
};	//end function arguments

//designator:
//	=> syntax: IDENTIFIER { '[' LOGIC_EXP ']' }*
//	=> semantic: this rule allows to process array expressions as well as regular variable
//input(s):
//	t: (type) => this parameter is optional, and is used ONLY if you expect new variable
//					identifier to be processed, i.e. when declaring a variable. Otherwise,
//					it should be passed in as NULL, so that if processed identifier does
//					not have associated variable, it would trigger error rather then try
//					to create a variable from scratch.
parser.prototype.process__designator = function(t){
	//check if first element is identifier
	var des_id = this.process__identifier();
	//check if identifier was processed correctly
	if( des_id == null ){
		//fail
		return FAILED_RESULT;
	}
	//get current scope
	var des_curScp = this.getCurrentScope(false);
	//find symbol with specified name in this scope and its parent hierarchy
	var des_symb = des_curScp.findSymbol(des_id);
	//initialize definition command for this symbol
	var des_defSymbCmd = null;
	//check if this identifier does not yet have associated variable
	if( des_symb == null ){
		//this identifier does not have associated symbol/variable
		//need to check if caller passed in valid type argument
		if( typeof t === "undefined" && t == null ){
			//type is invalid -- user uses undeclared variable
			this.error("undeclared variable " + des_id + " was used in the code");
		}
		//if reached this line, then we need to create a new variable
		des_symb = this.create__variable(des_id, t, des_curScp, des_curScp._current);
	} else {	//if symbol is defined
		//get last definition of command for this symbol
		des_defSymbCmd = des_symb.getLastDef();
	}	//end if there is no associated variable with retrieved identifier
	//loop while next token is open array (i.e. '[')
	while( this.isCurrentToken(TOKEN_TYPE.ARRAY_OPEN) == true ){
		//check if this variable was properly defined, i.e. it should have been defined
		//not in this function, but in a separate statement
		if( des_defSymbCmd == null ){
			//that means this array variable was not defined, but is attempted to be
			//used in array expression => that is error in user code
			this.error("array variable has to be defined before it is used");
		}
		//consume '['
		this.next();
		//process array index expression
		var des_idxExpRes = process__logicExp();
		//check if logic expression was processed unsuccessfully
		if( des_idxExpRes.success == false ){
			//trigger error
			this.error("7389274823657868");
		}
		//next expected token is array close (i.e. ']')
		if( this.isCurrentToken(TOKEN_TYPE.ARRAY_CLOSE) == false ){
			//fail
			this.error("missing closing array bracket in array index expression");
		}
		//consume ']'
		this.next();
		//create ADDA command for determining address of element to be accessed
		var des_addaCmd = des_curScp._current.createComand(
			COMMAND_TYPE.ADDA,
			[
				des_defSymbCmd,		//last definition of array/hashmap
				des_idxExpRes		//element index expression
			],			//arguments
			[]			//no symbols atatched to addressing command
		);
		//create LOAD command for retrieving data element from array/hashmap
		des_defSymbCmd = des_curScp._current.createCommand(
			COMMAND_TYPE.LOAD,
			[
				des_addaCmd			//addressing command
			],			//arguments
			[]			//no symbols yet attached to LOAD
		);
	}	//end loop to process array expression
	//return result
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.TEXT, des_id)
		.addEntity(RES_ENT_TYPE.SYMBOL, des_symb)
		.addEntity(RES_ENT_TYPE.COMMAND, des_defSymbCmd)
		.addEntity(RES_ENT_TYPE.TYPE, des_symb._return_type);
};	//end designator

//create variable instance
//input(s):
//	n: (text) variable name
//	t: (type) variable type
//	s: (scope) scope reference where to place newly declared variable
//	b: (block) block where to append command, representing declaration of variable
//output(s):
//	(symbol) => variable symbol
parser.prototype.create__variable = function(n, t, s, b){
	//create symbol representing this variable
	var v_symb = new symbol(n, t, s);
	//create command for initializing this variable in the given block
	type.getInitCmdForGivenType(t, b, v_symb);
	return v_symb;
};	//end function 'create__variable'

//type:
//	=> syntax: IDENTIFIER [ '<' TYPE { ',' TYPE }* '>' ]
//	=> semantic: type with templates does not need to have this/these template(s) if
//		it is used inside its own type definition
parser.prototype.process__type = function(){
	//try to parse type name (which is an identifier)
	var type_name = this.process__identifier();
	//ensure that identifier was processed successfully
	if( type_name == null ){
		//if identifier processing failed, then quit
		return FAILED_RESULT;
	}
	//check if type does not exist
	if( !(type_name in type.__library) ){
		//create dummy type object
		new type(type_name, OBJ_TYPE.CUSTOM, this._gScp);
	}
	//get type with retrieved name
	var tyObj = type.__library[type_name];
	//is dummy type -- if 'this' is not declared inside type, then it has not
	//been processed, yet, so it is a dummy (i.e. speculative) type
	var isDummyType = !('this' in type.__library[type_name]._scope._symbols);
	//check if this type has templates OR it is a dummy type (in which case, we do not know if it has template -- so assume it is)
	if( tyObj.isTmplType() == true || isDummyType ){
		//check if current token is '<' (starting template list)
		if( this.isCurrentToken(TOKEN_TYPE.LESS) == true ){
			//create array for templated types
			var ty_tmplArr = [];
			//consume '<'
			this.next();
			//process type list
			while(this.isCurrentToken(TOKEN_TYPE.GREATER) == false){
				//init var for keeping track of result returned by type parsing function
				var ty_tyRes = null;
				//if type was not processed successfully
				if( (ty_tyRes = this.process__type()).success == false ){
					//failed to process template type
					this.error("could not process element in the template-type list");
				}
				//check if the next token is ','
				if( this.isCurrentToken(TOKEN_TYPE.COMMA) ){
					//consume this token (skip to the next token)
					this.next();
				}
				//extract type
				ty_tmplTy = ty_tyRes.get(RES_ENT_TYPE.TYPE, false);
				//add template type to the array
				ty_tmplArr.push(ty_tmplTy);
			}
			//check if this is a speculative type and assign a number of templates
			this.assign_templateCountToSpeculativeType(
				isDummyType,		//is speculative/dummy type
				tyObj,				//speculative type
				ty_tmplArr.length	//count of template arguments
			);
			//consume '>'
			this.next();
			//try to create derived template type
			tyObj = type.createDerivedTmplType(tyObj, ty_tmplArr);

		} else if( isDummyType ){	//is this a dummy type
			//check and assign template arguments
			this.assign_templateCountToSpeculativeType(
				isDummyType,		//is speculative type
				tyObj,				//speculative type
				0					//no templates
			);
		} else {	//if there is no template list, but this type has templates
			//get current scope
			var tmpCurScp = this.getCurrentScope(false);	//get current scope
			//traverse thru scope hierarchy to check whether any scope level represents
			//	type object (i.e. we are currently inside type definition)
			while( tmpCurScp._owner != null ){	//until current scope is global scope
				//determine if this scope represents a type
				if( tmpCurScp._typeDecl !== null ){
					//if this is a type, then make sure that it is the type that
					//	is currently being processed without template list
					if( tmpCurScp._typeDecl._id == tyObj._id ){
						//it is allowed not to have a type template list if this type
						//	is used inside its own definition => quit loop
						break;
					} else {	//if it is a different type
						//this is a bug in user code
						this.error("need template specifier in type declaration");
					}	//end if type declaration inside its own definition
				}	//end if scope represents a type
			}	//end loop thru scope hierarchy
		}	//end if current token is '<' (start of template list)
	}	//end if type has templates
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.TYPE, tyObj);
};	//end type

//check and assign number of templates to this speculative type, so that when this
//type's definition will be processed, this count will be matched with an actual
//number of templates defined for this type.
//input(s):
//	isSpeculativeType: (boolean) => is this a speculative/dummy type
//	speculatType: (type) => type that has not been, yet formally processed
//	countOfTmpl: (int) => number of templates that was found this time
parser.prototype.assign_templateCountToSpeculativeType = 
	function(isSpeculativeType, speculatType, countOfTmpl){
	//if this is a speculative/dummy type
	if( isSpeculativeType ){
		//If another code processed this possibly templated type, then
		//it would have created '__tmp_templateCount' where it would
		//store number of processed templates
		if( '__tmp_templateCount' in speculatType ){
			//make sure that prior count matches this count
			if( countOfTmpl != speculatType.__tmp_templateCount ){
				//if it does not match, then this is error
				this.error("type " + speculatType._name + " is used with wrong number of template arguments");
			}
		}	//end if template count was already assigned
		//assign a count of templates arguments
		speculatType.__tmp_templateCount = countOfTmpl;
	}	//end if dummy type
};	//end function 'assign_templateCountToSpeculativeType'

//identifier:
//	=> syntax: { 'a' | ... | 'z' | 'A' | ... | 'Z' | '0' | ... | '9' | '_' }*
//	=> semantic: return not a result set, but the token text value
parser.prototype.process__identifier = function(){
	//if curent token is not text
	if( this.isCurrentToken(TOKEN_TYPE.TEXT) == false ){
		//fail
		return null;
	}
	//get identifier text representation
	var id_text = this.current().text;
	//consume identifier
	this.next();
	//return text represenation of identifier
	return id_text;
};	//end identifier

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
		//consume '<'
		this.next();
		//init counter for template arguments
		var i = 0;
		//loop thru template identifiers
		while(this.isCurrentToken(TOKEN_TYPE.GREATER) == false){
			//if is this not first template in the list
			if( i > 0 ){
				//make sure that there is a comma
				if( this.isCurrentToken(TOKEN_TYPE.COMMA) == false ){
					//if there is no comma, then this bug in user's code
					this.error("expecting comma in the template list in type definition");
				}	//end if ensure there is a comma
				//consume comma (',')
				this.next();
			}	//end if not first template in the list
			//process identifier
			var tmplElem = this.process__identifier();
			//make sure that identifier was processed successfully
			if( tmplElem == null ){
				//processing identifier faile
				this.error("expecting identifier in the template list in type definition");
			}	//end if ensure identifier process successfully
			//add element to the array
			objDef_tempArr.push(tmplElem);
			//increment counter
			i++;
		}
		//consume '>'
		this.next();
	}	//end if there is token list
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
	var objDef_newTypeInst = null;
	//check if type with the following name has been declared earlier
	if( objDef_id in type.__library ){
		//check if this type is not re-declared, i.e. ensure that it does not have
		//	'this' symbol defined in type's scope
		if( 'this' in type.__library[objDef_id]._scope._symbols ){
			//this type is re-declared => bug in user code
			this.error("type " + objDef_id + " is re-declared in the program");
		}	//end if type is re-declared
		//get type from the library
		objDef_newTypeInst = type.__library[objDef_id];
		//this type was created before its definition, if this type has templates
		//then all of its uses outside should also use correct number of templates
		if( objDef_tempArr.length > 0 ){	//if this type has templates
			//check if '__tmp_templateCount' is defined inside type
			if( '__tmp_templateCount' in objDef_newTypeInst ){
				//if wrong number of templates was used
				if( objDef_newTypeInst.__tmp_templateCount != objDef_tempArr.length ){
					//this is a bug in user code
					this.error("wrong number of templates for type " + objDef_id);
				}
			} else {	//type was used without template => bug
				//error in user code
				this.error("type " + objDef_id + " was used without templates");
			}
		}	//end if type was created before its definition (dummy type)
	} else {	//if not defined, then need to create
		//create 
		objDef_newTypeInst = new type(
			objDef_id, OBJ_TYPE.CUSTOM, this.getCurrentScope(false)
		);
	}	//end if type with the given name is already defined
	//create fundamental/required methods for this type
	objDef_newTypeInst.createReqMethods();
	//set type's scope as a current
	this.addCurrentScope(objDef_newTypeInst._scope);
	//assign parent type to this type
	objDef_newTypeInst._parentType = objDef_prnRef;
	//create symbol 'this'
	var objDef_this = new symbol("this", objDef_newTypeInst, objDef_newTypeInst._scope);
	//add 'this' to the scope
	objDef_newTypeInst._scope.addSymbol(objDef_this);
	//loop thru template list and insert data into type object
	for( var i = 0; i < objDef_tempArr.length; i++ ){
		//add template type name to the list inside type object
		objDef_newTypeInst._templateNameArray.push({
			name: objDef_tempArr[i],
			type: null			//this is a base type
		});
	}	//end loop thru template list
	//try to parse content of object
	this.process__objectStatements(objDef_newTypeInst);
	//if it did not crash that should mean statements were processed successfully
	//next token should be closing code bracket
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("missing '}' in the object definition");
	}
	//consume '}'
	this.next();
	//remove function scope from the stack
	this._stackScp.pop();
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.TYPE, objDef_newTypeInst);
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
parser.prototype.process__singleObjectStatement = function(t){
	//init parsing result
	var singleObjStmtRes = null;
	//try two kinds of object statements
	if(
		//try to parse data field
		(singleObjStmtRes = this.process__dataFieldDeclaration(t)).success == false &&

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
//input(s):
//	t: (type) => new object type
parser.prototype.process__dataFieldDeclaration = function(t){
	//initialize array of hashmaps to collect important data field information
	var dtFieldInfo = [];
	//try to process type
	var dtFldDeclRes_Type = this.process__type();
	//if type was not processed successfully
	if( dtFldDeclRes_Type.success == false ){
		//it is not data field, fail
		return FAILED_RESULT;
	}
	//declare temporary hashmap for type
	var tmpTy = {};
	//get the type
	tmpTy['type'] = dtFldDeclRes_Type.get(RES_ENT_TYPE.TYPE, false);
	//add hashmap to array
	dtFieldInfo.push(tmpTy);
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
	//declare temporary hashmap for id
	var tmpId = {};
	//save identifier
	tmpId['id'] = dtFldDeclRes_Id;
	//add hashmap to array
	dtFieldInfo.push(tmpId);
	//create symbol for this data field
	var dfd_symb = new symbol(tmpId['id'], tmpTy['type'], t._scope);
	//******** need to add symbol to scope
	//add field to the type (no command associated, right now)
	t.addField(
		tmpId['id'],
		tmpTy['type'],
		null				//no command associated, right now. Because for most types
							//we would need to call constructor to initialize value. But
							//this type's constructor may not have been defined, yet.
							//So postpone this command creation... Once all types have
							//been defined with empty constructor and other methods
							//initialized. Then, we would loop thru all non-base types
							//and compose constructor and other methods' code bodies.
							//TODO: this has to be done!!!
	);
	//return success to the caller
	return new Result(true, []);
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
	//initialize function definition object
	var funcDefObj = null;
	//if function with the given name is already defined in type object
	if( t && (funcName in t._methods) ){
		//if function type is constructor, then allow to change number of func arguments
		if( funcDefNameType == FUNCTION_TYPE.CTOR ){
			//assign function reference
			funcDefObj = t._methods[funcName];
		//if it is not custom function, then delete my definition
		} else if(funcDefNameType != FUNCTION_TYPE.CUSTOM) {
			//remove function reference from the object
			delete t._methods[funcName];
			//do not assign function reference, so that it will be created fresh
		} else {	//if it is custom function, then this function is re-declared => bug
			//this is a bug in user code
			this.error("custom function is re-defined");
		}	//end if function type is constructor
	}
	//if still need to create function
	if( funcDefObj == null ){
		//create function object
		funcDefObj = new functinoid(
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
	}	//end if function exists in type object
	//set function's scope as a current
	this.addCurrentScope(funcDefObj._scope);
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
		var tmpName = tmpCurArg.id;
		//get type
		var tmpType = tmpCurArg.type;
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
			COMMAND_TYPE.POP,	//command for retrieving argument from the stack
			[],					//command takes no arguments
			[tmpFuncArgSymb]	//symbol representing current function argument
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
	while( this._curTokenIdx < this._tokens.length ){
		//check if current token is opening curly bracket
		if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == true ){
			//found code open bracket, increment counter
			cntCurlyBrackets++;
		} else if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == true ){
			//found code close bracket, decrement counter
			cntCurlyBrackets--;
		}	//end if current toke is code open bracket
		//quit loop, when we find closing curly bracket for function code
		if( cntCurlyBrackets == 0 ){
			break;
		}	//end if token index is valid
		//increment to the next token
		this.next();
	}	//end loop thru token set
	//check if we found '}' that closes function code body
	if( cntCurlyBrackets != 0 ){
		//reached the end of program, but have not found closing bracket for
		//this function, this has to be a user code bug
		this.error("missing '}' for function code block");
	}
	//if there is a code inside function, then create task
	if( this._curTokenIdx + 1 < curTkIdx ){
		//create function body block where goes the actual code
		//	Note: the current block is designed for function arguments
		var tmpFuncBodyBlk = funcDefObj._scope.createBlock(true);
		//create task and reference it to function
		funcDefObj._task = this.addTask(
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
	//return function instance
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.FUNCTION, funcDefObj);
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
				if( cnt == -1 ){
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
		typeIdArr.push({
			'id': typeIdRes_id, 
			'type': typeIdRes_type.get(RES_ENT_TYPE.TYPE, false)
		});
		//increment element counter
		i++;
	}	//end loop thru type-identifier pair list
	//check that the next token matches END
	if( this.isCurrentToken(end) == false ){
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
	//phase # 1A -- process defintions, and add tasks for statement sequence
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
		//TODO: *** for function, we may need to create a symbol in global scope
		//TODO: *** for objects, we may need to create a symbol in global scope
		//check if the next token is '.'
		if( this.isCurrentToken(TOKEN_TYPE.PERIOD) ){
			//found end of program, so break out of loop
			break;
		} else if( this.isCurrentToken(TOKEN_TYPE.SEMICOLON) ){
			//consume this token (skip to the next token)
			this.next();
		}
	} while(true);	//end loop to parse program

	//Phase # 1B -- loop thru types that were defined in the phase # 1A and complete
	//code for all fundamental/required functions (such as constructors, comparison
	//operator, toString method, etc...)
	
	//loop thru types
	for( var tmpCurIterName in type.__library ){
		//set reference to type
		var tmpCurIterType = type.__library[tmpCurIterName];
		//check if iterated type is an object
		if( typeof tmpCurIterType == "object" ){
			//if this type's scope does not have 'this' defined, then this type has
			//never been defined by the user (i.e. bug in user code)
			if( !('this' in tmpCurIterType._scope._symbols) && tmpCurIterType._baseType == null ){
				//fail
				this.error("type " + tmpCurIterType._name + " has not been defined, but is used");
			}	//end if type has not been defined by user
			//loop thru methods of this type
			for( var tmpCurFuncName in tmpCurIterType._methods ){
				//get reference to the method
				var tmpCurFunc = tmpCurIterType._methods[tmpCurFuncName];
				//check that this is an object
				if( typeof tmpCurFunc == "object" ){
					//check if this function is not custom and does not have task
					if( 
						(tmpCurFunc._func_type.value !== FUNCTION_TYPE.CUSTOM.value) && 
						!('_task' in tmpCurFunc) 
					){
						//depending on the type of function
						switch(tmpCurFunc._func_type.value){
							//constructor function type
							case FUNCTION_TYPE.CTOR.value:
								//loop thru fields of this type
								for( var tmpTypeField in tmpCurIterType._fields ){
									//make sure that this field is an object
									if( typeof tmpTypeField != "function" ){
										//create field
										tmpCurIterType.createField(
											//field name
											tmpTypeField,
											//field type
											tmpCurIterType._fields[tmpTypeField].type,
											//constructor's first block
											tmpCurFunc._scope._current
										);
									}	//end if field is an object
								}	//end loop thru fields
								break;
							//all other fundamental function types
							default:
								//create external call to complete fundamental function
								tmpCurFunc._scope._current.createCommand(
									//call to external (JS) function
									COMMAND_TYPE.EXTERNAL,
									//process(FUNCTION_TYPE_NAME, TYPE_ID)
									[value.createValue("process(" + tmpCurFunc._func_type.name + "," + tmpCurIterType._id + ")")],
									//no associated symbols
									[]
								);
								break;
						}	//end case on function type
					}	//end if function is not custom and has no task
				}	//end if iterated method is an object
			}	//end loop thru methods
		}	//end if iterated type is an object
	}	//end loop thru defined types

	//Phase # 2 -- process function code snippets

	//init index for looping thru tasks and process
	/*var curTaskIdx = 0;
	//loop thru tasks and process each one of them
	for( ; curTaskIdx < this._taskQueue.length; curTaskIdx++ ){
		//load currently iterated task into parser
		this.loadTask(this._taskQueue[curTaskIdx]);
		//execute statements for this code snippet
		this.seqStmts();
	}	//end loop thru tasks
	*/
};	//end program