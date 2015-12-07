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

//get first/all entities with specified entity type
//input(s):
//	entType: (RES_ENT_TYPE) => type of entity to retrieve
//	doGetAll: (boolean) => should all entities with this type be retrieved
//output(s):
//	(Array<Parsing Object>) => entity/ies that was/were found in the result set
Results.prototype.get = function(entType, doGetAll){
	//initialize array of entities to be returned to the caller
	var val = [];
	//loop thru result set
	for( var i = 0; i < this.results.length; i++ ){
		//check that current entity is of specified type
		if( entType.value in this.results[i] ){
			//add item to the array
			val.push(this.results[i]);
			//if should not get all entities of specified type, then quit loop
			if( doGetAll == false ){
				break;
			}	//end if not get all entities
		}	//end if current entity of specified type
	}	//end loop thru result set
	//return found entity/ies of specified type
	return val;
};	//end function 'get' to get entity/ies of specified entity type

//create fast access failed result instance
var FAILED_RESULT = new Result(false, []);
