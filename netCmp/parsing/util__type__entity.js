/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	types of entity used by result (util__result.js)
	Used by:	result and any file that uses result
	Dependencies:	(none)
**/

var RES_ENT_TYPE = {
	//parsing type elements
	ARGUMENT: {value: 1, name: "argument"},				//obj__argument.js
	BLOCK: {value: 2, name: "block"},					//obj__block.js
	SCOPE: {value: 3, name: "scope"},					//obj__scope.js
	COMMAND: {value: 4, name: "command"},				//obj__command.js
	SYMBOL: {value: 5, name: "symbol"},					//obj__symbol.js
	TYPE: {value: 6, name: "type"},						//obj__type.js
	VALUE: {value: 7, name: "value"},					//obj__value.js
	RESULT: {value: 8, name: "result"},					//util__result.js
	ENT_TYPE: {value: 9, name: "result entity type"},	//itself
	FUNCTION: {value: 10, name: "functinoid"},			//obj__functinoid.js
	PROGRAM: {value: 11, name: "program"},				//obj__program.js
	TEXT: {value: 12, name: "text"},
	LOG_NODE: {value: 13, name: "logical tree node"},	//obj__log_node.js
	//interpreting type elements
	ENTITY: {value: 14, name: "entity"},			//interpreter/obj__entity.js
	CONTENT: {value: 15, name: "content"},			//interpreter/obj__content.js
	FRAME: {value: 16, name: "frame"},				//interpreter/obj__frame.js
	POSITION: {value: 17, name: "position"},		//interpreter/obj__position.js
	FUNC_CALL: {value: 18, name: "function call"},	//interpreter/obj__funcCall.js
	ITERATOR: {value: 19, name: "iterator"}			//interpreter/obj__iterator.js
};
