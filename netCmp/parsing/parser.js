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
	//create result set
	var ty_resSet = [];
	//add type to the result set
	var tmpTy = {};
	tmpTy[RES_ENT_TYPE.TYPE.value] = tyObj;
	ty_resSet.push(tmpTy);
	//return result set
	return new Result(true, ty_resSet);
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
	//compose result set
	var objDef_resSet = [];
	//add type to the result set
	var tmpTy = {};
	tmpTy[RES_ENT_TYPE.TYPE.value] = objDef_newTypeInst;
	objDef_resSet.push(tmpTy);
	//return result set
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
	//create result set
	var tmpResSet = [];
	//include function reference to the result set
	var tmpFunc = {};
	tmpFunc[RES_ENT_TYPE.FUNCTION.value] = funcDefObj;
	tmpResSet.push(tmpFunc);
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
			if( !('this' in tmpCurIterType._scope._symbols) ){
				//fail
				this.error("type " + tmpCurIterType._name + " has not been defined, but is used");
			}	//end if type has not been defined by user
			//loop thru methods of this type
			for( var tmpCurFunc in tmpCurIterType._methods ){
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
									if( typeof tmpTypeField == "object" ){
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
									["process(" + tmpCurFunc._func_type.name + "," + tmpCurIterType._id + ")"],
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
		this.seqStmts();
	}	//end loop thru tasks
};	//end program