/**	Developer:	Eduard Sedakov	Date:		2016-01-24	Description:	interpreting object that represents a entity	Used by: frame, {interpreter}	Depends on:	POSITION, CONTENT, {lexer}, {preprocessor}, {parser}, {logical tree}**///==========globals:==========//unique identifier used by entityentity.__nextId = 1;//reference to the interpreterentity.__interp = null;//==========statics:==========//reset static data members//input(s): (none)//output(s): (none)entity.reset = function() {	entity.__nextId = 1;	//set to first available integer	entity.__interp = null;	//set to null};//static calls:entity.reset();//class "entity" declaration://class describes single entity (variable, array, or tree) of any type//input(s)://	s: (symbol) symbol that represents entity in CFG//	f: (frame) reference to the frame where this entity is created//	c: (command) (optional) initialization command (if any)//	p: (entity) parent entity//output(s): (none)function entity(s, f, c, p) {	//assign id	this._id = entity.__nextId++;	//set owning frame	this._frame = f;	//set associated symbol for this entity	this._symbol = s;	//reference type of symbol	this._type = s._type;	//check if 'c' was not passed in	if( typeof c == "undefined" ){		//set command 'c' to NULL		c = null;	}	//setup a value	this._value = this.instantiateType(this._type, c, f);	//initialize to NULLs remaining fields	this._funcRef = null;	//set if this is a function argument	this._objRef = null;	//set if this is an object field	this._ownerRef = null;	// 	//get scope where this symbol is defined	var tmpScope = s._scope;	//if this is a function scope	switch( tmpScope._type ){		case SCOPE_TYPE.FUNCTION:			//determine if there is an argument with symbol's name			var tmpArg = tmpScope._funcDecl.getArg(s._name, s._type);			//set '_funcRef' to functinoid if this is an argument			this._funcRef = tmpArg != null ? tmpScope._funcDecl : null;			break;		case SCOPE_TYPE.OBJECT:			//if given entity is a field of type			if( s._name in tmpScope._typeDecl._fields ){				//set '_objRef' to point at this object's definition				this._objRef = tmpScope._typeDecl;				//if parent entity is given				if( typeof p != "undefined" && p != null ){					this._ownerRef = p;				}			}	//end if entity is a type's field			break;	}	//end if it is a function scope};	//end constructor for 'entity'//convert current entity to string representation//input(s): (none)//output(s)://	(string) => text representationentity.prototype.toString = function(){	//e.g. type._name / symbol._name : { RECURSIVELY<_value> } end symbol._name	var txt = this._type._name + " / " + this._symbol._name + " : {";	//if this entity represent singleton	if( this._type._type != OBJ_TYPE.CUSTOM.value ){		//then, '_value' is represented as CONTENT		txt += this._value.toString();	} else {	//otherwise, it is not a singleton		//loop thru set of fields		for( var tmpFieldName in this._value ){			//add text representation to the collection			txt += this._value[tmpFieldName].toString();		}	//end loop thru set of fields	}	//end if entity is a singleton	return txt + "} end " + this._symbol._name;};	//end function 'toString'//instantiate given type entity//input(s)://	t: (type) type to be instantiated//	c: (command) initialization command for this type (if it is a field)//	f: (frame) reference to the frame where given type entity is created//output(s)://	HashMap<fieldName, JS Object> => map that collects values and associated//		field names for the specified typeentity.prototype.instantiateType = function(t, c, f){	//initialize variable that keeps value of NULL command (if 'c' is a NULL command)	var nullCmdVal = null;	//if 'c' is a NULL command	if( c != null && c._type == COMMAND_TYPE.NULL ){		//make sure that this is a value		if( c._args[0].getTypeName() == RES_ENT_TYPE.VALUE ){			//return actual JS object from the value			return new content(t, c._args[0]._value);		}	//end if this is a value	}	//end if 'c' is a NULL command	//if 'c' is an EXTERNAL command	if( c != null && c._type == COMMAND_TYPE.EXTERNAL ){		//check if type describes an array		if( t._type.value == OBJ_TYPE.ARRAY.value ){			return new content(t, []);		} else if ( t._type.value == OBJ_TYPE.BTREE.value ){			return new content(				t,				new Btree(					entity.__interp,				//reference to the interpeter					t._templateNameArray[0].type,	//key type					t._templateNameArray[1].type	//val type				)			);		} else if ( t._type.value == OBJ_TYPE.DRAWING.value ){			return new content(				t,				new drawing()			);		}	//end if it is an array	}	//end if it is an external command	//check if this is a singleton type if no command for initialization is given	switch( t._type.value ){		case OBJ_TYPE.INT.value:			return new content(t, 0);		case OBJ_TYPE.REAL.value:			return new content(t, 0.0);		case OBJ_TYPE.TEXT.value:			return new content(t, "");		case OBJ_TYPE.BOOL.value:			return new content(t, false);		case OBJ_TYPE.ARRAY.value:			return new content(t, []);		case OBJ_TYPE.BTREE.value:			//make sure that type has two templates			if( t._templateNameArray.length != 2 ){				//error				throw new Error("tree type must have exactly two templates");			}			//construct tree object inside content and then return content			return new content(				t,				new Btree(					entity.__interp,				//reference to the interpeter					t._templateNameArray[0].type,	//key type					t._templateNameArray[1].type	//val type				)			);		case OBJ_TYPE.DRAWING.value:			return new content(t, new drawing());		case OBJ_TYPE.VOID.value:			throw new Error("runtime error: cannot instantiate VOID type");	}	//end switch to determine if this is a singleton type	//create a field set	var tmpFieldSet = {};	//loop thru fields of given type	for( var tmpFieldName in t._fields ){		//get field's type		var tmpFieldType = t._fields[tmpFieldName].type;		//initialize variable for keeping content for this field		var tmpContent = null;		//if this is not a singelton type		if( tmpFieldType._type.value == OBJ_TYPE.CUSTOM.value ){			//get this type's scope			var tmpFieldTypeScope = tmpFieldType._scope;			//get a symbol from type's scope			var tmpSymbol = tmpFieldTypeScope._symbols[tmpFieldName];			//make sure that symbol was found			if( typeof tmpSymbol == "undefined" || tmpSymbol == null ){				throw new Error("runtime error: 437856357825");			}			//construct entity for this type			tmpContent = new entity(				tmpSymbol,	//field's symbol				f,			//current frame				null,		//no initializing command				this		//parent entity			);		} else {	///if a singleton type, then construct a field			//get command that initializes this field			var tmpFieldCmd = t._fields[tmpFieldName].cmd;			//recursively process this current field type			tmpContent = this.instantiateType(tmpFieldType, tmpFieldCmd, f);		}		//add content to the instantiated type		tmpFieldSet[tmpFieldName] = tmpContent;	}	//end loop thru type fields	//return resulting field set	return new content(t, tmpFieldSet);};	//end function 'instantiateType'//get type name of this object (i.e. entity)//input(s): (none)//output(s)://	(RES_ENT_TYPE) => type of objectentity.prototype.getTypeName =	function() {	return RES_ENT_TYPE.ENTITY;};//compare with another entity comprehensively, i.e. by comparing each field//input(s)://	anotherEntity: (entity) entity to compare against//output(s)://	(boolean) => {true} if this entity is equal to {anotherEntity}; //				 {false} if they are not equalentity.prototype.isEqual =	function(anotherEntity) {	//make sure that {anotherEntity} is not null, so we can compare	if( typeof anotherEntity != "object" || anotherEntity !== null ) {		//if reached this point, then two objects are either of different		//	type or anotherEntity is null		return false;	}	//ensure that {this} is of the same type as {anotherEntity}	if( this.getTypeName() != anotherEntity.getTypeName() ) {		return false;	}	//ensure that two entities have the same type	if( this._type != anotherEntity._type ){		return false;	}	//check if entity is singleton	if( this._type._type.value != OBJ_TYPE.CUSTOM.value ){		//ensure that the value is inside CONTENT class		if( this._value.getTypeName() != RES_ENT_TYPE.CONTENT ||			anotherEntity.getTypeName() != RES_ENT_TYPE.CONTENT ){			return false;		}		//compare contents		return this._value.isEqual(anotherEntity._value);	}	//loop thru fields of this entity	for( var tmpFieldName in this._value ){		//sanity check: ensure that this field is present in another entity		if( !(tmpFieldName in anotherEntity._value) ){			return false;		}		//if two fields are not the same		if( this._value.isEqual(anotherEntity._value) == false ){			return false;		}	}	//end loop thru fields of this entity	//if we reached this point, then two entities are the same	return true;};	//end function 'isEqual'