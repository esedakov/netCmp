/**
	Developer:	Eduard Sedakov
	Date:		2016-03-19
	Description:	available set of B+ tree node types
	Used by:	B+ tree node
	Dependencies:	(none)
**/

var BTREE_NODE_TYPE = {
	NODE = {value: 0, name: "B+ node (not root, and not leaf)"},
	ROOT = {value: 1, name: "B+ root node"},
	LEAF = {value: 2, name: "B+ leaf node"}
};