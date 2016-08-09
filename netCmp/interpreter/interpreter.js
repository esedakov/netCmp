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
	//boolean flag to determine whether to stop execution of code
	this._doQuit = false;
	//library of EXTERNAL functions
	this._externalFuncLib = {};
	//populate library of external functions
	this.populateExtFuncLib();
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
	//stack of frames
	this._stackFrames = {};
	//add current frame to the stack
	this._stackFrames[scpMain._id] = this._curFrame;
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
	//set global variable for interpeter in the entity file
	entity.__interp = this;
	//ES 2016-08-04 (b_cmp_test_1): keep only one reference to DRAWING component
	this._drwCmp = null;
	//load variables for this frame
	this._curFrame.loadVariables();
	//run user's program, starting from the MAIN function
	this.run(this._curFrame);
};	//end constructor for interpreter

//populate library of externall functions (i.e. it is used by EXTERNAL command)
//input(s): (none)
//output(s): (none)
interpreter.prototype.populateExtFuncLib = function(){
	this._externalFuncLib = {
		//construct entity of given type
		//input(s):
		//	sid: (integer) id of the symbol for which to construct empty entity
		//	fr: (frame) current frame
		//output(s): (entity) => constructed entity
		'createVariableEntity': function(sid, fr){
			//find entity for the specified symbol id
			return fr._symbsToVars[sid];
		},
		//complete fundamental functionality of specified class:
		//ADD: {value: 2, name: "+"},				//operator '+' 				(this, other)
		//SUB: {value: 3, name: "-"},				//operator '-' 				(this, other)
		//MUL: {value: 4, name: "*"},				//operator '*' 				(this, other)
		//DIV: {value: 5, name: "/"},				//operator '/' 				(this, other)
		//MOD: {value: 6, name: "mod"},				//operator 'mod' 			(this, other)
		//TO_STR: {value: 7, name: "toString"},		//convert object to string	(this)
		//IS_EQ: {value: 8, name: "isEqual"},		//compare objects			(this, other)
		//IS_LESS: {value: 9, name: "isLess"},			//are two objects equal to each other
		//IS_GREATER: {value: 10, name: "isGreater"},			//are two objects equal to each other
		//CLONE: {value: 11, name: "cloneObject"},	//clone object				(this)
		//LENGTH: {value: 14, name: "length of container"},						(this)
		//GET: {value: 15, name: "get element of container"},					(this, index)
		//INSERT: {value: 16, name: "insert into container"},					(this, val [, key])		//'key' is used only in tree
		//REMOVE: {value: 17, name: "remove from container"},					(this, index)
		//INDEX: {value: 18, name: "index"},									(this, val)
		//IS_INSIDE 															(this, index)
		//IS_EMPTY 																(this)
		//REMOVE_ALL 															(this)
		//GET_MAX 																(this)
		//GET_MIN 																(this)
		//NUM_LEVELS 															(this)
		//input(s):
		//	fname: (text) function type's name
		//	tname: (text) object type's name
		//	fr: (frame) current frame
		//output(s):
		//	(content) => resulting arithmetic value
		'process': function(fname, tname, fr){
			//make sure that type with specified name exists
			if( !(tname in type.__library) ){
				//error
				throw new Error("runtime error: 5738572598659824");
			}
			//get specified type
			var tmpType = type.__library[tname];
			//get THIS entity
			var tmpThisEnt = fr.getEntityByName("this");
			//make sure that THIS entity was found
			if( tmpThisEnt == null ){
				//error
				throw new Error("runtime error: 34297471894754");
			}
			//get OTHER entity
			var tmpOtherEnt = fr.getEntityByName("other");
			//also try to get VAL and INDEX entities
			var tmpValEnt = fr.getEntityByName("val");
			var tmpIndexEnt = fr.getEntityByName("index");
			//if this operator takes more then 1 argument (i.e. not To_Str, not Clone, not Length) BUT does not have
			//	either 'other', 'val', or 'index' arguments defined
			/* ES 2016-06-12 (b_interpreter_2): do not check presence of function arguments
			if( fname != FUNCTION_TYPE.TO_STR.name && 
				fname != FUNCTION_TYPE.CLONE.name && 
				fname != FUNCTION_TYPE.LENGTH.name && 
				fname != FUNCTION_TYPE.IS_EMPTY.name &&
				fname != FUNCTION_TYPE.REMOVE_ALL.name &&
				fname != FUNCTION_TYPE.GET_MAX.name &&
				fname != FUNCTION_TYPE.GET_MIN.name &&
				fname != FUNCTION_TYPE.NUM_LEVELS.name &&
				(tmpOtherEnt == null && tmpValEnt == null && tmpIndexEnt == null)	//only 1 argument is defined
			){
				//error
				throw new Error("runtime error: 497395723859724");
			}*/
			//setup variables that would store CONTENTS instead of ENTITIES
			var tmpThisVal = tmpThisEnt;
			var tmpOtherVal = tmpOtherEnt;
			//if THIS is an entity
			if( tmpThisEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//re-define value of THIS
				tmpThisVal = tmpThisEnt._value;
			}
			//if OTHER is defined and it is an entity
			if( tmpOtherEnt != null && tmpOtherEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//re-define value of OTHER
				tmpOtherVal = tmpOtherEnt._value;
			}
			//if value entity exists and it is an ENTITY
			if( tmpValEnt != null && tmpValEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//replace entity's value with a content
				tmpValEnt = tmpValEnt._value;
			}
			//if index entity exists and it is an ENTITY
			if( tmpIndexEnt != null && tmpIndexEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//replace entity's value with a content
				tmpIndexEnt = tmpIndexEnt._value;
			}
			//setup a resulting value
			var tmpResVal = null;
			//depending on the type of function
			switch(fname){
				case FUNCTION_TYPE.ADD.name:
				case FUNCTION_TYPE.SUB.name:
				case FUNCTION_TYPE.MUL.name:
				case FUNCTION_TYPE.DIV.name:
				case FUNCTION_TYPE.MOD.name:
					//convert function type to equivalent command type
					var tmpEqCmdType = null;
					switch(fname){
						case FUNCTION_TYPE.ADD.name:
							tmpEqCmdType = COMMAND_TYPE.ADD;
						break;
						case FUNCTION_TYPE.SUB.name:
							tmpEqCmdType = COMMAND_TYPE.SUB;
						break;
						case FUNCTION_TYPE.MUL.name:
							tmpEqCmdType = COMMAND_TYPE.MUL;
						break;
						case FUNCTION_TYPE.DIV.name:
							tmpEqCmdType = COMMAND_TYPE.DIV;
						break;
						case FUNCTION_TYPE.MOD.name:
							tmpEqCmdType = COMMAND_TYPE.MOD;
						break;
					}
					//perform an arithmetic operation to get resulting value (content type)
					tmpResVal = this.processArithmeticOp(
						tmpEqCmdType,			//equivalent command type
						tmpThisVal,				//first argument (content)
						tmpOtherVal				//second argument (content)
					);
				break;
				case FUNCTION_TYPE.TO_STR.name:
					//convert object to text
					tmpResVal = new content(
						type.__library["text"],				//type is TEXT
						tmpThisVal._value.toString()		//THIS object is converted to string
					);
				break;
				case FUNCTION_TYPE.IS_EQ.name:
					//compare twp objects: THIS and OTHER and record BOOLEAN result
					tmpResVal = new content(
						type.__library["boolean"],			//type is boolean
						//compare THIS with OTHER
						JSON.stringify(tmpThisVal._value) == JSON.stringify(tmpOtherVal._value)
					);
				break;
				case FUNCTION_TYPE.CLONE.name:
					//make a clone of CONTENT
					tmpResVal = new content(
						tmpThisVal._type,
						JQuery.extend(true, {}, tmpThisVal._value)
					);
				break;
				case FUNCTION_TYPE.INSERT.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'insert' method
						tmpBTreeInstance.insert(
							tmpBTreeInstance._root,	//start from root node
							tmpIndexEnt,			//key to insert
							tmpValEnt				//val to insert
						);
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that array's template type matches type of given value
						if( tmpType._templateNameArray[0].type != tmpValEnt._type ){
							//error: type mismatch
							throw new Error("array template type is not matching value's type");
						}
						//make sure that index is of integer type
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of type integer");
						}
						//insert element into array
						tmpThisVal._value.splice(
							tmpIndexEnt._value,
							0,
							tmpValEnt
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke INSERT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.REMOVE.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'remove' method
						tmpBTreeInstance.remove(
							null,					//no parent node
							tmpBTreeInstance._root,	//starting from root node
							tmpIndexEnt				//key to remove
						);
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that index is of integer type
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of type integer");
						}
						//remove element from array
						tmpThisVal._value.splice(
							tmpIndexEnt._value,
							1
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.INDEX.name:
					if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that array's template type matches type of given value
						if( tmpType._templateNameArray[0].type != tmpValEnt._type ){
							//error: type mismatch
							throw new Error("array template type is not matching value's type");
						}
						//set resulting value to -1, i.e. value not found
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							-1							//value was not found == -1
						);
						//loop thru elements of array to find given value
						for( var k = 0; k < tmpThisVal._value.length; k++ ){
							//is current element matching given value
							if( tmpThisVal._value[k] != null && tmpThisVal._value[k] == tmpValEnt ){
								//found corresponding index
								tmpResVal._value = k;
								break;
							}
						}	//end loop thru elements of array to find given value
					} else {
						throw new Error("Tree object does not support 'index' functinoid");
					}
				break;
				case FUNCTION_TYPE.IS_INSIDE.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'isInside' method
						tmpResVal = tmpBTreeInstance.isInside(
							tmpBTreeInstance._root,	//starting from root node
							tmpIndexEnt				//key to find
						) != -1;	//TRUE if it is inside, FALSE if not
						//encapsulate boolean value in a content object
						tmpResVal = new content(
							type.__library["boolean"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke IS_INSIDE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.IS_EMPTY.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'isInside' method
						tmpResVal = tmpBTreeInstance.isEmpty();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpResVal = (tmpThisVal._value.length == 0);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke IS_EMPTY for " + tmpType._name + " type");
					}
					//encapsulate boolean value in a content object
					tmpResVal = new content(
						type.__library["boolean"],	//integer type
						tmpResVal
					);
				break;
				case FUNCTION_TYPE.REMOVE_ALL.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'removeAll' method
						tmpBTreeInstance.removeAll();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpThisVal._value = [];
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE_ALL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.LENGTH.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'numNodes' method
						tmpResVal = tmpBTreeInstance.numNodes();
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						tmpResVal = tmpThisVal._value.length;
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke LENGTH for " + tmpType._name + " type");
					}
					//encapsulate integer value in a content object
					tmpResVal = new content(
						type.__library["integer"],	//integer type
						tmpResVal
					);
				break;
				case FUNCTION_TYPE.GET.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'find' method
						tmpResVal = tmpBTreeInstance.find(
							tmpIndexEnt				//key to find
						);
					} else if( tmpType._type.value == OBJ_TYPE.ARRAY.value ){
						//make sure that index is integer
						if( tmpIndexEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("index for array has to be of integer type");
						}
						//make sure that index is non-negative and within bounds of array
						if( tmpIndexEnt._value < 0 || tmpIndexEnt._value >= tmpThisVal._value.length ){
							//error -- either index is negative or out of bound
							throw new Error("index is either negative or is out of bound");
						}
						//get entry from array at the specified index
						tmpResVal = tmpThisVal._value[tmpIndexEnt._value];
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.IS_LESS.name:
				case FUNCTION_TYPE.IS_GREATER.name:
					//if we reached less ('<') or greater ('>') operator, then following should hold:
					//	1. operator ('<' or '>') belongs to fundamental singleton type
					//	2. this type has to be numerical or textual
					//	3. in case it is textual, we compare two texts by length and then by letter
					//		composition
					//ensure that type is numerical/textual fundamential singleton
					if( 
						tmpType._type.value == OBJ_TYPE.INT.value ||
						tmpType._type.value == OBJ_TYPE.REAL.value ||
						tmpType._type.value == OBJ_TYPE.TEXT.value
					){
						//operator's type is numerical or textual
						if( fname == FUNCTION_TYPE.IS_LESS.name ){
							//apply a less comparison operator and store boolean result
							tmpResVal = tmpThisVal._value < tmpOtherVal._value;
						} else {
							//apply a greater comparison operator and store boolean result
							tmpResVal = tmpThisVal._value > tmpOtherVal._value;
						}
						//encompas boolean result with a content object
						tmpResVal = new content(
							type.__library["boolean"],	//boolean type
							tmpResVal					//comparison result value
						);
					} else {
						//error
						throw new Error("can compare only singleton numericals or singleton textuals");
					}
				break;
				case FUNCTION_TYPE.GET_MAX.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'getMax' method
						tmpResVal = tmpBTreeInstance.getMax(
							tmpBTreeInstance._root	//starting from root node
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET_MAX for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.GET_MIN.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'getMin' method
						tmpResVal = tmpBTreeInstance.getMin(
							tmpBTreeInstance._root	//starting from root node
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke GET_MIN for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.NUM_LEVELS.name:
					//if this is a B+ tree
					if( tmpType._type.value == OBJ_TYPE.BTREE.value ){
						//get instance of B+ tree
						var tmpBTreeInstance = tmpThisVal._value;
						//invoke 'numLevels' method
						tmpResVal = tmpBTreeInstance.numLevels();
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke NUM_LEVELS for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.MOVE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//get displacement by X
						var tmpDispX = getLocalVariableContent(fr, "dispX");
						//get displacement by Y
						var tmpDispY = getLocalVariableContent(fr, "dispY");
						//invoke method
						tmpDrwInstance.moveModel(tmpIdx, tmpDispX, tmpDispY);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke MOVE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.ROTATE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//get degree of rotation
						var tmpDeg = getLocalVariableContent(fr, "deg");
						//invoke method
						tmpDrwInstance.rotateModel(tmpIdx, tmpDeg);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke ROTATE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.SET_FONT.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpFontSize = getLocalVariableContent(fr, "fontSize");
						//get degree of rotation
						var tmpColorTxt = getLocalVariableContent(fr, "colorTxt");
						//invoke method
						tmpDrwInstance.setFontInfo(tmpFontSize, tmpColorTxt);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke SET_FONT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.SET_TXT_POS.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpX = getLocalVariableContent(fr, "x");
						//get degree of rotation
						var tmpY = getLocalVariableContent(fr, "y");
						//invoke method
						tmpDrwInstance.setTxtPosition(tmpX, tmpY);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke SET_TXT_POS for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.REMOVE_MODEL.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get model index
						var tmpIdx = getLocalVariableContent(fr, "idx");
						//invoke method
						tmpResVal = tmpDrwInstance.removeModel(tmpIdx);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke REMOVE_MODEL for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_RECT.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpOpacity = getLocalVariableContent(fr, "opacity");
						//get color for border
						var tmpBorderColor = getLocalVariableContent(fr, "borderColor");
						//get size for border
						var tmpBorderSize = getLocalVariableContent(fr, "borderSize");
						//get filling color
						var tmpFillColor = getLocalVariableContent(fr, "fillColor");
						//get degree of rounding in X-axis
						var tmpRoundX = getLocalVariableContent(fr, "roundX");
						//get degree of rounding in Y-axis
						var tmpRoundY = getLocalVariableContent(fr, "roundY");
						//get text
						var tmpTxt = getLocalVariableContent(fr, "txt");
						//invoke method
						tmpResVal = tmpDrwInstance.drawRect(
							tmpX, tmpY, tmpW, tmpH, tmpOpacity,
							tmpBorderColor, tmpBorderSize, tmpFillColor,
							tmpRoundX, tmpRoundY, tmpTxt
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_RECT for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_IMAGE.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpImgPath = getLocalVariableContent(fr, "imgPath");
						//invoke method
						tmpResVal = tmpDrwInstance.drawImage(
							tmpX, tmpY, tmpW, tmpH, tmpImgPath
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_IMAGE for " + tmpType._name + " type");
					}
				break;
				case FUNCTION_TYPE.DRAW_ELLIPSE.name:
					//make sure that method is called from drawing type
					if( tmpType._type.value == OBJ_TYPE.DRAWING.value ){
						//get instance of DRAWING object
						var tmpDrwInstance = tmpThisVal._value;
						//get x position
						var tmpX = getLocalVariableContent(fr, "x");
						//get y position
						var tmpY = getLocalVariableContent(fr, "y");
						//get width
						var tmpW = getLocalVariableContent(fr, "w");
						//get height
						var tmpH = getLocalVariableContent(fr, "h");
						//get transparency level
						var tmpOpacity = getLocalVariableContent(fr, "opacity");
						//get color for border
						var tmpBorderColor = getLocalVariableContent(fr, "borderColor");
						//get size for border
						var tmpBorderSize = getLocalVariableContent(fr, "borderSize");
						//get filling color
						var tmpFillColor = getLocalVariableContent(fr, "fillColor");
						//get text
						var tmpTxt = getLocalVariableContent(fr, "txt");
						//invoke method
						tmpResVal = tmpDrwInstance.drawRect(
							tmpX, tmpY, tmpW, tmpH, tmpOpacity,
							tmpBorderColor, tmpBorderSize, 
							tmpFillColor, tmpTxt
						);
						//encapsulate integer value in a content object
						tmpResVal = new content(
							type.__library["integer"],	//integer type
							tmpResVal
						);
					} else {
						//unkown not-supported type
						throw new Error("cannot invoke DRAW_RECT for " + tmpType._name + " type");
					}
				break;
			}
			//return resulting content value
			return tmpResVal;
		}
	};
};	//end function 'populateExtFuncLib'

//get content object for specified local variable name
//	f: (frame) current frame
//	name: (text) local variable name
//output(s):
//	(content) => value for specified variable
function getLocalVariableContent(f, name){
	var tmpEnt = f.getEntityByName(name);
	//set content equal to entity by default
	var tmpVal = tmpEnt;
	//if OTHER is defined and it is an entity
	if( tmpEnt != null && tmpEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
		//re-define value of OTHER
		tmpVal = tmpEnt._value;
	}
	//return content for local variable
	return tmpVal;
};	//end method 'getLocalVariableContent'

//associate entity/ies with the given command, based on symbol(s) representing this command
//input(s):
//	f: (frame) current frame
//	c: (command) current command with which to associate entities
//	v: (entity/content) command's value
//output(s): (none)
interpreter.prototype.associateEntWithCmd = function(f, c, v){
	//initialize temporary variable for keeping track of current symbol
	var tmpSymbId = null;
	//loop thru symbols associated with this command
	for( tmpSymbId in c._defChain ){
		//make sure that this symbol has associated entity already defined
		if( !(tmpSymbId in f._symbsToVars) ){
			//error
			//throw new Error("runtime error: 4738592375897");
			continue;	//*** happens with symbols representing fields for complex objects
						//i.e. field "_type" for "elem" type object
		}	//end if symbol is already defined
		//get entity for this symbol
		var tmpEnt = f._symbsToVars[tmpSymbId];
		//it has to be an entity
		if( tmpEnt.getTypeName() != RES_ENT_TYPE.ENTITY ){
			//then, we deal with content -- no need to reassign a content's value with
			//	a reference to the content -- it creates a link when content points
			//	to itself. So skip this symbol and try next one...
			continue;
		}
		//add entity for this command
		f._cmdsToVars[c._id] = tmpEnt;
		//if the value is given by the caller, then need to assign it to symbol
		if( typeof v == "object" && v != null ){
			//make sure that type is matching
			if( tmpEnt._type.isEqual(v._type) == false ){
				//check if type difference is adequate
				if( 
					//integer = real
					(
						tmpEnt._type._type.value == OBJ_TYPE.INT.value && 
						v._type._type.value == OBJ_TYPE.REAL.value
					) ||
					//real = integer
					(
						v._type._type.value == OBJ_TYPE.INT.value && 
						tmpEnt._type._type.value == OBJ_TYPE.REAL.value
					)
				) {
					//change value's type
					v._type = tmpEnt._type;
				} else {	//else, type mismatch is not adequate
					//error
					throw new Error("runtime error: 467579326578326582");
				}
			}
			//if 'v' is an entity
			if( v.getTypeName() == RES_ENT_TYPE.ENTITY ){
				//assign symbol's entity with the value of this entity
				tmpEnt._value = v._value;
			} else {	//otherwise, it has to be a content object
				//assign an entity's value
				tmpEnt._value = v;
			}	//end if 'v' is an entity
		}	//end if assigning value is provided by the caller
	}	//end loop thru associated symbols
};	//end function 'associateEntWithCmd'

//perform arithmetic operation and preliminary checks before such computation
//	to determine if involved values can be operated on
//input(s):
//	op: (COMMAND_TYPE) type of command under processing
//	c1: (content) first argument of arithmetic operation
//	c2: (content) second argument of arithmetic operation
//output(s):
//	(content) => resulting value of operation
interpreter.prototype.processArithmeticOp = function(op, c1, c2){
	//initialize variables for storing type and value of resulting operation
	var tmpResType = null;
	var tmpResVal = null;
	//if resulting type should be TEXT
	if(
		//if it is ADD operator and one of arguments is TEXT
		op.value == COMMAND_TYPE.ADD.value &&
		(
			c1._type._type.value == OBJ_TYPE.TEXT.value || c2._type._type.value == OBJ_TYPE.TEXT.value
		)
	){
		//set resulting type to be TEXT
		tmpResType = c1._type._type.value == OBJ_TYPE.TEXT.value ? c1._type : c2._type;
	}
	//if resulting type should be REAL
	if(
		//if one of arguments is REAL
		c1._type._type.value == OBJ_TYPE.REAL.value || c2._type._type.value == OBJ_TYPE.REAL.value
	){
		//set resulting type to be REAL
		tmpResType = c1._type._type.value == OBJ_TYPE.REAL.value ? c1._type : c2._type;
	}
	//first we need to check if such arithmetic operation is valid
	if(
		//if left argument is not valid
		(
			//not of type integer
			c1._type._type.value != OBJ_TYPE.INT.value &&
			//and, not of type real
			c1._type._type.value != OBJ_TYPE.REAL.value &&
			//and, it is either not ADD operator OR if it is ADD it's argument is not of type TEXT
			(
				//not an ADD operator
				op.value != COMMAND_TYPE.ADD.value ||
				//or, it is an ADD but its argument is not of type TEXT
				(
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT.value
				)
			)
		) ||
		//if right argument is not valid
		(
			//not of type integer
			c2._type._type.value != OBJ_TYPE.INT.value &&
			//and, not of type real
			c2._type._type.value != OBJ_TYPE.REAL.value &&
			//and, it is either not ADD operator OR if it is ADD it's argument is not of type TEXT
			(
				//not an ADD operator
				op.value != COMMAND_TYPE.ADD.value ||
				//or, it is an ADD but its argument is not of type TEXT
				(
					op.value == COMMAND_TYPE.ADD.value && c1._type._type.value != OBJ_TYPE.TEXT.value
				)
			)
		)
	){
		//error
		throw new Error("runtime error: 478278915739835");
	}
	//if resulting type was not set to either TEXT or REAL, then it has to become INTEGER
	if( tmpResType == null ){
		tmpResType = c1._type;	//at this point it should be INTEGER
	}
	//depending on the command type, perform an arithmetic operation
	switch(op.value){
		case COMMAND_TYPE.ADD.value:
			tmpResVal = c1._value + c2._value;
		break;
		case COMMAND_TYPE.SUB.value:
			tmpResVal = c1._value - c2._value;
		break;
		case COMMAND_TYPE.MUL.value:
			tmpResVal = c1._value * c2._value;
		break;
		case COMMAND_TYPE.DIV.value:
			tmpResVal = c1._value / c2._value;
		break;
		case COMMAND_TYPE.MOD.value:
			tmpResVal = c1._value % c2._value;
		break;
	}
	//create content object and return it back to the caller
	return new content(tmpResType, tmpResVal);
};	//end function 'processArithmeticOp'

//get content object
//input(s):
//	o: (entity or content) object from which to get a content
//output(s):
//	(content) => content object retrieved
//ES 2016-08-07 (b_cmp_test_1): change this function to static, so that it can used outside
interpreter.getContentObj = function(o){
	//check if it is aleady a content
	if( o.getTypeName() == RES_ENT_TYPE.CONTENT ){
		return o;
	//else it has to be entity
	} else if ( o.getTypeName() == RES_ENT_TYPE.ENTITY ){
		return o._value;
	//otherwise, cannot get a content
	} else {
		//error
		throw new Error("984973853562755");
	}
};	//end function 'getContentObj'

//issue: (not resolved)**************************************************
//	=> scenario: call object.foo(...)
//		we load symbols for the function foo, since we create a frame for
//		function scope and then use 'loadVariables' on this frame.
//	PROBLEM: we do not load anything from 'object' and we do not load
//		'this' that can be used inside invoked function.
//	Ways to resolve??????????????????????????????????????????????????????
//		Possible solution: also create another frame for given type of
//			'object', and load its variables using values from 'object'.
//			Then create frame for the functionoid, as it is done now.
//			And also, initialize symbol 'this' to point at the 'object'
//			inside either of these frames (may be both????)

//invoke a call to CFG functinoid
//input(s):
//	f: (frame) outer current frame
//	funcRef: (functinoid) functionoid to be executed
//	ownerEnt: (entity/content) owner for given functinoid (if any)
//	args: (optional) array of arguments
//output(s):
//	(entity/content) => value returned by the function
interpreter.prototype.invokeCall = function(f, funcRef, ownerEnt, args){
	//if array of argument is not defined or it is empty
	if( typeof args != "object" || args == null ){
		args = [];
	}
	//*********if this is a constructor, then instead of calling
	//	actual ctor function (which would only contain a NOP), create an
	//	actual object on your own, and do not perform ctor's invocation**************
	//IF FUNC_TYPE == CTOR AND OWNER_TYPE.TYPE is not CUSTOM, THEN ...
	//OR, else when calling "loadVariables" for MAIN function that contains a tree
	//	variable, instantiate tree object at that time
	//create current frame for MAIN function
	var tmpFrame = new frame(funcRef._scope);
	//create funcCall object
	var tmpFuncCallObj = new funcCall(
		funcRef,			//functinoid
		f._current,			//next command's position in the caller
		ownerEnt			//owner entity
	);
	//get number of function arguments
	var tmpNumArgs = funcRef._args.length;
	//move arguments from the argument stack to funcCall's stack
	while( tmpFuncCallObj._args.length < tmpNumArgs ){
		//insert argument in function call object
		tmpFuncCallObj._args.push(args.pop());
	}
	//reverse order of arguments
	tmpFuncCallObj._args.reverse();
	//add funcCall object to current frame
	tmpFrame._funcsToFuncCalls[funcRef._id] = tmpFuncCallObj;
	//load variables for this frame
	tmpFrame.loadVariables();
	//run function
	this.run(tmpFrame);
	//assign returned result to this command (CALL)
	return tmpFrame._funcsToFuncCalls[funcRef._id]._returnVal;
};	//end function 'invokeCall'

//process currently executed command in CONTROL FLOW GRAPH (CFG)
//input(s):
//	f: (frame) => current frame
//output(s): (none)
interpreter.prototype.run = function(f){
	//initialize temporary stack of function arguments
	var funcArgStk = [];
	//redirections (i.e. usage of ADDA and LOAD command pair)
	var redirectCmdMapToEnt = {}; //command{ADDA or LOAD}._id => entity
	//hashmap between scope id (in this case only conditional and loop
	//	scopes are considered) and result of comparison command
	var compResMap = {};	//scope id => comparison result
	//ES 2016-08-08 (b_cmp_test_1): init temporary iterator variable
	var tmpNextLoopIter = null;
	//loop to process commands in this frame
	do {
		//get currently executed position in the frame
		var curPos = f._current;
		//get currenty executed command
		var cmd = curPos._cmd;
		//temporary for storing next position to execute
		var nextPos = null;
		//initialize variable for keeping a value
		var tmpCmdVal = null;
		//initialize flag for associating symbols with a command
		var doAssociateSymbWithCmd = true;
		//depending on the type of current command
		switch(cmd._type.value){
			case COMMAND_TYPE.NOP.value:
				//do not need to associate symbols, since NOP never has
				//	such symbols in the first place
				doAssociateSymbWithCmd = false;
			break;
			case COMMAND_TYPE.NULL.value:
				//if there are no associated symbols with this NULL command, then
				//	it must be a constant declaration. So we need to create a
				//	value that will represent such constant
				//get singleton constant value
				var tmpSnglVal = cmd._args[0]._value;
				//setup variable for type
				var tmpSnglType = null;
				//determine type of singleton constant value
				switch(typeof tmpSnglVal){
					case "number":
						//is it an integer (see http://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer)
						if( tmpSnglVal == (tmpSnglVal | 0) ){
							//integer
							tmpSnglType = type.__library["integer"];
						} else {
							//real
							tmpSnglType = type.__library["real"];
						}
					break;
					case "string":
						tmpSnglType = type.__library["text"];
					break;
					case "boolean":
						tmpSnglType = type.__library["boolean"];
					break;
					default:
						//error -- unkown singleton type
						throw new Error("473582764744597852");
					break;
				}
				//create constant value
				tmpCmdVal = new content(
					tmpSnglType,		//type
					tmpSnglVal			//value
				);
			break;
			case COMMAND_TYPE.POP.value:
				//make sure this frame represents a function
				if( 
					//if there is no function associated with frame's scope, or
					f._scope._funcDecl == null || 

					//if there is no funcCall object for this functionoid
					!(f._scope._funcDecl._id in f._funcsToFuncCalls)
				){
					//error
					throw new Error("47857645784256478564");
				}
				//get array of content/value arguments for this function
				var tmpFuncValArgs = f._funcsToFuncCalls[f._scope._funcDecl._id]._args;
				//get array of function argument names
				var tmpFuncArgNames = f._scope._funcDecl._args;
				//make sure that this command has only one symbol
				if( cmd._defOrder.length != 1 ){
					//error
					throw new Error("45435426894673963");
				}
				//get symbol representing this argument
				var tmpArgSymb = cmd._defChain[cmd._defOrder[0]];
				//index
				var tmpArgIdx = -1;
				//check if this argument represents "this"
				if( tmpArgSymb._name == "this" ){
					//it is the very first argument
					tmpArgIdx = 0;
				}
				//if index is not known, yet
				if( tmpArgIdx == -1 ){
					//loop thru function arguments and find the one for this POP command
					for( var i = 0; i < tmpFuncArgNames.length; i++ ){
						//get currently looped function argument
						var tmpCurFuncArg = tmpFuncArgNames[i];
						//check if we found correct function argument
						if( tmpArgSymb._name == tmpCurFuncArg.name ){
							//set the index and quit loop
							tmpArgIdx = i;
							break;
						}	//end if found correct function argument
					}	//end loop thru function arguments
				}	//end if index is not known, yet
				//if index has been set
				if( tmpArgIdx >= 0 ){
					//save value for this argument
					tmpCmdVal = tmpFuncValArgs[tmpArgIdx];
				} else {	//not set, error
					throw new Error("848357238956982");
				}	//end if index has been set
			break;
			case COMMAND_TYPE.EXIT.value:
				//need to propagate this EXIT thru hierarchy of RUN calls
				//	proposing to introduce a field inside interpreter that is
				//	used to abort interpretation (i.e. _doQuit:boolean) that
				//	can signal when to stop executing
				this._doQuit = true;
				//quit function RUN, right away
				return;
			break;
			case COMMAND_TYPE.PUSH.value:
				//initialize variable that stores entity for argument command
				var tmpArgEnt = null;
				//if argument command has at least one entity
				if( cmd._args.length > 0 && cmd._args[0]._id in f._cmdsToVars ){
					//set argument command
					tmpArgEnt = f._cmdsToVars[cmd._args[0]._id];
					//assign retrieved value to PUSH command
					//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
					tmpCmdVal = interpreter.getContentObj(tmpArgEnt);
					//store value inside argument stack
					funcArgStk.push(tmpCmdVal);
				} else {
					throw new Error("runtime error: 9835973857985");
				}	//end if argument command has at least one entity
			break;
			case COMMAND_TYPE.ISNEXT.value:
				//ES 2016-08-08 (b_cmp_test_1): get iterating entity
				var tmpIterEntity = f._cmdsToVars[cmd._args[1]._id];
				//ES 2016-08-08 (b_cmp_test_1): if loop iterator was not yet initialized, i.e.
				//	if this is the first loop iteration
				if( tmpNextLoopIter == null ){
					//create iterator
					tmpNextLoopIter = new iterator(this._curFrame._scope, tmpIterEntity);
					//set this command's value to true, so that CMP that would compare
					//	value of this command with TRUE could yield success and remain
					//	inside the loop
					tmpCmdVal = true;
				} else {	//ES 2016-08-08 (b_cmp_test_1): else, check if there is next item
					//if there is not next item
					if( tmpNextLoopIter.isNext() == false ){
						//reset loop iterator, since we are leaving the loop
						tmpNextLoopIter = null;
						//set this command's value to false, so similarly CMP would yield
						//	failure when comparing this command with TRUE, and this would
						//	leave the loop
						tmpCmdVal = false;
					} else {
						//set true to stay inside loop
						tmpCmdVal = true;
					}	//end if there is no next item
				}	//end if it is a first loop iteration
				//create constant value
				tmpCmdVal = new content(
					type.__library["boolean"],	//type
					tmpCmdVal					//value
				);
			break;
			case COMMAND_TYPE.NEXT.value:
				//ES 2016-08-08 (b_cmp_test_1): if loop iterator is not null, then we are
				//	inside the loop, trying to iterate over the first/next element
				if( tmpNextLoopIter != null ){
					//move to the next iterating element
					tmpCmdVal = tmpNextLoopIter.next();
				} else {	//ES 2016-08-08 (b_cmp_test_1):  we have exited the loop
					//do nothing (loop will exit via BEQ command that checks whether
					//	isNext is true or not. If it is true, it remains inside the
					//	loop; otherwise, it leaves the loop)
				}
			break;
			case COMMAND_TYPE.CALL.value:
				//format: CALL [functinoid, symbol]
				//	symbol is optional (only if function is not stand-alone)
				//get functinoid
				var tmpFuncRef = cmd._args[0];
				//get number of function arguments
				var tmpNumArgs = tmpFuncRef._args.length;
				//if there is not enough of arguments on the stack
				if( funcArgStk.length < tmpNumArgs ){
					//error
					throw new Error("runtime error: not enough of function arguments");
				}
				//get owner entity (if any) for this functinoid
				var tmpFuncOwnerEnt = null;
				if( cmd._args.length > 1 &&
					cmd._args[1] != null ){
					if( cmd._args[1]._id in f._symbsToVars ){
						//assign entity for the function owner
						tmpFuncOwnerEnt = f._symbsToVars[cmd._args[1]._id];
					} else if( cmd._args[1]._id in f._cmdsToVars ){
						//assign content for the function owner
						tmpFuncOwnerEnt = f._cmdsToVars[cmd._args[1]._id];
					}
				}
				//if calling constructor
				if( tmpFuncRef._name == functinoid.detFuncName(FUNCTION_TYPE.CTOR) ){
					//if there is a symbol defined for this call command
					if( cmd._defOrder.length > 0 ){
						//get symbol associated with call to __create__
						var tmpDefCtorSymb = cmd._defChain[cmd._defOrder];
						//make sure that this symbol is defined in this frame
						if( tmpDefCtorSymb._id in f._symbsToVars ){
							//set value for this command
							tmpCmdVal = f._symbsToVars[tmpDefCtorSymb._id];
							//extract value from entity
							//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
							tmpCmdVal = interpreter.getContentObj(tmpCmdVal);
						} else {	//if not, then error
							throw new Error("runtime error: 435239574589274853");
						}	//end if symbol is not defined in this frame
					}	//end if symbol associated with this call command
				} else {	//else, making a call to a non-constructor function
					//invoke a call
					tmpCmdVal = this.invokeCall(f, tmpFuncRef, tmpFuncOwnerEnt, funcArgStk);
				}	//end if calling constructor
			break;
			case COMMAND_TYPE.EXTERNAL.value:
				//EXTERNAL ['FUNCTION_NAME(ARGS)']
				//get text argument that encodes FUNCTION_NAME and ARGS
				var tmpExtCmdArg = cmd._args[0]._value;
				//make sure it is of type string and it is not empty string
				if( typeof tmpExtCmdArg != "string" || tmpExtCmdArg == "" ){
					throw new Error("runtime error: unkown EXTERNAL command argument");
				}
				//get function name
				var tmpExtFuncName = tmpExtCmdArg.substring(0, tmpExtCmdArg.indexOf("("));
				//if function is 'createVariableEntity' (for declaring entity)
				if( tmpExtFuncName == "createVariableEntity" ){
					//make sure that there is only one argument
					if( tmpExtCmdArg.indexOf(";") >= 0 ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'createVariableEntity' should only take one argument");
					}
					//expecting only one (integer) argument
					var tmpSymbId = parseInt(tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(")")));
					//create entity using EXTERNAL function
					//	'createVariableEntity': function(sid; fr)
					tmpCmdVal = this._externalFuncLib['createVariableEntity'](tmpSymbId, f);
				//if function is 'process' (for processing fundamental operators)
				} else if( tmpExtFuncName == "process" ) {
					//make sure there are 2 arguments
					if( tmpExtCmdArg.split(";").length != 2 ){
						//error
						throw new Error("runtime error: PARSING BUG: EXTERNAL command's function 'process' should take exactly 2 arguments");
					}
					//get function type's name
					var tmpFuncTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf("(") + 1, tmpExtCmdArg.indexOf(";"));
					//get type name
					var tmpObjTypeName = tmpExtCmdArg.substring(tmpExtCmdArg.indexOf(";") + 1, tmpExtCmdArg.indexOf(")"));
					//process EXTERNAL operation
					//	'process': function(fname; tname; fr)
					tmpCmdVal = this._externalFuncLib['process'](tmpFuncTypeName, tmpObjTypeName, f);
				} else {	//unkown EXTERNAL function
					//error
					throw new Error("runtime error: PARSING BUG: unkown EXTERNAL function name");
				}	//end if function is 'createVariableEntity'
			break;
			case COMMAND_TYPE.PHI.value:
				//Comments only: two types of constructs to be discussed:
				//	1. condition (IF-THEN-ELSE):
				//		* if jump-condition is taken, then use PHI's right argument
				//		* if not taken, then use PHI's left argument
				//	2. loop (FOREACH or WHILE):
				//		* if first iteration, then use PHI's left argument
				//		* if second or later iteration, then use PHI's right argument
				//if PHI command has one argument
				if( cmd._args.length == 1 ){
					//associate value of this argument with this command
					f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
				//if PHI command has two arguments
				} else if( cmd._args.length == 2 ){
					//if this is a condition scope
					if( f._scope._type == SCOPE_TYPE.CONDITION ){
						//if condition is present inside map
						if( f._scope._id in compResMap ){
							//get value from the compResMap for this scope
							var tmpResMapEntry = compResMap[f._scope._id];
							//if jump condition is taken, i.e. compResMap for this scope contains a string ('0')
							if( typeof tmpResMapEntry == "string" ){
								//use right argument of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
							} else {	//else jump condition is not taken
								//use left argument of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
							}	//end if jump condition is taken
						} else {	//else condition is not present inside map
							//error
							throw new Error("runtime error: 74647647676535");
						}	//end if condition is present inside map
					//else, if current block has '_fallInOther' not nulled
					} else if( curPos._block._fallInOther != null ) {
						//get scope for '_fallInOther' block
						var tmpFallInOtherScp = curPos._block._fallInOther._owner;
						//check if that scope is a loop
						if( tmpFallInOtherScp._type == SCOPE_TYPE.FOREACH || 
							tmpFallInOtherScp._type == SCOPE_TYPE.WHILE ){
							//if it is not first iteration in the loop
							if( f._scope._id in compResMap ){
								//take value (a.k.a. content or entity) of right argument as value of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[1]._id];
							} else {	//else, it is first iteration in the loop
								//take value of left argument as value of PHI command
								f._cmdsToVars[cmd._id] = f._cmdsToVars[cmd._args[0]._id];
							}	//end if it is not first iteration in the loop
						}	//end if it is a loop scope
					}	//end if it is condition scope
				} else {	//else, it has inacceptable number of command arguments
					throw new Error("runtime error: 84937859532785");
				}	//end if PHI command has one argument
			break;
			case COMMAND_TYPE.ADD.value:
			case COMMAND_TYPE.SUB.value:
			case COMMAND_TYPE.MUL.value:
			case COMMAND_TYPE.DIV.value:
			case COMMAND_TYPE.MOD.value:
				//ARITHMETIC_COMMAND [leftArg, rightArg]
				//get content for the right arithmetic argument
				var tmpLeftArithEnt = f._cmdsToVars[cmd._args[0]._id];
				//if left argument is an entity
				if( tmpLeftArithEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
					tmpLeftArithEnt = tmpLeftArithEnt._value;
				}
				//get content for the left arithmetic argument
				var tmpRightArithEnt = f._cmdsToVars[cmd._args[1]._id];
				//if right argument is an entity
				if( tmpRightArithEnt.getTypeName() == RES_ENT_TYPE.ENTITY ){
					tmpRightArithEnt = tmpRightArithEnt._value;
				}
				//assign resulting command value
				tmpCmdVal = this.processArithmeticOp(
					cmd._type,			//command type
					tmpLeftArithEnt,	//first argument (content type)
					tmpRightArithEnt	//second argument (content type)
				);
			break;
			case COMMAND_TYPE.CMP.value:
				//CMP [rightArg, leftArg]
				//get entity for the right comparison argument
				//ES 2016-08-08 (b_cmp_test_1): make sure that we got content
				var tmpLeftCmpEnt = interpreter.getContentObj(f._cmdsToVars[cmd._args[0]._id]);
				//get entity for the left comparison argument
				//ES 2016-08-08 (b_cmp_test_1): make sure that we got content
				var tmpRightCmpEnt = interpreter.getContentObj(f._cmdsToVars[cmd._args[1]._id]);
				//compare left and right results and store in the proper map
				if( tmpLeftCmpEnt.isEqual(tmpRightCmpEnt) ){
					compResMap[f._scope._id] = 0;
				} else {
					compResMap[f._scope._id] = tmpLeftCmpEnt.isLarger(tmpRightCmpEnt) ? 1 : -1;
				}
				//do not associate symbols with command (just like NOP, CMP
				//	never has any associations)
				doAssociateSymbWithCmd = false;
			break;
			case COMMAND_TYPE.BEQ.value:
			case COMMAND_TYPE.BNE.value:
			case COMMAND_TYPE.BGT.value:
			case COMMAND_TYPE.BGE.value:
			case COMMAND_TYPE.BLT.value:
			case COMMAND_TYPE.BLE.value:
				//BXX [comparison_command, where_to_jump_command]
				//ensure that there is comparison result for this scope
				if( !(f._scope._id in compResMap) ){
					//error
					throw new Error("runtime error: 483957238975893");
				}
				//get comparison result
				var tmpCmpRes = compResMap[f._scope._id];
				//depending on the jump type either perform a jump or skip
				var tmpDoJump = false;
				switch(cmd._type.value){
					case COMMAND_TYPE.BEQ.value:
						tmpDoJump = tmpCmpRes == 0;
					break;
					case COMMAND_TYPE.BNE.value:
						tmpDoJump = tmpCmpRes != 0;
					break;
					case COMMAND_TYPE.BGT.value:
						tmpDoJump = tmpCmpRes == 1;
					break;
					case COMMAND_TYPE.BGE.value:
						tmpDoJump = tmpCmpRes == 0 || tmpCmpRes == 1;
					break;
					case COMMAND_TYPE.BLT.value:
						tmpDoJump = tmpCmpRes == -1;
					break;
					case COMMAND_TYPE.BLE.value:
						tmpDoJump == tmpCmpRes == -1 || tmpCmpRes == 0;
					break;
				}
				//if need to jump
				if( tmpDoJump ){
					//get command where to jump
					var tmpJmpCmd = cmd._args[1];
					//set destination position where to jump
					nextPos = new position(
						tmpJmpCmd._blk._owner,	//scope
						tmpJmpCmd._blk,			//block
						tmpJmpCmd				//command
					);
					//if this is a condition scope
					if( f._scope._type == SCOPE_TYPE.CONDITION ){
						//for conditions, we need to know which branch (THEN or ELSE) we have taken
						//	this helps to determine which argument of PHI command to associate with
						//	the total value of PHI command. So assign a non-integer value (e.g. a
						//	string value) to the entry in 'compResMap'
						compResMap[f._scope._id] = "0";
					}	//end if it is a condition scope
				}	//end if need to jump
				//do not associate symbols
				doAssociateSymbWithCmd = false;
			break;
			case COMMAND_TYPE.BRA.value:
				//get command where to jump
				var tmpJmpCmd = cmd._args[0];
				//set destination position where to jump
				nextPos = new position(
					tmpJmpCmd._blk._owner,	//scope
					tmpJmpCmd._blk,			//block
					tmpJmpCmd				//command
				);
				//do not associate symbols
				doAssociateSymbWithCmd = false;
			break;
			case COMMAND_TYPE.RETURN.value:
				//format: RETURN [expCmd]
				//get scope representing function
				var tmpFuncScp = f._scope;
				//make sure that it is a function scope
				if( tmpFuncScp._funcDecl == null ){
					//error
					throw new Error("runtime error: 2439472385784758");
				}
				//make sure that there is a funcCall object for this function
				if( !(tmpFuncScp._funcDecl._id in f._funcsToFuncCalls) ){
					//error
					throw new Error("runtime error: 89573957853");
				}
				//find funcCall object for this function
				var tmpFuncCallObj = f._funcsToFuncCalls[tmpFuncScp._funcDecl._id];
				//get returned expression command
				var tmpRetExpCmd = cmd._args[0]._id;
				//ensure that there is an entity for returned command
				if( !(tmpRetExpCmd in f._cmdsToVars) ){
					//error
					throw new Error("runtime error: 7487284924989402");
				}
				//get entity for returned expression command
				var tmpRetExpEnt = f._cmdsToVars[tmpRetExpCmd];
				//ensure that type of returned expression matches
				//	function's return type
				if( tmpRetExpEnt._type.isEqual(tmpFuncScp._funcDecl._return_type) == false ){
					//****TODO: need to handle cases when interpreter can cast one type to another
					//	for example, integer to real, or boolean to text, etc ... (singeltons only)
					//error
					throw new Error("runtime error: function return type does not match type of returned expression");
				}
				//save returned expression inside funcCall object
				//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
				tmpFuncCallObj._returnVal = interpreter.getContentObj(tmpRetExpEnt);
				//quit this RUN instance
				return;
			//this BREAK is not reached
			break;
			case COMMAND_TYPE.LOAD.value:
				//get its only argument (ADDA command)
				var tmpAddaCmdId = cmd._args[0]._id;
				//if there is an entity for ADDA command
				if( tmpAddaCmdId in f._cmdsToVars ){
					//add entry to redirection map
					redirectCmdMapToEnt[cmd._id] = f._cmdsToVars[tmpAddaCmdId];
					//add entry to map command=>entity
					tmpCmdVal = f._cmdsToVars[tmpAddaCmdId];
				} else {
					//error
					throw new Error("runtime error: 3947284731847149817");
				}	//end if there is an entity for ADDA command
			break;
			case COMMAND_TYPE.STORE.value:
				//structure of STORE command is as follows:
				//	STORE [ADDA command] [stored EXPRESSION command]
				//get ADDA command id
				var tmpAddaCmdId = cmd._args[0]._id;
				//get EXPRESSION's command id
				var tmpStoredExpCmdId = cmd._args[1]._id;
				//get entity stored for ADDA command
				var tmpLeftSideEnt = f._cmdsToVars[tmpAddaCmdId];
				//make sure that what we got is not functinoid
				//	since we cannot assign value returned by function, i.e.
				//	call foo() = 123; <== error
				if( tmpLeftSideEnt.getTypeName() == RES_ENT_TYPE.FUNCTION ){
					//error
					throw new Error("runtime error: 4856765378657632");
				}	//end if assigning function's result (error case)
				//get entity for stored expression
				var tmpStoredExpEnt = f._cmdsToVars[tmpStoredExpCmdId];
				//make sure that assigned expression matches type of
				//	left side expression (represented by ADDA command)
				if( tmpLeftSideEnt._type.isEqual(tmpStoredExpEnt._type) == false ){
					//error
					throw new Error("runtime error: type mismatch in assigned expression");
				}
				//store extracted value in an entity
				//*** tmpLeftSideEnt can be either ENTITY or CONTENT. Can we act equally same for assigning value to a content or an entity?
				//*** should not we try to find an entity that represents this left side?
				//*** can we store entry inside array same way? what about tree entity? => no!!!
				tmpLeftSideEnt._value = tmpStoredExpEnt.getTypeName() == RES_ENT_TYPE.ENTITY ? tmpStoredExpEnt._value : tmpStoredExpEnt;
				//if left side is a content
				if( tmpLeftSideEnt.getTypeName() == RES_ENT_TYPE.CONTENT ){
					//reset value of content
					tmpLeftSideEnt._value = tmpLeftSideEnt._value._value;
				}
				//add value to map command=>entity
				tmpCmdVal = tmpStoredExpEnt;
			break;
			case COMMAND_TYPE.ADDA.value:
				//get command of left side of access operator ('.')
				var tmpLeftSideCmd = cmd._args[0];
				//get entity for left side's command
				var tmpLeftSideEnt = f._cmdsToVars[tmpLeftSideCmd._id];
				//get command or functinoid representing right side
				var tmpRightSideRef = cmd._args[1];
				//if handling access operator (i.e. '.'), then there must be
				//	a third argument (that can be either symbol or a null)
				if( cmd._args.length > 2 ){
					//get third (optional) argument that is used for non-method field
					//	to represent symbol for the right side
					var tmpRightSideSymb = cmd._args[2];
					//store value inside the map '_cmdsToVars', so that LOAD or STORE
					//	command could use field's of method's reference value:
					//	1. for data field => entity OR content
					//	2. for method field => functinoid
					//if this is a method field (i.e. third argument - symbol is null)
					if( tmpRightSideSymb == null ){
						//store functinoid for ADDA's value
						tmpCmdVal = tmpRightSideRef;	//functinoid reference
						//also store left side's entity for this ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpLeftSideEnt;
					} else {	//otherwise, it is a data field
						//get entity OR a content representing given field
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						tmpCmdVal = interpreter.getContentObj(tmpLeftSideEnt)._value[tmpRightSideSymb._name];
						//store extracted entity/content for ADDA command
						redirectCmdMapToEnt[cmd._id] = tmpCmdVal;
					}	//end if it is a method field
				} else {	//otherwise, must be handling collection (array or B+ tree)
					//get entity type's type
					var tmpObjType = tmpLeftSideEnt._type._type.value;
					//make sure that the right hand side is command
					if( tmpRightSideRef.getTypeName() != RES_ENT_TYPE.COMMAND ){
						//error
						throw new Error("runtime error: 547857847773412");
					}
					//also make sure that this command has been evaluated
					if( !(cmd._id in f._cmdsToVars) ){
						//error
						throw new Error("runtime error: 893578923578927 (id:" + cmd._id + " => type:" + cmd._type.value + ")");
					}
					//get content representing right side (it has to be a singelton)
					//check if it is an array
					if( tmpObjType == OBJ_TYPE.ARRAY.value ){
						//	right side => integer
						//get entity representing array index
						var tmpArrIdxEnt = f._cmdsToVars[tmpRightSideRef._id];
						//ensure thay array index is integer
						if( tmpArrIdxEnt._type._type.value != OBJ_TYPE.INT.value ){
							//error
							throw new Error("runtime error: 478374893573985");
						}
						//get index value
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						var tmpArrIdxVal = interpreter.getContentObj(tmpArrIdxEnt)._value;
						//make sure that index is not addressing outside of array
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						if( tmpArrIdxVal >= interpreter.getContentObj(tmpLeftSideEnt)._value.length ){
							//index addresses beyond array boundaries
							throw new Error("runtime error: index is addressing outside of array boundaries");
						}
						//save array entry for ADDA command
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						tmpCmdVal = interpreter.getContentObj(tmpLeftSideEnt)._value[tmpArrIdxVal];
					} else if( tmpObjType == OBJ_TYPE.BTREE.value ){	//if tree
						//	right side => text
						//get entity representing tree entry
						var tmpHashIdxEnt = f._cmdsToVars[tmpRightSideRef._id];
						//ensure thay tree entry is text
						if( tmpHashIdxEnt._type._type.value != OBJ_TYPE.TEXT.value ){
							//error
							throw new Error("runtime error: 8947385735829");
						}
						//get index value
						//ES 2016-08-07 (b_cmp_test_1): changed 'getContentObj' function to static
						var tmpHashIdxVal = interpreter.getContentObj(tmpHashIdxEnt)._value;
						//TODO: check if addressed hash entry is actually inside tree
						//TODO: need to create special class for trees (it has to be more complex then JS associative array, i.e. be able to get min/max values and possibly to sort)
						throw new Error("runtime error: tree is not implemented, yet");
					}	//end if it is an array
				}	//end if handling access operator
				//do not associate symbols with this command
				doAssociateSymbWithCmd = false;
			break;
		}	//end switch -- depending on the type of current command
		//if need to associate symbol(s) with this command
		if( doAssociateSymbWithCmd ){
			//associate entities with NULL command
			this.associateEntWithCmd(f, cmd, tmpCmdVal);
		}	//end if need to associate symbol(s) with this command
		//if there is a value
		//ES 2016-08-09 (b_cmp_test_1): remove condition that checks whether command
		//	was already present inside command-to-variable set or not
		//	This is important for loop iterations, when we pass thru 2-nd and greater
		//	loop iteration, and all command-to-variable entities already been inserted
		if( tmpCmdVal != null ){ //&& !(cmd._id in f._cmdsToVars) ){
			//store value (content or entity) for this command
			f._cmdsToVars[cmd._id] = tmpCmdVal;
		}	//end if there is a value
		//flag for loading variable in a new scope
		//ES 2016-08-06 (b_cmp_test_1): suppose that this variable is not used
		//var doLoadNewScope = false;
		//if 'nextPos' is still NULL, then we simply need to move to the
		//	next consequent command (if there is any)
		if( nextPos == null ){
			//try to get next consequent position
			nextPos = f.getNextPos();
			//make sure that there is a next position available
			if( nextPos == null ){
				//reached the end, so quit
				return;
			}	//end if -- make sure there is a next available position 
		}	//end if move to next consequent position
		//variable for keeping track of iterator
		var tmpIter = null;
		//this processed command must have been a jump command (conditional
		//	or unconditional) so check if this scope is a loop
		if( f._scope._type.value == SCOPE_TYPE.WHILE.value ||
			f._scope._type.value == SCOPE_TYPE.FOREACH.value ){
			//if jumping to the start of the loop
			if( nextPos._block.isEqual(f._scope._start) == true &&
				//make sure that we are jumping within the loop
				cmd._blk._owner.isEqual(f._scope) == true
			){
				//save iterator
				tmpIter = f._iter;
				//set flag to load loop's scope
			}	//end if jumping to the start of loop
		}	//end if this is a loop scope
		//check if need to load new scope
		if( //ES 2015-08-05 (b_cmp_test_1): suppose that 'doLoadNewScope' is not used
			//doLoadNewScope ||		//if jumping inside a loop
			//OR, if moving from one scope to another
			cmd._blk._owner.isEqual(nextPos._scope) == false
		){
			//check if frame for transitioning scope has been already created
			if( nextPos._scope._id in this._stackFrames &&
				//make sure that it is not the scope we are going to delete
				nextPos._scope._id != this._curFrame._scope._id ){
				//remove current frame from the stack
				delete this._stackFrames[this._curFrame._scope._id];
				//retrieve existing frame
				this._curFrame = this._stackFrames[nextPos._scope._id];
			} else {	//create new frame
				//create new frame
				this._curFrame = new frame(nextPos._scope);
				//load variables for this new scope
				this._curFrame.loadVariables(f);
				//check whether stack of frames has frame associated with this scope
				if( nextPos._scope._id in this._stackFrames ){
					//delete it
					delete this._stackFrames[nextPos._scope._id];
				}
				//add frame to the stack
				this._stackFrames[nextPos._scope._id] = this._curFrame;
				//import data (cmds-to-vars and symbs-to-vars) from parent frame
				this._curFrame.importVariables(f);
			}	//end if frame already exists
			//set frame variable (f)
			f = this._curFrame;
		}	//end if need to load new scope
		//move to the next command
		f._current = nextPos;
	} while (!this._doQuit);	//end loop to process commands in this frame
};	//end function 'run'