/**
	Developer:	Eduard Sedakov
	Date:		2015-09-28
	Description:	convert incoming compiling text into a collection of tokens and perform
				basic syntax check of this compiled text
	Used by:	Parser
	Dependencies:	token, type__token
**/

//lexer ctor
//input(s): none
//output(s): none
function lexer() {
	//initialize local class variables
	this.listOfTokens = [];		//collection of resulting tokens
	this.currentIndex = 0;		//character index of the currently analyzed token
	this.startIndexOfToken = 0;	//starting character index of the currently analyzed token
	this.modeComment = 0;		//is this token a comment?
	this.prevToken = Token("");	//create error token
	this.lineNumber = 0;		//current line number
	this.offsetWithinLine = 0;	//character offset within current line
	this.text = null;		//text to be processed
};

//error/aborting function
//input(s):
//		errMsg => (string) message that explains reason for aborting
//return: nothing
lexer.prototype.errorReport =
	function(errMsg) {
		throw new Error(
			"error: " + errMsg +
			" at line = " + this.lineNumber +
			" and offset = " + this.offsetWithinLine); 
};

//determine if a passed character belongs to a set of white space characters
//input(s):
//		character => (char) character to be tested
//return: (boolean) true if belongs to such set
lexer.prototype.isWhiteSpaceChar =
	function(character) {
		return character == ' ' ||
			   character == '\t' ||
			   character == '\n' ||
			   character == '\r';
};

//increment to the next non-white-space character
//input(s): none
//return: none
lexer.prototype.incrementToNextCharacter =
	function() {
		//increment to the next character
		this.currentIndex++;
		this.offsetWithinLine++;
		//get new current character
		var currentChar = this.text[this.currentIndex];
		//check if this character is a white space
		var isWhiteSpace = this.isWhiteSpaceChar(currentChar);
		//keep looping while it is a white space
		while( isWhiteSpace )
		{
			//check if it is a first character of new line
			if( currentChar == '\r' )
			{
				//next character must be '\n', so consume it too
				this.currentIndex++;
				this.offsetWithinLine++;
				currentChar = this.text[this.currentIndex];
			}
			//check if it is a second character of new line ('\r\n')
			if( currentChar == '\n' )
			{
				//now, when we just consumed a new line increment current line number
				this.lineNumber++;
				//reset offset to zero
				this.offsetWithinLine = 0;
				//insert new line token
				this.listOfTokens.push(new Token("\r\n"));
			}
			//increment to next character
			this.currentIndex++;
			this.offsetWithinLine++;
			//get the value of this new character
			currentChar = this.text[this.currentIndex];
			isWhiteSpace = this.isWhiteSpaceChar(currentChar);
		}
};

//split text into tokens
//input(s):
//		text => (string) string that needs to split into tokens
//return: (Array<Token>) produce list of tokens for the given text
lexer.prototype.process = 
	function(text) {
		//initialize attributes
		this.listOfTokens = [];			//store list of processed tokens
		this.currentIndex = 0;			//index of currently processed character
		this.startIndexOfToken = 0;		//starting index for the current token
		this.modeComment = 0;			//comment mode
		this.prevToken = Token("");		//previously processed token
		this.lineNumber = 0;			//line number
		this.offsetWithinLine = 0;		//index of the current character within the current line
		this.text = text;				//assign a text to split into tokens
		//ES 2016-08-19 (b_code_error_handling): introduce counters for four types of brackets
		this.cntCurlyBrackets = 0;			//'{'		
		this.cntFuncCallBrackets = 0;		//'('
		this.cntSquareBrackets = 0;			//'['
		this.cntDoubleAngleBrackets = 0;	//'<<'
		//is current token processed
		var isCuTokenProcessed = true;
		//loop thru input characters
		while( this.currentIndex < text.length ) {
			//initialize temporary variable used for determining type of starting quote
			var isSingleQuote = false;
			//initialize flag to determine whether character is processed
			isCuTokenProcessed = false;
			//ES 2016-08-25 (b_code_error_handling): init flag to keep looping until we get
			//	non-white-space token or until an entire code is processed
			var doKeepLoopToGetValidToken = false;
			//ES 2016-08-25 (b_code_error_handling): fix bug: if current text is a space or tab
			//	then keep looping
			do{
				//current token text is formed by [startIndexOfToken, currentIndex] (inclusively)
				currentText = text.substring(this.startIndexOfToken, this.currentIndex + 1);
				//determine if this token is a white-space
				doKeepLoopToGetValidToken = currentText == " " || currentText == "\t";
				//if it is white space
				if( doKeepLoopToGetValidToken ){
					//go to next token
					this.startIndexOfToken++;
					this.currentIndex++;
				}
			} while( doKeepLoopToGetValidToken && this.currentIndex < text.length );
			//ES 2016-08-25 (b_code_error_handling): if reached end of lexed code
			if( this.currentIndex >= text.length ){
				//leave this loop - we have reached the end of lexed code
				break;
			}
			//determine type of the current token
			currentToken = new Token(currentText);
			//if found a start of comment
			if( currentToken.type == TOKEN_TYPE.COMMENTSTART || currentToken.type == TOKEN_TYPE.COMMENT ) {
				//make sure that the comment is not inside another comment
				if( this.modeComment > 0 ) {
					//error is found - double comment start, example: "/*/*"
					this.errorReport("double comment start");
				}
				//assign comment mode: '//' => 1, '/*' => 2
				this.modeComment = (currentToken.type == TOKEN_TYPE.Comment ? 1 : 2);
			}
			//if found end of comment or a newline (for single line comment)
			else if( currentToken.type == TOKEN_TYPE.COMMENTEND || (currentToken.type ==  TOKEN_TYPE.NEWLINE && this.modeComment > 0))
			{
				//make sure that when there is no comment, a comment end does not appear
				if( this.modeComment == 0 )
				{
					//error is found - double comment end, example: "*/*/" or
					//dangling '*/' without start of the comment
					this.errorReport("double comment end");
				}
				//if this character is not a single line comment
				if( this.modeComment == 2 ) {
					//go to next character and if it is a white space then keep
					//looping until a different next character is found
					this.incrementToNextCharacter();
					//reset start of the token index
					this.startIndexOfToken = this.currentIndex;
				}
				//set that current token is processed
				isCuTokenProcessed = true;
				//set comment to be ended
				this.modeComment = 0;
				//go to the next iteration
				continue;
			} else if (( isSingleQuote = (currentToken.type == TOKEN_TYPE.SINGLEQUOTE)) ||
						currentToken.type == TOKEN_TYPE.DOUBLEQUOTE){
				//determine quote symbol
				var quoteSymb = isSingleQuote ? "'" : '"';
				//find ending quote symbol
				var endQuoteIdx = this.text.indexOf(quoteSymb, this.currentIndex + 1);
				//if ending was not found
				if( endQuoteIdx < 0 ){
					//quoted text is not ended properly
					this.errorReport("missing ending quote around string");
				}
				//get text
				var tmpQuotedTxt = this.text.substring(this.currentIndex + 1, endQuoteIdx);
				//add starting quote to token list
				this.listOfTokens.push(new Token(quoteSymb));
				//create error token
				var tmpTxtToken = new Token("");
				//set type of token to be TEXT
				tmpTxtToken.type = TOKEN_TYPE.TEXT;
				//set value of token to be retrieved text
				tmpTxtToken.text = tmpQuotedTxt;
				//add retrieved text token to token list
				this.listOfTokens.push(tmpTxtToken);
				//add ending quote
				this.listOfTokens.push(new Token(quoteSymb));
				//reset currently processed character
				this.currentIndex = endQuoteIdx + 1;
				this.startIndexOfToken = this.currentIndex;
				isCuTokenProcessed = true;
				//go to next iteration
				continue;
			}
			//ES 2016-08-19 (b_code_error_handling): adjust counters for different bracket types
			this.adjustBracketCnts(currentToken.type);
			//if this token is error
			if( currentToken.type == TOKEN_TYPE.ERROR )
			{
				//if both current and previous tokens are erroneous, then
				if( this.prevToken.type == TOKEN_TYPE.ERROR )
				{
					//fail
					this.errorReport("current and previous tokens are errors");
				}
				//if current token is not part of comment
				if( this.modeComment == 0 )
				{
					//otherwise, insert processed token to the result set
					this.listOfTokens.push(this.prevToken);
				}
				//reset start of the token index
				this.startIndexOfToken = this.currentIndex;
				//set that current token is processed
				isCuTokenProcessed = true;
				//go to the next iteration
				continue;
			}
			//update previous token
			this.prevToken = currentToken;
			//go to next character and if it is a white space then keep looping until
			//a different next character is found
			this.incrementToNextCharacter();
		}
		//if there is un-processed token, then
		if( isCuTokenProcessed == false ){
			//if not comment, then
			if( this.modeComment == 0 )
			{
				//if previous token is erroneous, then
				if( this.prevToken.type == TOKEN_TYPE.ERROR ){
					//fail
					this.errorReport("current and previous tokens are errors");
				}
				//otherwise, insert previous token to the result set
				this.listOfTokens.push(this.prevToken);
			}
		}
		//ES 2016-08-19 (b_code_error_handling): check if any bracket counters is not 0
		if( this.cntSquareBrackets + this.cntFuncCallBrackets + this.cntCurlyBrackets + this.cntDoubleAngleBrackets != 0 ){
			//initialize error message
			var tmpErrMsg = "lex.1 - found ";
			//depending on different type of bracket
			if( this.cntSquareBrackets != 0 ){
				tmpErrMsg += this.cntSquareBrackets + " array";
			} else if( this.cntCurlyBrackets != 0 ){
				tmpErrMsg += this.cntCurlyBrackets + " code";
			} else if( this.cntFuncCallBrackets != 0 ){
				tmpErrMsg += this.cntFuncCallBrackets + " function call";
			} else {
				tmpErrMsg += this.cntDoubleAngleBrackets + "template list";
			}
			//complete error message
			tmpErrMsg += " bracket(s) unmatched";
			//set error
			throw new Error(tmpErrMsg);
		}
		//return list of tokens
		return this.listOfTokens;
};

//ES 2016-08-19 (b_code_error_handling): adjust counters for different bracket types
//input(s):
//	t: (TOKEN_TYPE) current token type
//output(s): (none)
lexer.prototype.adjustBracketCnts = function(t){
	//differentiate different bracket types; both opening and closing brackets
	switch(currentToken.type){
		case TOKEN_TYPE.ARRAY_OPEN: 	//[
			this.cntSquareBrackets++;
			break;
		case TOKEN_TYPE.ARRAY_CLOSE: 	//]
			this.cntSquareBrackets--;
			break;
		case TOKEN_TYPE.PARAN_OPEN: 	//(
			this.cntFuncCallBrackets++;
			break;
		case TOKEN_TYPE.PARAN_CLOSE: 	//)
			this.cntFuncCallBrackets--;
			break;
		case TOKEN_TYPE.CODE_OPEN: 		//{
			this.cntCurlyBrackets++;
			break;
		case TOKEN_TYPE.CODE_CLOSE: 	//}
			this.cntCurlyBrackets--;
			break;
		case TOKEN_TYPE.TMPL_OPEN: 		//<<
			this.cntDoubleAngleBrackets++;
			break;
		case TOKEN_TYPE.TMPL_CLOSE: 	//>>
			this.cntDoubleAngleBrackets--;
			break;
	}
};	//ES 2016-08-19 (b_code_error_handling): end method 'adjustBracketCnts'