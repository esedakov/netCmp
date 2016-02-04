/**
	Developer:	Eduard Sedakov
	Date:		2016-02-04
	Description:	interpreter module
	Used by: {everything}
	Depends on:	{everything}
**/

//class is designed for interpreting CFG (Control Flow Graph)
//input(s): 
//	code: (text) => strign representation of the code to be parsed 
//output(s): (none)
function interpreter(code){
	//try to parse given code
	this._parser = new parser(code);
	//process program
	this._parser.process__program();
	//ensure that global function __main__ exists
	if( !("__main__" in this._parser._globFuncs) ){
		//function main was not declared => abort
		throw new Error("runtime error: function 'MAIN' is not declared");
	}
	//get MAIN functinoid
	var mainFunc = this._parser._globFuncs["__main__"];
	//get scope for the MAIN functinoid
	var scpMain = mainFunc._scope;
	//make sure that function has at least one block
	if( scpMain._start == null ){
		//main function does not have any blocks => empty function
		throw new Error("runtime error: MAIN function has no starting block");
	}
	//create current frame for MAIN function
	this._curFrame = new frame(scpMain);
	//create a funcCall object needed for MAIN function
	var funcCallMain = new funcCall(
		mainFunc,		//__main__ functinoid 
		new position(	//position inside MAIN function
			scpMain, 					//main scope
			scpMain._start, 			//starting block of main function
			scpMain._start._cmds[0]		//beginning command of main function
		),
		null	//main does not belong to eny type (so no owning entity)
	);
	//add funcCall object to current frame
	this._curFrame._funcsToFuncCalls[mainFunc._id] = funcCallMain;
	//make sure that MAIN function has no arguments
	if( mainFunc._args.length != 0 ){
		throw new Error("runtime error: MAIN function cannot have any arguments");
	}
	//run MAIN function
	this.run(this._curFrame);
};	//end constructor for interpreter

//process currently executed command in CONTROL FLOW GRAPH (CFG)
//input(s):
//	f: (frame) => current frame
//output(s): (none)
interpreter.prototype.run = function(){
	//
};	//end function 'run'