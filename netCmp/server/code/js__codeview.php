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