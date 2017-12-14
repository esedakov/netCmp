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
	ITERATOR: {value: 19, name: "iterator"},		//interpreter/obj__iterator.js
	//library type elements
	BTREE: {value: 20, name: "B+ tree"},			//lib/B+Tree/b+_tree.js
	BNODE: {value: 21, name: "B+ node"},			//lib/B+Tree/obj__b+_node.js
	//ES 2016-09-10 (b_debugger): add type for debugger
	DBG: {value: 22, name: "debugger"},				//interpreter/dbg.js
	//ES 2016-09-10 (b_debugger): debugging function state
	DFS: {value: 23, name: "dbg func state"},		//interpreter/obj__dbgFuncState.js
	//ES 2016-09-27 (b_libs_1): point
	POINT: {value: 24, name: "point"},				//lib/Point/point.js
	//ES 2016-09-27 (b_libs_1): datetime
	DATETIME: {value: 24, name: "datetime"},		//lib/Datetime/Datetime.js
	//ES 2016-09-27 (b_libs_1): file properties
	FILEPROP: {value: 24, name: "fileprop"},		//lib/File/fileProp.js
	//ES 2016-09-27 (b_libs_1): file
	FILE: {value: 24, name: "file"},				//lib/File/file.js
	//ES 2016-09-27 (b_libs_1): timer
	TIMER: {value: 24, name: "timer"},				//lib/Timer/timer.js
	//ES 2017-02-18 (soko): flag allows designator to inform access handler that
	//	designator included its entry on access stack, so that access handler would
	//	not insert its own on the next iteration (iteration on '.')
	ACCESS_STACK_DESIGNATOR: {value: 25, name: "access stack designator information"},
	//ES 2017-11-11 (b_01): create new type for Canvas objects
	CANVAS_ELEM: {value: 26, name: "canvas element"},
	//ES 2017-12-14 (b_02): create type for rectangle
	RECT: {value: 27, name: "rectangle"},
};
