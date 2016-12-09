	//process tokens for the specified line and output resulting HTML
	function processLine(lineNum, doAdjustTabInfo){
		//remove whitespaces from beginning and end string and split text word-by-word 
		var words = g_code[lineNum]	//$(".nc-editor-current-line")
			.replace(/[\s]+/g, " ")
			.trim()
			//TODO: add other symbols, such as arithmetic symbols
			//	but keep in mind that '/*' can be interpreted as '/' and '*', separately
			.split(/(,|=|:|;|\(|\)|\{|\}|\s|\<|\>|\/\/|\/\*|\*\/)/g);
		//create container for processed text
		var res = "";
		//count number of open code brackets and decrease number by each closed code bracket
		var numOpenCodeBrackets = 0;
		//flag: start of new line
		var isStartNewLine = false;
		//counter: count letters in the processed line
		var tmpLetterCounter = 0;
		//for each resulted word
		$.each(words, function(index, value){
			//ignore empty string and white space
			if( value == "" ){ //|| value == " " ){
				return;
			}
			//flag: is this a current word
			var tmpIsCurWord =	tmpLetterCounter <= (g_curLetterNum - 1) 
								&& (tmpLetterCounter + value.length) >= g_curLetterNum;
			//store current word with each character encapsulated in its SPAN
			var tmpC = "";
			//split string into array of characters
			var tmpValCharArr = value.split("");
			//is it numeric?
			var isNumeric = $.isNumeric(tmpValCharArr[0]);
			//loop thru character array to encapsulte current character in a separate SPAN
			for( var i = 0; i < tmpValCharArr.length; i++ ){
				//start SPAN
				tmpC += "<span class='";
				//check if this is a current word AND current letter
				if( tmpIsCurWord && (tmpLetterCounter + i) == (g_curLetterNum - 1) ){
					//add class for the current letter
					tmpC += "nc-current-letter ";
				}
				//end SPAN
				tmpC += "nc-processed-letter'>" + tmpValCharArr[i] + "</span>";
			}	//end loop thru character array
			//start the SPAN
			res += "<span class='";
			//if this is current word
			if( tmpIsCurWord ) {
				//add class for the current word
				res += "nc-current-word ";
			}				case " ":
				case " ":
					res += "nc-white-space'>" + tmpC + "</span>";
					break;
				case "{":
					numOpenCodeBrackets++;
					//@intended to fall thru
				case "}":
					if( value == '}' ){
						numOpenCodeBrackets--;
					}
					//@intended to fall thru
				case ":":
				case ",":
				case "+":
				case "-":
				case "*":
				case "/":
				case "{":
				case "}":
				case ";":
				case "(":
				case ")":
				case "[":
				case "]":
				case ":":
				case "=":
				case "<":
				case ">":
					res += "nc-ignore nc-processed-word'>" + tmpC + "</span>";
					//if token appears at the end of line
					if( value == "{" || value == "}" || value == ";" ){
						////add new line
						//res += "<br />";
						//assert that next processed token will be on the new line
						isStartNewLine = true;
					}
					break;
				case "/*":
					//set this word to be comment
					res += "nc-comment nc-comment-start'>" + tmpC + "</span>";
					break;
				case "//":
					//set this word to be comment
					res += "nc-comment nc-comment-one-line'>" + tmpC + "</span>";
					break;
				case "*/":
					//set this word to be comment
					res += "nc-comment nc-comment-end'>" + tmpC + "</span>";
					break;
				case "FUNCTION":
				case "VAR":
				case "IF":
				case "ELSE":
				case "CALL":
				case "WHILE":
				case "LET":
				case "OBJECT":
				case "FOREACH":
				case "RETURN":
				case "MOD":
					res +=  "nc-lang-keyword nc-processed-word'>" + tmpC + "</span>";
					break;
				case "VOID":
				case "INTEGER":
				case "ARRAY":
				case "BOOLEAN":
				case "TEXT":
				case "DRAWING":
				case "REAL":
				case "TREE":
				case "DATETIME":
				case "FILE":
				case "TIMER":
				case "MATH":
				case "CAST":
					res += "nc-type nc-processed-word'>" + tmpC + "</span>";
					break;
				default: