/**
	Developer:	Eduard Sedakov
	Date:		2015-12-05
	Description:	parsing components
	Used by:	(testing)
	Dependencies: {lexer},{parsing types},{parsing obj}, {logic tree}, {preprocessor}
**/

//ES 2016-09-11 (b_debugger): instantiate parser object for easier access from other objects
parser.__instance = null;

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
	//ES 2017-02-17 (soko): new stack of scopes that is solely used for access operator, i.e.
	//	for determining scope where to search for data/method fields in the field hierarchy
	//	It is not the same as '_stackScp' since it is not used for determining where to
	//	insert next scope/block/command. THis stack is purely for access operator!
	this._accessStackScp = [];
	//include global scope in the stack
	this.addCurrentScope(this._gScp);
	//create boolean type before hand, since every type will have
	//	comparison operators that return booleab value, and we need
	//	to have this type defined before hand
	new type("boolean", OBJ_TYPE.BOOL, this._gScp);
	//create string type before hand, since every type will have
	//	method __toString__ that returns sting back to the caller
	//	and we need to have string object (e.g. TEXT) be defined
	new type("text", OBJ_TYPE.TEXT, this._gScp);
	//perform initialization of all types
	create__integerType(this._gScp);
	create__realType(this._gScp);
	create__booleanType(this._gScp);
	create__textType(this._gScp);
	create__voidType(this._gScp);
	create__integerArrayType(this._gScp);
	create__realArrayType(this._gScp);
	//ES 2016-06-05 (b_interpreter_2): initialize drawing component
	create__drawingType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for type point
	create__pointType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for type datetime
	create__datetimeType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for type file properties
	create__filePropertiesType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for component file
	create__fileType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for component timer
	create__timerType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for component math
	create__mathType(this._gScp);
	//ES 2016-09-23 (b_libs_1): create library for component cast
	create__castType(this._gScp);
	//ES 2017-12-14 (b_02): create library for rectangle component
	create__rectType(this._gScp);
	//create logic tree
	this.logTree = new LTree();
	//create instance of pre-processor
	this._pre_processor = new preprocessor(tokenList);
	//ES 2017-02-12 (soko): fix bug: determine all custom types declared by the user
	//	so that we could check later (e.g. in function definitions, whether given
	//	type identifiers are "legal" (i.e. such types are actually declared) or
	//	not. Now preprocessor would collect all type names in the special set
	//	and when needed, parser could simply lookup if type identifie exists in
	//	this set, which would be sufficient to say whether type is declared
	this._pre_processor.processCustomTypes();
	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): use preprocessor to
	//	retrieve all TTUs (Template Type Usage = TTU) so that parser could
	//	know how many and which templates are used for each type that has
	//	template arguments
	this._TTUs = this._pre_processor.processTTUs();
	//organize separate hashmap for arrays and/or trees
	var tmpArrayTreeTTUs = {};
	//if there is an array TTU
	if( "array" in this._TTUs ){
		//move TTUs for array into new specialized set
		tmpArrayTreeTTUs["array"] = this._TTUs["array"];
		//remove it from original TTU set
		delete this._TTUs["array"];
	}
	//if there is a tree TTU
	if( "tree" in this._TTUs ){
		//move TTUs for tree into new specialized set
		tmpArrayTreeTTUs["tree"] = this._TTUs["tree"];
		//remove it from original TTU set
		delete this._TTUs["tree"];
	}
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): setup templated types
	this.setupTemplatedTypes(this._TTUs);
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): setup types in specialized
	//	set for arrays and/or trees is not empty
	this.setupTemplatedTypes(tmpArrayTreeTTUs);
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): moved '_tokens' initialization
	//	because needed to use token list for setting up types associated with
	//	templates used in the code
	this._tokens = tokenList;
	//ES 2016-08-28 (b_log_cond_test): declare associative array for each PHI command
	//	to assist interpreter in determining which argument of PHI command (left or
	//	right), should be taken. It is entirely determined by the block from whch we
	//	have reached PHI command's block
	//	1. if statement:
	//		 +---[IF]---+
	//		/            \
	//	[THEN] (L)		[ELSE]  (R)
	//		\             /
	//		 +---[PHI]---+
	//	2. loop statement:
	//		+----[PHI]
	//		|      |
	//		|    [CMP]
	//		|      /\
	//		|  [BODY]\
	//		|    |    \
	//		+----+  [FINAL]
	//	3. logical tree  (a1 & a2 | a3 ...)
	//		an observation revealed one interesting fact about such trees -
	//			PHI block is always connected by the two adjacent blocks out
	//			of which one contains NOP (and always represents FALSE) and
	//			the other contains BRA (and always represents TRUE).
	//	So declare an associative array with:
	//		key: block's id which contains phi command(s)
	//		value: {
	//			left: (Array<BLOCK>) blocks that leads to using left argument of PHI command
	//			right: (Array<BLOCK>) blocks that leads to using right argument of PHI command
	//		}
	this._phiArgsToBlks = {};
	//setup empty set of functions defined inside a global scope
	this._globFuncs = {};
	//ES 2016-09-11 (b_debugger): set global variable to this instance of parser
	parser.__instance = this;
};	//end constructor 'parser'

//-----------------------------------------------------------------------------
// Setup Templated Types
//-----------------------------------------------------------------------------

//setup templated type use cases (TTUs)
//input(s):
//	setTTUs: (HashMap) hashmap of TTUs
//output(s): (none)
parser.prototype.setupTemplatedTypes = function(setTTUs){
	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): loop thru base types
	for( tmpBaseTypeName in setTTUs ){
		//make sure it is object
		if( typeof setTTUs[tmpBaseTypeName] != "object" ){
			//skip
			continue;
		}
		//get set of TTUs associated with this base type name
		var tmpTTUSet = setTTUs[tmpBaseTypeName];
		//loop thru TTUs
		for( tmpCurrentTTU in tmpTTUSet ){
			//if it is an array or tree
			if( tmpBaseTypeName == "array" ) {
				//create array type, specifically for this set of templates
				new type(tmpCurrentTTU, OBJ_TYPE.ARRAY, this._gScp);
			} else if( tmpBaseTypeName == "tree" ){
				//create tree type, specifically for this set of templates
				new type(tmpCurrentTTU, OBJ_TYPE.BTREE, this._gScp);
			} else {
				//create a dummy type
				new type(tmpCurrentTTU, OBJ_TYPE.CUSTOM, this._gScp);
			}
			//get array of type names associated with templates of this base type
			var tmpAssociatedTypeArr = tmpTTUSet[tmpCurrentTTU];
			//make sure that array has only 1 and tree has 2 template arguments
			if( (tmpBaseTypeName == "array" && tmpAssociatedTypeArr.length != 1) || 
				(tmpBaseTypeName == "tree" && tmpAssociatedTypeArr.length != 2)
			){
				//error
				this.error("324013478365478322");
			}
			//loop thru array of type names associated with template
			for( var i = 0; i < tmpAssociatedTypeArr.length; i++ ){
				//reset token list
				this._tokens = [];
				//get current associated type name
				var tmpTypeName = tmpAssociatedTypeArr[i];
				//add current type to the token list
				this._tokens.push(new Token(tmpTypeName));
				//process type
				var tmpTypeRes = this.process__type();
				//ensure that type was processed successfully
				if( tmpTypeRes.success == false ){
					//check if {{tmpTypeName}} has existing type reference
					//	if so, then this is not a error => we got ready type
					if( tmpTypeName in type.__library ){
						//set reference to the type
						tmpTypeRes = new Result(true, [])
							.addEntity(RES_ENT_TYPE.TYPE, type.__library[tmpTypeName]);
					} else {	//else, this type has not been declared
						//error (possibly in a parser)
						this.error("undeclared type '" + tmpTypeName + "'");
					}
				}	//end if type processed unsuccessfully
				//get type for template argument
				var tmpTmplArgType = tmpTypeRes.get(RES_ENT_TYPE.TYPE, false);
				//make sure that type was retrieved successfully
				if( tmpTmplArgType == null ){
					//error
					this.error("75836592657246427");
				}
				//determine template argument name
				var tmpTmplArgName = null;
				//if it is an array or tree
				if( tmpBaseTypeName == "array" || tmpBaseTypeName == "tree" ){
					//if it is an array
					if( tmpBaseTypeName == "array" ){
						tmpTmplArgName = "val";
					} else {	//if it is a tree
						//if it is the first template argument
						if( i == 0 ){
							tmpTmplArgName = "key";
						} else {	//if it is not first template argument
							tmpTmplArgName = "val";
						}
					}
				} else {	//non-array and non-tree case
					//set template type name
					tmpTmplArgName = "" + i;
					//if '__tmp_templateCount' is declared then increment by 1
					if( '__tmp_templateCount' in type.__library[tmpCurrentTTU] ){
						type.__library[tmpCurrentTTU].__tmp_templateCount++;
					} else {
						//else, assign it to 1
						type.__library[tmpCurrentTTU].__tmp_templateCount = 1;
					}
				}	//end if it is an array or tree
				//add template arguments to the array/tree type
				type.__library[tmpCurrentTTU]._templateNameArray.push({
					'name': tmpTmplArgName, 	//name of template argument
					'type': tmpTmplArgType		//type of template argument
				});
			}	//end loop thru array of associated types
			//if it is an array or tree
			if( tmpBaseTypeName == "array" || tmpBaseTypeName == "tree" ){
				//create symbol 'this'
				type.__library[tmpCurrentTTU].createField(
					"this", 										//variable name
					type.__library[tmpCurrentTTU], 					//variable type
					type.__library[tmpCurrentTTU]._scope._start		//first block in the type's scope
				);
				//create fundamental functions
				type.__library[tmpCurrentTTU].createReqMethods();
			}	//end if it is an array or tree
		}	//end loop thru TTUs of current base type
	}	//ES 2016-01-20 (Issue 3, b_bug_fix_for_templates): end loop thru base types
};	//end function 'setupTemplatedTypes'

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

//ES 2016-08-18 (b_code_error_handling): check whether next token type is as specified
//input(s):
//	tknTp: (TOKEN_TYPE) type of token to match with
//output(s):
//	(boolean) => {true} if next token type matches the given tknTp; {false} otherwise
parser.prototype.isNextToken = function(tknTp){
	//check if there is no next token
	if( (this._curTokenIdx + 1) >= this._tokens.length ){
		//cannot perform a check
		return false;
	}
	//compare next token with the given one
	return this._tokens[this._curTokenIdx + 1].type.value == tknTp.value;
};	//ES 2016-08-18 (b_code_error_handling): end method 'isNextToken'

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
		while(  tmpCurTkIdx > 0 && 
				//ES 2016-08-25 (b_code_error_handling): ensure that token index to be
				//	checked is valid, i.e. its difference is greater than zero
				(tmpCurTkIdx - this._curLineToken) > 0 &&
				//ES 2016-08-25 (b_code_error_handling): (modify) go back to the former
				//	new line and count number of tokens till that new line
				this._tokens[tmpCurTkIdx - this._curLineToken].type != TOKEN_TYPE.NEWLINE
		){
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

//ES 2017-01-27 (b_aws_fix_01): reset parser and associated classes
//input(s): (none)
//output(s): (none)
parser.reset = function(){

	//reset libraries
	Btree.reset();
	Bnode.reset();
	Datetime.reset();
	drawing.__library = {};
	drawing.__nextId = 1;
	File.reset();
	FileProp.reset();
	Point.reset();
	Timer.reset();

	//reset parsing components
	block.reset();
	command.reset();
	functinoid.reset();
	LTNode.reset();
	scope.reset();
	symbol.reset();
	type.reset();
	value.reset();

	//debug state reset
	dfs.reset();

};	//ES 2017-01-27 (b_aws_fix_01): end function 'reset'


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
//	curLine: (ES 2016-08-25: b_code_error_handling): current line index
//	curTknLine: (ES 2016-08-25: b_code_error_handling): token index on current line
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
//ES 2016-08-26 (b_code_error_handling): add two extra arguments (curLine and curTknLine)
//	for keeping track of current position in the parsed code (line and token pair)
parser.prototype.addTask = function(curLine, curTknLine, start, end, scp, blk, tmpls){
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
		//ES 2016-08-26 (b_code_error_handling): need to record token and line indexes
		//for the start of the function body. The former values were capturing the end.
		curLnTkn: curTknLine,
		curLnIdx: curLine
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
	this._curLineIdx = tk.curLnIdx;
	this._curLineToken = tk.curLnTkn;
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
			res[tmpSymbName] = [tmpVal.getLastDef(), tmpVal.getLastUse()];
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
parser.prototype.resetDefAndUseChains = function(state, scp){
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

					//ES 2016-08-10 (b_cmp_test_1): need to preserve PHI command inside def-chains after
					//	processed loop, so that interpreter was associating variables with the last
					//	correct value (which is attached to specific command, so if we remove PHI, 
					//	interpreter would find old value for such variable, that existed before loop)
					&& tmpSymb.getLastDef()._type != COMMAND_TYPE.PHI
				){
					//remove last def-chain entry
					tmpSymb.delLastFromDefChain();
				}	//end loop to restore def-chain
			}	//end if def-chain changed
			//restore usage chain, similarly
			while( tmpSymb.getLastUse() != tmpVal[1]

				//make sure that use-chain is not empty
				&& tmpSymb._useOrder.length > 0
			){
				//remove last use-chain entry
				tmpSymb.delLastFromUseChain();
			}	//end loop to restore use-chain
		}	//end if value is an object
	}	//end loop thru symbols
	//return set of def/use chains
	return res;
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
FACTOR: DESIGNATOR | SINGLETON | FUNC_CALL | VAR_OP | '(' LOGIC_EXP ')'
VAR_OP: 'var' TYPE '(' [ FUNC_ARGS_INST ] ')'
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
		//ES 2016-08-20 (b_code_error_handling): rephrase error message
		this.error("pars.32 - missing expression in return statement of function " + funcScp._funcDecl._name);
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
	//make sure that type of returned expression matches function return type
	if( expType !== funcScp._funcDecl._return_type ){
		//ES 2016-08-20 (b_code_error_handling): rephrase error message
		this.error("pars.30 - returning wrong object type for function " + funcScp._funcDecl._name);
	}
	//ES 2016-08-20 (b_code_error_handling): include this return statement inside
	//	function definition return commands
	funcScp._funcDecl._return_cmds.push(retCmd);
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

		//ES 2016-08-13 (b_cmp_test_1): fixing bug: should be array of commands, not just command
		[phiBlk._cmds[0]],

		[]
	);
	//make this block jump into PHI block
	block.connectBlocks(
		curBlk,
		phiBlk,
		B2B.JUMP
	);
	//ES 2016-09-03 (b_log_cond_test): handle execution path from this block to PHI
	this.addLeftRightBlkPairForPhiBlk(
		phiBlk._id, 		//phi block
		[], 				//from inside loop, so we take right argument
		[curBlk._id]		//	and not the left argument
	);
	//create new current block
	var followBlk = this.getCurrentScope().createBlock(true, true);
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
	var followBlk = this.getCurrentScope().createBlock(true, true);
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
//	(HashMap<SymbolName, Command>) => symbols as keys, referencing phi commands as values
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
//	s: (scope) scope
//	phiBlk: (block) PHI block for loop construct
//	phiCmds: (HashMap<SymbolName, Command>) symbols as keys and PHI commands as values
//				provided by the function 'createPhiCmdsForAccessibleSymbols'
//	defUseChain: (HashMap<SymbolName, Array<command>) symbols as keys and def/use chain
//				commands as values, provided by the function 'getDefAndUsageChains'
//output(s): (none)
parser.prototype.revisePhiCmds = function(phiBlk, phiCmds, defUseChain){
	//get reference to the current scope
	var curScope = this.getCurrentScope();
	//get all accessible symbols
	var symbs = curScope.getAllAccessibleSymbols();
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
		//ES 2017-11-03 (Issue 8, b_soko): if given PHI argument command is representing data field
		if( tmpSymbRef._scope._typeDecl != null ) {
			//determine index for deleting command inside PHI block
			var tmpCmdIdx = phiBlk._cmds.indexOf(tmpPhiCmd);
			//if index for deleting command was found
			if( tmpCmdIdx >= 0 ) {
				//remove PHI command for this symbol from PHI block
				delete phiBlk[tmpCmdIdx];
			}	//end if index for deleting command was found
			//remove associated items from def-use chain and phi command chain
			delete phiCmds[tmpSymbName];
			delete defUseChain[tmpSymbName];
		}	//ES 2017-11-03 (Issue 8, b_soko): end if PHI argument is data field
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

//ES 2016-08-30 (b_log_cond_test): get array of block id(s) that link to PHI block, i.e.
//	both that fall in and jump to PHI block
//input(s):
//	phiId: (BLOCK) phi block, for which we are finding all linking blocks
//	prevId: (BLOCK) block that was used prior to loop (NOTE: it could be same as PHI block)
//output(s):
//	Array<integer> array of block ids that fall/jump to PHI block
parser.prototype.getArrayOfBlkIdsLinkToPhi = function(phiBlk, tmpPrevCurBlk){
	//init array of block ids that fall/jump to PHI
	var tmpBlksLinkToPhi = [];
	//make sure that previous and PHI blocks are different
	if( tmpPrevCurBlk != phiBlk ){
		//add previous block id (which is not same as PHI) to the array of blocks that
		//	fall/jump to PHI
		tmpBlksLinkToPhi.push(tmpPrevCurBlk._id);
	} else {	//if PHI and previous blocks represent the same block
		//if there is block that falls into previous/PHI block
		if( tmpPrevCurBlk._fallInThis != null ){
			//add block id that fell in previous/PHI block
			tmpBlksLinkToPhi.push(tmpPrevCurBlk._fallInThis._id);
		}
		//if there is/are block(s) that jump to previous/PHI block 
		if( tmpPrevCurBlk._jumpToThis.length != 0 ){
			//loop thru array and add each block id
			for( tmpJumpBlkIndex in tmpPrevCurBlk._jumpToThis ){
				//get block id
				var tmpJumpBlkId = tmpPrevCurBlk._jumpToThis[tmpJumpBlkIndex]._id;
				//add block id to the array that collects block ids that fall/jump
				//	into PHI block
				tmpBlksLinkToPhi.push(tmpJumpBlkId);
			}	//end loop thru array of jump blocks
		}	//end if there is block that falls into previous/PHI block
	}	//end if PHI and previous blocks are same
	//return array of block ids that link to PHI block
	return tmpBlksLinkToPhi;
};	//end method 'getArrayOfBlkIdsLinkToPhi'

//while_loop:
//	=> syntax: 'while' LOGIC_EXP '{' [ STMT_SEQ ] '}'
//	=> semantic: (none)
parser.prototype.process__while = function(){
	//ensure that the first token is 'WHILE'
	if( this.isCurrentToken(TOKEN_TYPE.WHILE) == false ){
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
	//make sure that previous and PHI blocks are different
	if( tmpPrevCurBlk != phiBlk ){
		//make previous current block fall in PHI
		block.connectBlocks(
			tmpPrevCurBlk,		//source
			phiBlk,				//dest
			B2B.FALL			//fall-thru
		);
	}
	//ES 2016-08-30 (b_log_cond_test): init array of block ids that fall/jump to PHI
	var tmpBlksLinkToPhi = this.getArrayOfBlkIdsLinkToPhi(phiBlk, tmpPrevCurBlk);
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
	//ES 2016-08-15 (b_cmp_test_1): set that PHI block is related to WHILE loop scope
	phiBlk._relatedScope = whileLoopScp;
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
		//ES 2016-08-24 (b_code_error_handling): change error message
		this.error("pars.63 - condition is incorrectly formed");
	}
	//ES 2016-08-24 (b_code_error_handling): get type from result
	var whileExpType = whileExpRes.get(RES_ENT_TYPE.TYPE, false);
	//ES 2016-08-24 (b_code_error_handling): make sure that returned expression type exists
	if( whileExpType == null ){
		//error
		this.error("3275859237297548");
	}
	//ES 2016-08-24 (b_code_error_handling): condition inside WHILE needs to be boolean
	if( whileExpType._type != OBJ_TYPE.BOOL ){
		//error -- IF condition needs to be boolean
		this.error("pars.60 - WHILE condition needs to be boolean");
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
	var blkArr = whileExpRes.get(RES_ENT_TYPE.BLOCK,true);
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
	lastLoopBlk.createCommand(
		COMMAND_TYPE.BRA,	//jump
		[phiBlk._cmds[0]],	//first command of PHI block
		[]					//no symbols
	);
	//set LOOP jump to PHI
	block.connectBlocks(
		lastLoopBlk,	//source
		phiBlk,			//dest
		B2B.JUMP		//jump
	);
	//ES 2016-08-28 (b_log_cond_test): associate last loop block with RIGHT argument of
	//	PHI command, while block that preceeded this LOOP (i.e. before PHI block) with
	//	left argument (of PHI command(s))
	this.addLeftRightBlkPairForPhiBlk(
		phiBlk._id,			//phi block
		tmpBlksLinkToPhi,	//SUCCESS -> left
		[lastLoopBlk._id]	//FAIL -> right
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
	this.revisePhiCmds(phiBlk, phiCmds, changedSymbs);
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

//ES 2016-08-30 (b_log_cond_test): add left-right block pair for specific PHI block
//input(s):
//	phiId: (integer) id of PHI block
//	leftId: (Array<integer>) id of left block
//	rightId: (Array<integer>) id of the right block
//output(s): (none)
parser.prototype.addLeftRightBlkPairForPhiBlk = function(phiId, leftId, rightId){
	//if there is no such PHI block
	if( !(phiId in this._phiArgsToBlks) ){
		//create entry
		this._phiArgsToBlks[phiId] = {
			left: {},		//empty hash to easier check if there is specific id
			right: {}		//empty hash to easier check if there is specific id
		};
	}
	//if left id is not null AND it is not same as phiId
	if( leftId != null && Array.isArray(leftId) ){
		//loop thru ids
		for( idx in leftId ){
			//get left entry
			var lid = leftId[idx];
			//check if left id is not same as phi id
			if( lid != phiId ){
				//add left block id
				this._phiArgsToBlks[phiId].left[lid] = 0;
			}	//end if left id is not same as phi id
		}	//end loop thru ids
	}	//end if left id is not null AND it is not same as phiId
	if( rightId != null && Array.isArray(rightId) ){
		//loop thru ids
		for( idx in rightId ){
			//get right entry
			var rid = rightId[idx];
			//check if right id is not same as phi id
			if( rid != phiId ){
				//add right block id
				this._phiArgsToBlks[phiId].right[rid] = 0;
			}	//end if right id is not same as phi id
		}	//end loop thru ids
	}	//end if right id is not null AND it is not same as phiId
};	//ES 2016-08-30 (b_log_cond_test): end method 'addLeftRightBlkPairForPhiBlk'

//foreach_loop: 
//	=> syntax: 'foreach' '(' IDENTIFIER ':' DESIGNATOR ')' '{' [ STMT_SEQ ] '}'
//	=> semantic: (none)
parser.prototype.process__forEach = function(){
	//ensure that first token is 'FOREACH'
	if( this.isCurrentToken(TOKEN_TYPE.FOREACH) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'FOREACH'
	this.next();
	//get current block
	var tmpParScope = this.getCurrentScope();
	var tmpPrevCurBlk = tmpParScope._current;
	//create PHI block
	var phiBlk = tmpParScope.createBlock(true, true);
	//make sure that previous and PHI blocks are different
	if( tmpPrevCurBlk != phiBlk ){
		//make previous current block fall in PHI
		block.connectBlocks(
			tmpPrevCurBlk,		//source
			phiBlk,				//dest
			B2B.FALL			//fall-thru
		);
	}
	//ES 2016-08-30 (b_log_cond_test): init array of block ids that fall/jump to PHI
	var tmpBlksLinkToPhi = this.getArrayOfBlkIdsLinkToPhi(phiBlk, tmpPrevCurBlk);
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
	//ES 2016-08-15 (b_cmp_test_1): set that PHI block is related to WHILE loop scope
	phiBlk._relatedScope = forEachLoopScp;
	//set FOREACH loop as a current scope
	this.addCurrentScope(forEachLoopScp);
	//create block for conditions (separate from PHI block)
	var condBlk = forEachLoopScp.createBlock(true);//***, true);	//make it current block
	//make PHI block fall thru condition block
	block.connectBlocks(
		phiBlk,				//source
		condBlk,			//dest
		B2B.FALL			//fall-thru
	);
	//make sure that next token is '('
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//error
		//ES 2016-08-21 (b_code_error_handling): include error code
		this.error("pars.51 - expecting '(' after FOREACH keyword");
	}
	//consume '('
	this.next();
	//process identifier that represents loop iterator
	var iter_id = this.process__identifier();
	//check if identifier was processed incorrectly
	if( iter_id == null ){
		//fail
		//ES 2016-08-21 (b_code_error_handling): include error code
		this.error("pars.53 - expecting IDENTIFIER to represent iterator in FOREACH loop statement");
	}
	//ES 2016-08-24 (b_code_error_handling): if iterator's name matches existing variable in this scope
	if( tmpParScope.findSymbol(iter_id) != null ){
		//error -- name collision with existing variable
		this.error("pars.8 - iterator in FOREACH loop collides with existing variable " + iter_id);
	}
	//ensure that next token is ':'
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == false ){
		//error
		//ES 2016-08-24 (b_code_error_handling): change error message
		this.error("pars.55 - expecting ':' in FOREACH loop, after IDENTIFIER (loop iterator)");
	}
	//consume ':'
	this.next();
	//ES 2016-08-21 (b_code_error_handling): declare specifier for collection to loop thru
	var collExpRes = null;
	//ES 2016-08-19 (b_code_error_handling): catch error to check if it is undeclared variable
	try{
		//process collection name thru which to loop
		//ES 2016-08-21 (b_code_error_handling): move declaration outside of try-catch scope
		collExpRes = this.process__designator(null);
	} catch( tmpE ){
		//change to new error if specified error code matches
		this.triggerErrorWithSingleEntityName(
			"784738942375957857",	//error code
			tmpE.message,			//former/original error message
			"pars.50 - inside foreach loop undeclared variable "		//text for new error message
		);
	}
	//make sure that designator was processed successfully
	if( collExpRes.success == false ){
		//error
		//ES 2016-08-21 (b_code_error_handling): include error code
		this.error("pars.54 - expecting collection name in FOREACH loop statement, after ':'");
	}
	//make sure that next token ')'
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == false ){
		//error
		this.error("pars.52 - expecting ')' in FOREACH statement");
	}
	//consume ')'
	this.next();
	//get type of the collection variable
	var collType = collExpRes.get(RES_ENT_TYPE.TYPE, false);
	//get symbol representing collection variable
	var collSymb = collExpRes.get(RES_ENT_TYPE.SYMBOL, false);
	//get last definition command for collection var
	//ES 2016-08-13 (b_cmp_test_1): move statement after PHI commands are created
	//var collLastDefCmd = collSymb.getLastDef();
	//initializ flag: is this collection an array
	var collIsArr = false;
	//make sure that this is either array or tree
	if(
		//if collection's object type is array
		(collIsArr = (collType._type == OBJ_TYPE.ARRAY)) == false &&

		//if collection's object type is tree
		(collType._type == OBJ_TYPE.BTREE) == false
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
	iterType = collType._templateNameArray[0].type;
	//create variable for representing loop iterator
	var iterSymb = this.create__variable(
		iter_id, 			//name of iterator var
		iterType, 			//type of iterator var
		tmpParScope, 		//parent scope around FOREACH loop
		tmpPrevCurBlk		//block that follows into PHI block of FOREACH loop
	);
	//ES 2017-02-17 (soko): set flag '_isIter' to true to notify interpteter that this is iterator variable
	iterSymb._isIter = true;
	//get command library
	var cmdLib = command.getLastCmdForEachType();
	//get def/use chains for all accessible symbols
	var defUseChains = this.getDefAndUsageChains(tmpParScope);
	//get phi commands for all accessible symbols
	var phiCmds = this.createPhiCmdsForAccessibleSymbols(tmpParScope, phiBlk);
	//get last definition command for collection var
	var collLastDefCmd = collSymb.getLastDef();
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
	var outsideLoopBlk = tmpParScope.createBlock(true, true);	//OUTSIDE OF LOOP block (make it current in parent scope)
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
	//inside condition block create command NEXT that should grab
	//	next element from tree or array and store in iterator
	loopBodyBlk.createCommand(
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
	//process sequence of statements
	var seqStmtThenRes = this.process__sequenceOfStatements();
	//initialize reference to the last block in the loop body
	var lastLoopBlk = this.getCurrentScope()._current;
	//create un-conditional jump from BOYD block to PHI block
	lastLoopBlk.createCommand(
		COMMAND_TYPE.BRA,	//jump
		[phiBlk._cmds[0]],	//first command of PHI block
		[]					//no symbols
	);
	//set LOOP jump to PHI
	block.connectBlocks(
		lastLoopBlk,	//source
		phiBlk,			//dest
		B2B.JUMP		//jump
	);
	//ES 2016-08-28 (b_log_cond_test): associate last loop block with RIGHT argument of
	//	PHI command, while block that preceeded this LOOP (i.e. before PHI block) with
	//	left argument (of PHI command(s))
	this.addLeftRightBlkPairForPhiBlk(
		phiBlk._id,			//phi block
		tmpBlksLinkToPhi,	//SUCCESS -> left
		[lastLoopBlk._id]	//FAIL -> right
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
	this.revisePhiCmds(phiBlk, phiCmds, changedSymbs);
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
		//ES 2016-08-24 (b_code_error_handling): change error message
		this.error("pars.63 - condition is incorrectly formed");
	}
	//ES 2016-08-24 (b_code_error_handling): get type from result
	var ifExpType = ifExpRes.get(RES_ENT_TYPE.TYPE, false);
	//ES 2016-08-24 (b_code_error_handling): make sure that returned expression type exists
	if( ifExpType == null ){
		//error
		this.error("3275859237297548");
	}
	//ES 2016-08-24 (b_code_error_handling): condition inside IF needs to be boolean
	if( ifExpType._type != OBJ_TYPE.BOOL ){
		//error -- IF condition needs to be boolean
		this.error("pars.60 - IF condition needs to be boolean");
	}
	//get reference to array with three new blocks
	var blkArr = ifExpRes.get(RES_ENT_TYPE.BLOCK, true);
	//get reference to SUCCESS, FAIL, and PHI blocks
	var successBlk = blkArr[0];
	var failBlk = blkArr[1];
	var phiBlk = blkArr[2];
	//ES 2016-08-24 (b_code_error_handling): if failBlk or phiBlk is undefined
	//	then condition is missing comparison operator
	if( typeof failBlk == "undefined" || typeof phiBlk == "undefined" ){
		//error -- condition needs to have at least one comparison operator
		this.error("pars.66 - condition requires at least one comparison operator");
	}
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
	//ES 2016-08-15 (b_cmp_test_1): set first block to be related to IF-THEN-ELSE scope
	ifExpStartBlock._relatedScope = ifScp;
	//add FAIL block to the IF scope
	ifScp.addBlock(failBlk);
	//set IF scope as a current
	this.addCurrentScope(ifScp);
	//ensure that the next token is '{' (CODE_OPEN)
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//error
		this.error("pars.64 - expecting '{' to start THEN clause of IF condition");
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
	//ES 2016-08-15 (b_cmp_test_1): get reference for jump command
	var tmpThenBraCmd = thenBlk.createCommand(
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
		this.error("pars.64 - expecting '}' to end THEN clause of IF condition");
	}
	//consume '}'
	this.next();
	//initialize set of changed symbols in ELSE clause
	var changedSymbs_Else = {};
	//ES 2016-08-28 (b_log_cond_test): variable for block that represents FAIL path
	var tmpBlkFail = null;
	//check if next token is ELSE
	if( this.isCurrentToken(TOKEN_TYPE.ELSE) == true ){
		//consume ELSE token
		this.next();
		//switch to the ELSE block as current
		ifScp.setCurrentBlock(failBlk);
		//if next token is 'IF' (i.e. 'ELSE IF')
		/* ES 2016-08-24 (b_code_error_handling): forgot to comment out piece that
			did not work out correctly (else if)
		if( this.isCurrentToken(TOKEN_TYPE.IF) == true ){
			//call this function again to process ELSE-IF condition
			var elseIfRes = this.process__if();
			//ensure that ELSE-IF was processed successfully
			if( elseIfRes.success == false ){
				//error
				this.error("54825784754289");
			}	//end if ELSE-IF successfully processed
		//otherwise, check that next token is '{'
		} else */
		//ES 2016-08-24 (b_code_error_handling): in case this token is 'IF'
		if( this.isCurrentToken(TOKEN_TYPE.IF) == true ){
			//error -- place IF inside ELSE clause
			this.error("pars.67 - move IF condition inside ELSE clause");
		}
		if(this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == true ){
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
			//ES 2016-08-28 (b_log_cond_test): set ELSE block to be on FAILED path
			tmpBlkFail = elseBlk;
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
				this.error("pars.65 - expecting '}' to end ELSE clause of IF condition");
			}
			//consume '}'
			this.next();
		} else { //otherwise, error
			//error
			//ES 2016-08-24 (b_code_error_handling): change error message
			this.error("pars.68 - expecting '{' after 'ELSE' keyword in IF condition");
		}	//end if next token is 'IF'
	} else {	//ES 2016-08-16 (b_cmp_test_1): otherwise, there is no ELSE clause
		//connect condition block to phi block via jump
		block.connectBlocks(
			failBlk,				//source: fail block
			phiBlk,					//dest: PHI block
			B2B.FALL				//type of connection: jump
		);
		//ES 2016-09-03 (b_log_cond_test): there is no ELSE clause, so we need to set
		//	symbols for ELSE to state of symbols outside of IF statement
		//	RIght now, just initialize ELSE symbols' set
		changedSymbs_Else = {};
		//ES 2016-09-03 (b_log_cond_test): loop thru defUse pairs
		for( tmpCurSymbName in defUseChains ){
			//get pair of Def/Use chain
			var tmpPair = defUseChains[tmpCurSymbName];
			//make sure thar pair is an object AND iterated symbol should be
			//	defined inside THEN clause symbols' set
			if( typeof tmpPair == "object" && (tmpCurSymbName in changedSymbs_Then) ){
				//create array for this symbol name
				var tmpSymbArr = [];
				//set [0]th entry of Array to be def-command
				tmpSymbArr.push(tmpPair[0]);
				//set [1]st entry of Array to be symbol for def-command
				tmpSymbArr.push(tmpPair[0]._defChain[tmpPair[0]._defOrder[0]]);
				//add array for this symbol
				changedSymbs_Else[tmpCurSymbName] = tmpSymbArr;
			}	//end if pair is an object
		}	//ES 2016-09-03 (b_log_cond_test): end loop thru defUse pairs
		//changedSymbs_Else = this.resetDefAndUseChains(defUseChains, tmpParScope);
		//ES 2016-08-28 (b_log_cond_test): set FAIL block to be on FAILED path
		tmpBlkFail = failBlk;
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
			//remove entry from else collection
			delete changedSymbs_Else[tmpSymbName];
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
	//ES 2016-08-15 (b_cmp_test_1): remove argument from unconditional jump command
	//	that represents PHI block
	tmpThenBraCmd._args.pop();
	//ES 2016-08-15 (b_cmp_test_1): and instead add first command in PHI block
	tmpThenBraCmd._args.push(phiBlk._cmds[0]);
	//remove current scope from scope stack
	this._stackScp.pop();
	//set PHI block to be current in the new current scope
	//	Note: do not use function 'setCurrentBlock' because
	//	it will add this block to the this new scope, and we
	//	still want PHI block to be inside IF condition scope
	this.getCurrentScope()._current = phiBlk;
	//ES 2016-08-28 (b_log_cond_test): associate SUCCESS and FAIL blocks with left
	//	and right arguments of PHI command, respectively, to assist an interpreter
	//	in choosing the proper argument
	this.addLeftRightBlkPairForPhiBlk(
		phiBlk._id,			//phi block
		[thenBlk._id],		//SUCCESS -> left
		[tmpBlkFail._id]	//FAIL -> right
	);
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.BLOCK, phiBlk)
		.addEntity(RES_ENT_TYPE.SCOPE, ifScp);
};	//end 'if'

//assign/var_decl:
//	=> syntax: ( 'let' | 'var' TYPE ) DESIGNATOR [ '(' [ FUNC_ARGS_INST ] ')' ]^var [ '=' EXP ]^var
//	=> semantic: combined assignment and variable
//		declaration statements in one.
//		Note: ( [ '=' EXP ]^var ) means that it is 
//			optional only for the case of variable
//			declaration, i.e. ( 'var' TYPE ) case.
//ES 2015-03-06: added following code after TYPE: '(' [ FUNC_ARGS_INST ] ')'
//	to allow calling non-default constructor, if there is any
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
	//declare name result set
	var varNameRes = null;
	//designator returns: TEXT, SYMBOL, COMMAND, and TYPE
	//if declaring new variable
	if( doDeclVar == true ){
		//get token representing type
		var varTypeRes = this.process__type();
		//check if parent type is parsed not successfully
		//ES 2016-08-18 (b_code_error_handling): add extra check to ensure that type
		//	is followed by text identifier that represents variable name
		if( varTypeRes.success == false || this.isCurrentToken(TOKEN_TYPE.TEXT) == false ){
			//unknown type
			//ES 2016-08-18 (b_code_error_hanlding): replace former error with descriptive message
			//this.error("3257264578264786524");
			//ES 2016-08-18 (b_code_error_handling): if type is not determined
			if( varTypeRes.success == false ){
				this.error("pars.1 - missing type specifier");
			} else {	//ES 2016-08-18 (b_code_error_handling): else, variable name is missing
				this.error("pars.2 - missing variable name in declaration statement");
			}
		}
		//extract type from result set
		vType = varTypeRes.get(RES_ENT_TYPE.TYPE, false);
		//check that type was found in result set
		if( vType == null ){
			this.error("4738567465785468752");
		}
		//ES 2016-08-20 (b_code_error_handling): if type is not legal
		if( vType.isTypeLegal() == false ){
			//error -- unknown type specifier
			this.error("pars.9 - unknown type " + vType._name + " in declaration statement");
		}
		//ES 2016-08-19 (b_code_error_handling): record last symbol id
		var tmpLastSymbId = symbol.__nextId;
		//process variable name
		varNameRes = this.process__designator(vType);
		//ES 2016-08-19 (b_code_error_handling): get variable name
		var tmpVarName = varNameRes.get(RES_ENT_TYPE.TEXT, false);
		//ES 2016-08-19 (b_code_error_handling): if type of new variable is VOID
		if( vType._type == OBJ_TYPE.VOID ){
			//error - cannot declare VOID variable 
			this.error("pars.7 - cannot declare VOID variable " + tmpVarName);
		}
		//ES 2016-08-19 (b_code_error_handling): check if parser returned previously declared
		//	variable, and did not declare a new one
		if( tmpLastSymbId == symbol.__nextId ){
			//error: variable re-declared
			this.error("pars.8 - variable " + tmpVarName + " is re-declared");
		}
	} else {	//otherwise, processing new variable
		//process name expression
		//ES 2016-08-19 (b_code_error_handling): catch error to check if it is undeclared variable
		try{
			varNameRes = this.process__access();
		} catch( tmpE ){
			//change to new error if specified error code matches
			this.triggerErrorWithSingleEntityName(
				"784738942375957857",				//error code
				tmpE.message,						//former/original error message
				"pars.5 - undeclared variable "		//text for new error message
			);
		}
	}	//end if declaring new variable
	//get symbol from the designator result set
	var vSymb = varNameRes.get(RES_ENT_TYPE.SYMBOL, false);
	//ensure that variable name was processed successfully
	if( varNameRes.success == false ){
		//fail
		//ES 2016-08-18 (b_code_error_hanlding): replace former error with descriptive message
		//this.error("8937487389782482");
		//ES 2016-08-18 (b_code_error_handling): error: missing variable name
		this.error("pars.2 - missing variable name in assignment/declaration");
	}
	//setup variable to store command for new/existing variable
	var vExpCmd = null;
	//if declaring a variable, then '=' (equal operator) is
	//	not mandatory, so skip it if the next token is not '='
	if( this.isCurrentToken(TOKEN_TYPE.EQUAL) == true ){
		//consume '='
		this.next();
		//process expression
		var vExpRes = this.processLogicTreeExpression(true);
		//ES 2016-08-18 (b_code_error_handling): check if expression result is successful
		if( vExpRes.success == false ){
			//ES 2016-08-18 (b_code_error_hanlding): replace former error with descriptive message
			//this.error("94739572359758423");
			//ES 2016-08-18 (b_code_error_handling): error: right expression
			this.error("pars.4 - error caused by right expression in assignment/declaration");
		}
		//try to get command from expression result set
		var vExpCmd = vExpRes.get(RES_ENT_TYPE.COMMAND, false);
		//check that command was found
		if( vExpCmd == null ){
			//fail
			this.error("249329874572853729");
		}
		//get type
		//ES 2016-08-20 (b_code_error_handling): extracting type from wrong result set (varNameRes)
		//	but should from vExpRes
		vType = vExpRes.get(RES_ENT_TYPE.TYPE, false);
		//make sure that type was retrieved successfully
		if( vType == null ){
			//error
			this.error("47358375284957425");
		}
		//get command created by designator
		//ES 2016-08-28 (b_log_cond_test): moved statement from below, in order to check if
		//	we are assigning array or tree entry, and thus determine if we should fire a
		//	error when type of symbol (tree/array) does not match type of equal expression
		//	that would be type of tree/array entry
		var vLastCmd = varNameRes.get(RES_ENT_TYPE.COMMAND, false);
		//ES 2016-08-28 (b_log_cond_test): are we assigning array or tree or field entry
		var doAssignComplexObj = vLastCmd != null && vLastCmd._type == COMMAND_TYPE.LOAD;
		//ES 2016-08-20 (b_code_error_handling): if assigning wrong type
		//ES 2016-08-28 (b_log_cond_test): add condition that checks if symbol assigned is
		//	actually a tree/array, and type of equal expression in that case would be
		//	type of array/tree entry
		if( doAssignComplexObj == false && vSymb._type._id != vType._id ){
			//error -- assigning wrong type
			this.error("pars.15 - assigning wrong type to variable " + vSymb._name);
		}
		//get symbol
		var tmpExpSymb = varNameRes.get(RES_ENT_TYPE.SYMBOL, false);
		//make sure that symbol was retrieved successfully
		if( tmpExpSymb == null ){
			//error
			this.error("3248237648767234682");
		}
		//if need to assign array/tree/field data, then we need to swap LOAD with STORE
		//ES 2016-08-28 (b_log_cond_test): refactor code: replace condition with a variable
		//	to avoid code duplication
		if( doAssignComplexObj ){
			//change command from LOAD to STORE
			vLastCmd._type = COMMAND_TYPE.STORE;
			//store takes additional argument that represents value to be stored
			vLastCmd.addArgument(vExpCmd);
			//add symbol to the STORE command
			vLastCmd.addSymbol(vSymb);
			//get last command in the current block
			var tmpLastCmdInCurBlk = this.getCurrentScope()._current._cmds[this.getCurrentScope()._current._cmds.length - 1];
			//if STORE command is not last in the current block and current block is not empty
			//	then move STORE command to this current block from its original to make sure that
			//	all commands that STORE references will be processed before it, or else it can point
			//	at commands that are in the "future", i.e. placed after STORE command
			if( 
				//if it is not last command, and
				tmpLastCmdInCurBlk._id != vLastCmd._id &&

				//the current block is not empty (i.e. that it has at least one non-NOP command)
				//ES 2016-08-13 (b_cmp_test_1): renamed function, because it was giving wrong meaning 
				this.getCurrentScope()._current.isNonEmptyBlock()
			){
				//remove STORE command from its original place
				vLastCmd._blk._cmds.splice(vLastCmd._blk._cmds.indexOf(vLastCmd), 1);
				//ES 2016-08-13 (b_cmp_test_1): check if block from which STORE command is taken
				//	would becomes empty now, after STORE is removed
				if( vLastCmd._blk._cmds.length == 0 ){
					//create a NOP command
					vLastCmd._blk.createCommand(COMMAND_TYPE.NOP, [], []);
				}
				//reset _blk for the store command
				vLastCmd._blk = this.getCurrentScope()._current;
				//place STORE command to be the last command in the current block
				vLastCmd._blk._cmds.push(vLastCmd);
			}
		} else {	//if it is a singleton (not array and not tree)
			//add symbol to the expression command
			vExpCmd.addSymbol(vSymb);
		}	//end if assigned variable is array or tree
	} else {	//if next token is not '=' operator
		//if not declaring a new variable, then '=' was needed
		if( !doDeclVar ){
			//error
			this.error("pars.6 - missing assignment (right-side) expression in LET statement");
		}
		//ES 2016-08-18 (b_code_error_handling): check if declaration statement is ended 
		if( this.isCurrentToken(TOKEN_TYPE.SEMICOLON) == false &&
			this.isCurrentToken(TOKEN_TYPE.NEWLINE) == false &&
			this.isCurrentToken(TOKEN_TYPE.CODE_CLOSE) == false ){
			//ES 2016-08-18 (b_code_error_hanlding): replace former error with descriptive message
			//this.error("43857259878425");
			//ES 2016-08-18 (b_code_error_handling): error: equal sign
			this.error("pars.3 - missing equal sign");
		}
		//set expression command
		vExpCmd = vSymb.getLastDef();
	}	//end if next token is '=' operator
	//create and return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, vExpCmd)
		.addEntity(RES_ENT_TYPE.SYMBOL, vSymb);
};	//end statement assign/var_decl

//ES 2016-08-19 (b_code_error_handling): code for CATCH statement to change error message
//	if the original error code matches the given one
//input(s):
//	errCode: (text) given error code to match in the original error
//	errMsg: (text) catched original error message
//	txt: (text) text for the new error message
parser.prototype.triggerErrorWithSingleEntityName = function(errCode, errMsg, txt){
	//split error message by comma (',')
	var tmpSplitErrorMsg = errMsg.substring(6).split(/,| /);
	//assign error code
	var tmpErrorCode = tmpSplitErrorMsg[0];
	//assign variable name
	var tmpUndeclVarName = tmpSplitErrorMsg.length > 1 ? tmpSplitErrorMsg[1] : "";
	//check for special error code
	if( tmpErrorCode == errCode ){
		//throw error with proper message
		this.error(txt + tmpUndeclVarName);
	} else {
		//trigger former message
		throw new Error(errMsg);
	}
};	//end method 'triggerErrorWithSingleEntityName'

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
	var newCurBlk = curScp.createBlock(true, false);
	//if new block is created (not using previous empty block)
	if( prevCurBlk != newCurBlk ){
		//connect previous block to a new one
		block.connectBlocks(prevCurBlk, newCurBlk, B2B.FALL);
	}
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
		blkArr.push(curScp.createBlock(false, true));
		//create fail block [1]
		blkArr.push(curScp.createBlock(false, true));
		//create phi block [2]
		blkArr.push(curScp.createBlock(false, true));
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
				blkArr[1],	//source: FAIL
				blkArr[2],	//dest: PHI
				B2B.FALL
			);
			//ES 2016-08-28 (b_log_cond_test): associate SUCCESS and FAIL blocks with left
			//	and right arguments of PHI command, respectively, to assist an interpreter
			//	in choosing the proper argument
			this.addLeftRightBlkPairForPhiBlk(
				blkArr[2]._id,			//phi block
				[blkArr[0]._id],		//array: SUCCESS -> left
				[blkArr[1]._id]			//array: FAIL -> right
			);
		}	//end if create boolean constants
		//process logic tree
		this.logTree.process(
			blkArr[0]._cmds[0],	//first command in SUCCESS block
			blkArr[1]._cmds[0]	//first command in FAIL block
		);
		//refresh logical tree
		this.logTree.clear();
		//ES 2016-08-26 (b_log_cond_test): if PHI block is not current block and
		//	current block is empty (i.e. has only a NOP command)
		//ES TODO: test this new code with IF and WHILE statements -- does it wire up CFG correctly
		//ES 2016-08-28 (b_log_cond_test): make sure that PHI command exists
		if( phiCmd != null &&								//there should be PHI command 
			phiCmd._blk._id != curScp._current._id && 		//if PHI block is not current block
			curScp._current.isNonEmptyBlock() == false ){	//if current is empty
			//make a FALL connection between PHI and current blocks
			block.connectBlocks(
				phiCmd._blk,
				curScp._current,
				B2B.FALL
			);
		}
		//setup result set
		res = new Result(true, [])
			.addEntity(RES_ENT_TYPE.TYPE, 
				type.createType("boolean", OBJ_TYPE.BOOL, this._gScp))
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
	//ES 2016-08-24 (b_code_error_handling): get types for left and right sides of condition
	var relExp_lh_type = relExp_res.get(RES_ENT_TYPE.TYPE, false);
	var relExp_rh_type = relExp_rh_exp.get(RES_ENT_TYPE.TYPE, false);
	//ES 2016-08-24 (b_code_error_handling): make sure that types for left and right
	//	sides of comparison expressions do exist
	if( relExp_rh_type == null || relExp_lh_type == null ){
		this.error("47538575945792873");
	}
	//ES 2016-08-24 (b_code_error_handling): compare types for left and right sides
	if( relExp_rh_type._id != relExp_lh_type._id ){
		//error -- wrong types are compared
		this.error("pars.61 - wrong types are compared");
	}
	//ES 2016-08-24 (b_code_error_handling): convert comparison operator to function name
	var tmpOpFuncName = functinoid.detFuncNameFromCmdTypeOp(relOpCmdType);
	//ES 2016-08-24 (b_code_error_handling): has function name been determined
	if( tmpOpFuncName == null ){
		this.error("438753289575987584");
	}
	//ES 2016-08-24 (b_code_error_handling): check if operator is not supported by condition types
	if( !(tmpOpFuncName in relExp_rh_type._methods) ){
		//error -- condition type do not support given comparison operator
		this.error("pars.62 - condition type " + relExp_rh_type._name + " does not support comparison operator " + tmpOpFuncName);
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
	this.getCurrentScope().createBlock(true, true);	//pass 'true' to set new block as current
	//create terminal node in the logic tree
	var relExp_termNode = this.logTree.addTerminal(
		relExp_jmpCmd,			//jump command
		null					//at this point there is no parent node, yet
	);
	//return result set
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, relExp_jmpCmd)
		.addEntity(RES_ENT_TYPE.TYPE, 
			type.createType("boolean", OBJ_TYPE.BOOL, this._gScp))
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
	//remove type from the result set
	expRes.removeAllEntitiesOfGivenType(RES_ENT_TYPE.TYPE);
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

//process '(' LOGIC_EXP ')', i.e. fully isolated expression
//input(s): (none)
//output(s):
//	(Result) => if statement is processed successfully, then it passes back
//		what 'process__logicExp' function has returned
parser.prototype.process__fullIsolatedExp = function(){
	//check if first token is opened paranthesis (i.e. '(')
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == true ){
		//consume '('
		this.next();
		//process logical expression
		var res = this.process__logicExp();
		//check if logical expression was processed successfully AND
		//		expression is ended with ')'
		if( res.success == true &&
			this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == true ){
			//consume ')'
			this.next();
			//success case
			return res;
		}	//end if expression processed successfully
	}	//end if starting opened paranthesis
	//failure case
	return FAILED_RESULT;
};	//end 'process__fullIsolatedExp'

//process VAR operator for variable declaration
//	=> syntax: 'var' TYPE '(' [ FUNC_ARGS_INST ] ')'
//	=> semantic: it would invoke custom constructor, provided by the user.
//		If user specifies no arguments then default ctor will be used even
//		if user provided custom ctor with 0 arguments.
parser.prototype.process__varOperator = function(){
	//check if first token is 'var'
	if( this.isCurrentToken(TOKEN_TYPE.VAR) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'var'
	this.next();
	//process type
	var varOp__typeRes = this.process__type();
	//make sure that type was processed successfully
	if( varOp__typeRes.success == false ){
		//fail
		return FAILED_RESULT;
	}
	//get type
	var varOp__type = varOp__typeRes.get(RES_ENT_TYPE.TYPE, false);
	//if next token is not an open paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		return FAILED_RESULT;
	}
	//consume '('
	this.next();
	//initialize name for ctor method
	var varOp__ctorName = null;
	//if there are no arguments, i.e. the next token is ')'
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == true ){
		//then use default constructor
		varOp__ctorName = "__create__";			//default constructor
	} else {
		varOp__ctorName = "__constructor__";	//custom constructor
	}
	//make sure that custom constructor method exists
	if( !(varOp__ctorName in varOp__type._methods) ){
		//error
		this.error("user needs to explicitly create constructor for " + varOp__type._name);
	}
	//get reference to the ctor method
	var funcRef = varOp__type._methods[varOp__ctorName];	//get ctor (i.e. __constructor__)
	//try to process function arguments
	var varOp__args = this.process__funcArgs(funcRef);
	//now, ensure that the current token in closing paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == false ){
		//fail
		this.error("expecting ')' in the function call statement, after argument list");
	}
	//consume ')'
	this.next();
	//get current block
	var varOp__curBlk = this.getCurrentScope()._current;
	//create CALL command
	var varOp__callCmd = varOp__curBlk.createCommand(
		COMMAND_TYPE.CALL,	//call command type
		[funcRef],			//reference to invoked functinoid
		[]
	);
	//return result
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.COMMAND, varOp__callCmd)
		.addEntity(RES_ENT_TYPE.TYPE, funcRef._return_type);
};	//end 'process__varOperator'

//factor
//	=> syntax: DESIGNATOR | SINGLETON | FUNC_CALL | VAR_OP | '(' LOGIC_EXP ')'
//	=> semantic: (none)
parser.prototype.process__factor = function(){
	//init parsing result
	var factorRes = null;
	//try various kinds of statements
	if(
		//process variable identifier exoression statement
		(factorRes = this.process__designator(null)).success == false &&

		//process singleton expression
		(factorRes = this.process__singleton()).success == false &&

		//process function call expression
		(factorRes = this.process__functionCall()).success == false &&

		//process VAR operator for variable declaration
		(factorRes =  this.process__varOperator()).success == false &&

		//process fully isolated expression
		(factorRes = this.process__fullIsolatedExp()).success == false
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
		//ES 2016-06-12 (b_intepreter_2): 'snglVal' at first should just contain actual
		//	JS object value (i.e. integer, text, boolean). Then, during command construction
		//	value object will be formed using this value.
		//snglVal = value.createValue(snglIsTrue);
		snglVal = snglIsTrue;
		//set type to be boolean
		snglType = type.createType("boolean", OBJ_TYPE.BOOL, this._gScp);
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
		//ES 2016-06-12 (b_intepreter_2): 'snglVal' at first should just contain actual
		//	JS object value (i.e. integer, text, boolean). Then, during command construction
		//	value object will be formed using this value.
		//snglVal = value.createValue(this.current().text);
		snglVal = this.current().text;
		//consume this token
		this.next();
		//now make sure that there is ending quote
		if( this.isCurrentToken(snglIsDoubleQuote ? TOKEN_TYPE.DOUBLEQUOTE : TOKEN_TYPE.SINGLEQUOTE) == false ){
			//if not, then fail
			this.error("expecting ending quote symbol");
		}
		//set type to be text
		snglType = type.createType("text", OBJ_TYPE.TEXT, this._gScp);
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
			snglType = type.createType("integer", OBJ_TYPE.INT, this._gScp);
		} else if( this.isCurrentToken(TOKEN_TYPE.FLOAT) ){	//if this is a real
			//set real value
			snglVal = snglVal * parseFloat(this.current().text);
			//set type to be real
			snglType = type.createType("real", OBJ_TYPE.REAL, this._gScp);
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
		COMMAND_TYPE.NULL,				//null command type
		[value.createValue(snglVal)],	//processed value
		[]								//symbols
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
//			possible to store function pointers in array or tree, so ACCESS cannot
//			in this case process array index brackets or it would semantic error
parser.prototype.process__functionCall = function(){
	//check if the current token is not 'call'
	if( this.isCurrentToken(TOKEN_TYPE.CALL) == false ){
		//fail
		return FAILED_RESULT;
	}
	//consume 'call'
	this.next();
	//declare result set for access processor
	var funcCall_AccRes = null;
	try{
		//parse thru function name expression to get functinoid and possibly command
		//	representing object that contains this functinoid in its definition
		//ES 2016-08-19 (b_code_error_handling): move declaration of result set variable outside
		funcCall_AccRes = this.process__access();
	} catch(tmpE){
		//trigger new error message if original's has specified error code
		this.triggerErrorWithSingleEntityName(
			"784738942375957857",						//error code
			tmpE.message,								//former/original error message
			"pars.12 - invoking non-existing function "	//new error message
		);
	}
	//access is suposse to return a functionoid in the result set
	var funcRef = funcCall_AccRes.get(RES_ENT_TYPE.FUNCTION,  false);
	//if functinoid is not found, then this is error
	if( funcRef == null ){
		//ES 2016-08-19 (b_code_error_handling): add error specifier (pars.13)
		this.error("pars.13 - attempting to call non-functinoid entity");
	}
	//ES 2016-08-20 (b_code_error_handling): if causing infinite recursion, i.e. if
	//	calling function within itself AND there is no return command above in code
	//ES 2016-08-28 (b_log_cond_test): make sure that scope represents function
	if( this.getCurrentScope()._funcDecl != null &&
		this.getCurrentScope()._funcDecl._id == funcRef._id && 
		funcRef._return_cmds.length == 0 ){
		//error -- infinite recursion
		this.error("pars.14 - infinite recursion in " + funcRef._name);
	}
	//try to get symbol from the result set
	var funcOwnerSymbRef = funcCall_AccRes.get(RES_ENT_TYPE.SYMBOL, false);
	//ES 2016-07-28 (Issue 3, b_cmp_test_1): try to get command. If processing
	//	sub-expression (by the ACCESS operator), then we would not have symbol
	//	but we can use COMMAND entity to create THIS reference (later in the code)
	var tmpSubExpThisCmd = funcCall_AccRes.get(RES_ENT_TYPE.COMMAND, false);
	//ensure that the next token is open paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//fail
		//ES 2016-08-18 (b_code_error_handling): pars.10 - missing '(' after function name in a CALL statement
		this.error("pars.10 - expecting '(' after functinoid name");
	}
	//consume '('
	this.next();
	//if there is a owner reference for this method
	//ES 2016-07-28 (Issue 3, b_cmp_test_1): change IF condition by adding an extra
	//	condition to check if instead exists COMMAND entity, to use it for THIS
	if( funcOwnerSymbRef != null || tmpSubExpThisCmd != null ){
		//get current block
		var tmpCurBlk = this.getCurrentScope()._current;
		//get last definition of THIS
		//ES 2016-07-29 (Issue 3, b_cmp_test_1): first check if symbol is not null, and
		//	only then try to get last def-command using this symbol.
		var tmpThisDef = funcOwnerSymbRef != null ? funcOwnerSymbRef.getLastDef() : null;
		//make sure that there is a command for THIS
		if( tmpThisDef == null ){
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): check if command is not a null
			if( tmpSubExpThisCmd != null ){
				tmpThisDef = tmpSubExpThisCmd;
			} else {	//else, (original case) -- error because cannot determine THIS
				this.error("473857328957328");
			}	//ES 2016-07-28 (Issue 3, b_cmp_test_1): end if command exists for THIS
		}
		//pass THIS as a function argument
		tmpCurBlk.createCommand(
			COMMAND_TYPE.PUSH,		//push function argument on the stack
			[tmpThisDef],			//command represening expression
			[]						//no symbols associated with this command
		);
	}	//end if there is an owner reference for this method
	//try to process function arguments
	this.process__funcArgs(funcRef);	//it does not matter what it returns
	//now, ensure that the current token in closing paranthesis
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_CLOSE) == false ){
		//fail
		this.error("expecting ')' in the function call statement, after argument list");
	}
	//consume ')'
	this.next();
	//get current block
	var funcCall_curBlk = this.getCurrentScope()._current;
	//construct array of arguments for CALL command
	var funcCallArgsArr = [funcRef];
	//if there is a symbol representing owner
	if( funcOwnerSymbRef != null ){
		//add symbol to array
		funcCallArgsArr.push(funcOwnerSymbRef);
		//get command from access result set
		var funcOwnerCmd = funcCall_AccRes.get(RES_ENT_TYPE.COMMAND, false);
		//if there is a command, then add it to the array
		if( funcOwnerCmd != null ){
			funcCallArgsArr.push(funcOwnerCmd);
		}
	//ES 2016-07-28 (Issue 3, b_cmp_test_1): if instead there is a COMMAND entity
	} else if( tmpSubExpThisCmd != null ) {
		//add NULL to argument array to represent symbol
		//funcCallArgsArr.push(null);	//TODO: not sure if interpreter needs to maintain an exact order of elements
		//add command to the argument array
		funcCallArgsArr.push(tmpSubExpThisCmd);
	}	//end if there is symbol representing owner
	//create CALL command
	var funcCall_callCmd = funcCall_curBlk.createCommand(
		COMMAND_TYPE.CALL,	//call command type
		funcCallArgsArr,	//reference to invoked functinoid
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
	//ES 2017-02-17 (soko): add NULL to the access stack of scopes
	this._accessStackScp.push(null);
	//parse factor
	var accRes = this.process__factor();
	//check if factor got processed successfully
	if( accRes.success == false ){
		//ES 2017-02-17 (soko): remove recently inserted NULL from access stack
		this._accessStackScp.pop();
		//fail
		return FAILED_RESULT;
	}
	//if factor is not a functinoid
	//ES 2016-07-28 (Issue 3, b_cmp_test_1): change IF condition to handle sup-expression
	//	case, but in the same time reject (as originally) stand-alone function case.
	if( accRes.isEntity(RES_ENT_TYPE.FUNCTION) == false 
		
		//ES 2016-07-28 (Issue 3, b_cmp_test_1): Specifically, add extra condition to 
		//	check if result set contains COMMAND entity to separate cases of 
		//	stand-alone and sup-expression.
		|| accRes.isEntity(RES_ENT_TYPE.COMMAND) == true 
	){
		//record reference to the current scope
		var tmpStartScp = this.getCurrentScope();
		//get current block
		var tmpCurBlk = tmpStartScp._current;
		//ES 2017-02-17 (soko): should add scope to the access stack of scopes
		//	Check result set that may arrive from designator (i.e. factor -> designator)
		//	to inform this function (access handler) that designator included new item on
		//	access stack, so that access handler would not included its own item this turn
		var tmpDoAddAccessScp = accRes.isEntity(RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR) == false;
		//try to parse '.'
		//ES 2015-01-23: correct from process__designator to process__access
		//	to follow the EBNF grammar of my language. Also, this is needed
		//	to process recursive access expressions.
		while( this.isCurrentToken(TOKEN_TYPE.PERIOD) == true ){
			//consume '.'
			this.next();
			//so, we are processing field/function of some custom type object
			//	we need to set this custom type's scope to be current so that
			//	all fields and functions defined in this scope could be found
			//	by designator function call, below
			//Get symbol for the processed factor
			var accFactorSymbol = accRes.get(RES_ENT_TYPE.SYMBOL, false);
			//make sure that symbol was found
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): get a type entity
			var accFactorType = accRes.get(RES_ENT_TYPE.TYPE, false);
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): get command entity
			var accFactorCmd = accRes.get(RES_ENT_TYPE.COMMAND, false);
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): change IF condition by adding two
			//	extra condition to check if type and commmand (from result set) has been
			//	acquired successfully. If it is, then we are handling a sup-expression
			if( accFactorSymbol == null && (accFactorType == null || accFactorCmd == null) ){
				this.error("326453485238767");
			}
			//get current scope
			var acc_curScp = this.getCurrentScope();
			//get type of this symbol
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): check if symbol is defined or not
			var accFactorSymbolType = accFactorSymbol != null ? accFactorSymbol._type : accFactorType;
			//set this type's scope as a curent scope
			//ES 2017-02-17 (soko): store scope for accessing field hierarchy inisde separate stack of scopes,
			//	since prior usage of '_stackScp' created a conflict, when writing new scopes/blocks/commands
			//	inside the current scope and accessing fields in the field hierarchy (both were altering
			//	stack of scopes and it was resulting in creation of commands at the wrong scope)
			//this.addCurrentScope(accFactorSymbolType._scope);
			if( tmpDoAddAccessScp ){
				//add current scope to the access stack of scopes
				this._accessStackScp.push(accFactorSymbolType._scope);
			}
			//initialize access argument
			var accArg1 = null;	//either functinoid (if method) or command (if data field)
			var accArg2 = null; //either null (if method) or symbol (if data field)
			//if current token is an identifier and it is a function name in the given type
			if( this.isCurrentToken(TOKEN_TYPE.TEXT) == true &&

				//ES 2016-07-29 (b_cmp_test_1): replace code:
				//	use function 'isMethodExist' instead of direct string match. Since
				//	some functions (core) have double-undescores before and after
				//	function names, and this method would not handle them, correctly.
				//this.current().text in accFactorSymbolType._methods ){
				accFactorSymbolType.isMethodExist(this.current().text) ){
				
				//assign functinoid reference as access argument
				//ES 2016-07-29 (b_cmp_test_1): replace code:
				//	use function 'getMethodsIfExists' to retrieve functinoid, to avoid
				//	string match, since core functions' name starts and ends with
				//	underscores; thus former approach would not cover core functions
				//accArg1 = accFactorSymbolType._methods[this.current().text];
				accArg1 = accFactorSymbolType.getMethodsIfExists(this.current().text);

				//proceed to next token
				this.next();
				//create and save result
				accRes = new Result(true, [])
					.addEntity(RES_ENT_TYPE.FUNCTION, accArg1)
					
					//ES 2016-07-28 (Issue 3, b_cmp_test_1): move call to add symbol out
					//.addEntity(RES_ENT_TYPE.SYMBOL, accFactorSymbol)
					
					.addEntity(RES_ENT_TYPE.TYPE, accArg1._return_type);
				
				//ES 2016-07-28 (Issue 3, b_cmp_test_1): check if symbol exists
				if( accFactorSymbol != null ){
					//moved this stement from above
					accRes.addEntity(RES_ENT_TYPE.SYMBOL, accFactorSymbol);
				}

				//ES 2016-07-28 (Issue 3, b_cmp_test_1): check if command exists
				if( accFactorCmd != null ){
					//add command to the new result set
					accRes.addEntity(RES_ENT_TYPE.COMMAND, accFactorCmd);
				}

			} else {	//if it is not a function of given type
				//ES 2016-08-19 (b_code_error_handling): get name of object, from which to invoke function
				var tmpObjName = accRes.get(RES_ENT_TYPE.TEXT, false);
				//try to parse designator (Note: we should not declare any variable
				//	right now, so pass 'null' for the function argument type)
				//ES 2017-11-07 (Issue 10, b_soko): prevent designator to consume indexing expression right now
				//	by invoking only first part of original function (process__designator), which now is placed
				//	in its own separate method 'process__desId'.
				//accRes = this.process__designator(null);
				var accRes = this.process__desId(null);
				//ES 2016-08-18 (b_code_error_handling): check if we got a function
				if( accRes.get(RES_ENT_TYPE.FUNCTION, false) != null ){
					//ES 2016-08-18 (b_code_error_hanlding): replace former error with descriptive message
					//this.error("537582475498675237");
					//ES 2016-08-19 (b_code_error_handling): get function name
					var tmpFuncName = accRes.get(RES_ENT_TYPE.TEXT, false);
					//ES 2016-08-18 (b_code_error_handling): error: undeclared function
					this.error("pars.11 - " + tmpFuncName + " function is not declared in " + tmpObjName + " object");
				}
				//make sure that designator was processed successfully
				if( accRes.success == false ){
					//error
					this.error("437623876878948");
				}
				//get command representing designator
				accArg1 = accRes.get(RES_ENT_TYPE.COMMAND, false);
				//make sure that there is a command
				if( accArg1 == null ){
					this.error("839578957875973");
				}
				//remove command from the result set, because it should be
				//replaced by LOAD command later on
				accRes.removeAllEntitiesOfGivenType(RES_ENT_TYPE.COMMAND);
				//get symbol and save it inside accArg2
				accArg2 = accRes.get(RES_ENT_TYPE.SYMBOL, false);
				//ensure that symbol was retrieved successfully
				if( accArg2 == null ){
					//error
					this.error("785436857673278562");
				}
				//TODO: need to check if right side (i.e. field's name) actually
				//	present in the left side's type definition******************
			}	//end if it is a function of given type
			//get last definition of command for this symbol
			//ES 2016-07-28 (Issue 3, b_cmp_test_1): check if symbol is defined, or not
			acc_defSymbCmd = accFactorSymbol != null ? accFactorSymbol.getLastDef() : accFactorCmd;
			//create ADDA command for determining address of element to be accessed
			var acc_addaCmd = tmpCurBlk.createCommand(
				COMMAND_TYPE.ADDA,
				[
					acc_defSymbCmd,		//last definition of factor
					//functionoid (if method) or command (if data field)
					accArg1,
					//null (if method) or symbol (if data field)
					accArg2
				],			//arguments
				[]			//no symbols atatched to addressing command
			);
			//create LOAD command for retrieving data element from array/tree
			acc_loadCmd = tmpCurBlk.createCommand(
				COMMAND_TYPE.LOAD,
				[
					acc_addaCmd			//addressing command
				],			//argument
				[]			//no symbols
			);
			//ES 2017-02-14 (soko): if accessed data field (i.e. accArg2 is symbol, and not null)
			if( accArg2 != null ){
				//add this symbol to ADDA command
				acc_loadCmd.addSymbol(accArg2);
			}       //ES 2017-02-14 (soko): end if accessed data field
			//add LOAD command to the result set
			accRes.addEntity(RES_ENT_TYPE.COMMAND, acc_loadCmd);
			//ES 2017-11-07 (Issue 10, b_soko): attempt to finish processing next designator (as array/tree index expression)
			var tmpAccIdxExpRes = this.process__desArrayIdx(accRes);
			//ES 2017-11-07 (Issue 10, b_soko): if array/tree index expression was processed, i.e. if resulting set has
			//	different command than the one that was passed into function 'process__desArrayIdx'
			if( tmpAccIdxExpRes.get(RES_ENT_TYPE.COMMAND)._id != acc_loadCmd._id ) {
				//reset accRes
				accRes = tmpAccIdxExpRes;
			}
			//ES 2017-02-17 (soko): if designator added scope to the stack of scopes
			if( tmpAccIdxExpRes.isEntity(RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR) ){
				//do not add scope the next iteration
				tmpDoAddAccessScp = false;
			} else {
				//assert flag, i.e. add scope to the access stack
				tmpDoAddAccessScp = true;
			}	//ES 2017-02-17 (soko): end if designator added scope to the stack of scopes
			//remove type's scope from the stack
			//ES 2016-01-23: remove code:
			//	Do not remove last processed type from the scope stack, yet
			//	Since we still may need it to recursively process '.' operator.
			//this._stackScp.pop();
		}	//end loop thru accessed fields
		//loop thru scope hierarchy and recursively remove scopes till we get
		//	to the starting scope that was recorded at the top of function.
		//ES 2017-02-17 (soko): Suggestion: may not need it anymore, since now storing scopes
		//	for access operator in a separate stack
		while( this.getCurrentScope() != tmpStartScp ){
			//if we have not yet reached the required scope, then take current out
			this._stackScp.pop();
		}
	}       //end if it is not functinoid
	//ES 2017-02-17 (soko): remove all entries from access stack that were added in this access invocation
	//	i.e. remove all scopes till NULL object, including the NULL (that was added at the top of function)
	var tmpAccessScpIdx = this._accessStackScp.length - 1;
	while( tmpAccessScpIdx >= 0 ){
		//if it is not NULL
		if( this._accessStackScp[tmpAccessScpIdx] != null ){
			//remove it from the access stack
			this._accessStackScp.pop();
		} else {	//if it is NULL
			//remove NULL
			this._accessStackScp.pop();
			//quit loop
			break;
		}	//end if it is not NULL
		//decrement index by 1
		tmpAccessScpIdx--;
	}	//ES 2017-02-17 (soko): end loop - remove all entries added in this access invocation
	//return result set
	return accRes;
};	//end access

//func_args_inst:
//	=> syntax: LOGIC_EXP { ',' LOGIC_EXP }*
//	=> semantic: (none)
//input(s):
//	f: (functinoid) reference to the functionoid for which we are processing
//			function arguments
parser.prototype.process__funcArgs = function(f){
	//init flag - is sequence of arguments non empty, i.e. has at least one argument
	var isSeqNonEmpty = false;
	//init result variable to keep track of return value
	var funcArgRes = null;
	//init counter for function arguments
	var i = 0;
	//get current block
	var funcArg_curBlk = this.getCurrentScope()._current;
	//loop thru statements
	do{
		//increment counter
		i++;
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
		//ES 2016-08-20 (b_code_error_handling): ensure that command exists
		if( funcArg_cmd == null ){
			//error
			this.error("4375825795757459");
		}
		//ES 2016-08-20 (b_code_error_handling): if too many arguments
		if( i > f._args.length ){
			//error -- wrong number of arguments
			this.error("pars.17 - given wrong number of arguments (" + 
						i + ") for function " + f._name + ", which " +
						"only takes " + f._args.length + " arguments");
		}
		//ES 2016-08-20 (b_code_error_handling): get type
		var funcArg_type = funcArgRes.get(RES_ENT_TYPE.TYPE, false);
		//ES 2016-08-20 (b_code_error_handling): ensure that type exists
		if( funcArg_type == null ){
			//error
			this.error("5298574933279823");
		}
		//ES 2016-08-28 (b_log_cond_test): declare index for checked function argument
		var tmpFuncArgIdx = i - 1;
		//ES 2016-08-28 (b_log_cond_test): if this function is not global, i.e. if it is
		//	declared within some object, then its first argument is reference to this
		//	object, so we have offset index by 1
		if( f._scope._owner != this._gScp 
			
			//ES 2016-09-17 (b_dbg_test): and, this is not a constructor function
			&& f._func_type != FUNCTION_TYPE.CTOR && f._func_type != FUNCTION_TYPE.CUSTOM_CTOR ){
			tmpFuncArgIdx++;
		}
		//ES 2016-08-20 (b_code_error_handling): make sure that this argument matches type
		//ES 2016-08-28 (b_log_cond_test): change 'i - 1' with 'tmpFuncArgIdx' to properly
		//	handle case when function is a member of an object (see comment above)
		if( funcArg_type._id != f._args[tmpFuncArgIdx].type._id ){
			//error -- argument type mismatch
			this.error("pars.16 - argument [" + i + "] type mismatch (" + 
						//ES 2016-08-28 (b_log_cond_test): change 'i - 1' with 'tmpFuncArgIdx'
						//	to properly handle case when function is a member of an object
						//	(see comment above)
						funcArg_type._name + " -> " + f._args[tmpFuncArgIdx].type._name + 
						") for function " + f._name);
		}
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
	//ensure that there is a correct number of function arguments
	if( i != (f._args.length - (f._args.length > 0 && f._args[0].name == "this" ? 1 : 0)) ){
		//error
		this.error("pars.17 - given wrong number of arguments (" + 
					i + ") for function " + f._name + ", which " +
					"takes " + f._args.length + " arguments");
	}
	//send result back to caller
	return funcArgRes;
};	//end function arguments

//ES 2017-11-07 (Issue 10, b_soko): first half of 'process__designator' function, which needs to
//	be separated into individual method, so that process just identifier, without consuming
//	array indexing expression (if one exists right after identifier). This will help deal with
//	Issue 10, which involves incorrect ordering of processed commands between array indexing and
//	dot-operator expressions.
//input(s):
//	t: (type) => this
parser.prototype.process__desId = function(t) {
	//check if first element is identifier
	var des_id = this.process__identifier();
	//check if identifier was processed correctly
	if( des_id == null ){
		//fail
		return FAILED_RESULT;
	}
	//get current scope
	var des_curScp = this.getCurrentScope(false);
	//ES 2017-02-17 (soko): pulled out declaration for 'des_symb' from new IF stmt
	var des_symb = null;
	//initialize definition command for this symbol
	var des_defSymbCmd = null;
	//ES 2017-02-17 (soko): if access stack is not empty and the last entry is not NULL, i.e. we are accessing
	//	either array/tree element or field of the complex (non-singleton) object
	if( this._accessStackScp.length > 0 && this._accessStackScp[this._accessStackScp.length - 1] != null ){
		//get last entry on the access stack
		var tmp_lastAccScp = this._accessStackScp[this._accessStackScp.length - 1];
		//find symbol inside it this scope
		des_symb = tmp_lastAccScp.findSymbol(des_id);
	} else {	//else, (original case), i.e. try to find variable in the execution scope hierarchy
		//find symbol with specified name in this scope and its parent hierarchy
		//ES 2017-02-17 (soko): pull out variable declaration for 'des_symb' outside of IF stmt
		des_symb = des_curScp.findSymbol(des_id);
	}
	//check if this identifier does not yet have associated variable
	if( des_symb == null ){
		//this identifier does not have associated symbol/variable
		//need to check if caller passed in valid type argument
		if( typeof t === "undefined" || t == null ){
			//check if this identifier is a method, defined in a global scope
			if( des_id in this._globFuncs ){
				//get function reference
				var tmpFuncRef = this._globFuncs[des_id];
				//identifier is a function name, defined in a global scope
				return new Result(true, [])
					.addEntity(RES_ENT_TYPE.TEXT, des_id)
					.addEntity(RES_ENT_TYPE.TYPE, tmpFuncRef._return_type)
					.addEntity(RES_ENT_TYPE.FUNCTION, tmpFuncRef);
			}
			//type is invalid -- user uses undeclared variable
			//ES 2016-08-19 (b_code_error_handling): trigger unique error code with name of
			//	variable that caused thia error, so it can be caught by one of the callers
			this.error("784738942375957857," + des_id);
		}
		//if reached this line, then we need to create a new variable
		des_symb = this.create__variable(des_id, t, des_curScp, des_curScp._current);
	} else {	//if symbol is defined
		//get last definition of command for this symbol
		des_defSymbCmd = des_symb.getLastDef();
	}	//end if there is no associated variable with retrieved identifier
	//return processed identifier information
	return new Result(true, [])
		.addEntity(RES_ENT_TYPE.TEXT, des_id)
		.addEntity(RES_ENT_TYPE.SYMBOL, des_symb)
		.addEntity(RES_ENT_TYPE.COMMAND, des_defSymbCmd)
		.addEntity(RES_ENT_TYPE.TYPE, des_symb._type);
};	//ES 2017-11-07 (Issue 10, b_soko): end process designator identifier

//ES 2017-11-07 (Issue 10, b_soko): second half of 'process__designator' function
//	moved into separate method, to finish processing array index expression, if
//	one existed.
//input(s):
//	idInfo: (RESULT) resulting object from 'process__desId' function
parser.prototype.process__desArrayIdx = function(idInfo) {
	//get current scope
	var des_curScp = this.getCurrentScope(false);
	//if processed identifier represents functionoid
	if( idInfo.isEntity(RES_ENT_TYPE.FUNCTION) ) {
		//quit, thee is no array indexing operator next
		return idInfo;
	}
	//get identifier name
	var des_id = idInfo.get(RES_ENT_TYPE.TEXT, false);
	//get symbol instance
	var des_symb = idInfo.get(RES_ENT_TYPE.SYMBOL, false);
	//get command
	var des_defSymbCmd = idInfo.get(RES_ENT_TYPE.COMMAND, false);
	//get type
	var tmpDesType = idInfo.get(RES_ENT_TYPE.TYPE, false);
	//loop while next token is open array (i.e. '[')
	while( this.isCurrentToken(TOKEN_TYPE.ARRAY_OPEN) == true ){
		//set symbol reference to null, since now we are accessing not the symbol var, but the 
		//	array/tree element of this symbol
		des_symb = null;
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
		var des_idxExpRes = this.process__logicExp();
		//check if logic expression was processed unsuccessfully
		if( des_idxExpRes.success == false ){
			//trigger error
			this.error("7389274823657868");
		}
		//get type of indexed expression
		var des_idxExpType = des_idxExpRes.get(RES_ENT_TYPE.TYPE, false);
		//make sure that type was found
		if( des_idxExpType == null ){
			//error
			this.error("74835632785265872452");
		}
		//next expected token is array close (i.e. ']')
		if( this.isCurrentToken(TOKEN_TYPE.ARRAY_CLOSE) == false ){
			//fail
			this.error("missing closing array bracket in array index expression");
		}
		//get command representint index for container
		var tmpContainerIndexCmd = des_idxExpRes.get(RES_ENT_TYPE.COMMAND, false);
		//make sure that retrieved command is not null
		if( tmpContainerIndexCmd == null ){
			//error
			this.error("435732562478564598");
		}
		//consume ']'
		this.next();
		//make sure that accessed type is either array or tree AND it has template(s)
		if( 
			//if it is neither array nor tree, or
			(tmpDesType._type != OBJ_TYPE.ARRAY && tmpDesType._type != OBJ_TYPE.BTREE) ||
			
			//it has no templates
			tmpDesType._templateNameArray.length == 0
		){
			//error
			this.error("974398546574659845");
		}
		//set type to be last template type to represent type of accessed value element
		tmpDesType = tmpDesType._templateNameArray[tmpDesType._templateNameArray.length - 1].type;
		//create ADDA command for determining address of element to be accessed
		var des_addaCmd = des_curScp._current.createCommand(
			COMMAND_TYPE.ADDA,
			[
				des_defSymbCmd,			//last definition of array/tree
				tmpContainerIndexCmd	//element index expression
				//null				//accessing element of container, not a data field
			],			//arguments
			[]			//no symbols atatched to addressing command
		);
		//create LOAD command for retrieving data element from array/tree
		des_defSymbCmd = des_curScp._current.createCommand(
			COMMAND_TYPE.LOAD,
			[
				des_addaCmd			//addressing command
			],			//arguments
			[]			//no symbols yet attached to LOAD
		);
	}	//end loop to process array expression
	//ES 2017-02-18 (soko): moved creation of Result from below, so that we can conditionally
	//	create 'RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR' inside IF stmt below, i.e. include
	//	this result entity only if designator added new item on access stack
	var tmpResSet = new Result(true, []);
	//ES 2017-02-12 (soko): fix bug: place type of value of array/tree inside stack of scopes
	//      whenever '.' operator follows index close (']'), i.e. foo[index]._field, so that
	//      we could find field (data/method) within the type of array/tree value
	//If next symbol following array close operator (']') is dot ('.')
	if( this._accessStackScp.length > 0 && this.isCurrentToken(TOKEN_TYPE.PERIOD) == true ){
		//place type of array/tree value on the scope stack
		this._accessStackScp.push(tmpDesType._scope);
		//notify ACCESS handler that designator included new item on access handler
		tmpResSet.addEntity(RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR, true);
	}       //ES 2017-02-12 (soko): end if '.' follows ']'
	//if symbol is defined
	if( des_symb != null ) {
		//add symbol to result set
		tmpResSet.addEntity(RES_ENT_TYPE.SYMBOL, des_symb);
	}
	//return result
	//ES 2017-02-18 (soko): move creation of result set above IF stmt that determines whether
	//	to include new item on access stack. This way 'RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR'
	//	would be included only if new item was inserted on access stack
	//return new Result(true, [])
	return tmpResSet
		.addEntity(RES_ENT_TYPE.TEXT, des_id)
		//.addEntity(RES_ENT_TYPE.SYMBOL, des_symb)
		.addEntity(RES_ENT_TYPE.COMMAND, des_defSymbCmd)
		.addEntity(RES_ENT_TYPE.TYPE, tmpDesType);
};	//ES 2017-11-07 (Issue 10, b_soko): end process designator array index expression

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
	/* ES 2017-11-07 (Issue 10, b_soko): moved this part into separate function
		'process__desId' to determine name of identifier, without processing array indexing
		expression, if one existed.
	//check if first element is identifier
	var des_id = this.process__identifier();
	//check if identifier was processed correctly
	if( des_id == null ){
		//fail
		return FAILED_RESULT;
	}
	//get current scope
	var des_curScp = this.getCurrentScope(false);
	//ES 2017-02-17 (soko): pulled out declaration for 'des_symb' from new IF stmt
	var des_symb = null;
	//ES 2017-02-17 (soko): if access stack is not empty and the last entry is not NULL, i.e. we are accessing
	//	either array/tree element or field of the complex (non-singleton) object
	if( this._accessStackScp.length > 0 && this._accessStackScp[this._accessStackScp.length - 1] != null ){
		//get last entry on the access stack
		var tmp_lastAccScp = this._accessStackScp[this._accessStackScp.length - 1];
		//find symbol inside it this scope
		des_symb = tmp_lastAccScp.findSymbol(des_id);
	} else {	//else, (original case), i.e. try to find variable in the execution scope hierarchy
		//find symbol with specified name in this scope and its parent hierarchy
		//ES 2017-02-17 (soko): pull out variable declaration for 'des_symb' outside of IF stmt
		des_symb = des_curScp.findSymbol(des_id);
		//initialize definition command for this symbol
		var des_defSymbCmd = null;
	}
	//check if this identifier does not yet have associated variable
	if( des_symb == null ){
		//this identifier does not have associated symbol/variable
		//need to check if caller passed in valid type argument
		if( typeof t === "undefined" || t == null ){
			//check if this identifier is a method, defined in a global scope
			if( des_id in this._globFuncs ){
				//get function reference
				var tmpFuncRef = this._globFuncs[des_id];
				//identifier is a function name, defined in a global scope
				return new Result(true, [])
					.addEntity(RES_ENT_TYPE.TEXT, des_id)
					.addEntity(RES_ENT_TYPE.TYPE, tmpFuncRef._return_type)
					.addEntity(RES_ENT_TYPE.FUNCTION, tmpFuncRef);
			}
			//type is invalid -- user uses undeclared variable
			//ES 2016-08-19 (b_code_error_handling): trigger unique error code with name of
			//	variable that caused thia error, so it can be caught by one of the callers
			this.error("784738942375957857," + des_id);
		}
		//if reached this line, then we need to create a new variable
		des_symb = this.create__variable(des_id, t, des_curScp, des_curScp._current);
	} else {	//if symbol is defined
		//get last definition of command for this symbol
		des_defSymbCmd = des_symb.getLastDef();
	}	//end if there is no associated variable with retrieved identifier
	ES 2017-11-07 (Issue 10, b_soko): end moved code in 'process__desId' */
	/* ES 2017-11-07 (Issue 10, b_soko): moved this part of function into method 'process__desArrayIdx',
		so that it can be invoked later on to finish processing array index expression
	//init type
	var tmpDesType = des_symb._type;
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
		var des_idxExpRes = this.process__logicExp();
		//check if logic expression was processed unsuccessfully
		if( des_idxExpRes.success == false ){
			//trigger error
			this.error("7389274823657868");
		}
		//get type of indexed expression
		var des_idxExpType = des_idxExpRes.get(RES_ENT_TYPE.TYPE, false);
		//make sure that type was found
		if( des_idxExpType == null ){
			//error
			this.error("74835632785265872452");
		}
		//next expected token is array close (i.e. ']')
		if( this.isCurrentToken(TOKEN_TYPE.ARRAY_CLOSE) == false ){
			//fail
			this.error("missing closing array bracket in array index expression");
		}
		//get command representint index for container
		var tmpContainerIndexCmd = des_idxExpRes.get(RES_ENT_TYPE.COMMAND, false);
		//make sure that retrieved command is not null
		if( tmpContainerIndexCmd == null ){
			//error
			this.error("435732562478564598");
		}
		//consume ']'
		this.next();
		//make sure that accessed type is either array or tree AND it has template(s)
		if( 
			//if it is neither array nor tree, or
			(tmpDesType._type != OBJ_TYPE.ARRAY && tmpDesType._type != OBJ_TYPE.BTREE) ||
			
			//it has no templates
			tmpDesType._templateNameArray.length == 0
		){
			//error
			this.error("974398546574659845");
		}
		//set type to be last template type to represent type of accessed value element
		tmpDesType = tmpDesType._templateNameArray[tmpDesType._templateNameArray.length - 1].type;
		//create ADDA command for determining address of element to be accessed
		var des_addaCmd = des_curScp._current.createCommand(
			COMMAND_TYPE.ADDA,
			[
				des_defSymbCmd,			//last definition of array/tree
				tmpContainerIndexCmd	//element index expression
				//null				//accessing element of container, not a data field
			],			//arguments
			[]			//no symbols atatched to addressing command
		);
		//create LOAD command for retrieving data element from array/tree
		des_defSymbCmd = des_curScp._current.createCommand(
			COMMAND_TYPE.LOAD,
			[
				des_addaCmd			//addressing command
			],			//arguments
			[]			//no symbols yet attached to LOAD
		);
	}	//end loop to process array expression
	//ES 2017-02-18 (soko): moved creation of Result from below, so that we can conditionally
	//	create 'RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR' inside IF stmt below, i.e. include
	//	this result entity only if designator added new item on access stack
	var tmpResSet = new Result(true, []);
	//ES 2017-02-12 (soko): fix bug: place type of value of array/tree inside stack of scopes
	//      whenever '.' operator follows index close (']'), i.e. foo[index]._field, so that
	//      we could find field (data/method) within the type of array/tree value
	//If next symbol following array close operator (']') is dot ('.')
	if( this._accessStackScp.length > 0 && this.isCurrentToken(TOKEN_TYPE.PERIOD) == true ){
		//place type of array/tree value on the scope stack
		this._accessStackScp.push(tmpDesType._scope);
		//notify ACCESS handler that designator included new item on access handler
		tmpResSet.addEntity(RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR, true);
	}       //ES 2017-02-12 (soko): end if '.' follows ']'
	//return result
	//ES 2017-02-18 (soko): move creation of result set above IF stmt that determines whether
	//	to include new item on access stack. This way 'RES_ENT_TYPE.ACCESS_STACK_DESIGNATOR'
	//	would be included only if new item was inserted on access stack
	//return new Result(true, [])
	return tmpResSet
		.addEntity(RES_ENT_TYPE.TEXT, des_id)
		.addEntity(RES_ENT_TYPE.SYMBOL, des_symb)
		.addEntity(RES_ENT_TYPE.COMMAND, des_defSymbCmd)
		.addEntity(RES_ENT_TYPE.TYPE, tmpDesType);
	ES 2017-11-07 (Issue 10, b_soko): end moved code into 'process__desArrayIdx' */

	//ES 2017-11-07 (Issue 10, b_soko): consume identifier and determine its type information
	var tmpIdInf = this.process__desId(t);

	//ES 2017-11-07 (b_soko): if identifier failed to process
	if( tmpIdInf.success == false  ) {
		//fail
		return FAILED_RESULT;
	}

	//ES 2017-11-07 (Issue 10, b_soko): try to process array index expression, providing one exists
	//	and return result
	return this.process__desArrayIdx(tmpIdInf);

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
	//add symbol to this scope
	s.addSymbol(v_symb);
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
					//ES 2016-07-27 (b_cmp_test_1): fix bug: need to reset variable to
					//	point to the owner, so we can iterate to next level
					tmpCurScp = tmpCurScp._owner;
				}	//end loop thru scope hierarchy
			}	//ES 2016-01-16 (Issue 3, b_bug_fix_for_templates): end if is template type
			//determine if type scope was not found
			if( tyObj == null ){
				//scope was not found
				//this.error("437856357865782");
				tyObj = type.__library[type_name];
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
	if( this.isCurrentToken(TOKEN_TYPE.TEXT) == false && 
		//make sure that array and tree qualify as identifiers, so 
		//	that process__type can function without additional changes
		this.isCurrentToken(TOKEN_TYPE.ARRAYTYPE) == false && 
		this.isCurrentToken(TOKEN_TYPE.BTREETYPE) == false ){
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
	//ES 2016-08-21 (b_code_error_handling): if found not equal sign (<>)
	if( this.isCurrentToken(TOKEN_TYPE.NEQ) ){
		//error -- expecting template specifier in obj-def
		this.error("pars.42 - expecting template specifier in object definition");
	}
	//check if '<' is current token
	if( this.isCurrentToken(TOKEN_TYPE.LESS) == true ){
		//ES 2016-08-21 (b_code_error_handling): temporary associative array to make
		//	sure that template specifiers all have unique names
		var tmpTmplSpecSet = {};
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
					//ES 2016-08-21 (b_code_error_handling): include error code (pars.44)
					this.error("pars.44 - expecting comma in the template list in type definition");
				}	//end if ensure there is a comma
				//consume comma (',')
				this.next();
			}	//end if not first template in the list
			//process identifier
			var tmplElem = this.process__identifier();
			//make sure that identifier was processed successfully
			if( tmplElem == null ){
				//processing identifier faile
				//ES 2016-08-21 (b_code_error_handling): updated error message
				this.error("pars.43 - expecting template specifier in object definition");
			}	//end if ensure identifier process successfully
			//ES 2016-08-21 (b_code_error_handling): check if this template specifier has
			//	been encountered already in this object definition
			if( tmplElem in tmpTmplSpecSet ){
				//error -- template specifier re-declared in object definition
				this.error("pars.45 - template specifier re-declared in object definition");
			}
			//add element to the array
			objDef_tempArr.push(tmplElem);
			//ES 2016-08-21 (b_code_error_handling): add template specifier to set
			tmpTmplSpecSet[tmplElem] = null;
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
		//ES 2016-08-21 (b_code_error_handling): updated error message
		this.error("pars.40 - missing object name in object definition");
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
			//unknown type
			this.error("parent object type is unknown; check spelling");
		}
		//extract type
		objDef_prnRef = objDef_typeRes.get(RES_ENT_TYPE.TYPE, false);
	}
	//make sure that next token is code open bracket ('{')
	if( this.isCurrentToken(TOKEN_TYPE.CODE_OPEN) == false ){
		//missing code open paranthesis
		//ES 2016-08-21 (b_code_error_handling): updated error message
		this.error("pars.41 - expecting '{' after object name");
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
	//ES 2016-01-21: if type has no blocks
	if( objDef_newTypeInst._scope._start == null ){
		//create a block
		objDef_newTypeInst._scope.createBlock(true);
	}
	//ES 2016-01-21 (Issue 3, b_bug_fix_for_templates): instead of simply adding Symbol
	//	for 'this' inside type's scope, create a field (which would internally add symbol)
	//	and also will create a command for 'this'. All of this is needed, so that when
	//	'this' is parsed within function code sequence, designator could return COMMAND that
	//	initializes 'this' properly -- it is responsibilty of interpreter to differentiate
	//	'this' for each instance of such type.
	//create symbol 'this'
	//var objDef_this = new symbol("this", objDef_newTypeInst, objDef_newTypeInst._scope);
	//add 'this' to the scope
	//objDef_newTypeInst._scope.addSymbol(objDef_this);
	objDef_newTypeInst.createField(
		"this", 							//variable name
		objDef_newTypeInst, 				//variable type
		objDef_newTypeInst._scope._start	//first block in the type's scope
	);
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
	//initialize array or tree to collect important data field information
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
		this.error("pars.46 - expecting field name after semi-colon (':') in object definition " + t._name);
	}
	//ES 2016-08-21 (b_code_error_handling): check if this field name is already defined
	if( dtFldDeclRes_Id in t._scope._symbols ){
		//error -- field re-declaration
		this.error("pars.48 - field " + dtFldDeclRes_Id + " is re-declared in object " + t._name);
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
		//ES 2016-08-19 (b_code_error_handling): add error specifier (pars.20)
		this.error("pars.20 - missing type specifier in function definition");
	}
	//try to get processed type (returned result is an array)
	var funcRetType = funcDefRes_RetType.get(RES_ENT_TYPE.TYPE, false);
	//ES 2016-08-20 (b_code_error_handling): if type is not legal
	if( funcRetType.isTypeLegal() == false ){
		//error -- unknown type
		this.error("pars.25 - unknown type " + funcRetType._name + " in function definition");
	}
	//check that the next token is colon (':')
	if( this.isCurrentToken(TOKEN_TYPE.COLON) == false ){
		//missing colon
		//ES 2016-08-19 (b_code_error_handling): add error specifier (pars.21)
		this.error("pars.21 - missing colon in function definition");
	}
	//consume colon (':')
	this.next();
	//get function name
	var funcName = this.process__identifier();
	//check that function name was processed incorrectly
	if( funcName == null ){
		//failed to parse function name
		//ES 2016-08-19 (b_code_error_handling): re-phrase start error message and
		//	add error specifier (pars.22)
		this.error("pars.22 - missing function name in function definition");
	}
	//check that the next token is '(' (open paranthesis)
	if( this.isCurrentToken(TOKEN_TYPE.PARAN_OPEN) == false ){
		//missing open paranthesis
		//ES 2016-08-19 (b_code_error_handling): re-phrase start of error message and
		//	add error specifier (pars.23)
		this.error("pars.23 - missing '(' in function definition");
	}
	//get current scope (false: do not remove scope from the stack)
	var funcDefCurScp = this.getCurrentScope(false);
	//determine function type from the name
	var funcDefNameType = functinoid.detFuncType(funcName);
	//initialize function definition object
	var funcDefObj = null;
	
	//if function with the given name is already defined in type object
	//ES 2016-07-29 (b_cmp_test_1): replace code:
	//	use function 'isMethodExist' instead of direct string match. Since
	//	some functions (core) have double-undescores before and after
	//	function names, and this method would not handle them, correctly.
	//if( t && (funcName in t._methods) ){
	if( t && t.isMethodExist(funcName) ){

		//if function type is constructor, then allow to change number of func arguments
		//ES 2016-03-06: remove first part of IF condition, because CTOR will represent
		//	default constructor (i.e. takes no arguments). And then there will be another
		//	function type (i.e. CUSTOM_CTOR) that user can define for its own constructor.
		//	But it is optional method, i.e. does not need to defined -- meaning, parser
		//	will not define this method if it is not defined by the user.
		/*if( funcDefNameType == FUNCTION_TYPE.CTOR ){
			//assign function reference
			funcDefObj = t._methods[funcName];
		//if it is not custom function, then delete my definition
		} else */
		if(funcDefNameType != FUNCTION_TYPE.CUSTOM) {
			
			//ES 2016-07-29 (b_cmp_test_1): check if this given a non-core function
			if( funcName in t._methods ){
			
				//remove function reference from the object
				delete t._methods[funcName];
			
			} else {	//if given a core function

				//if it is a core function, then add double-underscores before and
				//	after the function name
				delete t._methods["__" + funcName + "__"];
			
			}
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
			//if this is not a custom constructor
			if( funcDefNameType != FUNCTION_TYPE.CUSTOM_CTOR &&
				funcDefNameType != FUNCTION_TYPE.CTOR ){
				//create symbol for current argument
				var tmpThisSymb = t._scope.findSymbol("this");
				//create POP command for current argument
				var c = funcDefObj._scope._current.createCommand(
					COMMAND_TYPE.POP,		//pop command
					[],						//POP takes no arguments
					[tmpThisSymb]			//symbol representing this argument
				);
				//add argument to the function
				funcDefObj.addArg("this", t, c);
			}
		} else {
			//make sure that function with the given name has not be defined in a global scope
			if( funcName in this._globFuncs ){
				this.error("function " + funcName + " is re-declared in the global scope");
			}
			//this function is going to be declared inside global scope
			this._globFuncs[funcName] = funcDefObj;
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
		//add argument to the array _args in functinoid object
		funcDefObj._args.push({
			name: tmpName,		//argument name
			type: tmpType,		//argument type
			cmd: pop_cmd_curArg	//reference to the POP command
		});
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
	//ES 2016-08-26 (b_code_error_handling): record line index at the start of code
	var tmpCurLineIdx = this._curLineIdx;
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
		//before connecting two blocks, make sure that they are different to avoid cyclic connection
		if( tmpCurBlk != tmpFuncBodyBlk ){
			//ES 2016-01-20: make argument block fall into this new block
			block.connectBlocks(
				tmpCurBlk,
				tmpFuncBodyBlk,
				B2B.FALL
			);
		}
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
			tmpCurLineIdx,		//current line index
			curTkIdx,			//token index on the current line
			curTkIdx,			//token that follows first '{'
			this._curTokenIdx,	//token that corresponds '}'
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
//	(Array<{id: TEXT, type: TYPE}>) => array of hashmaps, where each hashmap represents
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
					//ES 2016-08-20 (b_code_error_handling): change error message to specify
					//	absence of ending paranthesis
					this.error("pars.27 - expecting '" + end.matcher + "' in function argument list");
				}
				return [];
			}	//end if it is 0th element
		}	//end if type parsing failed
		//ES 2016-08-19 (b_code_error_handling): get type from result set
		var tmpArgType = typeIdRes_type.get(RES_ENT_TYPE.TYPE, false);
		//try to parse identifier
		var typeIdRes_id = this.process__identifier();
		//ES 2016-08-19 (b_code_error_handling): check if type is VOID
		if( tmpArgType._type == OBJ_TYPE.VOID ){
			//error: cannot instantiate void type
			this.error("pars.24 - cannot instantiate VOID type for function argument " + typeIdRes_id);
		}
		//ES 2016-08-20 (b_code_error_handling): if type is not legal
		if( tmpArgType.isTypeLegal() == false ){
			//error -- unkwon type in function argument list
			this.error("pars.26 - unknown type " + tmpArgType._name + " in function argument " + typeIdRes_id);
		}
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
			//ES 2016-08-19 (b_code_error_handling): refactor code - replace statement with var
			'type': tmpArgType
		});
		//increment element counter
		i++;
	}	//end loop thru type-identifier pair list
	//check that the next token matches END
	if( this.isCurrentToken(end) == false ){
		//if user code bug, should be errored
		if( doErrorOnFailure ){
			//ES 2016-08-20 (b_code_error_handling): change error message to specify
			//	absence of ending paranthesis
			this.error("pars.27 - expecting '" + end.matcher + "' in function argument list");
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
parser.prototype.process__statement = function(){
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
				//ES 2016-08-26 (b_code_error_handling): adjust line number to point to the
				//	previous line, where error actually took place
				this.prev();
				//then, this is a bug in user code, since ';' is not followed
				//by a statement (see semantic notes for this function)
				//ES 2016-08-26 (b_code_error_handling): no semicolon at the ending statement
				//	of any scope
				this.error("pars.70 - remove ';' at the last statement of this scope");
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
		//check if the next token is '.'
		if( this.isCurrentToken(TOKEN_TYPE.PERIOD) ){
			//found end of program, so break out of loop
			break;
		} else if( this.isCurrentToken(TOKEN_TYPE.SEMICOLON) ){
			//consume this token (skip to the next token)
			this.next();
		}
		//reset command library to avoid cases when NULL command that initializes fields
		//	of one type, also gets to initialize fields from another type, since it is
		//	found to be a similar NULL command.
		command.resetCommandLib();
	} while(true);	//end loop to parse program

	//Phase # 1B -- loop thru types that were defined in the phase # 1A and complete
	//code for all fundamental/required functions (such as constructors, comparison
	//operator, toString method, etc...)
	
	//loop thru types
	for( var tmpCurIterName in type.__library ){
		//set reference to type
		var tmpCurIterType = type.__library[tmpCurIterName];
		//check if iterated type is an object
		if( typeof tmpCurIterType == "object" 

			//also make sure it is not a VOID type (it does not need any methods)
			&& tmpCurIterType._type.value != OBJ_TYPE.VOID.value
		){
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
				//ES 2016-08-01 (b_cmp_test_1): if custom ctor, then create
				//	'this' object via a call to default constructor
				if( tmpCurFuncName == "__constructor__" ){
					//get function reference to default CTOR
					var tmpDefCtorFunc = tmpCurIterType._methods["__create__"];
					//get "this" symbol
					var tmpThisDefCtorSymb = tmpCurIterType._scope.findSymbol("this");
					//check if "this" was not found
					if( tmpThisDefCtorSymb == null ){
						this.error("438572985748745");
					}
					//add THIS to __constructor__'s function scope
					tmpCurFunc._scope.addSymbol(tmpThisDefCtorSymb);
					//create call to default CTOR
					var callToDefCtorCmd = 
						tmpCurFunc._scope._start.createCommand(
							COMMAND_TYPE.CALL,	//call command type
							[tmpDefCtorFunc],	//reference to invoked functinoid
							[tmpThisDefCtorSymb]
						);
				}	//ES 2016-08-01 (b_cmp_test_1): end if custom ctor
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
										//ES 2016-01-22 (issue 3, b_bug_fix_for_templates): field and
										//	its symbol should already exist. What we need to do, is
										//	create command that initializes this field
										//tmpCurIterType.createField(
										//	//field name
										//	tmpTypeField,
										//	//field type
										//	tmpCurIterType._fields[tmpTypeField].type,
										//	//constructor's first block
										//	tmpCurFunc._scope._current
										//);
										//get symbol for this command
										var tmpFieldSymb = tmpCurIterType._scope._symbols[tmpTypeField];
										//create command that init this field
										var tmpFieldCmd = type.getInitCmdForGivenType(
											//field type
											tmpCurIterType._fields[tmpTypeField].type,
											//constructor's first block
											tmpCurFunc._scope._current,
											//symbol for this field
											tmpFieldSymb
										);
										//set field's command
										tmpCurIterType._fields[tmpTypeField].cmd = tmpFieldCmd;
									}	//end if field is an object
								}	//end loop thru fields
								break;
							//custom constructor
							case FUNCTION_TYPE.CUSTOM_CTOR.value:
								//do nothing
							//all other fundamental function types
							default:
								//create external call to complete fundamental function
								var extCmd = tmpCurFunc._scope._current.createCommand(
									//call to external (JS) function
									COMMAND_TYPE.EXTERNAL,
									//process(FUNCTION_TYPE_NAME, TYPE_NAME)
									[value.createValue("process(" + tmpCurFunc._func_type.name + ";" + tmpCurIterType._name + ")")],
									//no associated symbols
									[]
								);
								//if this functinoid returns anything but void
								if( tmpCurFunc._return_type.isEqual(type.__library["void"]) == false ) {
									//create RETURN command that returns produced value by EXTERNAL command
									tmpCurFunc._scope._current.createCommand(
										//RETURN command
										COMMAND_TYPE.RETURN,
										//result of external command, created above
										[extCmd],
										//no associated symbols
										[]
									);
								}	//end if functinoid returns anything but void
								break;
						}	//end case on function type
					}	//end if function is not custom and has no task
				}	//end if iterated method is an object
			}	//end loop thru methods
		}	//end if iterated type is an object
		//reset command library to avoid cases when NULL command that initializes fields
		//	of one type, also gets to initialize fields from another type, since it is
		//	found to be a similar NULL command.
		command.resetCommandLib();
	}	//end loop thru defined types

	//ES 2016-08-20 (b_code_error_handling): create associative array for problematic arrays
	//	key: type name
	//	val: type reference
	var tmpEmptyTypes = {};

	//ES 2016-08-20 (b_code_error_handling): create associative array for template types
	//	key: type name
	//	val: NULL
	var tmpTmplTypes = {};

	//ES 2016-08-20 (b_code_error_handling): loop thru types
	for( var tmpCurTypeName in type.__library ){
		//get type object
		var tmpCurType = type.__library[tmpCurTypeName];
		//make sure that type is an object
		if( typeof tmpCurType != "object" ){
			//skip
			continue;
		}
		//if this type is custom
		if( tmpCurType._type == OBJ_TYPE.CUSTOM ){
			//if type has no methods AND has no fields
			if( isEmptyCollection(tmpCurType._methods) == true &&
				isEmptyCollection(tmpCurType._fields) == true ){
				//add type to set of problematic types
				tmpEmptyTypes[tmpCurType._name] = tmpCurType;
			//else, type is not empty AND it has templates
			} else if( tmpCurType._templateNameArray.length > 0 ){
				//loop thru templates
				for( var k = 0; k < tmpCurType._templateNameArray.length; k++ ){
					//add template type name to the set
					tmpTmplTypes[tmpCurType._templateNameArray[k].name] = null;
				}	//end loop thru templates
			}	//end if type has no methods and no fields
		}	//end if type is custom
	}	//ES 2016-08-20 (b_code_error_handling): end loop thru types

	//ES 2016-08-20 (b_code_error_handling): loop thru problematic types, if any
	for( var tmpCurEmptyTypeName in tmpEmptyTypes ){
		//get type object
		var tmpCurEmptyType = tmpEmptyTypes[tmpCurEmptyTypeName];
		//ensure that iterated type is an object
		if( typeof tmpCurEmptyType != "object" ){
			//skip
			continue;
		}
		//if this type name exists in template type associative array
		if( tmpCurEmptyTypeName in tmpTmplTypes ){
			//assert that iterated type is used as template specifier
			tmpCurEmptyType._isTmplSpecifier = true;
		} else {
			//error -- undeclared template specifier
			this.error("pars.47 - undeclared template specifier " + tmpCurEmptyTypeName);
		}
	}	//ES 2016-08-20 (b_code_error_handling): end loop thru problematic types

	//Phase # 2 -- process function code snippets

	//init index for looping thru tasks and process
	var curTaskIdx = 0;
	//loop thru tasks and process each one of them
	for( ; curTaskIdx < this._taskQueue.length; curTaskIdx++ ){
		//ES 2016-08-20 (b_code_error_handling): get task object
		var tmpTaskObj = this._taskQueue[curTaskIdx];
		//load currently iterated task into parser
		//ES 2016-08-20 (b_code_error_handling): refactor, to avoid repeating access to task object
		this.loadTask(tmpTaskObj);
		//ES 2016-08-02 (Issue 5, b_cmp_test_1): get first block in the function scope that
		//	stores POP commands for function arguments
		//ES 2016-08-20 (b_code_error_handling): refactor, to avoid repeating access to task object
		var tmpFuncArgBlk = tmpTaskObj.scp._start;
		//ES 2016-08-02 (Issue 5, b_cmp_test_1): loop thru block commands
		for( tmpPopCmdIdx in tmpFuncArgBlk._cmds ){
			//get current command
			var tmpPopCmd = tmpFuncArgBlk._cmds[tmpPopCmdIdx];
			//make sure that it is not a NOP command
			if( tmpPopCmd._type == COMMAND_TYPE.NOP ){
				//quit loop -- there are no more commands to process
				break;
			}
			//get symbol associated with POP command (it must be exactly one symbol per POP command)
			var tmpPopSymb = tmpPopCmd._defChain[tmpPopCmd._defOrder[0]];
			//remove POP command from symbol's definition chain
			tmpPopSymb.delFromDefChain(tmpPopCmd);
			//insert POP command as the last entry in the definition chain
			tmpPopSymb.addToDefChain(tmpPopCmd);
		}	//ES 2016-08-02 (Issue 5, b_cmp_test_1): end loop thru block commands
		//execute statements for this code snippet
		this.process__sequenceOfStatements();
		//ES 2016-08-20 (b_code_error_handling): if it is a function
		if( tmpTaskObj.scp._funcDecl != null ){
			//if needs to return but does not have return stmt
			if(
				//if needs to return, i.e. return type is not VOID
				tmpTaskObj.scp._funcDecl._return_type._type != OBJ_TYPE.VOID &&
				//if has no return commands defined in it 
				tmpTaskObj.scp._funcDecl._return_cmds.length == 0
			){
				//error -- function needs return statement
				this.error("pars.31 : function " + tmpTaskObj.scp._funcDecl._name + 
							" needs at least one return statement");
			}	//end if needs at least one return stmt
			//init flag -- is there return inside function scope
			var tmpIsRetInFuncScp = false;
			//loop thru return statements
			for( var tmpRetCmdIndex in tmpTaskObj.scp._funcDecl._return_cmds ){
				//get command
				var tmpRetCmd = tmpTaskObj.scp._funcDecl._return_cmds[tmpRetCmdIndex];
				//if return command is inside function scope
				if( tmpRetCmd._blk._owner._id == tmpTaskObj.scp._id ){
					//set flag to true
					tmpIsRetInFuncScp = true;
				}	//end if return command is inside function scope
			}	//end loop thru return statements
			//check if there is no return inside function scope
			/* ES 2017-02-12 (soko): removed this check for now
			if( tmpIsRetInFuncScp == false
				//ES 2016-08-26 (b_log_cond_test): return type is not void
				&& tmpTaskObj.scp._funcDecl._return_type._type != OBJ_TYPE.VOID
			){
				//error -- not all control paths return
				this.error("pars.31 - not all control paths return");
			}
			ES 2017-02-12 (soko): end removed code for now */
		}	//ES 2016-08-20 (b_code_error_handling): end if it is a function
		//reset command library to avoid cases when NULL command that initializes fields
		//	of one type, also gets to initialize fields from another type, since it is
		//	found to be a similar NULL command.
		command.resetCommandLib();
	}	//end loop thru tasks
	//ES 2016-08-30 (b_log_cond_test): loop thru collection of LEFT and RIGHT block ids
	//	that link to PHI blocks in CFG. This collection assists interpreter in determining
	//	which argument of PHI command to use, depending on the block from which it reached
	//	PHI block. Thus, we do not have to understand inside interpreter wether we are
	//	dealing with WHILE loop, FOREACH loop, IF-THEN-ELSE statement, or LOGICAL-TREE.
	//	We already have an answer, which is stored inside this collection.
	for( tmpPhiBlkId in this._phiArgsToBlks ){
		//get data structure that stores LEFT and RIGHT associative array of block ids
		var tmpLeftRightDt = this._phiArgsToBlks[tmpPhiBlkId];
		//loop thru this data structure
		for( tmpFieldName in tmpLeftRightDt ){
			//get object for this field name
			var tmpArrBlkIds = tmpLeftRightDt[tmpFieldName];
			//make sure that we have retrieved object (associative array for LEFT/RIGHT block ids)
			if( typeof tmpArrBlkIds == "object" ){
				//declare array of blocks that will be removed from this associative array
				//	because these blocks do not contain PHI commands (empty PHI blocks)
				var tmpEmptyPhiBlks = [];
				//for each block in this associative array
				for( tmpLinkBlkIdToPhiBlk in tmpArrBlkIds ){
					//get block for this block id
					var tmpBlkObj = block.__library[tmpLinkBlkIdToPhiBlk];
					//if this block is empty OR first command of this block is not PHI
					if( tmpBlkObj._cmds.length == 0 || 
						tmpBlkObj._cmds[0]._type != COMMAND_TYPE.PHI ){
						//add this block to remove array
						tmpEmptyPhiBlks.push(tmpLinkBlkIdToPhiBlk);
					}	//end if this block is empty OR does not start with PHI command
				}	//end loop thru each block in associative array
				//loop thru array of empty block ids
				for( tmpEmptyBlkId in tmpEmptyPhiBlks ){
					//remove from the LEFT/RIGHT associative array
					delete tmpArrBlkIds[tmpEmptyBlkId];
				}	//end loop thru array of empty block ids
			}	//end if retrieved object (associative array for LEFT/RIGHT block ids)
		}	//end loop thru data structure that stores LEFT and RIGHT array of block ids
	}	//ES 2016-08-30 (b_log_cond_test): end loop thru PHI blocks' data structures
	//ES 2016-08-16 (b_cmp_test_1): if there is main function
	if( "__main__" in this._globFuncs ){
		//get all blocks
		var tmpMainLastBlk = this._globFuncs["__main__"]._scope._blks;
		//make sure that set of blocks is not empty
		if( isEmptyCollection(tmpMainLastBlk) == false ){
			//extract current block
			tmpMainLastBlk = this._globFuncs["__main__"]._scope._current;
			//add EXIT command to this block
			tmpMainLastBlk.createCommand(
				COMMAND_TYPE.EXIT,		//exit program
				[],						//no command arguments
				[]						//no associated symbols
			);
		}	//end if scope is not empty
	}	//ES 2016-08-16 (b_cmp_test_1): end if there is main function
};	//end program
