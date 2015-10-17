/**
	Developer:	Eduard Sedakov
	Date:		2015-10-09
	Description:	set of commands terminated by jump
	Used by:	block
	Dependencies:	(none)
**/

var B2B = {
	/* direct (non-jump) transfer of control flow from one block to another */
	FALL: {value: 1, name: "fall"},
	/* jumping from one block to another block */
	JUMP: {value: 2, name: "jump"}
};
