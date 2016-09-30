//function for creating integer array type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__integerArrayType(gScp){
	//create dummy type integer array
	var tmp_i_arr_type = new type("array<integer>", OBJ_TYPE.ARRAY, gScp);
	//create symbol 'this'
	tmp_i_arr_type.createField(
		"this", 							//variable name
		tmp_i_arr_type, 					//variable type
		tmp_i_arr_type._scope._start		//first block in the type's scope
	);
	//create fundamental functions
	tmp_i_arr_type.createReqMethods();
	//set template to be integer
	tmp_i_arr_type._templateNameArray[0] = {
		'name': 'key',
		'type': type.__library["integer"]
	};
	//increment counter of templates by 1
	tmp_i_arr_type.__tmp_templateCount++;
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
	//create symbol '_value' of type integer
	//var tmp_int_valSymb = new symbol("_value", tmp_int_type, tmp_int_type._scope);
	//add '_value' to the scope
	//tmp_int_type._scope.addSymbol(tmp_int_valSymb);
	//create default constructor
	//var tmp_int_ctorFunc = new functinoid(
	//	"__create__",			//function name
	//	tmp_int_type._scope,	//function scope
	//	FUNCTION_TYPE.CTOR,		//type of function is constructor
	//	tmp_int_type			//returns create type
	//);
	//add constructor method to the type definition
	//tmp_int_type.addMethod("__create__", tmp_int_ctorFunc);

//function for creating real array type
//input(s):
//	gScp: (scope) global scope
//output(s): (none)
function create__realArrayType(gScp){
	//create dummy type real array
	var tmp_r_arr_type = new type("array<real>", OBJ_TYPE.ARRAY, gScp);
	//create symbol 'this'
	tmp_r_arr_type.createField(
		"this", 							//variable name
		tmp_r_arr_type, 					//variable type
		tmp_r_arr_type._scope._start		//first block in the type's scope
	);
	//create fundamental functions
	tmp_r_arr_type.createReqMethods();
	//set template to be real
	tmp_r_arr_type._templateNameArray[0] = {
		'name': 'key',
		'type': type.__library["real"]
	};
	//increment counter of templates by 1
	tmp_r_arr_type.__tmp_templateCount++;
	//reset command library to avoid cases when NULL command that initializes fields
	//	of one type, also gets to initialize fields from another type, since it is
	//	found to be a similar NULL command.
	command.resetCommandLib();
	//create symbol '_value' of type integer
	//var tmp_int_valSymb = new symbol("_value", tmp_int_type, tmp_int_type._scope);
	//add '_value' to the scope
	//tmp_int_type._scope.addSymbol(tmp_int_valSymb);
	//create default constructor
	//var tmp_int_ctorFunc = new functinoid(
	//	"__create__",			//function name
	//	tmp_int_type._scope,	//function scope
	//	FUNCTION_TYPE.CTOR,		//type of function is constructor
	//	tmp_int_type			//returns create type
	//);
	//add constructor method to the type definition
	//tmp_int_type.addMethod("__create__", tmp_int_ctorFunc);
};