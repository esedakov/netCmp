/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	smallest unit that is used to describe incoming/input compiling text
	Used by:	Lexer
	Dependencies:	type__token
**/

//determine type of the token based on its textual representation
//input(s):
//		text => text that represents token
//output(s): (Token) token "class"
function Token(text) {
	//initialize attributes
	var type = TOKEN_TYPE.ERROR;	//error token type
	//check if the given text is an empty string
	if( text.length == 0 )
	{
		//if so, then return error immediately
		return {type: type, text: text};
	}
	//determine type
	switch(text)
	{
	case "int":
		type = TOKEN_TYPE.INTTYPE;
		break;
	case "float":
		type = TOKEN_TYPE.FLOATTYPE;
		break;
	case "string":
		type = TOKEN_TYPE.STRINGTYPE;
		break;
	case "bool":
		type = TOKEN_TYPE.BOOLTYPE;
		break;
	case "array":
		type = TOKEN_TYPE.ARRAYTYPE;
		break;
	case "hash":
		type = TOKEN_TYPE.HASHMAPTYPE;
		break;
	case "void":
		type = TOKEN_TYPE.VOIDTYPE;
		break;
	case "true":
		type = TOKEN_TYPE.TRUE;
		break;
	case "false":
		type = TOKEN_TYPE.FALSE;
		break;
	case "function":
		type = TOKEN_TYPE.FUNC;
		break;
	case "object":
		type = TOKEN_TYPE.OBJECT;
		break;
	case "\n":
	case "\r\n":
		type = TOKEN_TYPE.NEWLINE;
		break;
	case "\"":
		type = TOKEN_TYPE.DOUBLEQUOTE;
		break;
	case "\'":
		type = TOKEN_TYPE.SINGLEQUOTE;
		break;
	case "var":
		type = TOKEN_TYPE.VAR;
		break;
	case "let":
		type = TOKEN_TYPE.LET;
		break;
	case "if":
		type = TOKEN_TYPE.IF;
		break;
	case "else":
		type = TOKEN_TYPE.ELSE;
		break;
	case "while":
		type = TOKEN_TYPE.WHILE;
		break;
	case "foreach":
		type = TOKEN_TYPE.FOR_EACH;
		break;
	case "return":
		type = TOKEN_TYPE.RETURN;
		break;
	case "break":
		type = TOKEN_TYPE.BREAK;
		break;
	case "continue":
		type = TOKEN_TYPE.CONTINUE;
		break;
	case ".":
		type = TOKEN_TYPE.PERIOD;
		break;
	case "call":
		type = TOKEN_TYPE.CALL;
		break;
	case "in":
		type = TOKEN_TYPE.IN;
		break;
	case "<":
		type = TOKEN_TYPE.LESS;
		break;
	case "=<":
		type = TOKEN_TYPE.LESSEQ;
		break;
	case ">":
		type = TOKEN_TYPE.GREATER;
		break;
	case "=>":
		type = TOKEN_TYPE.GREATEREQ;
		break;
	case "==":
		type = TOKEN_TYPE.EQ;
		break;
	case "<>":
		type = TOKEN_TYPE.NEQ;
		break;
	case "&":
		type = TOKEN_TYPE.AND;
		break;
	case "|":
		type = TOKEN_TYPE.OR;
		break;
	case "mod":
		type = TOKEN_TYPE.MOD;
		break;
	case "+":
		type = TOKEN_TYPE.PLUS;
		break;
	case "-":
		type = TOKEN_TYPE.MINUS;
		break;
	case "/":
		type = TOKEN_TYPE.DIVIDE;
		break;
	case "*":
		type = TOKEN_TYPE.MULTIPLY;
		break;
	case "[":
		type = TOKEN_TYPE.ARRAY_OPEN;
		break;
	case "]":
		type = TOKEN_TYPE.ARRAY_CLOSE;
		break;
	case "(":
		type = TOKEN_TYPE.PARAN_OPEN;
		break;
	case ")":
		type = TOKEN_TYPE.PARAN_CLOSE;
		break;
	case "{":
		type = TOKEN_TYPE.CODE_OPEN;
		break;
	case "}":
		type = TOKEN_TYPE.CODE_CLOSE;
		break;
	case ",":
		type = TOKEN_TYPE.COMMA;
		break;
	case ";":
		type = TOKEN_TYPE.SEMICOLON;
		break;
	case "=":
		type = TOKEN_TYPE.EQUAL;
		break;
	case ":":
		type = TOKEN_TYPE.COLON;
		break;
	case "/*":
		type = TOKEN_TYPE.COMMENTSTART;
		break;
	case "*/":
		type = TOKEN_TYPE.COMMENTEND;
		break;
	case "//":
		type = TOKEN_TYPE.COMMENT;
		break;
	default:
		//init flags
		var i = 0, isIntNumber = true, isFloatNumber = false, isError = false;
		//loop thru character set
		for(; i < text.length; i++)
		{
			//if this character is acceptable for variable name, i.e. upper or
			//lower case letter or underscore
			if( (text[i] >= 'a' && text[i] <= 'z') || (text[i] >= 'A' && text[i] <= 'Z') || text[i] == '_' )
			{
				//check if we determined this token to be a floating number
				if( isFloatNumber ){
					//then, this token is neither number nor text used
					//for variable names
					isError = true;
				}
				//set that this token is not a number
				isIntNumber = false;
				isFloatNumber = false;
			}
			//check if this is a floating point number
			else if(text[i] == '.')
			{
				//if this token already been determined as number
				if( isIntNumber == true )
				{
					//clarify that this is a floating point number
					isIntNumber = false;
					isFloatNumber = true;
				}
				//if this token already been determined as a floating point number
				else if( isFloatNumber == true )
				{
					//then we encountering '.' for the second time, which
					//is the error
					isError = true;
					isIntNumber = false;
					isFloatNumber = false;
				}
				//if this is not a number, then trigger error
				else {
					isError = true;
				}
			}
			//check if character is not a digit
			else if( !(text[i] >= '0' && text[i] <= '9') )
			{
				//then, we know that current character is neither letter, nor
				//underscore, nor digit, nor dot (.) => and we do not accept
				//any other characters among types integers and text
				isError = true;
				isIntNumber = false;
				isFloatNumber = false;
			}
			//if there been a error, then quit
			if(isError){
				break;
			}
		}	//end loop thru character set
		//if this token is integer
		if( isIntNumber ) {
			//assert type to be integral number
			type = TOKEN_TYPE.NUMBER;
		}
		//if this token is floating point
		else if( isFloatNumber ) {
			//assert type to be floating point number
			type = TOKEN_TYPE.FLOAT;
		}
		//if there is no error
		else if( isError == false ) {
			//assert type to be remaining type - text (not integer and not float)
			type = TOKEN_TYPE.TEXT;
		//otherwise, it is a error
		} else {
			type = TOKEN_TYPE.ERROR;
		}
		break;
	}	//end switch to determine type
	//return type specs
	return {type: type, text: text};
}
