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
		this.text = text;			//assign a text to split into tokens
		//is current token processed
		var isCuTokenProcessed = true;
		//loop thru input characters
		while( this.currentIndex < text.length ) {
			//initialize flag to determine whether character is processed
			isCuTokenProcessed = false;
			//current token text is formed by [startIndexOfToken, currentIndex] (inclusively)
			currentText = text.substring(this.startIndexOfToken, this.currentIndex + 1);
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
			}
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
		//return list of tokens
		return this.listOfTokens;
};
