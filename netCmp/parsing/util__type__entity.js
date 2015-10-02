/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	types of entity used by result (util__result.js)
	Used by:	result and any file that uses result
	Dependencies:	(none)
**/

var RES_ENT_TYPE = {
	ARGUMENT: {type: 1, name: "argument"},		//obj__argument.js
	BLOCK: {type: 2, name: "block"},		//obj__block.js
	SCOPE: {type: 3, name: "scope"},		//obj__scope.js
	COMMAND: {type: 4, name: "command"},		//obj__command.js
	SYMBOL: {type: 5, name: "symbol"},		//obj__symbol.js
	TYPE: {type: 6, name: "type"},			//obj__type.js
	VALUE: {type: 7, name: "value"},		//obj__value.js
	RESULT: {type: 8, name: "result"},		//util__result.js
	ENT_TYPE: {type: 9, name: "result entity type"}	//itself
};
