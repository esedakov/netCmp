<script>
	//update comments
	function updateComments(){
		//remove all comments
		$(".nc-comment").removeClass("nc-comment");
		//for each comment-start
		$(".nc-comment-start").each(function(index, value){
			//get next element
			var tmpNext = $(this).next();
			//loop thru remaining elements till comment-start/end
			while(
				tmpNext.length != 0 &&
				$(tmpNext).hasClass("nc-comment-start") == false &&
				$(tmpNext).hasClass("nc-comment-end") == false
			){
				//if it is not commented yet
				if( $(tmpNext).hasClass("nc-comment") == false ){
					//make it commented
					$(tmpNext).addClass("nc-comment");
				}
				//if there is no next element on this line
				if( $(tmpNext).next().length == 0 ){
					//get line to which this token belongs
					var tmpThisLine = $(tmpNext).closest(".nc-line");
					//try to get next line
					var tmpNextLine = $(tmpThisLine).next();
					//loop thru lines
					while( tmpNextLine.length > 0 ){
						//set next token to be analyzed to first element in new line
						tmpNext = $(tmpNextLine).children().first();
						//if acquired element is not null and not empty
						if( tmpNext != null && tmpNext.length > 0 ){
							//quit loop
							break;
						}
						//else, get next line
						tmpNextLine = $(tmpNextLine).next();
					}	//end loop thru lines
				} else {	//else, there is next element on this line
					//move to next element
					tmpNext = $(tmpNext).next();
				}	//end if there is no next element
			}	//end loop thru remaining elements till comment-start/end
		});	//end foreach comment-start
		//for each comment-one-line
		$(".nc-comment-one-line").each(function(index, value){
			//get next element
			var tmpNext = $(this).next();
			//loop thru remaining elements till end of line
			while( tmpNext.length != 0 ){
				//if it is not commented yet
				if( $(tmpNext).hasClass("nc-comment") == false ){
					//make it commented
					$(tmpNext).addClass("nc-comment");
				}
				//move to next element
				tmpNext = $(tmpNext).next();
			}	//end loop thru remaining elements till end of line
		});	//end foreach comment-one-line
	};	//end function 'updateComments'
	//create new current line
	//	lnNum: (current) line number
	//	returns => former current line
	function createNewCurrentLine(lnNum){
		//get former line
		var tmpFormerLine = $(".nc-editor-current-line");
		//remove class from the current line
		$(tmpFormerLine).removeClass("nc-editor-current-line");
		//check if this line does not have class {{'line_'.lnNum}}
		if( $(".line_" + (lnNum - 1)).length == 0 ){
			//add class for the line number
			$(tmpFormerLine).addClass("line_" + (lnNum - 1));
		}
		//create new line inside code block (i.e. current line)
		$(tmpFormerLine).after(
			"<span class='nc-line nc-editor-current-line'></span>"
		);
		//remove class 'nc-current-word' from current word on former line
		$(tmpFormerLine).find(".nc-current-word").removeClass("nc-current-word");
		//remove class 'nc-current-letter' from letter of this word on former line
		$(tmpFormerLine).find(".nc-current-letter").removeClass("nc-current-letter");
		//return former current line
		return tmpFormerLine;
	};	//end function 'createNewCurrentLine'
	//open/close code section, via '{' and '}' letters
	function startEndCodeSection(doStartCode){
		//get tabulation pair [A,B], where A specifies pair info, B counts tabs
		//	for the line, in which user pressed [ENTER]
		var tmpOldLineTabPair = g_tabs[g_curLineNum];
		//increment current line index
		g_curLineNum++;
		//determine symbol of code section
		var tmpSymb = doStartCode ? "{" : "}";
		//add new line in textual representation
		g_code.push(tmpSymb);
		//init number of tabs for the new line
		var tmpNumTabs = tmpOldLineTabPair[1];
		//if opening code section
		if( doStartCode ){
			//add new tab container (for now leave it un-initialized)
			g_tabs.push([tmpNumTabs + 1, tmpNumTabs]);
			//increment tabulation by 1
			tmpNumTabs++;
		} else {
			//add new tab container (for now leave it un-initialized)
			g_tabs.push([-1 * tmpNumTabs, tmpNumTabs - 1]);
			//decrement tabulation by 1
			tmpNumTabs--;
		}
		//update line counter again, since we will insert another line
		g_curLineNum++;
		//add new empty line
		g_code.push("");
		//add new tab container
		g_tabs.push([0, tmpNumTabs])
		//remove former current and create new current line
		var tmpFormerLine = createNewCurrentLine(g_curLineNum);
		//get new current line
		var tmpCurLine = $(".nc-editor-current-line");
		//create new line for '{' or '}'
		$(tmpFormerLine).after(
			"<span class='nc-line line_" + g_curLineNum + "'>" +
				"<span class='nc-ignore nc-processed-word'>" + tmpSymb + "</span>" +
			"</span>"
		);
		//assign tabulation for current line
		$(tmpCurLine).css("margin-left", 2 * g_tabs[g_curLineNum][1] + "em");
		//assign tabulation for line with '{' or '}'
		$(tmpCurLine).prev().css(
			"margin-left", 
			2 * g_tabs[g_curLineNum - 1][1] + "em"
		);
	}	//end function 'startEndCodeSection'
	//create new line in the code
	function createNextNewEmptyLine(){
		//add new line in textual representation
		g_code.splice(g_curLineNum + 1, 0, "");
		//add new tab container (for now leave it un-initialized)
		g_tabs.splice(g_curLineNum + 1, 0, [0, 0]);
	}	//end function 'createNewLine'
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
			}
			//update letter counter
			tmpLetterCounter += value.length;
			//if iterated word is among known
			switch(value.toUpperCase()){
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
					//if numeric OR boolean constants
					if( isNumeric || value == "true" || value == "false" ){
						res += "nc-constant-value";
					} else {	//else, it is identifier
						res += "nc-identifier";
					}
					//add remaining class -- processed word
					res += " nc-processed-word'>" + tmpC + "</span>";
					break;
			}
			//if this processed character is not a slash (i.e. '/')
			if( value != "/" ){
				//reset counter of consequent slashes
				tmpCntConseqSlash = 0;
			}
		});
		//init tabulation for the previous line
		var tmpTabCurLine = 0;
		//if an entire line is '}', then we need to un-tab this line
		var doUnTab = isStartNewLine && numOpenCodeBrackets < 0 && words.join("") == '}';
		//add processed code before current line
		$(".nc-editor-current-line").html(res);
		//if need to raise tabulation for the next line(s)
		if( doAdjustTabInfo && isStartNewLine ){
			//if opened paranthesis
			if( numOpenCodeBrackets > 0 ){
				//open new pair of paranthesis
				g_tabs[lineNum][0] = g_tabs[lineNum][1] + 1;
			} else if( numOpenCodeBrackets < 0 ){
				//close pair of paranthesis
				g_tabs[lineNum][0] = -1 * g_tabs[lineNum][1];
				//if this line needs to be un-tabbed
				if( doUnTab ){
					//decrement counter of tabs for this line
					g_tabs[lineNum][1] = g_tabs[lineNum][1] - 1;
				}
				//make sure that counter of tabs is not negative
				if( g_tabs[lineNum][1] < 0 ){
					//reset tabulation to 0
					g_tabs[lineNum][1] = 0;
				}	//end if make sure that tabulation is not negative
			}	//end if opened paranthesis
		}	//end if need to raise tabulation
		//apply tabulation to the current line
		$(".nc-editor-current-line").css(
			"margin-left", 
			g_tabs[lineNum][1] * 2 + "em"
		);
		//update comments
		updateComments();
	};	//end function 'processLine'
	//add event to each file tab (i.e. opened file) to signal click
	$(".nav-tabs > li[role='presentation']").on('click', function(){
		//get name of file that is now opened in the editor
		var tmpCurFileName =
			$(".nav-tabs > li[role='presentation'][class='active']")
			.find("a")
			.text();
		//remove 'active' class from other tabs
		$(".nav-tabs > li[role='presentation']").removeClass("active");
		//get name of file (i.e. name of hyperlink in the file tab) to be opened
		var tmpFileName = $(this).find("a").text();
		//make sure that new file tab is not the old one
		if( tmpCurFileName == tmpFileName ){
			//abort
			return;
		}
		//assign it to this file tab
		$(this).addClass("active");
		//save information for opened file
		g_files[tmpCurFileName] = {
			code: g_code,
			line: g_curLineNum,
			letter: g_curLetterNum,
			tabs: g_tabs
		};
		//check if this file tab has no information in our buffer
		if( !(tmpFileName in g_files) ){
			//create new file tab entry
			//TODO: we need to load file from the server, right now it is set empty
			g_files[tmpFileName] = {
				code: [""],
				line: 0,
				letter: 0,
				tabs: [[0,0]]
			}
		}	//end if this file tab has no information in our buffer
		//load new information
		g_code = g_files[tmpFileName].code;
		g_curLineNum = g_files[tmpFileName].line;
		g_curLetterNum = g_files[tmpFileName].letter;
		g_tabs = g_files[tmpFileName].tabs;
		//remove all content from the editor
		$(".nc-input-editor").html(
			"<span class='nc-line nc-editor-current-line'>" +
				"<span class='nc-current-word'>" +
					"<span class='nc-current-letter'>" +
					"</span>" +
				"</span>" +
			"</span>"
		);
		//render this new file in the editor
		renderFile(0);
		//clear focus from clicked file tab
		$(".nav-tabs > li[role='presentation'][class='active'] > a").blur();
	});
	//render file in the editor
	//input(s):
	//	startLine: (integer) line number from which to start rendering
	//output(s): (none)
	function renderFile(startLine){
		//loop thru changed\created lines
		for( var tmpLineIdx = startLine; tmpLineIdx <= g_curLineNum; tmpLineIdx++ ){
			//check if this line is empty
			if( g_code[tmpLineIdx] == "" ){
				//skip this line
				continue;
			}
			//process and output this line
			processLine(
				tmpLineIdx, 	//current line number
				false			//do not adjust tab information (it is already set up)
				//,tmpIsComment	//is line commented out
			);
			//if it is not the last iteration
			if( tmpLineIdx < g_curLineNum ){
				//create new current line
				createNewCurrentLine(tmpLineIdx + 2);
			}	//end if not last iteration
		}	//end loop thru changed\created lines
	};	//end function 'renderLine'
	//store information for all tabs (i.e. opened files)
	var g_files = {};
	//store entered code line-by-line
	var g_code = [""];
	//store line number for the current
	var g_curLineNum = 0;
	//store index of the current letter in the line
	var g_curLetterNum = 0;
	//store tabulations for each line
	//function void:__main__(){		=> 0:[ 1,0]
	//	var integer:i = 0;			=> 1:[ 0,1]
	//	if( i == 0 ){				=> 2:[ 2,1]
	//		let i = 123;			=> 3:[ 0,2]
	//		var integer:j = i;		=> 4:[ 0,2]
	//	}							=> 5:[-2,1]
	//}								=> 6:[-1,0]
	//*****************************************
	//[A,B]
	//	A => counter for paranthesis, which helps to identify:
	//			-> pair of paranthesis, e.g. 1 and -1 or 2 and -2
	//	B => idetifies tabulation index, how many tabs to insert in the specified line
	var g_tabs = [[0,0]];	//start with 1st line already created
	//copy-paste handler to modify code in the editor
	//	see: http://stackoverflow.com/a/19269040
	$(document).on('paste',function(e) {
		e.preventDefault();
		var text = (e.originalEvent || e).clipboardData.getData('text/plain') || window.clipboardData.getData('text/plain');
		//init container for saving content after current letter marker (if any)
		var tmpAfterConsole = "";
		//if there is no current line
		if( g_curLineNum == g_code.length ){
			//create new empty line
			createNextNewEmptyLine();
		}	//end if there is no current line
		//if current line is not empty
		if( g_code[g_curLineNum].length > 0 ){
			//get remaining part of current string after current marker
			tmpAfterConsole = g_code[g_curLineNum].slice(g_curLetterNum);
			//reset current line to code before current marker
			g_code[g_curLineNum] = g_code[g_curLineNum].slice(0, g_curLetterNum);
		}	//end if current line is not empty
		//record starting line
		var tmpStartLine = g_curLineNum;
		//loop thru pasted text (char-by-char)
		for( var idx = 0; idx < text.length; idx++ ){
			//is this a newline character (sequence of chars: 13, 10)
			var tmpIsNewLine = 
				idx + 1 < text.length &&			//there is 2nd character
				text[idx].charCodeAt(0) == 13 &&	//first is 0x0D == 13
				text[idx+1].charCodeAt(0) == 10;	//second is 0x0A == 10
			//if need to make a newline(s)
			if( tmpIsNewLine ||
				text[idx] == "{" ||
				text[idx] == "}" ) {
				//if not close paranthesis
				if( text[idx] != "}" ){
					//create new line below the current line
					createNextNewEmptyLine();
					//move cursor to the start of this new line
					g_curLineNum++;
					g_curLetterNum = 0;
				}	//end if not close paranthesis
				//get tab pair information for the current line
				var tmpOldLineTabPair = g_tabs[g_curLineNum - 1];
				//if previous line had '{' or '}'
				if( tmpOldLineTabPair[0] != 0 ){
					//set new line, appropriately
					g_tabs[g_curLineNum][1] = 
						tmpOldLineTabPair[1] + (tmpOldLineTabPair[0] > 0 ? 1 : 0);
				} else {	//else, it is simply new line
					//copy over the tabulation from previous line
					g_tabs[g_curLineNum][1] = tmpOldLineTabPair[1];
				}	//end if previous line had '{' or '}'
				//if not a new line character
				if( !tmpIsNewLine ){
					//if it is '{' (i.e. start of code section)
					if( text[idx] == "{" ) {
						//add opening paranthesis to the new line
						g_code[g_curLineNum] = g_code[g_curLineNum].concat(text[idx]);
						//reset tab information for this line to be start of code section
						g_tabs[g_curLineNum][0] = g_tabs[g_curLineNum][1] + 1;
					} else {	//else, it is end of code section
						//add closing paranthesis to the new line
						g_code[g_curLineNum] = 
							g_code[g_curLineNum].concat(text[idx]);
						//reset tab information for this line to be end of code section
						g_tabs[g_curLineNum][0] = -1 * g_tabs[g_curLineNum][1];
						//decrement tabulation for this line
						g_tabs[g_curLineNum][1]--;
						//set similar tabulation for the new line (after '}')
						//g_tabs[g_curLineNum][1] = g_tabs[g_curLineNum - 1][1];
					}
				} else {
					//skip one more character
					idx++;
				}	//end if not a new line character
				//skip to the next character
				continue;
			}	//end if newline
			//add character to the end of the current line
			g_code[g_curLineNum] = g_code[g_curLineNum].concat(text[idx]);
			//increment current character counter
			g_curLetterNum++;
		}	//end loop thru pasted text
		g_code[g_curLineNum] = g_code[g_curLineNum].concat(tmpAfterConsole);
		//flag: is line commented out
		//var tmpIsComment = false;
		//render newly created lines
		renderFile(tmpStartLine);
		//set to the next line
		g_curLineNum++;
	});	//end copy-paste handler
	//click handler to change re-position cursor
	//	see: http://stackoverflow.com/questions/10706903/check-which-element-has-been-clicked-with-jquery
	$('body').click(function(e){
		//get target that was clicked
		var tmpTarget = $(e.target);
		//make sure that clicked element is inside editor (i.e. 'nc-input-editor')
		if( $(tmpTarget).closest(".nc-input-editor").length > 0 ){
			//get line
			var tmpLine = $(tmpTarget).closest(".nc-line");
			//get letter number in this line
			g_curLetterNum = $(tmpLine).find(".nc-processed-letter").index(tmpTarget[0]) + 1;
			//get line number
			g_curLineNum = $(".nc-input-editor").find(".nc-line").index(tmpLine[0]);
			//erase current marker
			$(".nc-current-letter").removeClass("nc-current-letter");
			$(".nc-current-word").removeClass("nc-current-word");
			$(".nc-editor-current-line").removeClass("nc-editor-current-line");
			//set clicked letter to be current letter
			$(tmpTarget).addClass("nc-current-letter");
			//set parent word for this letter to be current word
			$(tmpTarget).parent().addClass("nc-current-word");
			//set current line
			$(tmpLine).addClass("nc-editor-current-line");
		}	//end if clicked element is inside editor
	});	//end click handler
	//key handler to recognize keys typed by the user
	$(window).on("keypress keydown", function(e){
		//if handling keydown event
		if( e.type == "keydown" ){
			//check if pressed overloaded character
			if( e.which == 8		//backspace
				|| e.which == 37	//arrow left
				|| e.which == 39	//arrow right
				|| e.which == 38	//arrow up
				|| e.which == 40	//arrow down
			){
				//do not process this key
				e.preventDefault();
				//to avoid collissions offset these special characters by 900
				e.keyCode = e.which + 900;
			} else {	//handle other keys with keypress event, since it translates
						//	keyboard event to specific character pressed
				return;
			}
		}	//end if handling keydown
		//see: http://stackoverflow.com/questions/13506209/pass-data-using-jquery-trigger-event-to-a-change-event-handler
		$(".nc-input-editor").trigger("enterkey", [{
			keyCode: e.keyCode
		}]);
	});
	//character handler to process and output result in the editor
	$(".nc-input-editor").bind("enterkey", function(e, data){
		//navigation offsets
		var tmpNavX = 0;
		var tmpNavY = 0;
		//PHASE # 1: process entered key code
		//depending on the typed character
		switch(data.keyCode){
			case 937: 		//arrow left
				tmpNavX--;
				break;
			case 939: 		//arrow right
				tmpNavX++;
				break;
			case 938: 		//arrow up
				tmpNavY--;
				break;
			case 940: 		//arrow down
				tmpNavY++;
				break;
			case 13:		//enter
				//get tabulation pair [A,B], where A specifies pair info, B counts tabs
				//	for the line, in which user pressed [ENTER]
				var tmpOldLineTabPair = g_tabs[g_curLineNum];
				//increment current line index
				g_curLineNum++;
				//add new line in textual representation
				createNextNewEmptyLine();
				//get former line
				var tmpFormerLine = $(".nc-editor-current-line");
				//remove class from the current line
				$(tmpFormerLine).removeClass("nc-editor-current-line");
				//check if this line does not have class {{'line_'.g_curLineNum}}
				if( $(".line_" + g_curLineNum).length == 0 ){
					//add class for the line number
					$(tmpFormerLine).addClass("line_" + g_curLineNum);
				}
				//create new line span with class '.nc-editor-current-line'
				$(tmpFormerLine).after(
					"<span class='nc-line nc-editor-current-line'></span>"
				);
				//move code for the former line after the current marker on the next line
				g_code[g_curLineNum] = g_code[g_curLineNum - 1].slice(g_curLetterNum); 
				//get new current line
				var tmpCurLine = $(".nc-editor-current-line");
				//get current word in the former line -- it will be an iterator of words
				var tmpFormerIterWord = $(tmpFormerLine).find(".nc-current-word");
				//init buffer (content) for new current line
				var tmpBufNewCurLine = "";
				//loop thru current and remaining words of the former code line
				while( tmpFormerIterWord.length != 0 ){
					//add currently iterated word into buffer for new current line
					//	see: http://stackoverflow.com/a/5744268
					tmpBufNewCurLine += $(tmpFormerIterWord)[0].outerHTML;
					//get reference to the currently iterated word
					var tmpWord = tmpFormerIterWord;
					//move to the next word
					tmpFormerIterWord = $(tmpFormerIterWord).next();
					//check if it is not current word on former line
					if( $(tmpWord).hasClass("nc-current-word") == false ){
						//remove this word from former line
						$(tmpWord).remove();
					}	//end if it is not current word on former line
				}	//end loop thru current and remaining words of former code line
				//insert buffered content into the new current line
				$(tmpCurLine).html(tmpBufNewCurLine);
				//get current word on the new current line
				var tmpCurWord = $(tmpCurLine).find(".nc-current-word");
				//remove letters from the current word on the new current line
				$(tmpCurWord).children().remove();
				//init buffer (content) for the current word on the new line
				var tmpBufNewCurWord = "";
				//get the next letter after current inside former line
				var tmpFormerIterLetter = $(tmpFormerLine).find(".nc-current-letter").next();
				//loop thru remaining letters starting from referenced
				while( tmpFormerIterLetter.length != 0 ){
					//copy currently iterated letter to the current word on the new line
					tmpBufNewCurWord += $(tmpFormerIterLetter).html();
					//get reference to the current letter
					var tmpLetter = tmpFormerIterLetter;
					//move to the next letter
					tmpFormerIterLetter = $(tmpFormerIterLetter).next();
					//remove this letter in the current word on the former line
					$(tmpLetter).remove();
				}	//end loop thru remaining letters starting from referenced
				//remove class 'nc-current-word' from current word on former line
				$(tmpFormerLine).find(".nc-current-word").removeClass("nc-current-word");
				//remove class 'nc-current-letter' from letter of this word on former line
				$(tmpFormerLine).find(".nc-current-letter").removeClass("nc-current-letter");
				//add '.nc-current-letter' to the first letter of current word on new line
				$(tmpCurLine).find(".nc-current-word").children().first().addClass('.nc-current-letter');
				//count occurrences of open code brackets (i.e. '{') in the former line
				//	see: http://stackoverflow.com/questions/881085/count-the-number-of-occurences-of-a-character-in-a-string-in-javascript
				var tmpNumOpenBrackets = $(tmpFormerLine).html().split("{").length - 1;
				//count occurrences of closed code brackets in the former line
				var tmpNumClosedBrackets = $(tmpFormerLine).html().split("}").length - 1;
				//set tabulation for the new line equal to former line
				g_tabs[g_curLineNum][0] = tmpOldLineTabPair[0];
				g_tabs[g_curLineNum][1] = tmpOldLineTabPair[1];
				//if the new current line should be tabulated by checking whether
				//	previous current line had any unpaired opened code bracket
				if( tmpNumOpenBrackets > tmpNumClosedBrackets ){
					//increase tabulation for the new line
					g_tabs[g_curLineNum][1]++;
				}	//end if tabulate new current line
				//make sure that pair information is 0
				g_tabs[g_curLineNum][0] = 0;
				//count occurrences of closed code brackets in the current line
				var tmpNumOpenBrackets = $(tmpCurLine).html().split("{").length - 1;
				//count occurrences of closed code brackets in the current line
				var tmpNumClosedBrackets = $(tmpCurLine).html().split("}").length - 1;
				//if new line contains either opened or closed bracket
				if( tmpNumOpenBrackets > 0 || tmpNumClosedBrackets > 0 ){
					//if new line contains closed bracket
					if( tmpNumClosedBrackets > tmpNumOpenBrackets ){
						//add tab to the former line
						g_tabs[g_curLineNum - 1][1]++;
					}	//end if new line contains closed bracket
					//reset former line's pair information to 0
					g_tabs[g_curLineNum - 1][0] = 0;
				}	//end if new line contains either opened or closed bracket
				//apply tabulation to the new current and former lines
				$(tmpFormerLine).css("margin-left", 2 * g_tabs[g_curLineNum - 1][1] + "em");
				$(tmpCurLine).css("margin-left", 2 * g_tabs[g_curLineNum][1] + "em");
				//reset current letter marker
				g_curLetterNum = 0;
				//quit
				return;
			//create special cases for '{' and '}' to automatically create new lines
			//	when either of these code paranthesis gets typed by the user. I am trying
			//	to resolve a problem with lines having series of such paranthesis
			//	if(i == 0){ let i = 0; } else {
			//	***** since it is hard to determine what to do
			//	or even worse situation:
			//	} else {
			//	since number of '{' and '}' is equal, and thus we do not tabulate next line
			//	but we actually must tabulate it!
			case 123:			//{
				startEndCodeSection(true);
				break;
			case 125:			//}
				startEndCodeSection(false);
				break;
			case 908:			//backspace
				//check if current line is empty already
				if( g_code[g_curLineNum].length == 0 ){
					//if this is very first line (0th line number) but it isn't the only line
					//OR it is non-first line
					//	Note: if it is only line, do not remove it, we need to have at
					//	least one line in the code buffer
					if( (g_curLineNum == 0 && g_code.length > 1) || g_curLineNum > 0 ){
						//remove current line
						g_code.splice(g_curLineNum, 1);
						//locate SPAN for the current line
						var spCurLine = $(".nc-editor-current-line");
						//var for the line that becomes current (replacing line)
						var spFutCurLine = null;
						//if this is very first line
						if( g_curLineNum == 0 ){
							//locate SPAN below
							spFutCurLine = $(spCurLine).next();
						} else {
							//decrement current line index
							g_curLineNum--;
							//locate SPAN above
							spFutCurLine = $(spCurLine).prev();
						}
						//remove SPAN for the current line
						$(spCurLine).remove();
						//remove all classes from the replacing line
						$(spFutCurLine).removeClass();
						//make this line to be current line
						$(spFutCurLine).addClass("nc-editor-current-line");
						$(spFutCurLine).addClass("nc-line");
						//quit
						return;
					}	//end if this is very first line but it isn't only line
				} else {	//else, if current line is not empty
					//if current character is the first on the line
					if( g_curLetterNum == 0 ){
						//if there is line above
						if( g_curLineNum > 0 ){
							//get reference to the line above (a.k.a. previous line)
							var tmpPrevLine = $(".nc-editor-current-line").prev();
							//remove <br /> (break to new line) from previous line
							//$(tmpPrevLine).find("br").remove();
							//get content of the previous line
							var tmpCntPrev = $(tmpPrevLine).html();
							//get content of the current line
							var tmpCntCur = $(".nc-editor-current-line").html();
							//copy content of the current line to the previous one
							$(tmpPrevLine).html(tmpCntPrev + tmpCntCur);
							//update textual version of code for the line above
							g_code[g_curLineNum - 1] += g_code[g_curLineNum];
							//remove this line from the textual version of code
							g_code.splice(g_curLineNum, 1);
							//physically remove current line
							$(".nc-editor-current-line").remove();
							//decrement index of current line
							g_curLineNum--;
							//make previous line be the current
							$(tmpPrevLine).addClass("nc-editor-current-line");
							//quit
							return;
						}	//end if there is line above
					} else {	//else, current character is not first on the line
						//if it is last character on the line
						if( g_code[g_curLineNum].length == g_curLetterNum ){
							//remove last character on the current line
							//	see: http://stackoverflow.com/questions/9932957/javascript-remove-character-from-a-string
							g_code[g_curLineNum] = g_code[g_curLineNum].slice(0, -1);
						} else {	//else, it is within the line
							//remove specific character within the line
							//	see: http://stackoverflow.com/questions/9932957/javascript-remove-character-from-a-string
							g_code[g_curLineNum] = 
								g_code[g_curLineNum].slice(0, g_curLetterNum - 1) + 
								g_code[g_curLineNum].slice(g_curLetterNum);
						}	//end if it is last character on the line
						//if deleted the last character on the line
						if( g_code[g_curLineNum].length < g_curLetterNum ){
							//decrement current line character by 1
							g_curLetterNum--;
						}	//end if deleted the last character on the line
					}	//end if current character is first on the line
					//@proceed further to re-color word after one of its letters got removed
				}	//end if current line is empty already
				break;
			default:		//printed character
				//get character from pressed key code on the keyboard
				//	see: http://stackoverflow.com/questions/1772179/get-character-value-from-keycode-in-javascript-then-trim
				var curChar = String.fromCharCode(data.keyCode);
				//add currently pressed key code to the current code line
				g_code[g_curLineNum] = [
					g_code[g_curLineNum].slice(0, g_curLetterNum),
					curChar,
					g_code[g_curLineNum].slice(g_curLetterNum)
				].join("");
				//increment current line character by 1
				g_curLetterNum++;
				//@prpceed futher to color changed word
			break;
		}
		//if pressed navigation key
		if( tmpNavY != 0 || tmpNavX != 0 ){
			//if going left AND we are at the start of the line already
			if( tmpNavX == -1 && g_curLetterNum == 0 ){
				//reset navigation for Y = -1
				tmpNavY = -1;
			} else if( tmpNavX == 1 && g_curLetterNum >= (g_code[g_curLineNum].length - 1) ){
				//reset navigation for Y = 1
				tmpNavY = 1;
			}
			//if navigating vertically
			if( tmpNavY != 0 ){
				//if moving down AND we are at the very last line already
				if( tmpNavY == 1 && (g_code.length - 1) == g_curLineNum ){
					//move current character marker at the last character of this line
					g_curLetterNum = g_code[g_curLineNum].length;
					//@leave current line as it is
				//else, if moving up AND we are at the very first line already
				} else if( tmpNavY == -1 && g_curLineNum == 0 ){
					//move current character marker at the first character of this line
					g_curLetterNum = g_code[g_curLineNum].length > 0 ? 1 : 0;
					//@leave current line as it is
				} else {	//else, can move up/down
					//adjust position vertically
					g_curLineNum += tmpNavY;
					//get current line reference
					var tmpCurLine = $(".nc-editor-current-line");
					//remove class 'nc-editor-current-line' from the current line
					$(tmpCurLine).removeClass("nc-editor-current-line");
					//if moving up
					if( tmpNavY == -1 ){
						//make line above to be the current line
						tmpCurLine = $(tmpCurLine).prev();
					} else {
						//make line below to be the current line
						tmpCurLine = $(tmpCurLine).next();
					}
					//assign a current line
					$(tmpCurLine).addClass("nc-editor-current-line");
					//check if also need to move to the first character of this line
					if( tmpNavX == 1 ){
						//goto to first character on this line
						g_curLetterNum = 0;
					//check if also need to move to the last character of this line
					} else if( tmpNavX == -1 ){
						//goto to last character on this line
						g_curLetterNum = g_code[g_curLineNum].length;
					}
				}
			} else {	//else, navigating horizontally
				//adjust position horizontally
				g_curLetterNum += tmpNavX;
			}
		}	//end if pressed navigation key
		//PHASE # 2: color current line
		//process tokens for the current line and output resulting line HTML structure
		processLine(g_curLineNum, true);