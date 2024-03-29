/**
	Developer:	Eduard Sedakov
	Date:		2015-10-01
	Description:	result returned by every parsing routine
	Used by:	(all parsing routines)
	Dependencies:	command, block, scope, symbol, function, type, res_ent_type
**/

//object is returned by parsing functions to determine whether function execute successfully,
//	and to transfer some information back to the caller (from callee)
//input(s):
//	success: (boolean) => did parsing function execute successfully?
//	results: (Array<hash<res_ent_type, object>>) => resulted output
//output(s): (none)
function Result(success, results) {
	this.success = success;	//success flag
	this.results = results;	//array of hash-maps, where each should contain one key-value pair
	//e.g. [{command, obj1},{block, obj2},{command, obj3},{scope, obj4},{scope, obj5}, ...]
};

//export given entity from this result set into the another specified result set
//input(s):
//	t: (RES_ENT_TYPE) => type of entity to export
//	r: (Result) => result set to import from given entity type
//	doAll: (boolean) => should all entities of this type to be imported
//output(s):
//	(Result) => this Result instance
Result.prototype.importEntity = function(t, r, doAll){
	//check that 'r' is result set
	if( !('results' in r) ){
		//this is not a result set
		throw new Error("7483462736748236");
	}
	//loop thru result set
	for( var i = 0; i < r.results.length; i++ ){
		//check that this element is of specified type
		if( t.value in r.results[i] ){
			//export this element into another result set
			this.addEntity(t, r.results[i][t.value]);
			//should export only single entity
			if( !doAll ){
				//quit loop
				break;
			}	//end if do single entity
		}	//end if this element contains specified type
	}	//end loop thru result set
	//return this Result instance
	return this;
};	//end function 'exporEntity'

//add entity to result set and return this RESULT object
//input(s):
//	t: (RES_ENT_TYPE) => type of entity to add
//	v: (parsing object) => object to be added, descriped by specified type (t)
//output(s):
//	(Result) => this Result instance
Result.prototype.addEntity = function(t, v){
	//store command for this variable or array/tree element
	var tmpEnt = {};
	tmpEnt[t.value] = v;
	//add hashmap to Result's results array
	this.results.push(tmpEnt);
	//return this Result instance
	return this;
};	//end function 'addEntity'

//remove all entities of specified type
//input(s):
//	t: (RES_ENT_TYPE) => type of entity to be removed from result set
//output(s):
//	(Result) => this Result instance
Result.prototype.removeAllEntitiesOfGivenType = function(t){
	//loop thru result set
	for( var i = 0; i < this.results.length; i++ ){
		//check if current element specifies given type
		if( t.value in this.results[i] ){
			//delete this element from the array
			this.results.splice(i, 1);
		}	//end if current element has given type
	}	//end loop thru result set
	//return this Result instance
	return this;
};	//end function 'removeAllEntitiesOfGivenType'

//check if entity is specified in the result set
//input(s):
//	t: (RES_ENT_TYPE) => type of entity to be checked
//output(s):
//	(boolean) => is the given entity represented in result set
Result.prototype.isEntity = function(t){
	//loop thru result set
	for( var i = 0; i < this.results.length; i++ ){
		//check if current element specifies given type
		if( t.value in this.results[i] ){
			//given type is represented in result set
			return true;
		}	//end if current element has given type
	}	//end loop thru result set
	//given entity type is not represented in result set
	return false;
};	//end function 'isEntity'

//get first/all entities with specified entity type
//input(s):
//	entType: (RES_ENT_TYPE) => type of entity to retrieve
//	doGetAll: (boolean) => should all entities with this type be retrieved
//output(s):
//	(Array<Parsing Object>) => entity/ies that was/were found in the result set
Result.prototype.get = function(entType, doGetAll){
	//initialize array of entities to be returned to the caller
	var val = [];
	//loop thru result set
	for( var i = 0; i < this.results.length; i++ ){
		//check that current entity is of specified type
		if( entType.value in this.results[i] ){
			//add item to the array
			val.push(this.results[i][entType.value]);
			//if should not get all entities of specified type, then quit loop
			if( doGetAll == false ){
				break;
			}	//end if not get all entities
		}	//end if current entity of specified type
	}	//end loop thru result set
	//return found entity/ies of specified type
	return doGetAll ? val : (val.length > 0 ? val[0] : null);
};	//end function 'get' to get entity/ies of specified entity type

//create fast access failed result instance
var FAILED_RESULT = new Result(false, []);
