/**
	Developer:	Eduard Sedakov
	Date:		2016-01-24
	Description:	interpreting object that represents a variable
	Used by: frame, {interpreter}
	Depends on:	{lexer}, {preprocessor}, {parser}, {logical tree}
**/

//==========globals:==========

//unique identifier used by entity
content.__nextId = 1;

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
content.reset = function() {
	content.__nextId = 1;	//set to first available integer
};

//static calls:
content.reset();

//class "content" declaration:
//class describes content of interpreting entity (variable, array, or tree)
//input(s):
//	t: (type) parsing object describing type
//	v: (JS object) value representing content
//output(s): (none)
function content(t, v){
	//assign id
	this._id = content.__nextId++;
	//type
	this._type = t;
	//value
	this._value = v;
};	//end constructor for 'content'

//convert current content to string representation
//input(s): (none)
//output(s):
//	(string) => text representation
content.prototype.toString = function(){
	//e.g. CONTENT[integer / 1]
	//ES 2016-08-13 (b_cmp_test_1): remove older text representation of CONTENT
	//return "CONTENT[" + this._type._name + " / " + this._value + "]";
	//ES 2016-08-13 (b_cmp_test_1): start text representation of content with its type
	var txt = "[" + this._type._name + "]:";
	//ES 2016-08-13 (b_cmp_test_1): if this entity represent singleton
	if( this._type._type != OBJ_TYPE.CUSTOM.value ){
		//then, '_value' is represented as CONTENT
		txt += this._value.toString();
	} else {	//ES 2016-08-13 (b_cmp_test_1): otherwise, it is not a singleton
		//surround set of fields with '{' and '}'
		txt += "{";
		//loop thru set of fields
		for( var tmpFieldName in this._value ){
			//add text representation to the collection
			//add trailing comma at the end
			txt += this._value[tmpFieldName].toString() + ",";
		}	//end loop thru set of fields
		//surround set of fields with '{' and '}'
		txt += "}";
	}	//ES 2016-08-13 (b_cmp_test_1): end if entity is a singleton
	//ES 2016-08-13 (b_cmp_test_1): re-formulate text output, see comment above
	return txt;
};	//end function 'toString'

//get type name of this object (i.e. content)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
content.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.CONTENT;
};

//compare with another content by comparing JS object (contained in '_value')
//input(s):
//	anotherContent: (content) content to compare against
//output(s):
//	(boolean) => {true} if this content is equal to {anotherContent};
//				 {false} if they are not equal
content.prototype.isEqual =
	function(anotherContent) {
	//make sure that {anotherContent} is not null, so we can compare
	if( anotherContent !== null ) {
		//ensure that {this} is of the same type as {anotherContent}
		if( this.getTypeName() == anotherContent.getTypeName() &&
			//make sure that two contents represent JS object of the same type
			this._type == anotherContent._type
		) {
			//compare values
			//ES 2016-09-27 (b_libs_1): check if value has 'isEqual' method
			if( this._value.isEqual === "function" ){
				//call 'isEqual' instead
				return this._value.isEqual(anotherContent._value);
			} else {	//ES 2016-09-27 (b_libs_1): (original case): if no 'isEqual'
				//ES 2016-09-27 (b_libs_1): Comments only: simply rely on '=='
				return this._value == anotherContent._value;
			}
		}	//end if two contents have same type
	}	//end if another content is not null
	//if reached this point, then two objects are either of different 
	//	type or anotherContent is null
	return false;
};	//end function 'isEqual'

//ES 2016-08-08 (b_cmp_test_1): determine which value (this or another) larger
//	anotherContent: (content) content to compare with
//output(s):
//	(boolean) => {true} if this content is larger then another; {false} otherwise
content.prototype.isLarger =
	function(anotherContent) {
	//make sure that {anotherContent} is not null, so we can compare
	if( anotherContent !== null ) {
		//ensure that {this} is of the same type as {anotherContent}
		if( this.getTypeName() == anotherContent.getTypeName() &&
			//make sure that two contents represent JS object of the same type
			this._type == anotherContent._type
		) {
			//compare values
			return this._value > anotherContent._value;
		} else {	//not matching types == error
			throw new Error("runtime error: 347385275957852");
		}	//end if two contents have same type
	}	//end if another content is not null
	//another is NULL, so this is larger
	return true;
};	//end function 'isEqual'