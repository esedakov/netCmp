/**
	Developer:	Eduard Sedakov
	Date:		2015-12-25
	Description:	logical tree for processing boolean expressions and finalizing
					jump instructions (i.e. assigning destinations for jump mnemonics)
	Used by:		{parsing}
	Dependencies:	(logical node), block, command
**/

//class logical tree maintains collection of nodes in the form of
//acyclic non-directed graph. It is used for determining targets of
//the jump instructions inside logical conditions (used in loops,
//if-then-else clauses, and other expressions/statements)
//When a logical expression needs to be parsed, we first generate
//these tree by iteratively constructing its nodes in the bottom-up
//manner (from terminals to the root) and then perform the second
//phase, during which we use DFS (depth-first-search) to traverse
//resulting tree and assign targets for all jump instructions in
//the terminals of this tree.
//input(s): (none)
//output(s): (none)
function LTree(){
	this._rootNode = null;		//reference to the root of tree (determined at
								//the time of tree processing- second phase)
	this._nodes = [];			//list of logical tree nodes (of all types)
	this._terminalNodes = [];	//list of logical tree terminal nodes
};	//end constructor

//clear out all fields of logical tree after processing of a tree
//input(s): (none)
//output(s): (none)
LTree.prototype.clear =
	function(){
	//reset fields of logical tree
	this._rootNode = null;
	this._nodes = [];
	this._terminalNodes = [];
};

//add terminal node to the logical tree
//					+-->R: add S, T	<-----+	<= starting command
//	 pre-processing |	U: mul R, '1'     |
//					+-->V: sub U, W       | logical tree node
//		 comparison --->X: cmp V, '0'     |
//			   jump --->Y: beq X, Z <-----+	<= jump command
//
//input(s):
//	jumpCmd: (command) jump instruction
//	parentNonTerminalNode: (LTNode) logical node that should own newly created
//						   terminal node
//output(s): 
//	(LTNode) => created terminal node
LTree.prototype.addTerminal =
	function(jumpCmd, parentNonTerminalNode){
	//create terminal node
	var node = new LTNode(
		jumpCmd, 				//jump mnemonic
		LOG_NODE_TYPE.TERMINAL, //terminal type of node
		parentNonTerminalNode, 	//parent if any
		null 					//not a terminal, so no connection type
	);
	//add to the list of nodes
	this._nodes.push(node);
	//add to list of terminal nodes
	this._terminalNodes.push(node);
	//return terminal
	return node;
};	//end function 'addTerminal'

//create non-terminal node
//input(s):
//	logicConnectionType: (LOGIC_OP) type of connection between nodes: AND or OR
//	parentNonTerminalNode: (LTNode) logical node that should own newly created
//						   non-terminal node
//output(s): 
//	(LTNode) => created non-terminal node
LTree.prototype.addNonTerminal =
	function(logicConnectionType, parentNonTerminalNode){
	//create non-terminal node
	var node = new LTNode(
		null, 						//no jump mnemonic (this is either AND or OR operator)
		LOG_NODE_TYPE.NON_TERMINAL, //type of node
		parentNonTerminalNode,		//parent node
		logicConnectionType			//type of connection (AND or OR)
	);
	//add to the list of nodes
	this._nodes.push(node);
	//return non-terminal
	return node;
};	//end function 'addNonTerminal'

//process tree
//input(s):
//	successCommand: (Command) goto this command upon success of an entire logical tree
//	failureCommand: (Command) goto this command upon failure of an entire logical tree
//output(s): (none)
LTree.prototype.process =
	function(successCommand, failureCommand){
	//make sure that root is nulled whenever this 
	this._rootNode = null;
	//initialize index for scanning thru nodes
	var i = 0;
	//determine root node by scanning thru the list of nodes
	for( i = 0; i < this._nodes.length ; i++ ){
		//if the node does not have parent, then it is root
		if( this._nodes[i]._parent == null && 
			this._nodes[i]._type == LOG_NODE_TYPE.NON_TERMINAL ){
			//set root of logical tree
			this._rootNode = this._nodes[i];
			//set type to be ROOT, right now it is non-terminal
			this._rootNode._type = LOG_NODE_TYPE.ROOT;
			//quit loop, since found root
			break;
		}	//end if this is a root
	}	//end loop thru nodes to find root node
	//check if root was not found
	if( this._rootNode == null ){
		//check that in this case there is only 1 terminal node in the
		//	entire logical tree (any other case, would be a error)
		if( this._nodes.length != 1 && 
			this._nodes[0]._type == LOG_NODE_TYPE.TERMINAL ){
			//there is either more then 1 node in a tree OR single node
			//inside tree is not terminal
			throw new Error("root node was not found");
		}
		//create root node (as non-terminal)
		this._rootNode = this.addNonTerminal(LOGIC_OP.OR, null);
		//change node type from non-terminal to root
		this._rootNode._type = LOG_NODE_TYPE.ROOT;
		//connect terminal to newly created root node
		this._rootNode.addChild(this._nodes[0]);
	}
	//set special root's data-members (exclusive for root node)
	this._rootNode._successCmd = successCommand;
	this._rootNode._failureCmd = failureCommand;
	//initialize index for looping thru terminal nodes
	var j = 0;
	//loop thru and process terminal nodes
	for( ; j < this._terminalNodes.length; j++ ){
		//determine information about currently iterated terminal node
		var jump_info = this.detJumpInfo(this._terminalNodes[j]);
		var fallingTarget = null;
		var jumpTarget = null;
		//if jump instruction needs to be inverted, then
		if( jump_info._invert ){
			//try to invert (jump) command if it is possible
			if( this.invertJump(this._terminalNodes[j]._jmpCmd) == false ){
				//not invertible or not even jump instruction
				throw new Error("non-invertible command in place of jump instruction");
			}
			//set where should jump land (it is inverted, so set failure as primary
			//	jump target)
			jumpTarget = jump_info._failure;
			//because jump command is inverted, its target is also inverted => failure
			//	add to jump command appropriate target
			this._terminalNodes[j]._jmpCmd._args.push(jumpTarget);
			//set target that should be executed if conditional-jump is not 
			//	taken (i.e. if jump instruction is not executed)
			fallingTarget = jump_info._success;
		} else {	//else if instruction need not be inverted
			//set where should jump land
			jumpTarget = jump_info._success;
			//add to jump command appropriate target
			this._terminalNodes[j]._jmpCmd._args.push(jumpTarget);
			//set target that should be executed if conditional-jump is falling thru
			fallingTarget = jump_info._failure;
		}	//end if instruction needs to be inverted
		//connect blocks appropriately
		//set direct connection
		//ES 2016-08-26 (b_log_cond_test): falling target can be either command or LTnode
		//	so, we need generalized way of extracting BLOCK information from variable
		this.setDirectFall(this._terminalNodes[j]._jmpCmd._blk, this.getBlock(fallingTarget));
		//set jump connection
		//ES 2016-08-26 (b_log_cond_test): falling target can be either command or LTnode
		//	so, we need generalized way of extracting BLOCK information from variable
		this.setJump(this._terminalNodes[j]._jmpCmd._blk, this.getBlock(jumpTarget));
	}	//end loop thru terminal nodes
};	//end function 'process'

//ES 2016-08-26 (b_log_cond_test): get block
//input(s):
//	e:	1. (command)
//		2. (LTNode)
//output(s):
//	(block) => block to which this command or terminal node belongs to
//	(null) => if it is niether command nor terminal node
LTree.prototype.getBlock = function(e){
	//if this is command
	if( '_blk' in e && e.getTypeName() == RES_ENT_TYPE.COMMAND ){
		return e._blk;
	}
	//otherwise, it is tree node
	//if this is not terminal node
	if( e._type != LOG_NODE_TYPE.TERMINAL ){
		//fail
		throw new Error("493582579827595875452");
	}
	//return block of comparison command
	return e._cmpCmd._blk;
};	//ES 2016-08-26 (b_log_cond_test): end method 'getBlock'

//set direct connection between blocks owning two given commands
//input(s):
//	sourceCmd: (block) transfer control flow from this command
//	destCmd: (block) transfer control flow to this command
//output(s): (none)
LTree.prototype.setDirectFall =
	function(sourceBlk, destBlk){
	//check if it is possible to create a direct fall connection
	if( sourceBlk == destBlk ){
		throw new Error("inter-block control transfer should be done between different blocks");
	}
	//make direct connection
	block.connectBlocks(
		sourceBlk,
		destBlk,
		B2B.FALL
	);
};	//end function 'setDirectFall'

//set jump connection between blocks owning two commands
//input(s):
//	sourceCmd: (block) jump from this command
//	destCmd: (block) jump to this command
//output(s): (none)
LTree.prototype.setJump =
	function(sourceBlk, destBlk){
	//check if it is possible to create jump connection
	if( sourceBlk == destBlk ){
		throw new Error("jump source and destination should belong to different blocks");
	}
	//make connection
	block.connectBlocks(
		sourceBlk,
		destBlk,
		B2B.JUMP
	);
};	//end function 'setJump'

//store information about jump instruction
//input(s):
//	shouldInvert: (boolean) should jump instruction be inverted, e.g. 
//		BEQ => BNE or BLT => BGE, etc...
//	inCaseOfSuccessJumpToThisBlk: (block) jump target in the case of
//		comparison condition success
//	inCaseOfFailureJumpToThisBlk: (block) jump target in the case of
//		comparison condition failure
//output(s): (none)
function jumpInfo(shouldInvert, inCaseOfSuccessJumpToThisBlk, inCaseOfFailureJumpToThisBlk){
	this._invert = shouldInvert;
	this._success = inCaseOfSuccessJumpToThisBlk;
	this._failure = inCaseOfFailureJumpToThisBlk;
};	//end 'jumpInfo'

//determine jump information for the given terminal node
//input(s):
//	terminalNode: (LTNode) terminal node in question
//output(s): 
//	(jumpInfo) => information for the jump instruction stored in the given terminal node
LTree.prototype.detJumpInfo =
	function(terminalNode){
	//get reference to the parent of the given terminal node
	var parentNode = terminalNode._parent;
	//determine position of the terminal node inside its parent's children array
	var terminalIndex = indexOfElement(parentNode._children, terminalNode);
	//check whether terminal node was found
	if( terminalIndex >= parentNode._children.length ){
		//raise error, since given terminal node has to be child of its own parent
		throw new Error("LTree is corrupt: parent does not contain child, while child reference parent");
	}
	//determine if the terminal node is the last in the array of children inside parent node
	var isLast = (parentNode._children.length - 1) == terminalIndex;
	//should the jump instruction be inverted?
	var shouldInvert = false;
	if(
		(parentNode._con == LOGIC_OP.AND && isLast == false) ||
		(parentNode._con == LOGIC_OP.OR && isLast == true)
	){
		shouldInvert = true;
	}
	//compose jump information
	return new jumpInfo(

		//should jump instruction be inverted
		shouldInvert,
		
		//comparison case is success
		this.nextJumpTarget(parentNode, true, isLast, terminalIndex),
		
		//comparison case is failure
		this.nextJumpTarget(parentNode, false, isLast, terminalIndex)
	);
};	//end function 'detJumpInfo'

//recursively determine next jump target
//input(s):
//	currentNode: (LTNode) node to consider at the current iteration
//	isSuccess: (boolean) is comparison condition considered to yield success (value
//			   => true) or failure (value => false)
//	isLast: is terminal node considered inside detJumpInfo last or not
//	prevIndex: (integer) index of the node from the previous iteration (level below)
//output(s):
//	(Block) => block to which control flow needs to be forwarded given
//		input conditions
LTree.prototype.nextJumpTarget =
	function(currentNode, isSuccess, isLast, prevIndex){
	//depending on the type of non-terminal junction (AND or OR)
	//	determine destination of jump instruction
	switch(currentNode._con){
	case LOGIC_OP.AND:		//logical operation AND
		//if comparison yields success, then evaluate next comparison in AND condition
		if( isSuccess ){
			//if the terminal node last, then we do not have next comparison, so we
			//	have to consult with the level above us to determine where to jump
			if( isLast ){
				//if current node is root, then there is no level above to consult with
				if( currentNode._type == LOG_NODE_TYPE.ROOT ){
					//if root, then take success case
					return currentNode._successCmd;
				} else {	//if there is level above, then consult with it
					//determine index of this node in its parent's children array
					var index = indexOfElement(currentNode._parent._children, currentNode);
					//is this node last in the parent's children array
					var last = (currentNode._parent._children.length - 1) == index;
					//let parent determine where should jump land
					return this.nextJumpTarget(
							currentNode._parent,	//parent of this node
							isSuccess,				//are we considering success case
							last,					//is last in parent
							index 					//index of this node in parent
					);
				}	//end if node is root
			} else {	//else this is not a last node
				//find the left most node in the next branch
				//             ...
				//            /
				//          AND  <- this is current node
				//         /   \
				//      AND     AND
				//     / | \   / | \
				//     X Y Z   K L M
				//         ^
				//         |
				//         this a terminal processed in the prior iteration
				//  So success destination for jump instruction 'Z' should be
				//	jump instruction 'K', which is the left-most in the next
				//	branch (i.e. AND instruction) relative to the one from
				//	where we came from.
				return this.leftMostTerminal(
						//need to find jump instruction 'K' in the next 
						currentNode._children[prevIndex + 1]
				);
			}
		} else {	//if it is a failure case, then consult with level above
			//if current node is root, then there is no level above
			if( currentNode._type == LOG_NODE_TYPE.ROOT ){
				//if root, then take ELSE case
				return currentNode._failureCmd;
			} else {	//if it is not a root
				//determine index of this node in the parent's children array
				var index = indexOfElement(currentNode._parent._children, currentNode);
				//is this a last node in the parent's children array
				var last = (currentNode._parent._children.length - 1) == index;
				//consult with parent to determine destination command
				return this.nextJumpTarget(
						currentNode._parent,
						isSuccess,
						last,
						index
				);
			}	//end if this is a root node
		}	//end if success case
		break;
	case LOGIC_OP.OR:		//logical operation OR
		//if this is a success, then we OR evaluates TRUE, so consult with level
		//	above to determine where to jump next
		if( isSuccess ){
			//if current node is root, then there is no level above
			if( currentNode._type == LOG_NODE_TYPE.ROOT ){
				//if root, then take THEN case
				return currentNode._successCmd;
			} else {	//if it is not a root, then consult with level above
				//determine index of this node in parent
				var index = indexOfElement(currentNode._parent._children, currentNode);
				//is this node last in the parent
				var last = (currentNode._parent._children.length - 1) == index;
				//consult with parent level to determine where to jump next
				return this.nextJumpTarget(
						currentNode._parent,
						isSuccess,
						last,
						index
				);
			}	//end if this node is a root
		} else {	//else if this is a failure case, then evaluate next expression
			//if the terminal node last, then OR condition failed
			if( isLast ){
				//if current node is root, then the whole logical expression failed
				if( currentNode._type == LOG_NODE_TYPE.ROOT ){
					//if root, then take success case
					return currentNode._failureCmd;
				} else {	//else if this is not root, let parent determine destination
					//determine index of this node in the parent
					var index = indexOfElement(currentNode._parent._children, currentNode);
					//is this node last in the parent
					var last = (currentNode._parent._children.length - 1) == index;
					//consult with the level above to determine destination
					return this.nextJumpTarget(
							currentNode._parent,
							isSuccess,
							last,
							index
					);
				}	//end if this node is a root
			} else {
				//            ...
				//           /
				//          OR  <- this is current node
				//         /  \
				//      AND    AND
				//     / | \  / | \
				//     X Y Z  K L M
				//         ^
				//         |
				//         this node was evaluated in the level below.
				//	If we consider a failure case, i.e. condition represented
				//	by terminal node 'Z' fails, then we need to jump to 'K'.
				//	In other words, we need to find left most node 'K' in the
				//	next branch (next AND logical operator).
				//find the left most in the next branch
				return this.leftMostTerminal(
						currentNode._children[prevIndex + 1]
				);
			}	//end if this is a last node
		}	//end if this is a success case
		break;
	}	//switch for logical operation (AND/OR)
	//should not reach this point, since every condition ends with return
	throw new Error("478346347523");
};	//end function 'nextJumpTarget'

//find left-most node in the given tree branch (branch is associated with
//passed non-terminal node - all of its children and below them makes up
//branch to be considered)
//input(s):
//	branch: (Node) non-terminal node
//output(s): 
//	(Node) => terminal node that is at the left of the given branch
LTree.prototype.leftMostTerminal =
	function(branch){
	//check whether the given node is terminal or not
	if( branch._type == LOG_NODE_TYPE.TERMINAL ){
		//if it is terminal, then this is a node we are looking for
		return branch;
	}
	//recursively call this function on the left-most child of this node
	return this.leftMostTerminal(branch._children[0]);
};	//end function 'leftMostTerminal'

//invert jump instruction
//input(s):
//	command: (command) command for which jump instruction needs to be inverted
//output(s): 
//	(boolean) => success if command is invertible, or failure if given command
//		type is not jump, and thus not invertible
LTree.prototype.invertJump =
	function(command){
	//condition on the command type
	switch(command._type){
	case COMMAND_TYPE.BEQ:
		command._type = COMMAND_TYPE.BNE;
		break;
	case COMMAND_TYPE.BNE:
		command._type = COMMAND_TYPE.BEQ;
		break;
	case COMMAND_TYPE.BLE:
		command._type = COMMAND_TYPE.BGT;
		break;
	case COMMAND_TYPE.BLT:
		command._type = COMMAND_TYPE.BGE;
		break;
	case COMMAND_TYPE.BGE:
		command._type = COMMAND_TYPE.BLT;
		break;
	case COMMAND_TYPE.BGT:
		command._type = COMMAND_TYPE.BLE;
		break;
	default:
		return false;
	}
	return true;
};	//end function 'invertJump'