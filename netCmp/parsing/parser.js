/**
	Developer:	Eduard Sedakov
	Date:		2015-12-05
	Description:	parsing components
	Used by:	(testing)
	Dependencies: {lexer},{parsing types},{parsing obj}, {logic tree}, {preprocessor}
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
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): moved initialization
	//	of '_tokens' after processing template list (TTUs)
	var tokenList = l.process(code);
	//make sure that set of resulting tokens is not empty
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): renamed variable, since
	//	moved initialization of '_tokens' to the end of the function
	if( tokenList.length == 0 ){
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
	//create instance of pre-processor
	this._pre_processor = new preprocessor(tokenList);
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): use preprocessor to
	//	retrieve all TTUs (Template Type Usage = TTU) so that parser could
	//	know how many and which templates are used for each type that has
	//	template arguments
	this._TTUs = this._pre_processor.processTTUs();
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): loop thru base types
	for( tmpBaseTypeName in this._TTUs ){
		//get set of TTUs associated with this base type name
		var tmpTTUSet = this._TTUs[tmpBaseTypeName];
		//loop thru TTUs
		for( tmpCurrentTTU in tmpTTUSet ){
			//get array of type names associated with templates of this base type
			var tmpAssociatedTypeArr = tmpTTUSet[tmpCurrentTTU];
			//loop thru array of type names associated with template
			for( var i = 0; i <  tmpAssociatedTypeArr.length; i++ ){
				//reset token list
				this._tokens = [];
				//get current associated type name
				var tmpTypeName = tmpAssociatedTypeArr[i];
				//check if this entity has templates itself
				if( tmpTypeName.indexOf('<') >= 0 ){
					//skip this entity => it will processed later
					continue;
				}
				//add current type to the token list
				this._tokens.push(new Token(tmpTypeName));
				//process type
				var tmpTypeRes = this.process__type();
				//ensure that type was processed successfully
				if( tmpTypeRes.success == false ){
					//error (possibly in a parser)
					this.error("548756478568467435");
				}
			}	//end loop thru array of associated types
		}	//end loop thru TTUs of current base type
	}	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): end loop thru base types
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): moved '_tokens' initialization
	//	because needed to use token list for setting up types associated with
	//	templates used in the code
	this._tokens = tokenList;
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
//	ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): add argument 'tmpls'
//	tmpls: array of template argument types associated with currently processed
//			type that uses templates. If we are processing type without templates
//			or not processing type at all, then this function argument should be
//			passed as NULL.
//output(s):
//	associative array representing new task
parser.prototype.addTask = function(start, end, scp, blk, tmpls){
	//add new task entry
	this._taskQueue.push({

		//save information to restart processing, later on
		start: start,
		end: end,
		scp: scp,
		blk: blk,

		//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): add field to
		//	represent array of template argument types
		tmpls: tmpls,

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
	//assign line and token indexes
	this._curLineToken = tk.curLnIdx;
	this._curTokenIdx = tk.curLnTkn;
	//re-initialize scope stack
	this._stackScp = [];
	//loop thru scope hierarhcy, starting from the given scope
	//	to reconstruct scope stack
	var tmpScp = tk.scp;
	while( tmpScp != null ){
		//add scope to the stack
		this._stackScp.push(tmpScp);
		//switch to parent scope
		tmpScp = tmpScp._owner;
	}
	//we have add scopes in reverse order (from function scope to global)
	//	so, reverse the order of stack 
	this._stackScp.reverse();
	//reset current block
	this.getCurrentScope(false)._current = tk.blk;
};	//end function 'loadTask'

//-----------------------------------------------------------------------------
// manipulations with definition and usage CHAINS
//-----------------------------------------------------------------------------

//determine last entry for definition and usage chanins
//	of all accessible symbols in the given scope
//input(s):
//	s: (scope) scope from which to search for all accessible symbols
//output(s):
//	HashMap<SymbolName, Array<command>> => key is a symbol name, and value 
//		is an array where, first element is a definition command and
//		second element is a usage command (for this symbol). This array
//		will always have two elements, and if symbol has no usage, then
//		the second element will be set to null
parser.prototype.getDefAndUsageChains = function(s){
	//get all accessible symbols
	var symbs = s.getAllAccessibleSymbols();
	//initialize resulting hashmap
	var res = {};
	//loop thru accessible symbols
	for( var tmpSymbName in symbs ){
		//get value
		var tmpVal = symbs[tmpSymbName];
		//make sure that value is an obect
		if( typeof tmpVal == "object" ){
			//add def and use items for the current symbol
			res[tmpSymbName] = [val.getLastDef(), val.getLastUse()];
		}	//end if value is an object
	}	//end loop thru accessible symbols
	//return hashmap of def/use last entries
	return res;
};	//end function 'getDefAndUsageChains'

//restore definition and usage chains to the specified
//state (acquired via function 'getDefAndUsageChains')
//input(s):
//	state: (HashMap<SymbolName, Array<command>>) => hashmap of symbols
//		that provide fast access of last def and use chains
//	scp: (scope) => scope which contains all accessible symbols of this state
//output(s):
//	(HashMap<SymbolName, [Command, Symbol]>) => hashmap of symbol 
//		names and last definition commands with symbol. This hashmap
//		will only include symbols, whose definition is different
//		between current state and the given state ('state').
parser.prototype.resetDefAndUseChains - function(state, scp){
	//initialize returning collection that will keep
	//track of definition commands for those symbols
	//where it is not same as in given state
	var res = {};
	//get all symbols
	var symbs = scp.getAllAccessibleSymbols();
	//loop thru symbols of the given state
	for( var tmpSymbName in state ){
		//get value
		var tmpVal = state[tmpSymbName];
		//make sure that value is an object
		if( typeof tmpVal == "object" ){
			//make sure that this symbol is known
			if( !(tmpSymbName in symbs) ){
				//this symbol is not known, skip
				continue;
			}
			//get symbol
			var tmpSymb = symbs[tmpSymbName];
			//get current symbol's usage command
			var tmpUse = tmpSymb.getLastUse();
			//get current symbol's definition command
			var tmpDef = tmpSymb.getLastDef();
			//if definition chain changed
			if( tmpDef != tmpVal[0] ){
				//add new entry to result set
				res[tmpSymbName] = [tmpDef, tmpSymb];
				//restore definition chain to prior state OR empty it out
				while( tmpSymb.getLastDef() != tmpVal[0] 

					//make sure that def-chain is not empty
					&& tmpSymb._defOrder.length > 0
				){
					//remove last def-chain entry
					tmpSymb.delLastFromDefChain();
				}	//end loop to restore def-chain
			}	//end if def-chain changed
			//restore usage chain, similarly
			while( tmpUse != tmpVal[1]

				//make sure that use-chain is not empty
				&& tmpSymb._useOrder.length > 0
			){
				//remove last use-chain entry
				tmpSymb.delLastFromUseChain();
			}	//end loop to restore use-chain
		}	//end if value is an object
	}	//end loop thru symbols
};	//end function 'resetDefAndUseChains'

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
FOREACH_LOOP: 'foreach' '(' IDENTIFIER ':' DESIGNATOR ')' '{' [ STMT_SEQ ] '}'
RETURN: 'return' LOGIC_EXP
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

//determine nearest loop scope starting from the current scope
//input(s): (none)
//output(s):
//	=> (scope) loop scope
//	=> NULL - if no loop scope was found in the hierarchy, starting from the current scope
parser.prototype.get__nearestFunctionScope = function(){
	//get current loop scope
	var s = this.getCurrentScope();
	//loop thru scope hierarchy starting from current scope
	while( s !== null && s._owner !== null ){
		//is currently iterated scope represents a LOOP
		if( s._type == SCOPE_TYPE.FUNCTION ){
			return s;
		}	//end if scope is a loop
		//switch to parent scope
		s = s._owner;
	}	//end loop thru scope hierarchy
	//did not find a loop scope
	return null;
};	//end function 'get__nearestLoopScope'

//return statement
//	=> syntax: 'return' LOGIC_EXP
//	=> semantic: (none)
parser.prototype.process__return = function(){
	//ensure that the first token is RETURN
	if( this.isCurrentToken(TOKEN_TYPE.RETURN) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume RETURN
	this.next();
	//get nearest function scope
	var funcScp = this.get__nearestFunctionScope();
	//make sure that return is inside function
	if( funcScp == null ){
		//error
		this.error("RETURN statement not inside function");
	}
	//process expression
	var expRes = this.processLogicTreeExpression(true);
	//check that expression was processed successfully
	if( expRes.success == false ){
		//error
		this.error("436756278645786547");
	}
	//get command from processed logical expression
	var expCmd = expRes.get(RES_ENT_TYPE.COMMAND, false);
	//check that command for logical expression was found
	if( expCmd == null ){
		//error
		this.error("47384732837855");
	}
	//create RETURN command
	var retCmd = this.getCurrentScope()._current.createCommand(
		COMMAND_TYPE.RETURN,
		[expCmd],
		[]
	);
	//get type of processed expression
	var expType = expRes.get(RES_ENT_TYPE.TYPE, false);
	//ensure that type was found successfully
	if( expType == null ){
		//error
		this.error("194298478934892474");
	}
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, retCmd)
		.addEntity(RES_ENT_TYPE.TYPE, expType);
};	//end 'return'

//determine nearest loop scope starting from the current scope
//input(s): (none)
//output(s):
//	=> (scope) loop scope
//	=> NULL - if no loop scope was found in the hierarchy, starting from the current scope
parser.prototype.get__nearestLoopScope = function(){
	//get current loop scope
	var s = this.getCurrentScope();
	//loop thru scope hierarchy starting from current scope
	while( s !== null && s._owner !== null ){
		//is currently iterated scope represents a LOOP
		if( s._type == SCOPE_TYPE.WHILE ||
			s._type == SCOPE_TYPE.FOREACH ){
			return s;
		}	//end if scope is a loop
		//switch to parent scope
		s = s._owner;
	}	//end loop thru scope hierarchy
	//did not find a loop scope
	return null;
};	//end function 'get__nearestLoopScope'

//continue:
//	=> syntax: 'continue'
//	=> semantic: jump to a PHI block of nearest LOOP scope
parser.prototype.process__continue = function(){
	//ensure that the first token is CONTINUE
	if( this.isCurrentToken(TOKEN_TYPE.CONTINUE) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume CONTINUE
	this.next();
	//get nearest loop scope
	var loopScp = this.get__nearestLoopScope();
	//make sure that loop scope was found
	if( loopScp == null ){
		//error
		this.error("9372741848978748");
	}
	//get starting block in this scope
	var phiBlk = loopScp._start;
	//ensure that starting block is known
	if( phiBlk == null ){
		//error
		this.error("237284723984738");
	}
	//get block where to insert CONTINUE
	var curBlk = this.getCurrentScope()._current;
	//create un-conditional jump to PHI block
	contCmd = curBlk.createCommand(
		COMMAND_TYPE.BRA,
		phiBlk._cmds[0],
		[]
	);
	//make this block jump into PHI block
	block.connectBlocks(
		curBlk,
		phiBlk,
		B2B.JUMP
	);
	//create new current block
	var followBlk = this.getCurrentScope().createBlock(true);
	//make previous current block fall into new current block
	block.connectBlocks(
		curBlk,
		followBlk,
		B2B.FALL
	);
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, followBlk)
		.addEntity(RES_ENT_TYPE.COMMAND, contCmd);
};	//end 'continue'

//break:
//	=> syntax: 'break'
//	=> semantic: jump to a finalizing block of nearest LOOP scope
parser.prototype.process__break = function(){
	//ensure that the first token is BREAK
	if( this.isCurrentToken(TOKEN_TYPE.BREAK) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume BREAK
	this.next();
	//get nearest loop scope
	var loopScp = this.get__nearestLoopScope();
	//make sure that loop scope was found
	if( loopScp == null ){
		//fail
		this.error("34784673278235");
	}
	//get ending block in this scope
	var finBlk = loopScp._end;
	//ensure that starting block is known
	if( finBlk == null ){
		//fail
		this.error("132748327837");
	}
	//get block where to insert CONTINUE
	var curBlk = this.getCurrentScope()._current;
	//create un-conditional jump to finalizing block
	contCmd = curBlk.createCommand(
		COMMAND_TYPE.BRA,
		finBlk._cmds[0],
		[]
	);
	//make this block jump into finalizing block
	block.connectBlocks(
		curBlk,
		finBlk,
		B2B.JUMP
	);
	//create new current block
	var followBlk = this.getCurrentScope().createBlock(true);
	//make previous current block fall into new current block
	block.connectBlocks(
		curBlk,
		followBlk,
		B2B.FALL
	);
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, followBlk)
		.addEntity(RES_ENT_TYPE.COMMAND, contCmd);
};	//end 'break'

//create PHI commands for all accessible symbols
//input(s):
//	s: (scope) scope where to start search for accessible symbols
//	phiBlk: (block) PHI block for loop construct
//output(s):
//	(HasMap<SymbolName, Command>) => symbols as keys, referencing phi commands as values
parser.prototype.createPhiCmdsForAccessibleSymbols = function(s, phiBlk){
	//get all accessible symbols
	var symbs = s.getAllAccessibleSymbols();
	//initialize resulting hashmap
	var res = {};
	//loop thru accessible symbols
	for( var tmpSymbName in symbs ){
		//get value
		var tmpVal = symbs[tmpSymbName];
		//make sure that value is an obect
		if( typeof tmpVal == "object" ){
			//determine last entry from def-chain of this symbol
			var tmpDefCmd = tmpVal.getLastDef();
			//create PHI command for this symbol
			res[tmpSymbName] = phiBlk.createCommand(
				COMMAND_TYPE.PHI,
				[tmpDefCmd],
				[tmpVal]
			);
		}	//end if value is an object
	}	//end loop thru accessible symbols
	//return hashmap with phi commands for each accessible symbol
	return res;
};	//end function 'createPhiCmdsForAccessibleSymbols'

//complete PHI commands for each symbol by adding an extra argument 
//	that should represent command that changes value of the given
//	symbol inside the loop's body.
//input(s):
//	phiBlk: (block) PHI block for loop construct
//	phiCmds: (HashMap<SymbolName, Command>) symbols as keys and PHI commands as values
//				provided by the function 'createPhiCmdsForAccessibleSymbols'
//	defUseChain: (HashMap<SymbolName, Array<command>) symbols as keys and def/use chain
//				commands as values, provided by the function 'getDefAndUsageChains'
//output(s): (none)
parser.prototype.revisePhiCmds = function(phiBlk, phiCmds, defUseChain){
	//get all accessible symbols
	var symbs = s.getAllAccessibleSymbols();
	//get reference to the current scope
	var curScope = this.getCurrentScope();
	//loop thru commands in the given block to revise them
	for( var tmpSymbName in phiCmds ){
		//for fast access declare variable to refer to the current
		//phi instuction
		var tmpPhiCmd = phiCmds[tmpSymbName];
		//determine symbol representing current phi
		var tmpSymbRef = symbs[tmpSymbName];
		//if such symbol is NOT inside def-use chain
		if( !(tmpSymbName in defUseChain) ){
			//skip it
			continue;
		}
		//retrieve last entry from definition chain
		var lastDefCmd = defUseChain[tmpSymbName][0];
		//get reference to the first argument in PHI command
		var firstArgInPhiCmd = tmpPhiCmd._args[0];
		//if symbol was redefined inside the loop
		if( lastDefCmd != firstArgInPhiCmd &&
			lastDefCmd != tmpPhiCmd ){
			//include last definition inside the phi information entry
			tmpPhiCmd.addArgument(lastDefCmd);
		}	//end if symbol was redefined in the loop
	}	//end loop thru PHI commands
};	//end function 'revisePhiCmds'

//while_loop:
//	=> syntax: 'while' LOGIC_EXP '{' [ STMT_SEQ ] '}'
//	=> semantic: (none)
parser.prototype.process__while = function(){
	//check that first token is 'WHILE'
	if( this.isCurrentToken(TOKEN_TYPE.WHILE) ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'WHILE'
	this.next();
	//get current block
	var tmpParScope = this.getCurrentScope();
	var tmpPrevCurBlk = tmpParScope._current;
	//create PHI block
	var phiBlk = tmpParScope.createBlock(true);
	//make previous current block fall in PHI
	block.connectBlocks(
		tmpPrevCurBlk,		//source
		phiBlk,				//dest
		B2B.FALL			//fall-thru
	);
	//create new scope for WHILE-loop construct
	var whileLoopScp = new scope(
		tmpParScope,		//parent scope
		SCOPE_TYPE.WHILE,	//scope type
		null,				//not functinoid
		null,				//not object
		phiBlk,				//starting block
		null,				//no finalizing block, yet
		null,				//no current block
		[]					//no symbols, yet
	);
	//set WHILE loop as a current scope
	this.addCurrentScope(whileLoopScp);
	//create block for conditions (separate from PHI block)
	var condBlk = whileLoopScp.createBlock(true);	//make it current block
	//make PHI block fall thru condition block
	block.connectBlocks(
		phiBlk,				//source
		condBlk,			//dest
		B2B.FALL			//fall-thru
	);
	//get phi commands for all accessible symbols
	var phiCmds = this.createPhiCmdsForAccessibleSymbols(tmpParScope, phiBlk);
	//process logical expression
	var whileExpRes = this.processLogicTreeExpression(false);
	//check if logical expression was processed un-successfully
	if( whileExpRes.success == false ){
		//error
		this.error("7587589424738323");
	}
	//function that processed logical tree expression
	//creates series of blocks and connects them in
	//the following manner:
	//          [condition]
	//         /           \
	//        /             \
	//    [success]      [failure]
	//        \             /
	//         \           /
	//      [finalizing block]
	//function creates SUCCESS, FAILURE, and FIN blocks
	//But for LOOP we need a simpler construct, specifically:
	//   +----->[phi block]
	//   |           |
	//   |      [condition]
	//   |          / \
	//   |         /   \
	//   |        /     \
	//   |       /       \
	//   |  [loop body]   \
	//   |      |          \
	//   +------+   [outside of loop]
	//we already have PHI and CONDITION blocks created.
	//So we need LOOP and OUTSIDE blocks, which can be
	//represented by SUCCESS and FAILURE blocks, respectively.
	//Note: we do not need "finalizing block", so disregard it.
	//get reference to SUCCESS and FAIL blocks
	var loopBodyBlk = blkArr[0];	//success block
	var outsideLoopBlk = blkArr[1];	//fail block
	//insert body block to the WHILE scope as a current
	whileLoopScp.setCurrentBlock(loopBodyBlk);
	//add outsideLoop block to the parent of WHILE scope
	tmpParScope.addBlock(outsideLoopBlk);
	//set 'outsideLoopBlk' as finalizing block of WHILE scope (but it is not part of while scope)
	whileLoopScp._end = outsideLoopBlk;
	//ensure that the next token is '{' (CODE_OPEN)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//error
		this.error("expecting '{' to start body clause of WHILE loop");
	}
	//consume '{'
	this.next();
	//get command library
	var cmdLib = command.getLastCmdForEachType();
	//get def/use chains for all accessible symbols
	var defUseChains = this.getDefAndUsageChains(tmpParScope);
	//process sequence of statements
	var seqStmtThenRes = this.process__sequenceOfStatements();
	//initialize reference to the last block in the loop body
	var lastLoopBlk = this.getCurrentScope()._current;
	//create un-conditional jump from BOYD block to PHI block
	loopBodyBlk.createCommand(
		COMMAND_TYPE.BRA,	//jump
		[phiBlk._cmds[0]],	//first command of PHI block
		[]					//no symbols
	);
	//set LOOP jump to PHI
	block.connectBlocks(
		loopBodyBlk,	//source
		phiBlk,			//dest
		B2B.JUMP		//jump
	);
	//restore command library to saved state
	command.restoreCmdLibrary(cmdLib);
	//restore def/use chains for all previously accessible symbols
	//	also, get collection of symbol names with last item of
	//	def-chain for each such symbol, so that we can revise
	//	PHI block for all symbols that were changed during LOOP
	//	body clause of WHILE loop construct.
	var changedSymbs = this.resetDefAndUseChains(defUseChains, tmpParScope);
	//complete phi commands in the PHI block (see function description)
	this.revisePhiCmds(phiBlk, phiCmds, defUseChains);
	//ensure that next token is '}' (CODE_CLOSE)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("expecting '}' to end THEN clause of IF condition");
	
	}
	//consume '}'
	this.next();
	//remove WHILE scope from scope stack
	this._stackScp.pop();
	//set outsideLoop block as a current block of new scope
	this.getCurrentScope().setCurrentBlock(outsideLoopBlk);
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, outsideLoopBlk)
		.addEntity(RES_ENT_TYPE.SCOPE, whileLoopScp);
};	//end 'while'

//foreach_loop: 
//	=> syntax: 'foreach' '(' IDENTIFIER ':' DESIGNATOR ')' '{' [ STMT_SEQ ] '}'
//	=> semantic: (none)
parser.prototype.process__forEach = function(){
	//check that first token is 'FOREACH'
	if( this.isCurrentToken(TOKEN_TYPE.FOREACH) ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'FOREACH'
	this.next();
	//get current block
	var tmpParScope = this.getCurrentScope();
	var tmpPrevCurBlk = tmpParScope._current;
	//create PHI block
	var phiBlk = tmpParScope.createBlock(true);
	//make previous current block fall in PHI
	block.connectBlocks(
		tmpPrevCurBlk,		//source
		phiBlk,				//dest
		B2B.FALL			//fall-thru
	);
	//create new scope for FOREACH-loop construct
	var forEachLoopScp = new scope(
		tmpParScope,		//parent scope
		SCOPE_TYPE.FOREACH,	//scope type
		null,				//not functinoid
		null,				//not object
		phiBlk,				//starting block
		null,				//no finalizing block, yet
		null,				//no current block
		[]					//no symbols, yet
	);
	//set FOREACH loop as a current scope
	this.addCurrentScope(forEachLoopScp);
	//create block for conditions (separate from PHI block)
	var condBlk = forEachLoopScp.createBlock(true);	//make it current block
	//make PHI block fall thru condition block
	block.connectBlocks(
		phiBlk,				//source
		condBlk,			//dest
		B2B.FALL			//fall-thru
	);
	//get phi commands for all accessible symbols
	var phiCmds = this.createPhiCmdsForAccessibleSymbols(tmpParScope, phiBlk);
	//make sure that next token is '('
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//error
		this.error("expecting '(' after FOREACH keyword");
	}
	//consume '('
	//process identifier that represents loop iterator
	var iter_id = this.process__identifier();
	//check if identifier was processed incorrectly
	if( iter_id == null ){
		//fail
		return this.error("expecting IDENTIFIER to represent iterator in FOREACH loop statement");
	}
	//ensure that next token is ':'
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == false ){
		//error
		this.error("expecting ':' in FOREACH loop, after IDENTIFIER (loop iterator)");
	}
	//consume ':'
	this.next();
	//process collection name thru which to loop
	var collExpRes = this.process__designator(null);
	//make sure that designator was processed successfully
	if( collExpRes.success == false ){
		//error
		this.error("expecting collection name in FOREACH loop statement, after ':'");
	}
	//make sure that next token ')'
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == false ){
		//error
		this.error("expecting ')' in FOREACH statement");
	}
	//get type of the collection variable
	var collType = collExpRes.get(RES_ENT_TYPE.TYPE, false);
	//get symbol representing collection variable
	var collSymb = collExpRes.get(RES_ENT_TYPE.SYMBOL, false);
	//get last definition command for collection var
	var collLastDefCmd = collSymb.getLastDef();
	//initializ flag: is this collection an array
	var collIsArr = false;
	//make sure that this is either array or hashmap
	if(
		//if collection's object type is array
		(collIsArr = (collType._type == OBJ_TYPE.ARRAY)) == false &&

		//if collection's object type is hashmap
		(collType._type == OBJ_TYPE.HASH)
	){
		//error
		this.error("must iterate thru collection object in FOREACH loop");
	}
	//make sure that collection has at least one template available
	if( collType._templateNameArray.length == 0 ){
		//error
		this.error("collection should have DERIVED templated type, i.e. template list should not be empty");
	}
	//initialize variable to represent types of iterator
	var iterType = null;
	//specify of iterator to be first element of template list
	iterType = collType._templateNameArray[0]._type;
	//create variable for representing loop iterator
	var iterSymb = this.create__variable(
		iter_id, 			//name of iterator var
		iterType, 			//type of iterator var
		tmpParScope, 		//parent scope around FOREACH loop
		tmpPrevCurBlk		//block that follows into PHI block of FOREACH loop
	);
	//create command ISNEXT to check if next element is available in collection
	var isNextCmd = condBlk.createCommand(
		COMMAND_TYPE.ISNEXT,
		[iterSymb.getLastDef(), collLastDefCmd],
		[]
	);
	//create NULL command for FALSE
	var nullCmdTrue = condBlk.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(false)],
		[]
	);
	//create comparison command to check if collection still has iterating elements available
	var cmpCmd = condBlk.createCommand(
		COMMAND_TYPE.CMP,
		[isNextCmd, nullCmdTrue],
		[]
	);
	//create command NEXT that takes 
	//   +----->[phi block]
	//   |           |
	//   |      [condition]
	//   |          / \
	//   |         /   \
	//   |        /     \
	//   |       /       \
	//   |  [loop body]   \
	//   |      |          \
	//   +------+   [outside of loop]
	//we already have PHI and CONDITION blocks created.
	//So we need LOOP and OUTSIDE blocks
	//create LOOP and OUTSIDE blocks
	var loopBodyBlk = forEachLoopScp.createBlock(true);	//LOOP BODY block (make it current in FOREACH scope)
	var outsideLoopBlk = tmpParScope.createBlock(true);	//OUTSIDE OF LOOP block (make it current in parent scope)
	//create conditional jump command to quit loop when there are no more items to iterate
	condBlk.createCommand(
		COMMAND_TYPE.BEQ,
		[cmpCmd, outsideLoopBlk._cmds[0]],
		[]
	);
	//make condition block fall in loop body block
	block.connectBlocks(
		condBlk,
		loopBodyBlk,
		B2B.FALL
	);
	//make condition block jump in outside of loop block
	block.connectBlocks(
		condBlk,
		outsideLoopBlk,
		B2B.JUMP
	);
	//inside condition block create command NEXT that should either
	//	grab next element from hashmap and store in iterator
	condBlk.createCommand(
		COMMAND_TYPE.NEXT,
		[iterSymb.getLastDef(), collLastDefCmd],
		[iterSymb]
	);
	//set 'outsideLoopBlk' as finalizing block of FOREACH scope (but it is not part of FOREACH scope)
	forEachLoopScp._end = outsideLoopBlk;
	//ensure that the next token is '{' (CODE_OPEN)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//error
		this.error("expecting '{' to start body clause of FOREACH loop");
	}
	//consume '{'
	this.next();
	//get command library
	var cmdLib = command.getLastCmdForEachType();
	//get def/use chains for all accessible symbols
	var defUseChains = this.getDefAndUsageChains(tmpParScope);
	//process sequence of statements
	var seqStmtThenRes = this.process__sequenceOfStatements();
	//initialize reference to the last block in the loop body
	var lastLoopBlk = this.getCurrentScope()._current;
	//create un-conditional jump from BOYD block to PHI block
	loopBodyBlk.createCommand(
		COMMAND_TYPE.BRA,	//jump
		[phiBlk._cmds[0]],	//first command of PHI block
		[]					//no symbols
	);
	//set LOOP jump to PHI
	block.connectBlocks(
		loopBodyBlk,	//source
		phiBlk,			//dest
		B2B.JUMP		//jump
	);
	//restore command library to saved state
	command.restoreCmdLibrary(cmdLib);
	//restore def/use chains for all previously accessible symbols
	//	also, get collection of symbol names with last item of
	//	def-chain for each such symbol, so that we can revise
	//	PHI block for all symbols that were changed during LOOP
	//	body clause of FOREACH loop construct.
	var changedSymbs = this.resetDefAndUseChains(defUseChains, tmpParScope);
	//complete phi commands in the PHI block (see function description)
	this.revisePhiCmds(phiBlk, phiCmds, defUseChains);
	//ensure that next token is '}' (CODE_CLOSE)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("expecting '}' to end THEN clause of IF condition");
	
	}
	//consume '}'
	this.next();
	//remove FOREACH scope from scope stack
	this._stackScp.pop();
	//set outsideLoop block as a current block of new scope
	this.getCurrentScope().setCurrentBlock(outsideLoopBlk);
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, outsideLoopBlk)
		.addEntity(RES_ENT_TYPE.SCOPE, forEachLoopScp);
};	//end 'foreach'

//if:
//	=> syntax: 'if' LOGIC_EXP '{' [ STMT_SEQ ] '}' [ 'else' '{' [ STMT_SEQ ] '}' ]
//	=> semantic: (none)
parser.prototype.process__if = function(){
	//ensure that first token is 'IF'
	if( this.isCurrentToken(TOKEN_TYPE.IF) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'if'
	this.next();
	//get current block
	var tmpParScope = this.getCurrentScope();
	var tmpPrevCurBlk = tmpParScope._current;
	//process logical tree expression
	var ifExpRes = this.processLogicTreeExpression(false);
	//get starting block of logical tree expression
	var ifExpStartBlock = tmpPrevCurBlk._fallInOther;
	//ensure that exp was successfully evaluated
	if( ifExpRes.success == false ){
		//if not successful, then error
		this.error("947387983278237");
	}
	//get reference to array with three new blocks
	var blkArr = ifExpRes.get(RES_ENT_TYPE.BLOCK, true);
	//get reference to SUCCESS, FAIL, and PHI blocks
	var successBlk = blkArr[0];
	var failBlk = blkArr[1];
	var phiBlk = blkArr[2];
	//create if-scope
	var ifScp = new scope(
		tmpParScope,			//parent scope
		SCOPE_TYPE.CONDITION,	//scope type
		null,					//not functinoid
		null,					//not object
		ifExpStartBlock,		//condition block
		phiBlk,					//finalizing block
		successBlk,				//make it as current -- THEN clause of IF condition
		[]						//no symbols, yet
	);
	//add FAIL block to the IF scope
	ifScp.addBlock(failBlk);
	//set IF scope as a current
	this.addCurrentScope(ifScp);
	//ensure that the next token is '{' (CODE_OPEN)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//error
		this.error("expecting '{' to start THEN clause of IF condition");
	}
	//consume '{'
	this.next();
	//get command library
	var cmdLib = command.getLastCmdForEachType();
	//get def/use chains for all accessible symbols
	var defUseChains = this.getDefAndUsageChains(tmpParScope);
	//process sequence of statements
	var seqStmtThenRes = this.process__sequenceOfStatements();
	//initialize reference to the last block in the THEN clause
	var thenBlk = this.getCurrentScope()._current;
	//create un-conditional jump to PHI block
	thenBlk.createCommand(
		COMMAND_TYPE.BRA,	//un-conditional jump
		[phiBlk],			//the only argument is a block where to jump
		[]					//no symbols
	);
	//connect last block in THEN clause to PHI
	block.connectBlocks(
		thenBlk,	//source: last THEN block
		phiBlk,		//dest: first (and only) PHI block
		B2B.JUMP	//type of connection: jump
	);
	//restore command library to saved state
	command.restoreCmdLibrary(cmdLib);
	//restore def/use chains for all previously accessible symbols
	//	also, get collection of symbol names with last item of
	//	def-chain for each such symbol, so that we can populate
	//	PHI block with all symbols that were changed during THEN
	//	clause of IF condition.
	var changedSymbs_Then = this.resetDefAndUseChains(defUseChains, tmpParScope);
	//ensure that next token is '}' (CODE_CLOSE)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("expecting '}' to end THEN clause of IF condition");
	}
	//consume '}'
	this.next();
	//initialize set of changed symbols in ELSE clause
	var changedSymbs_Else = {};
	//check if next token is ELSE
	if( this.isCurrentToken(TOKEN_TYPE.ELSE) == true ){
		//consume ELSE token
		this.next();
		//switch to the ELSE block as current
		ifScp.setCurrentBlock(failBlk);
		//if next token is 'IF' (i.e. 'ELSE IF')
		if( this.isCurrentToken(TOKEN_TYPE.IF) == true ){
			//call this function again to process ELSE-IF condition
			var elseIfRes = this.process__if();
			//ensure that ELSE-IF was processed successfully
			if( elseIfRes.success == false ){
				//error
				this.error("54825784754289");
			}	//end if ELSE-IF successfully processed
		//otherwise, check that next token is '{'
		} else if(this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == true ){
			//consume '{'
			this.next();
			//process sequence of statements
			var seqStmtThenRes = this.process__sequenceOfStatements();
			//initialize reference to the last block in the ELSE clause
			var elseBlk = this.getCurrentScope()._current;
			//fall-thru last block in ELSE clause to PHI
			block.connectBlocks(
				elseBlk,	//source: last ELSE block
				phiBlk,		//dest: first (and only) PHI block
				B2B.FALL	//type of connection: fall thru
			);
			//restore command library to saved state
			command.restoreCmdLibrary(cmdLib);
			//restore def/use chains for all previously accessible symbols
			//	also, get collection of symbol names with last item of
			//	def-chain for each such symbol, so that we can populate
			//	PHI block with all symbols that were changed during THEN
			//	clause of IF condition.
			var changedSymbs_Else = this.resetDefAndUseChains(defUseChains, tmpParScope);
			//ensure that next token is '}'
			if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
				//error
				this.error("expecting '}' to end ELSE clause of IF condition");
			}
			//consume '}'
			this.next();
		} else { //otherwise, error
			//error
			this.error("expecting either 'IF' or '{' after 'ELSE' keyword in IF condition");
		}	//end if next token is 'IF'
	}	//end if next token is 'ELSE'
	//loop thru symbols that were changed in THEN clause
	for( var tmpSymbName in changedSymbs_Then ){
		//get symbol reference
		var tmpSymbRef = changedSymbs_Then[tmpSymbName][1];
		//get last definition of this symbol
		var phiLeftCmd = changedSymbs_Then[tmpSymbName][0];
		//initialize right-side command for PHI
		var phiRightCmd = null;
		//if this symbol is inside ELSE changed set
		if( tmpSymbName in changedSymbs_Else ){
			//get command from ELSE changed set
			phiRightCmd = changedSymbs_Else[tmpSymbName][0];
		} else {
			//get last def-chain command for this symbol that
			//	was setup before parsing this IF condition
			phiRightCmd = tmpSymbRef.getLastDef();
		}
		//create PHI command
		phiBlk.createCommand(
			COMMAND_TYPE.PHI,
			[phiLeftCmd, phiRightCmd],
			[tmpSymbRef]
		);
	}	//end loop thru symbols changed in THEN clause
	//loop thru symbols that were changed in ELSE clause
	for( var tmpSymbName in changedSymbs_Else ){
		//get symbol reference
		var tmpSymbRef = changedSymbs_Else[tmpSymbName][1];
		//get last definition of this symbol for left side of PHI command
		var phiLeftCmd = tmpSymbRef.getLastDef();
		//get right side of PHI command
		var phiRightCmd = changedSymbs_Else[tmpSymbName][0];
		//create PHI command
		phiBlk.createCommand(
			COMMAND_TYPE.PHI,
			[phiLeftCmd, phiRightCmd],
			[tmpSymbRef]
		);
	}	//end loop thru symbols changed in ELSE clause
	//remove current scope from scope stack
	this._stackScp.pop();
	//set PHI block to be current in the new current scope
	//	Note: do not use function 'setCurrentBlock' because
	//	it will add this block to the this new scope, and we
	//	still want PHI block to be inside IF condition scope
	this.getCurrentScope()._current = phiBlk;
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, phiBlk)
		.addEntity(RES_ENT_TYPE.SCOPE, ifScp);
};	//end 'if'

//assign/var_decl:
//	=> syntax: ('let' | 'var' TYPE) DESIGNATOR [ '=' EXP ]^var
//	=> semantic: combined assignment and variable
//		declaration statements in one.
//		Note: ( [ '=' EXP ]^var ) means that it is 
//			optional only for the case of variable
//			declaration, i.e. ( 'var' TYPE ) case.
parser.prototype.process__assignOrDeclVar = function(){
	//init a flag - do declare a variable OR assign a variable
	var doDeclVar = false;
	//determine whether assigning or declaring a variable
	//	Note: assign => 'let';	declare => 'var'
	if( this.isCurrentToken(TOKEN_TYPE.LET) == false &&
		(doDeclVar = this.isCurrentToken(TOKEN_TYPE.VAR)) == false
	) {
		//fail
		return FAILED_RESULT;
	}
	//consume first token ('var' or 'let')
	this.next();
	//init var that stores type of this variable
	var vType = null;
	//if declaring new variable
	if( doDeclVar == false ){
		//get token representing type
		var varTypeRes = this.process__type();
		//check if parent type is parsed not successfully
		if( varTypeRes.success == false ){
			//unkown type
			this.error("3257264578264786524");
		}
		//extract type from result set
		vType = varTypeRes.get(RES_ENT_TYPE.TYPE, false);
		//check that type was found in result set
		if( vType == null ){
			this.error("4738567465785468752");
		}
	}	//end if declaring new variable
	//process name of the variable
	var varNameRes = this.process__designator(vType);
	//ensure that variable name was processed successfully
	if( varNameRes.success == false ){
		//fail
		this.error("8937487389782482");
	}
	//process expression
	var vExpRes = this.processLogicTreeExpression(true);
	//try to get command from expression result set
	var vExpCmd = vExpRes.get(RES_ENT_TYPE.COMMAND, false);
	//check that command was found
	if( vExpCmd == null ){
		//fail
		this.error("249329874572853729");
	}
	//designator returns: TEXT, SYMBOL, COMMAND, and TYPE
	//get symbol from the designator result set
	var vSymb = varNameRes.get(RES_ENT_TYPE.SYMBOL, false);
	//get type
	vType = varNameRes.get(RES_ENT_TYPE.TYPE, false);
	//if type is either array or hashmap
	if( vType._type == OBJ_TYPE.ARRAY || vType._type == OBJ_TYPE.HASH ){
		//get command created by designator
		var vLastCmd = varNameRes.get(RES_ENT_TYPE.COMMAND, false);
		//if previous command is not LOAD, then it is error
		if( vLastCmd._type != COMMAND_TYPE.LOAD ){
			this.error("984983949379");
		}
		//change command from LOAD to STORE
		vLastCmd._type = COMMAND_TYPE.STORE;
		//store takes additional argument that represents value to be stored
		vLastCmd.addArgument(vExpCmd);
		//add symbol to the STORE command
		vLastCmd.addSymbol(vSymb);
	} else {	//if it is a singleton (not array and not hashmap)
		//add symbol to the expression command
		vExpCmd.addSymbol(vSymb);
	}	//end if assigned variable is array or hashmap
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, vExpCmd)
		.addEntity(RES_ENT_TYPE.SYMBOL, vSymb);
};	//end statement assign/var_decl

//process boolean expression that can result in a change of
//	program's control flow, i.e. if-condition, while-loop,
//	or an assignment that uses AND/OR operators
//input(s):
//	doCreateBoolConsts: (boolean) => should commands (null)
//		that initialize boolean constants (TRUE and FALSE)
//		be created in SUCCESS and FALSE blocks, respectively
//output(s):
//	(Result) => would be passed from 'process__logicExp' function if it is not
//					boolean logical tree expression, OR
//	(Result) => result would contain 3 blocks if this was a logical expression:
//		successBlk: (Block) jump to this block if boolean expression is computed successfully
//		failBlk: (Block) jump to this block if boolean expression is computed un-successfully
//		phiBlk: (Block) block which connects success and fail blocks
//                  [condition]
//                 /           \
//                /             \
//               /               \
//          [success]         [failure]
//               \               /
//                \             /
//                 \           /
//                  [phi block]
parser.prototype.processLogicTreeExpression = 
	function(doCreateBoolConsts){
	//get current scope
	var curScp = this.getCurrentScope();
	//get current block
	var prevCurBlk = curScp._current;
	//create new current block
	var newCurBlk = curScp.createBlock(true);
	//connect previous block to a new one
	block.connectBlocks(prevCurBlk, newCurBlk, B2B.FALL);
	//parse logic expression
	var res = this.process__logicExp();
	//check if logic expression failed
	if( res.success == false ){
		//fail
		return FAILED_RESULT;
	}
	//try to get logic node out of returned result set
	var logNd = res.get(RES_ENT_TYPE.LOG_NODE, false);
	//if it is a logic expression (i.e. uses logic tree)
	if( logNd !== null ){
		//create array for 3 blocks: success, fail, and phi
		var blkArr = [];
		//initialize PHI command
		var phiCmd = null;
		//create success block [0]
		blkArr.push(curScp.createBlock(false));
		//create fail block [1]
		blkArr.push(curScp.createBlock(false));
		//create phi block [2]
		blkArr.push(curScp.createBlock(false));
		//should create boolean constants TRUE and FALSE
		if( doCreateBoolConsts ){
			//create constant command (null) TRUE in SUCCESS block
			var successCmd = blkArr[0].createCommand(
				COMMAND_TYPE.NULL,
				[value.createValue(true)],
				[]
			);
			//create constant command (null) FALSE in FAIL block
			var failCmd = blkArr[1].createCommand(
				COMMAND_TYPE.NULL,
				[value.createValue(false)],
				[]
			);
			//create PHI command in PHI block
			phiCmd = blkArr[2].createCommand(
				COMMAND_TYPE.PHI,
				[successCmd, failCmd],
				[]
			);
			//create un-conditional jump from SUCCESS block to a PHI block
			blkArr[0].createCommand(
				COMMAND_TYPE.BRA,
				[blkArr[2]],	//destination block
				[]
			);
			//setup a jump from SUCCESS to PHI
			block.connectBlocks(
				blkArr[0],	//source: SUCCESS
				blkArr[2],	//dest: PHI
				B2B.JUMP
			);
			//setup a fall-thru from FAIL to PHI
			block.connectBlocks(
				blkArr[1],	//source: SUCCESS
				blkArr[2],	//dest: PHI
				B2B.FALL
			);
		}	//end if create boolean constants
		//process logic tree
		this.logTree.process(
			blkArr[0]._cmds[0],	//first command in SUCCESS block
			blkArr[1]._cmds[0]	//first command in FAIL block
		);
		//refresh logical tree
		this.logTree.clear();
		//setup result set
		res = new Result(true, [])
			.addEntity(RES_ENT_TYPE.TYPE, 
				new type("boolean", OBJ_TYPE.BOOL, this._gScp))
			.addEntity(RES_ENT_TYPE.COMMAND, phiCmd)
			.addEntity(RES_ENT_TYPE.BLOCK, blkArr[0])
			.addEntity(RES_ENT_TYPE.BLOCK, blkArr[1])
			.addEntity(RES_ENT_TYPE.BLOCK, blkArr[2]);
	}	//end if need to process logic expression tree
	//return result set
	return res;
};	//end function 'processLogicTreeExpression'

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
	//create comparison command
	var relExp_compCmd = relExp_curBlk.createCommand(
		COMMAND_TYPE.CMP,
		[relExp_lh_cmd, relExp_rh_cmd],	//left and right hand side relational expressions
		[]								//no associated symbols
	);
	//create jump command with the command type specified by relational operator
	//Note: destination command will be set up by logical tree component
	var relExp_jmpCmd = relExp_curBlk.createCommand(
		relOpCmdType,			//command type
		[relExp_compCmd],		//reference comparison command
		[]
	);
	//create new current block, since this block is ended with a jump instruction
	//	Note: do not connect previous and new blocks together; block connections
	//	will be handled by the logical tree component
	this.getCurrentScope().createBlock(true);	//pass 'true' to set new block as current
	//create terminal node in the logic tree
	var relExp_termNode = this.logTree.addTerminal(
		relExp_jmpCmd,			//jump command
		null					//at this point there is no parent node, yet
	);
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, relExp_jmpCmd)
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
		(factorRes = this.process__designator(null)).success == false &&

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
		if( typeof t === "undefined" || t == null ){
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
//	=> syntax: IDENTIFIER [ '<<' TYPE { ',' TYPE }* '>>' ]
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
		if( this.isCurrentToken(TOKEN_TYPE.TMPL_OPEN) == true ){
			//create array for templated types
			var ty_tmplArr = [];
			//consume '<<'
			this.next();
			//initialize var represents full type name, i.e. includes templates
			var tmpTmplTypeTxt = type_name + "<";
			//process type list
			while(this.isCurrentToken(TOKEN_TYPE.TMPL_CLOSE) == false){
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
				//add template argument type to the full type name
				tmpTmplTypeTxt += (ty_tmplArr.length > 0 ? "," : "") + ty_tmplTy._name;
				//add template type to the array
				ty_tmplArr.push(ty_tmplTy);
			}
			//add '>'
			tmpTmplTypeTxt += ">";
			//check if this is a speculative type and assign a number of templates
			this.assign_templateCountToSpeculativeType(
				isDummyType,		//is speculative/dummy type
				tyObj,				//speculative type
				ty_tmplArr.length	//count of template arguments
			);
			//consume '>>'
			this.next();
			//try to create derived template type
			//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): instead of having base and derived
			//	types, we would have only derived types. Thus, every type that uses templates, should
			//	declare in the type library (type.__library) type, which name includes both type name
			//	and a set of associated template argument types. For instance, if there is a template
			//	type 'foo' and it takes one template argument. Furthermore, there are only two variations
			//	of FOO being used in the whole program: foo<int> and foo<real>. The the type library
			//	should include only two types with the following names: "foo<int>" and "foo<real>".
			//	There should not be a type "foo", because that is a former approach, i.e. a base type.
			//tyObj = type.createDerivedTmplType(tyObj, ty_tmplArr);
			//check if type with the given full name was defined in the type library
			if( tmpTmplTypeTxt in type.__library ){
				//then, we have created a extra type (at the top of this function, when we checked
				//	whether type with {{type_name}} already exists or not.) We should remove this
				//	type from the type library
				delete type.__library[type_name];
				//assign a type found in library
				tyObj = type.__library[tmpTmplTypeTxt];
			//if type with the following template arguments does not exist
			} else {
				//loop thru array of encountered templates
				for( var k = 0; k < ty_tmplArr.length; k++ ){
					//assign template argument
					tyObj._templateNameArray.push({'name' : null, 'type': ty_tmplArr[k]});
				}	//end loop thru template arguments
			}	//end if type with given full name exists
		/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): remove code
			Move this code inside ELSE case, so that we do not need to replicate
			code for finding function scope. This is needed to check if type
			identifier represents template argument
		} else if( isDummyType ){	//is this a dummy type
			//check and assign no template arguments
			this.assign_templateCountToSpeculativeType(
				isDummyType,		//is speculative type
				tyObj,				//speculative type
				0					//no templates
			);
		ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
		*/
		} else {	//if there is no template list, but this type has templates
			//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): ensure that this is 
			//	either a template type OR a dummy type
			if( tyObj.isTmplType() == true || isDummyType ){
				//reset type to know if scope was found
				tyObj = null;
				//get current scope
				var tmpCurScp = this.getCurrentScope(false);	//get current scope
				//traverse thru scope hierarchy to check whether any scope level represents
				//	type object (i.e. we are currently inside type definition)
				while( tmpCurScp._owner != null ){	//until current scope is global scope
					//determine if this scope represents a type
					if( tmpCurScp._typeDecl !== null ){
						//if this is a type, then make sure that it is the type that
						//	is currently being processed without template list
						/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed code
							removed IF condition because 'tyObj' would always store a
							dummy type when it comes to handle templated types
						if( tmpCurScp._typeDecl._id == tyObj._id ){
						ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
						*/
						//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): if this is a dummy type
						if( isDummyType ){
							//get template array
							var tmpTmplArr = tmpCurScp._typeDecl._templateNameArray;
							//loop thru template array of the given type to
							//	check if a type identifier is a template 
							//	argument (e.g. if identifier is '_Ty')
							for( var k = 0; k < tmpTmplArr.length; k++ ){
								//if current template argument matches the
								//	encountered type identifier
								if( type_name == tmpTmplArr[k].name ){
									//found the template, quit loop
									tyObj = tmpTmplArr[k].type;
									break;
								}
							}	//end loop thru template array
						} else {	//it is not a speculative, but a tmpl type
							//assign a type (since right now object 'tyObj' is
							//	a dummy type, and we need an actual type)
							tyObj = tmpCurScp._typeDecl;
						}
						//it is allowed not to have a type template list if this type
						//	is used inside its own definition => quit loop
						break;
						/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): remove code
								remove IF condition that checked whether type stored in
								the scope is the same as in 'tyObj' variable, because
								tyObj would always store a dummy type when it comes to
								handle templated types
						} else {	//if it is a different type
							//this is a bug in user code
							this.error("need template specifier in type declaration");
						}	//end if type declaration inside its own definition
						ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end removed code
						*/
					}	//end if scope represents a type
				}	//end loop thru scope hierarchy
			}	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end if is template type
			//determine if type scope was not found
			if( tyObj == null ){
				//scope was not found
				this.error("437856357865782");
			}	//end if type scope was not found
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
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): if template type exists in preprocessed TTU set
	if( objDef_tempArr.length > 0 && objDef_id in this._TTUs ){
		//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): get hashmap that store
		//	various combinations of template arguments for this type, composed by
		//	preprocessor and stored in current TASK
		//var tmpTypeTmplSet = this._taskQueue[this._taskQueue.length - 1].tmpls;
		//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): loop thru type template set
		for( var tmpTTU in this._TTUs[objDef_id] ){
			//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): if iterated object is not object
			if( typeof this._TTUs[objDef_id][tmpTTU] != "object" ){
				//skip
				continue;
			}
			//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): get type name associated with a template
			var tmpTypeNames = this._TTUs[objDef_id][tmpTTU];
			//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): compose array of types
			//	associated with this TTU
			var tmpTypeArr = [];
			for( var j = 0; j < tmpTypeNames.length; j++ ){
				//make sure current type name exists in a library
				if( !(tmpTypeNames[j] in type.__library) ){
					//error
					this.error("784378945685329");
				}
				//add type to the array
				tmpTypeArr.push(type.__library[tmpTypeNames[j]]);
			}	//end loop to compose array of types associated with this TTU
			//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): call method that contains modularized code, below
			//	for creating and setting up a type object
			this.createAndSetupType(
				tmpTTU, 						//type name
				objDef_tempArr, 				//array of template arguments
				objDef_prnRef, 					//parent type (if any)
				tmpTypeArr						//current TTU (Template Type Usage)
			);
			/* ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): modularized code in a function 'createAndSetupType'
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
			ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end modularize code in function 'createAndSetupType'
			*/
		}	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end loop thru template set
		//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): moved code from below
		//	to remove new type scope from the stack
		this._stackScp.pop();

	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): if this is not a template type
	} else if(objDef_tempArr.length == 0) {
		//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): call method that contains modularized code, below
		//	for creating and setting up a type object
		this.createAndSetupType(
			objDef_id, 		//type name
			[], 			//empty array for template arguments
			objDef_prnRef, 	//parent type (if any)
			[]			//no TTU, siince no templates
		);
		//remove new type scope from the stack
		this._stackScp.pop();
	
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): if this is a template type, but it has not been used in
	//	the code, i.e. preprocessor has not found usage case of this template type
	} else {
		//do not create type for it, skip (i.e. do nothing)
	}	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end if template type exists in preprocessed TTU set
	//if it did not crash that should mean statements were processed successfully
	//next token should be closing code bracket
	if( this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
		//error
		this.error("missing '}' in the object definition");
	}
	//consume '}'
	this.next();
	//remove function scope from the stack
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): move code
	//	Move statement that pops out current scope in the IF and ELSE-IF
	//	statements above, because only in thouse code blocks we are adding
	//	a new current scope to the scope stack
	//this._stackScp.pop();
	//return result set
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): added ';', see comment below
	return new Result(true, []);
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed call '.addEntity'
	//	do not add TYPE to the result set, since in the new approach, we can
	//	create multiple types and the caller does not use this information
	//	anyway, so no point to return these extra data
	//	.addEntity(RES_ENT_TYPE.TYPE, objDef_newTypeInst);
};	//end function 'process__objectDefinition'

//TODO: need to review method that parses functions on the usage of templates

//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): modularized code from the core
//	parsing function to process object definition, above.
//input(s):
//	tyName: (TEXT) => type name (identifier)
//	tmplArr: (Array<TEXT>) => array of template argument names
//	prnType: (type) => parent type (if any)
//	ttu: (Array<type>) => set of associated types with templates
//output(s):
//	(type) => created type
parser.prototype.createAndSetupType = function(tyName, tmplArr, prnType, ttu){
	//create object type
	var objDef_newTypeInst = null;
	//boolean flag -- did type already was created earlier (i.e. dummy type)
	var doExist = false;
	//check if type with the following name has been declared earlier
	if( tyName in type.__library ){
		//assert that type already existsed
		doExist = true;
		//check if this type is not re-declared, i.e. ensure that it does not have
		//	'this' symbol defined in type's scope
		if( 'this' in type.__library[tyName]._scope._symbols ){
			//this type is re-declared => bug in user code
			this.error("type " + tyName + " is re-declared in the program");
		}	//end if type is re-declared
		//get type from the library
		objDef_newTypeInst = type.__library[tyName];
		//this type was created before its definition, if this type has templates
		//then all of its uses outside should also use correct number of templates
		if( tmplArr.length > 0 ){	//if this type has templates
			//check if '__tmp_templateCount' is defined inside type
			if( '__tmp_templateCount' in objDef_newTypeInst ){
				//if wrong number of templates was used
				if( objDef_newTypeInst.__tmp_templateCount != tmplArr.length ){
					//this is a bug in user code
					this.error("wrong number of templates for type " + tyName);
				}
			} else {	//type was used without template => bug
				//error in user code
				this.error("type " + tyName + " was used without templates");
			}
		}	//end if type was created before its definition (dummy type)
	} else {	//if not defined, then need to create
		//create
		objDef_newTypeInst = new type(
			tyName, OBJ_TYPE.CUSTOM, this.getCurrentScope(false)
		);
	}	//end if type with the given name is already defined
	//create fundamental/required methods for this type
	objDef_newTypeInst.createReqMethods();
	//set type's scope as a current
	this.addCurrentScope(objDef_newTypeInst._scope);
	//assign parent type to this type
	objDef_newTypeInst._parentType = prnType;
	//create symbol 'this'
	var objDef_this = new symbol("this", objDef_newTypeInst, objDef_newTypeInst._scope);
	//add 'this' to the scope
	objDef_newTypeInst._scope.addSymbol(objDef_this);
	//check if template list matches what was retrieved by preprocessor
	if( tmplArr.length != ttu.length ){
		this.error("4637567835659053");
	}
	//loop thru template list and insert data into type object
	for( var i = 0; i < tmplArr.length; i++ ){
		//get type associated with current template argument
		var tmpAssociatedTmplType = ttu[i];
		//if type was created earlier (dummy type)
		if( doExist ){
			//instead of adding template to the list, just specify the name field
			objDef_newTypeInst._templateNameArray[i].name = tmplArr[i];
		} else {	//type was just created
			//add template type name to the list inside type object
			objDef_newTypeInst._templateNameArray.push({
				name: tmplArr[i],
				type: tmpAssociatedTmplType
			});
		}
	}	//end loop thru template list
	//try to parse content of object
	this.process__objectStatements(objDef_newTypeInst);
	//return created type
	return objDef_newTypeInst;
};	//end function 'createAndSetupType'

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
	//add symbol to scope
	t._scope.addSymbol(dfd_symb);
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
	if( this._curTokenIdx + 1 > curTkIdx ){
		//get current block
		var tmpCurBlk = funcDefObj._scope._current;
		//create function body block where goes the actual code
		//	Note: the current block is designed for function arguments
		var tmpFuncBodyBlk = funcDefObj._scope.createBlock(true);
		//ES 2016-01-20: make argument block fall into this new block
		block.connectBlocks(
			tmpCurBlk,
			tmpFuncBodyBlk,
			B2B.FALL
		);
		//create template type array
		var funcDef_tmplArr = [];
		//if this function is created for some type
		if( t ){
			//if this type has templates
			if( t.isTmplType() == true ){
				//store array of type associations in 'funcDef_tmplArr'
				funcDef_tmplArr = t._templateNameArray;
			}
		}
		//create task and reference it to function
		funcDefObj._task = this.addTask(
			this._curTokenIdx,	//token that follows first '{'
			curTkIdx,			//token that corresponds '}'
			funcDefObj._scope,	//function's scope
			tmpFuncBodyBlk,		//function body block
			funcDef_tmplArr		//array of associated types with templates
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
		(stmtRes = this.process__assignOrDeclVar()).success == false &&

		//process function call statement
		(stmtRes = this.process__functionCall()).success == false &&

		//process if statement statement
		(stmtRes = this.process__if()).success == false &&

		//process while loop statement
		(stmtRes = this.process__while()).success == false &&

		//process foreach loop statement
		(stmtRes = this.process__forEach()).success == false &&

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
			//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): removed _baseType from TYPE definition
			//		because decided to have only DERIVED types (i.e. types where template arguments are
			//		tied directly to specific type), since this approach would allow to do type checking
			//		for the variables/function_calls of template type.
			if( !('this' in tmpCurIterType._scope._symbols) ){
				//fail
				//ES 2015-01-21 (Issue 3, b_bug_fix_for_templates): there are cases when DUMMY types are
				//	created, and they are not changed to any normal type. For instance, when we deal with
				//	templated type (e.g. _Ty). So instead of crashing here, delete this type and continue
				//	with the next available type to process.
				//this.error("type " + tmpCurIterType._name + " has not been defined, but is used");
				delete type.__library[tmpCurIterType];
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
	var curTaskIdx = 0;
	//loop thru tasks and process each one of them
	for( ; curTaskIdx < this._taskQueue.length; curTaskIdx++ ){
		//load currently iterated task into parser
		this.loadTask(this._taskQueue[curTaskIdx]);
		//execute statements for this code snippet
		this.process__sequenceOfStatements();
	}	//end loop thru tasks
};	//end program