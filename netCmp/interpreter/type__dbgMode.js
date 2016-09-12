/**
	Developer:	Eduard Sedakov
	Date:		2016-09-04
	Description:	debuging modes
	Used by:	(interpreter), (debugger)
	Dependencies:	(none)
**/

var DBG_MODE = {
	//run till next breakpoint, or exception, or end of program (which
	//	ever happens first)
	NON_STOP: {value:1, name:"dm_NonStop", matcher:"non_stop"},
	//run single command and if this command is CALL, then step inside function call
	STEP_IN: {value:2, name:"dm_StepIn", matcher:"step_in"},
	//run single command and if this command is CALL, then step over function call,
	//	i.e. do not enter inside and treat entire function body as one command
	STEP_OVER: {value:3, name:"dm_StepOver", matcher:"step_over"},
	//quit debugging
	QUIT: {value:4, name: "dm_quit", matcher:"quit"}
};