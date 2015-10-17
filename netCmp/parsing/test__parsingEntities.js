/**
	Developer:	Eduard Sedakov
	Date:		2015-10-16
	Description:	test file for parsing entities
	Used by:	(testing)
	Dependencies:	(everything)
**/

//test value object (simples to test, since it does not depend on any other entity)
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed, false: not passed)
function test__value() {
	//maintain info whether tests failed or passed
	var testsPassed = true;
	//create int constants
	var c_i1 = value.createValue(147), 
		c_i2 = value.createValue(741), 
		c_i3 = value.createValue(147);
	//create floating point constants
	var c_r1 = value.createValue(98.12),
		c_r2 = value.createValue(7.12);
	//create array constant
	var c_arr1 = value.createValue(['a',1,true]),
		c_arr2 = value.createValue(['a', 1, true]),
		c_arr3 = value.createValue([]);
	//create hash map constant
	var c_hm1 = value.createValue({key: 'marco', value:'polo'}),
		c_hm2 = value.createValue({key: ['a',1,true], value: 'polo'});
	//try to print them all (requires user to analyze output)
	alert(c_i1 + " \n\r correct is = {id:#, value: 147}");
	alert(c_i2 + " \n\r correct is = {id:#, value: 741}");
	alert(c_i3 + " \n\r correct is = {id:#, value: 147}");
	alert(c_r1 + " \n\r correct is = {id:#, value: 98.12}");
	alert(c_r2 + " \n\r correct is = {id:#, value: 7.12}");
	alert(c_arr1 + " \n\r correct is = {id:#, value: Array['a',1,true]}");
	alert(c_arr2 + " \n\r correct is = {id:#, value: Array['a',1,true]}");
	alert(c_arr3 + " \n\r correct is = {id:#, value: Array[]}");
	alert(c_hm1 + " \n\r correct is = {id:#, value: {'key':'marco', 'value':'polo'}}");
	alert(c_hm2 + " \n\r correct is = {id:#, value: {'key':['a',1,true], 'value':'polo'}}");
	//try to equalize them
	if( c_i1.isEqual(c_i2) == true || c_i1.isEqual(c_i3) == false ){
		//report
		alert("error: integer comparison test failed");
		//fail
		testsPasssed = false;
	}
	//return status
	return testsPassed;
};

//test commands (only limited set: NOP, NULL, and arithmetic command MUL that uses NULL) object
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed. false: failed)
function test__commands(){
	//maintain info whether tests failed or passed
	var testPassed = true;
	//create simple nop command
	var cmd_nop = new command(COMMAND_TYPE.NOP, [], null);
	//create null command for constant value
	var cmd_null = new command(
		COMMAND_TYPE.NULL, 
		[value.createValue(123)],
		null);
	//print commands
	alert(cmd_nop + " \n\r correct is = {id:#, type: nop, blk: ((null)), args: Array[]}");
	alert(cmd_null + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[{id: #, value: 123}]}");
	//get last commands for each command type
	var cmdList = command.getLastCmdForEachType();
	//print all relevant last commands
	alert(command.__library[COMMAND_TYPE.NOP.value] + " \n\r correct is = {id:#, type: nop, blk: ((null)), args: Array[]}");
	alert(command.__library[COMMAND_TYPE.NULL.value] + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[{id: #, value: 123}]}");
	alert(command.__library[COMMAND_TYPE.MUL.value] + " \n\r correct is = null");
	//create another null command
	var cmd_null2 = new command(
		COMMAND_TYPE.NULL,
		[value.createValue(true)],
		null);
	//create multiply command
	var cmd_mul = new command(
		COMMAND_TYPE.MUL,
		[cmd_null, cmd_null2],
		null);
	//print two new commands
	alert(cmd_null2 + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[{id: #, value: true}]}");
	alert(cmd_mul + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[<command:#>, <command:#>]}");
	//restore from previous command list
	command.restoreCmdLibrary(cmdList);
	alert(command.__library[COMMAND_TYPE.NOP.value] + " \n\r correct is = {id:#, type: nop, blk: ((null)), args: Array[]}");
	alert(command.__library[COMMAND_TYPE.NULL.value] + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[{id: #, value: 123}]}");
	alert(command.__library[COMMAND_TYPE.MUL.value] + " \n\r correct is = null");
	//if NOP is backed up
	if( command.isBackedUp(cmd_nop._type) == true ){
		//report
		alert("error: NOP should not be backed up");
		//fail
		testPassed = false;
	}
	//if NULL is backed up
	if( command.isBackedUp(cmd_null._type) == false ){
		//report
		alert("error: NULL should not backed up");
		//fail
		testPassed = false;
	}
	//if NOP or NULL jump instruction
	if( command.isJump(cmd_nop._type) || command.isJump(cmd_null._type) ){
		//report
		alert("error: NOP and NULL are not jump instructions");
		//fail
		testPassed = false;
	}
	//find similar command for NULL # 1
	var cmdNull_alt = command.findSimilarCmd(COMMAND_TYPE.NULL, [value.createValue(123)]);
	//print command for found alternative
	alert(cmdNull_alt + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[{id: #, value: 123}]}");
	//check isEqual
	if( cmdNull_alt.isEqual(cmd_null) == false ){
		//report
		alert("cmd NOP # 1 is not equal to itself");
		//fail
		testPassed = false;
	}
	//add MULL to NOP
	cmd_nop.addArgument(cmd_mul);
	//print
	alert(cmd_nop + " \n\r correct is = {id:#, type: nop, blk: ((null)), args: Array[<command:4>]}");
	//return status
	return testPassed;
};

//test symbol object
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed. false: failed)
function test__symbols(){
};

//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_parsing_entities_tests() {
	//prompt
	alert("****starting testing parsing****");
	//test value object
	alert("test VALUE object, returned: " + test__value());
	//test command object
	alert("test COMMAND (basic) object, returned: " + test__commands());
};
