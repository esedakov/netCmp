/**
	Developer:	Eduard Sedakov
	Date:		2015-12-25
	Description:	logical tree node
	Used by:		{logical tree}, {parsing}
	Dependencies:	type__log_node (logical node), type__log_op (logical operation)
**/

//==========globals:==========

//unique identifier used by logic node
LTnode.__nextId = 1;

//==========statics:==========

//reset static data members for the logic tree node
//input(s): (none)
//output(s): (none)
LTnode.reset = function() {
	LTnode.__nextId = 1;		//set to first available integer
};

// 	LTNode (logical tree node) - depending on the type does different work:
//	1. if terminal: node represents single condition term that interacts with other
//					terms via logical operators (i.e. && or ||). Such term may
//					include pre-processing code, comparison, and conditional jump:
//					+-->R: add S, T	<-----+
//	 pre-processing |	U: mul R, '1'     |
//					+-->V: sub U, W       | logical tree node
//		 comparison --->X: cmp V, '0'     |
//			   jump --->Y: beq X, Z <-----+
//	2. if non-terminal: node represents a junction between terminal and/or non-
//						-terminal nodes.
//						[nt]
//                     /    \
//					 [t]   [nt]
//						  /    \
//						[t]    [t]
//	where
//		nt: non-terminal node
//		t: terminal node
//input(s):
//	startCmd: (command) command that computes arguments required for comparison
//						of the given jump instruction
//	jmpCmd: (command) command representing jump (first argument of which has to
//					  point at the comparison command, just like in the diagram
//					  above (but target 'Z' is skipped, since not known)
//	nodeType: (LOG_NODE_TYPE) type of the node: root, non-terminal, or terminal
//	parent: (LTnode) other node that has this one among its children
//	connection: (LOGIC_OP) type of logical connection between nodes: AND or OR
//output(s): (none)
function LTnode(startCmd, jmpCmd, nodeType, parent, connection) {
	this._id = LTnode.__nextId++;		//assign node identifier
	this._type = nodeType;			//type of the node: root, non-terminal, or terminal
	//three next members are used exclusively by terminal node, other node types should
	//set them to NULLs
	this._startCmd = startCmd;		//starting command of the block that computes arguments
									//comparison of the given jump instruction
	this._jmpCmd = jmpCmd;			//keep reference to the jump command
	this._parent = parent;			//who owns this (logical tree) node (if this node is root,
									//then parent is NULL)
	this._children = [];				//if this is a root or non-terminal then it has its children
									//nodes (however, for terminal there are no children)
	this._con = connection;			//type of logical connection: AND or OR
									//it is used by root or non-terminal, but not by terminal
	//next two members are used exclusively by root node
	this._successCmd = null;		//if condition succeeds, then it jumps to this command
									//	if-then-else: successCmd=>then;
									//	while-loop: successCmd=>next iteration
	this._failureCmd = null;		//if condition fails, then it jumps to this command
									//	if-then-else: failureCmd=>else or elseif;
									//	while-loop: failureCmd=>quit loop
	if( this._jmpCmd != null ){
		this._cmpCmd =				//the first argument of jump instruction has to be
			jmpCmd._args[0];		//comparison command
		//make sure that right now jump address is not known, i.e. second argument
		//of the jump (target 'Z') should not be inside the jump command
		if( this._jmpCmd._args.length != 1 ){
			throw new Error("jump command should not know target at the time of logTree construction");
		}
	}
};	//end constructor

//functions of LTnode class

//check if two symbols are equal (only id comparison)
//input(s):
//	node1: (LTnode) instance # 1 of logical node
//	node2: (LTnode) instance # 2 of logical node
//output(s): 
//	(boolean) => are two logical nodes equal to each other (only id comparison)
LTnode.prototype.isEqual =
	function(anotherNode) {
	return this._id == anotherNode._id;
};	//end function 'isEqual'

//convert object to string representation
//input(s): nothing
//return(s): 
//	(string) => string representation of this object
LTNode.prototype.toString =
	function() {
	var res = "<";
	//depending on the type of the logical node, do
	switch(this._type){
		case LOG_NODE_TYPE.ROOT:
			res += "root: " +
				   "id= " + this._id + 
				   ", parent= null" +
				   ", connection= " + this._con.name +
				   ", success= " + this._successCmd.toString() +
				   ", failure= " + this._failureCmd.toString();
			break;
		case LOG_NODE_TYPE.NON_TERMINAL:
			res += "nt: " +
				   "id= " + this._id +
				   ", parent= " + this._parent._id +
				   ", connection= " + this._con.name;
			break;
		case LOG_NODE_TYPE.TERMINAL:
			res += "t: " +
				   "id= " + this._id +
				   ", parent= " + this._parent._id +
				   ", cmp= " + this._cmpCmd.toString() +
				   ", jmp= " + this._jmpCmd.toString();
			break;
	}
	//loop thru children nodes and add to string their IDs (of course if the node is
	//a terminal, then it will not have any children
	res += ", children= [";
	var i = 0;
	for( i = 0; i < this._children.length; i++ ){
		res += (i > 0 ? ", " : "") + this._children[i].id;
	}
	return res + "] >";
};	//end function 'toString'

//add a child to this node (this node has to be either non-terminal or root)
//input(s):
//	child: (LTNode) child node (terminal OR non-terminal, cannot be root)
//output(s): 
//	(Boolean) => success or failure
LTNode.prototype.addChild =
	function(child){
	//check that this node is NOT terminal
	if( this._type == LOG_NODE_TYPE.TERMINAL ){
		//if it is terminal, then fail
		return false;
	}
	//make sure that child does not have any parent already set
	if( child._parent != null ){
		//if there is existing parent, then fail
		return false;
	}
	//modify child's data
	child._parent = this;
	//modify parent's data
	this._children.push(child);
};	//end function 'addChild'