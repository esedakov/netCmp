/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	types of commands
	Used by:	command
	Dependencies:	(none)
**/

var COMMAND_TYPE = {
	NOP: {value: 1, name: "nop"},		//every empty block should have one
	PUSH: {value:2, name:"push"},		//load arguments into function
	POP: {value:3, name:"pop"},		//retrieve arguments during function execution
	NULL: {value:4, name:"null"},		//value for undefined variable
	LOAD: {value:5, name:"load"},		//load address of entity (array, tree, class)
	STORE: {value:6, name:"store"},		//store value at address (calculated by ADDA)
	ADDA: {value:7, name:"adda"},		//calculate address
	RETURN: {value:8, name:"return"},	//return value from function back to caller
	PHI: {value:9, name:"phi"},		//choose command
	ADD: {value:10, name:"add"},		//sum
	SUB: {value:11, name:"sub"},		//subtract
	MUL: {value:12, name:"mul"},		//multiply
	DIV: {value:13, name:"div"},		//divide
	MOD: {value:14, name:"mod"},		//mod
	CMP: {value:15, name:"cmp"},		//compare
	BEQ: {value:16, name:"beq"},		//jump if equal (==)
	BGT: {value:17, name:"bgt"},		//jump if greater (>)
	BLE: {value:18, name:"ble"},		//jump if less or equal (<=)
	BLT: {value:19, name:"blt"},		//jump if less (<)
	BNE: {value:20, name:"bne"},		//jump if not equal (!=)
	BGE: {value:21, name:"bge"},		//jump if greater or equal (>=)
	BRA: {value:22, name:"bra"},		//unconditional jump
	ADDTO: {value:23, name:"addTo"},	//add to container (array or tree)
	CALL: {value:24, name:"call"},		//invoke specified method/function
	EXTERNAL: {value:25, name:"external"},	//invoken externally written function (in JS)
	FUNC: {value: 26, name: "function"},	//command declaring a function
	EXIT: {value: 27, name: "exit"},		//exit program
	ISNEXT: {value: 28, name: "isNext"},	//is next element in collection available (used in FOREACH statement)
	NEXT: {value: 29, name: "next"},		//next item in collection (used in FOREACH statement)
	TEMPLATE: {value: 30, name: "template"}	//templated type
};
