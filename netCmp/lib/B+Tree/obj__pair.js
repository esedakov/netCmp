/**
	Developer:	Eduard Sedakov
	Date:		2016-03-19
	Description:	B+ node
	Used by: obj__B+_node.js
	Depends on:	(none)
**/

//class pair for representing key-value pair
//input(s):
//	key: (js object) => key
//	val: (js object) => value
function pair(key, val){
	//store key and value
	this._key = key;
	this._val = val;
};	//end constructor 'pair'