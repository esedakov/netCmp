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
	alert(c_arr1 + " \n\r correct is = {id:#, value: ['a',1,true]}");
	alert(c_arr2 + " \n\r correct is = {id:#, value: ['a',1,true]}");
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
	alert(cmd_mul + " \n\r correct is = {id:#, type: null, blk: ((null)), args: Array[<command:#, type:null>, <command:#, type:null>]}");
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
	alert(cmd_nop + " \n\r correct is = {id:#, type: nop, blk: ((null)), args: Array[<command:4, type:mul>]}");
	//return status
	return testPassed;
};

//create field in the passed in type entity
//input(s):
//	ent: type entity where to create a new field
//	name: name of the field
//	t: type of the entity
//	val: value object that initializes field in the entity type when it is instantiated
function createTypeEntityField(ent, name, t, val){
	return ent.addField(
		name,
		t, 
		new command(
			COMMAND_TYPE.NULL, 
			[value.createValue(val)],
			null)
	);
};

//test type object
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed. false: failed)
function test__types(){
	//maintain info whether tests failed or passed
	var testPassed = true;
	//create real type
	var t_int = new type("integer", OBJ_TYPE.INT, null);
	//create text type
	var t_text = new type("text", OBJ_TYPE.TEXT, null);
	//create user-defined 'address' type
	var t_address = new type("address", OBJ_TYPE.CUSTOM, null);
	//address includes 'country':text, 'city':text, zipCode: int, 'street':text, 
	//	'houseNumber': text, 'floor': int, 'room': int
	createTypeEntityField(t_address, "country", t_text, "");
	createTypeEntityField(t_address, "city", t_text, "");
	createTypeEntityField(t_address, "zipCode", t_int, 99999);
	createTypeEntityField(t_address, "street", t_text, "");
	createTypeEntityField(t_address, "houseNumber", t_text, "");
	createTypeEntityField(t_address, "floor", t_int, 0);
	createTypeEntityField(t_address, "room", t_int, 0);
	//right now will not be adding methods, since functinoid is not tested, yet
	//so, 'addMethod' is skipped
	//check if existing field exists
	if( t_address.isFieldExist("country") == false ){
		//report
		alert("error: 'country' field has not been defined");
		//fail
		testPassed = false;
	}
	//check if non-existing field exists
	if( t_address.isFieldExist("porch") == true ){
		//report
		alert("error: 'porch' field has been found, even though it is not defined");
		//fail
		testPassed = false;
	}
	//print integer type
	alert("integer type: \r\n" + t_int + "\r\ncorrect: {id:#, name: integer, type: int, scope.id: (undefined), fields: HashMap{}, methods: HashMap{}}");
	//print text type
	alert("text type:\r\n" + t_text + "\r\ncorrect: {id:#, name: text, type: text, scope.id: (undefined), fields: HashMap{}, methods: HashMap{}}");
	//print address type
	alert("address type:\r\n" + t_address + "\r\ncorrect: {id: #, name: address, type: custom, scope.id: (undefined), fields: HashMap{country => <command:#, type: null>, city => <command:#, type: null>, zipCode => <command:#, type: null>, street => <command:#, type: null>, houseNumber => <command:#, type: null>, floor => <command:#, type: null>, room => <command:#, type: null>}, methods: HashMap{}}");
	//check if type is equal to itself
	if( t_address.isEqual(t_address) == false ){
		//report
		alert("error: t_address failed to be equal to itself");
		//fail
		testPassed = false;
	}
	//check if two types are not equal to each other
	if( t_int.isEqual(t_text) == true ){
		//report
		alert("error: t_int is equal to t_text");
		//fail
		testPassed = false;
	}
	//return status
	return testPassed;
};

//test symbol object
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed. false: failed)
function test__symbol(){
	//maintain info whether tests failed or passed
	var testPassed = true;
	//create type int
	var t_int = new type("integer", OBJ_TYPE.INT, null);
	//create value of 123
	var v_123 = value.createValue(123);
	//create command representing value of variable
	var cmd_123 = new command(
		COMMAND_TYPE.NULL, 
		[],	//do not pass value
		null);
	//create symbol representing instantiated type INT with initial value of 123
	var s_i = new symbol("i", t_int, null);
	//assign cmd_123 as definition of symbol 'i'
	cmd_123.addSymbol(s_i);
	//add argument '123'
	cmd_123.addArgument(v_123);
	//create another command that is next value of variable 'i'
	var cmd_mul = new command(
		COMMAND_TYPE.MUL, 
		[],	//do not pass arguments
		null);
	//add arguments
	cmd_mul.addArgument(cmd_123);
	cmd_mul.addArgument(value.createValue(9));
	//create new variable that gets set with the value of 'cmd_mul'
	var s_j = new symbol("j", t_int, null);
	cmd_mul.addSymbol(s_j);
	//create new command that will use both cmd_123 and cmd_mul
	var cmd_add = new command(
		COMMAND_TYPE.ADD, 
		[],	//do not pass arguments
		null);
	//add arguments
	cmd_add.addArgument(cmd_123);
	cmd_add.addArgument(cmd_mul);
	//assign a symbol i to this new command
	cmd_add.addSymbol(s_i);
	//print 'i' and 'j'
	alert(s_i);
	alert(s_j);
	//print all 3 commands
	alert(cmd_123);
	alert(cmd_mul);
	alert(cmd_add);
	//check whether they are equal
	if( s_i.isEqual(s_j) == true ){
		//report
		alert("error: s_i should not be equal to s_j");
		//fail
		testPassed = false;
	}
	//check if variable is equal to itself
	if( s_i.isEqual(s_i) == false ){
		//report
		alert("error: s_i should be equal to itself");
		testPassed = false;
	}
	//return status
	return testPassed;
};

//creating a set of objects that closely reflect simple program:
//	global space would contain function main() and type declaration: foo
//		foo would contain field _sum (type: real)
//			create function (pro-version of constructor)
//			and also update function to return updated sum
//	main would create foo and then call foo.update and assign result to variable
//	NO PARSING IS ACTUALLY DONE, I will simply simulate this code
//input(s): none
//output(s):
//	boolean => has test passed? (true: passed. false: failed)
function test__program_scope_block_function(){
	/*
	 * class foo {
	 *   int _sum;
	 *   foo() {
	 *     _sum = 0;
	 *   };
	 *   float update(int arg) {
	 *     _sum += arg;
	 *     return _sum;
	 *   };
	 * };
	 * int main() {
	 *   foo temp = new foo();
	 *   temp.update(123);
	 * };
	**/
	//maintain whether test passed or failed
	var testPassed = true;
	//first create program with global scope
	var prog = new program();
	//get global scope
	var g_scp = prog.getGlobalScope();
	//create relevant types (in global scope), they should be available everywhere
	var t_int = new type("integer", OBJ_TYPE.INT, g_scp);
	var t_real = new type("real", OBJ_TYPE.REAL, g_scp);
	//create type 'foo'
	var t_foo = new type("foo", OBJ_TYPE.OBJ_CUSTOM, g_scp);
	//create function 'create' (it is a pro-version of constructor) for 'foo'
	var foo_create = new functinoid(
		"create",		//function name
		t_foo._scope,		//scope for the FOO type
		FUNCTION_TYPE.CTOR,	//func type: constructor
		t_foo			//return type is FOO
	);
	//attach function 'create' (it is a pro-version of constructor) to 'foo'
	t_foo.addMethod("create", foo_create);
	//create symbol for _sum
	var s_foo_sum = new symbol("_sum", t_int, t_foo._scope);
	//add _sum to function create in foo scope
	t_foo._scope.addSymbol(s_foo_sum);
	//create initializing command for '_sum'
	var sum_cmd_init = foo_create._scope._current.createCommand(
		COMMAND_TYPE.NULL,		//command type is NULL
		[value.createValue(0)],		//command to initialize
		[s_foo_sum]			//symbol for _sum
	);
	//create field '_sum' (integer) in 'foo'
	t_foo.addField(
		"_sum",		//field name
		t_int, 		//field type
		sum_cmd_init	//command to initialize _sum field
	);
	//create function 'update' for 'foo'
	var foo_update = new functinoid(
		"update",		//function name
		t_foo._scope,		//scope for the FOO type
		FUNCTION_TYPE.CUSTOM,	//func type: custom (user defined)
		t_real			//return type is REAL (floating point)
	);
	//attach function 'update' to 'foo'
	t_foo.addMethod("update", foo_update);
	//create symbol representing function argument 'arg' of 'foo'
	var s_foo_update_arg = new symbol("arg", t_int, foo_update._scope);
	//add arg to function update in foo scope
	foo_update._scope.addSymbol(s_foo_update_arg);
	//create command POP to retrieve function argument send from the caller to update '_sum'
	var pop_cmd_update_arg = foo_update._scope._current.createCommand(
		COMMAND_TYPE.POP,	//retrieve argument from stack
		[],			//no arguments
		[s_foo_update_arg]	//symbol representing argument
	);
	//create another block to function 'update'
	var foo_update_main_blk = foo_update._scope.createBlock(true);
	//create command ADD to update '_sum'
	var add_cmd_update_sum = foo_update_main_blk.createCommand(
		COMMAND_TYPE.ADD,			//adding '_sum' with 'arg'
		[sum_cmd_init, pop_cmd_update_arg],	//commands _sum and arg
		[s_foo_sum]
	);
	//create command RETURN to send result back to caller
	foo_update_main_blk.createCommand(
		COMMAND_TYPE.RETURN,		//function return command
		[add_cmd_update_sum],		//return resulting value of _sum + arg
		[]				//no symbol assigned
	);
	//create function 'main'
	var gl_main = new functinoid(
		"main",			//function name
		g_scp,			//global scope
		FUNCTION_TYPE.MAIN,	//func type: main
		t_int			//return type is integer
	);
	//create symbol representing instantiated variable of type 'foo' (call variable temp)
	var s_main_foo_temp = new symbol("temp", t_foo, gl_main._scope);
	//add temp to main function scope
	gl_main._scope.addSymbol(s_main_foo_temp);
	//create command CALL to instantiate FOO
	var main_foo_temp = gl_main._scope._current.createCommand(
		COMMAND_TYPE.CALL,	//call constructor
		[],			//no arguments
		[s_main_foo_temp]	//symbol representing instantiated foo
	);
	//create constant to be send to FOO.UPDATE
	var cmd_const_123 = gl_main._scope._current.createCommand(
		COMMAND_TYPE.NULL,		//constant init command
		[value.createValue(123)],	//constant 123
		[]				//no symbol
	);
	//create command PUSH to send value to FOO.UPDATE
	var cmd_push_to_update = gl_main._scope._current.createCommand(
		COMMAND_TYPE.PUSH,	//push function argument
		[cmd_const_123],	//argument is constant 123
		[]			//no symbol
	);
	//create command CALL to update FOO
	gl_main._scope._current.createCommand(
		COMMAND_TYPE.CALL,	//call update
		[cmd_push_to_update],	//pushed function argument for constant 123
		[]			//no symbol
	);
	//create command EXIT
	gl_main._scope._current.createCommand(
		COMMAND_TYPE.EXIT,	//exit program
		[],			//no arguments
		[]			//no symbols
	);
	//attach 'main' to global scope
	g_scp.addScope(gl_main._scope);
	//attach 'foo' to global scope
	g_scp.addScope(t_foo._scope);
	//return status
	return testPassed;
};

//run all tests and produce response message string evaluating results
//input(s): none
//output(s):
//	string => message if error took place, otherwise, empty string
function run_parsing_entities_tests() {
	//prompt
	alert("****starting testing parsing****");
	//test value object
	//alert("test VALUE object, returned: " + test__value());
	//test command object
	//alert("test COMMAND (basic) object, returned: " + test__commands());
	//test type object
	//alert("test TYPE object, returned: " + test__types());
	//test symbol object
	//alert("test SYMBOL object, returned: " + test__symbol());
	//complete parsing test
	alert("complete parsing test, returned: " + test__program_scope_block_function());
};
