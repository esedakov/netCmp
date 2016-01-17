/**
	Developer:	Eduard Sedakov
	Date:		2016-01-15
	Description:	pre-process lexed code to identify all TTUs (Templated
					Type Usage = TTU) so that parser could create as many 
					templated types as there are use cases for such types.
					Example, if code has type 'foo' that takes two templates:
					code exmaple: 'object <_Ty,_Ky> foo { ... }'
					and inside code there are two various usage cases of 'foo'
					such as these: 'foo<int, real>' and 'foo<text, text>'
					then we would store two TTUs for type 'foo':
					1. <int, real>
					2. <text, text>
					and during parsing we would create two separate instances
					of type 'foo' for each mentioned TTU.
	Used by:		{parser}
	Dependencies:	{parser}, {lexer}
**/

//class pre-processor that is needed to find and store various TTUs
//input(s):
//	tokens: (Array<Token>) array of tokens generated by the lexer
//output(s):
//	(HashMap< string, Array<Array<text>> >) =>
//		hashmap's key (string) represents a name of templated type, e.g. 'foo'
//		hashmap's value stores two arrays:
//			outer array stores actual TTUs, while inner elements of each TTU
//Example for above: { 'foo<int,real>' : ['int', 'real'], 'foo<text,text>' : ['text', 'text'] }
function preprocessor(tokens){
	//initialize hashmap that would store types and associated array of TTUs
	this._typeTTUs = {};
	//store array of tokens
	this._tokens = tokens;
	//loop thru tokens
	for( var i = 0; i < tokens.length; i++ ){
		//determine if current token is an open angle bracket (i.e. '<<')
		if( tokens[i].type == TOKEN_TYPE.TMPL_OPEN && i > 0 ){
			//what we need is an identifier before angle bracket
			//	which is the name of the type
			var tmpTypeToken = tokens[i-1];
			//make sure that type token is a TEXT
			if( tmpTypeToken.type != TOKEN_TYPE.TEXT ){
				//skip, this is not a template definition => error in user code
				continue;
			}
			//process template list
			var tmpRet = this.processTemplateList(i + 1);
			//reset index
			i = tmpRet.counter;
			//determine type name
			var tmpTypeName = tmpTypeToken.text + "<" + tmpTypeToken.text + ">";
			//check if type has been added to the return variable
			if( tmpTypeName in this._typeTTUs ){
				//skip, this entry already exists
				continue;
			}
			//add entry for the TTU
			ret[tmpTypeName].push(tmpRet.tmpl);
		}	//end if current token is '<<'
	}	//end loop thru tokens
	return this._typeTTUs;
};

//process template list, starting from the token passed '<<'
//input(s):
//	idx: (integer) => current index which points at the start of token 
//			list (i.e. after token '<<')
//output(s):
//	HashMap:
//		counter: (integer) => current index
//		txt: (text) text representation of types even templated types.
//			If we process foo<< goo<<int>>, real >> in this function,
//			then it should return following array: ['goo<int>', 'real']
//			Note: use single '<' and '>')
//		tmpl: (Array<text>) => array of strings representing templated types
preprocessor.processTemplateList = function(idx){
	//initialize array of type specifiers that are returned by this function
	var typeSpecArr = [];
	//initialize variable to keep concatenated string for all encountered tokens
	var txtRep = "";
	//temporary variable to keep track of last type specifier
	var tmpLastTypeId = null;
	//loop thru tokens starting from token pointed by index 'idx'
	//until the closing bracket for template list
	while( this._tokens[idx].type != TOKEN_TYPE.TMPL_CLOSE ){
		//get current token type
		var tmpTokenType = this._tokens[idx].type;
		//if find a start of template list
		if( tmpTokenType == TOKEN_TYPE.TMPL_OPEN ){
			//process template by calling recursively this function
			var tmpRes = this.processTemplateList(idx + 1);
			//remove type specifier from array
			tmpLastTypeId = typeSpecArr.pop();
			//add its result to the array of text specifiers
			typeSpecArr.push(tmpLastTypeId + "<" + tmpRes.txt + ">");
			//reset index
			idx = tmpRes.counter;
			//addup returned text representation of inner expression to this one
			txtRep += "<" + tmpRes.txt + ">";
			//check if this type has not been added to the set
			if( !(txtRep in this._typeTTUs) ){
				//add type to the set
				this._typeTTUs[txtRep] = tmpRes.tmpl;
			}
		//if this token is a text specifier for type
		} else if( tmpTokenType == TOKEN_TYPE.TEXT ) {
			//assing type specifier
			tmpLastTypeId = this._tokens[idx].text;
			//add type specifier to the text representation
			txtRep += tmpLastTypeId;
			//add new type specifier to the array
			typeSpecArr.push(tmpLastTypeId);
		//if this is a template type separator (i.e. ',')
		} else if( tmpTokenType == TOKEN_TYPE.COMMA ){
			//add comma to the text representation
			txtRep += ",";
			//reset last type specifier
			tmpLastTypeId = "";
		}	//end if find a start of template list
		//go to the next token
		idx++;
	}	//end loop thru tokens
	//return collection of counter and array of type specifiers
	return {counter: idx, tmpl: typeSpecArr, txt: txtRep};
};	//end function 'processTemplateList' to process template list