/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	available set of tokens
	Used by:	Token, Lexer
	Dependencies:	(none)
**/

var TOKEN_TYPE = {
	//types and type keywords
	INTTYPE: {value:1, name:"ty_Int", matcher:"int"},
	STRINGTYPE: {value:2, name:"ty_String", matcher:"string"},
	BOOLTYPE: {value:3, name:"ty_Boolean", matcher:"bool"},
	ARRAYTYPE: {value:4, name:"ty_Array", matcher:"array"},
	BTREETYPE: {value:5, name:"ty_Tree", matcher:"tree"},
	VOIDTYPE: {value:6, name:"ty_Void", matcher:"void"},
	FLOATTYPE: {value:7, name:"ty_Float", matcher:"float"},
	FUNC: {value:8, name:"ty_Function", matcher:"function"},
	OBJECT: {value:9, name:"ty_Object", matcher:"object"},
	//special type values
	TRUE: {value:10, name:"val_True", matcher:"true"},
	FALSE: {value:11, name:"val_False", matcher:"false"},
	NUMBER: {value:12, name:"val_Integer", matcher:""},	//requires special handling
	TEXT: {value:13, name:"val_Text", matcher:""},		//requires special handling
	ARRAY_EMPTY: {value:14, name:"val_EmptyArray", matcher:"[]"},
	
	//ES 2015-12-12 (Issue 2): remove empty hashmap to make parsing of function
	//and type definitions easier.
	//HASH_EMPTY: {value: 15, name: "val_EmptyHash", matcher:"{}"},
	
	FLOAT: {value:16, name:"val_Float", matcher:""},	//requires special handling
	//special character sequence
	NEWLINE: {value:17, name:"scs_NewLine", matcher:"\r\n"},
	DOUBLEQUOTE: {value:18, name:"scs_DoubleQuote", matcher:"\""},
	SINGLEQUOTE: {value:19, name:"scs_SingleQuote", matcher:"\'"},
	//keywords
	VAR: {value:20, name:"cmd_Var", matcher:"var"},	//declare variable
	LET: {value:21, name:"cmd_Let", matcher:"let"},	//assign existing variable
	IF: {value:22, name:"cmd_If", matcher:"if"},
	ELSE: {value:23, name:"cmd_Else", matcher:"else"},
	WHILE: {value:24, name:"cmd_While", matcher:"while"},
	RETURN: {value:25, name:"cmd_Return", matcher:"return"},
	BREAK: {value:26, name:"cmd_Break", matcher:"break"},
	CONTINUE: {value:27, name:"cmd_Continue", matcher:"continue"},
	CALL: {value:28, name:"cmd_Call", matcher:"call"},
	FOREACH: {value:29, name:"cmd_ForEach", matcher:"foreach"},
	//comparison operators
	LESS: {value:30, name:"op_LT", matcher:"<"},
	LESSEQ: {value:31, name:"op_LEQ", matcher:"=<"},
	GREATER: {value:32, name:"op_GT", matcher:">"},
	GREATEREQ: {value:33, name:"op_GEQ", matcher:"=>"},
	EQ: {value:34, name:"op_EQ", matcher:"=="},
	NEQ: {value:35, name:"op_NEQ", matcher:"<>"},
	//logical operators
	AND: {value:36, name:"op_And", matcher:"&"},
	OR: {value:37, name:"op_Or", matcher:"|"},
	//arithmetic operators
	PLUS: {value:38, name:"op_Add", matcher:"+"},
	MINUS: {value:39, name:"op_Sub", matcher:"-"},
	DIVIDE: {value:40, name:"op_Div", matcher:"/"},
	MULTIPLY: {value:41, name:"op_Mul", matcher:"*"},
	MOD: {value:42, name:"op_Mod", matcher:"mod"},
	//syntax
	ARRAY_OPEN: {value:43, name:"sy_ArrOpen", matcher:"["},
	ARRAY_CLOSE: {value:44, name:"sy_ArrClose", matcher:"]"},
	PARAN_OPEN: {value:45, name:"sy_ParanOpen", matcher:"("},
	PARAN_CLOSE: {value:46, name:"sy_ParanClose", matcher:")"},
	CODE_OPEN: {value:47, name:"sy_CodeOpen", matcher:"{"},
	CODE_CLOSE: {value:48, name:"sy_CodeClose", matcher:"}"},
	COMMA: {value:49, name:"sy_Comma", matcher:","},
	SEMICOLON: {value:50, name:"sy_SimeColon", matcher:";"},
	EQUAL: {value:51, name:"sy_Set", matcher:"="},
	COLON: {value:52, name:"sy_Colon", matcher:":"},
	PERIOD: {value:53, name:"sy_Dot", matcher:"."},
	TMPL_OPEN: {value: 54, name:"sy_TmplOpen", matcher: "<<"},
	TMPL_CLOSE: {value: 55, name:"sy_TmplClose", matcher: ">>"},
	//special tokens
	COMMENTSTART: {value:60, name:"st_CommentStart", matcher:"/*"},
	COMMENTEND: {value:61, name:"st_CommentEnd", matcher:"*/"},
	COMMENT: {value:61, name:"st_Comment", matcher:"//"},
	ERROR: {value:63, name:"st_Error", matcher:"error"}
};