/**
	Developer:	Eduard Sedakov
	Date:		2015-10-09
	Description:	set of commands terminated by jump
	Used by:	scope, command
	Dependencies:	scope, argument, symbol, command, COMMAND_TYPE, B2B
**/

//==========globals:==========

//unique identifier used by block
block.__nextId = 1;

//ES 2016-08-30 (b_log_cond_test): create library of block ids
block.__library = {};

//==========statics:==========

//reset static data members
//input(s): (none)
//output(s): (none)
block.reset = function() {
	block.__nextId = 1;		//set to first available integer
	//ES 2016-08-30 (b_log_cond_test): initialize library of block ids
	block.__library = {};
};

//connect source to destination via specified type of block to block connection
//input(s):
//	source: (block) => block from which fall/jump to another block (dest)
//	dest: (block) => block to/in which jump/fall from source
//	type: (B2B) => type of connection from one block to another block (fall/jump)
//output(s): (none)
block.connectBlocks = function(source, dest, type){
	//ensure that source and destination blocks are different
	if( source == dest ){
		return;
	}
	//if source falls into destination
	if( type == B2B.FALL ) {
		//set source to fall into dest
		source._fallInOther = dest;
		//update information in destination
		dest._fallInThis = source;
	} else { //otherwise, source jumps into destination
		//set source to jump into dest
		source._jumpToOther = dest;
		//update info in dest
		dest._jumpToThis.push(source);
	}
};

//break connection between two blocks with the specified connection type between them
//input(s):
//	source: (block) => block from which fall/jump to another block (dest)
//	dest: (block) => block to/in which jump/fall from source
//	type: (B2B) => type of connection between two blocks
//output(s): (none)
block.breakBlocks = function(source, dest, type){
	//if source falls into destination
	if( type == B2B.FALL ) {
		//reset info in both source and destination
		source._fallInOther = null;
		dest._fallInThis = null;
	} else { //otherwise, source jumps into destination
		//reset source from jumping to destination
		source._jumpToOther = null;
		//loop thru blocks that jump into destination and remove source from that list
		for( var i = 0; i < dest._jumpToThis.length; i++ ) {
			//if this block is the source, then remove it
			if( dest._jumpToThis[i].isEqual(source) ) {
				//remove source from the list
				dest._jumpToThis.splice(i, 1);
			}
		}
	}
};

//static calls:
block.reset();

//class "block" declaration:
//class represents set of commands that is terminates by a jump - conditional/unnconditional
//	jump instruction OR return OR end of program.
//input(s):
//	scp: (scope) => scope that owns this block
//output(s): (none)
function block(scp){
	//assign id
	this._id = block.__nextId++;
	//assign parent/owner scope
	this._owner = scp;
	//ES 2016-08-15 (b_cmp_test_1): if this is a condition inside LOOP or IF-THEN-ELSE clause, then
	//	It's owner is not going to be this LOOP or IF-THEN-ELSE, so we need to identify it's relation
	//	to such LOOP or IF-THEN-ELSE clause.
	//	Note: if it is not part of LOOP's or IF-THEN-ELSE condition, then leave it null
	this._relatedScope = null;
	//initialize set of commands
	this._cmds = [];
	//block should always have at least one command (i.e. never empty), so that it is
	//possible to jump to this block (keep in mind that in this convention jump targets
	//not the block itself, but the command, which is why block should not be empty
	this.createCommand(COMMAND_TYPE.NOP, [], []);
	//data structires used to keep information about jumps to/from this block
	this._jumpToThis = [];	//several blocks may jump to this one
	this._fallInThis = null;	//"fall" means to transfer without jump - only one block can do this
				//direct ancestor (a.k.a. parent block)
	this._jumpToOther = null;	//jump in another block (only one, since any block can
					//have exactly one jump instruction)
	this._fallInOther = null;	//falling in another (child) block
};

//add command to the block
//input(s):
//	cmd: (command) command to be added to the block
//output(s): (none)
block.prototype.addCommand =
	function(cmd){
	//set owner of command
	cmd._blk = this;
	//ES 2015-10-28 (b_parsing_types): moved code from createCommand to avoid
	//	code duplication (see commented out code for detailed reason)
	//create temporary index used in loops
	var i = 0;
	//if this is a first real command in this block, then we need to first remove
	//NOP command declared in this block (created at the time of block birth)
	if( this._cmds.length == 1 && this._cmds[0]._type == COMMAND_TYPE.NOP ) {
		//remove NOP command
		this._cmds.pop();

		//trasnfer all jumps from NOP to new command, and then dispose of NOP
		//loop thru all jump commands that transfer control flow to this block
		for( i = 0; i < this._jumpToThis.length; i++ ) {
			//get reference to such jump instruction (located in another block)
			var jumpCmd = this._jumpToThis[i]._cmds[this._jumpToThis[i]._cmds.length - 1];
			//remove reference of NOP (in this block) from the argument list of jump cmd
			//	NOTE: jump keeps target as the last argument, so remove it
			jumpCmd._args.pop();
			//now, insert argument representing new command that replaces NOP
			jumpCmd._args.push(cmd);
		}
	}
	//add new command to block's command list
	this._cmds.push(cmd);
};

//is it an empty block, i.e. does this block has at least 1 non-NOP command
//input(s):
//output(s):
//	(boolean) => FALSE, if this block has either no commands (which is parser's error) OR
//		1 NOP command. Otherwise, this function will return TRUE
//ES 2016-08-13 (b_cmp_test_1): rename, since function is looking for non-empty blocks
block.prototype.isNonEmptyBlock =
	function(){
	//check if this block has at least one command
	if( this._cmds.length == 0 ){
		//error
		throw new Error("43746357863525252");
	//if this block has more then 1 command, then it is not empty
	} else if( this._cmds.length > 1 ){
		//definetly, non empty
		return true;
	}
	//at this point we know that this block has exactly 1 command => need to make sure
	//	it is not a NOP command
	return this._cmds[0]._type != COMMAND_TYPE.NOP;
};	//end 'isNonEmptyBlock'	(ES 2016-08-13: b_cmp_test_1: rename function to better describe its goal)

//create command inside this block
//input(s):
//	cmd_type: (COMMAND_TYPE) => type of command
//	args: (Array<Argument>) => arguments that are inlcuded in this command
//	symbs: (Array<Symbol>) => symbols associated with new command
//output(s): 
//	(command) => command that was either create from scratch or returned existing one
block.prototype.createCommand = 
	function(cmd_type, args, symbs){
	//try to get existing command with specified properties (type and arguments)
	//ES 2016-08-13 (b_cmp_test_1): include extra argument to represent this block's scope
	//	so that we can choose command that is in this or an outter scope, but not inner
	var cmd = command.findSimilarCmd(cmd_type, args, this._owner);
	//if such command does not exist already, return it
	if( cmd == null ) {
		//create command instance
		var cmd = new command(cmd_type, [], this);
		//add command to the block (ES 2015-10-28: replaced code block below)
		this.addCommand(cmd);
		/* ES 2015-10-28 (b_parsing_types): moved code into function 'addCommand',
			to avoid code duplication with this function, since it needs to check
			if there is NOP command inside the block and it also needs to add this
			command to block's command list
		//create temporary index used in loops
		var i = 0;
		//if this is a first real command in this block, then we need to first remove
		//NOP command declared in this block (created at the time of block birth)
		if( this._cmds.length == 1 && this._cmds[0]._type == COMMAND_TYPE.NOP ) {
			//remove NOP command
			this._cmds.pop();

			//trasnfer all jumps from NOP to new command, and then dispose of NOP
			//loop thru all jump commands that transfer control flow to this block
			for( i = 0; i < this._jumpToThis.length; i++ ) {
				//get reference to such jump instruction (located in another block)
				var jumpCmd = this._jumpToThis[i]._cmds[this._jumpToThis[i]._cmds.length - 1];
				//remove reference of NOP (in this block) from the argument list of jump cmd
				//	NOTE: jump keeps target as the last argument, so remove it
				jumpCmd._args.pop();
				//now, insert argument representing new command that replaces NOP
				jumpCmd._args.push(cmd);
			}
		}
		//add new command to block's command list
		this._cmds.push(cmd);
		ES 2015-10-28 (b_parsing_types): end moved block
		*/
		//loop thru all arguments and add them to new command argument list
		for( i = 0;i < args.length; i++ ) {
			//add argument to existing command
			cmd.addArgument( args[i] );
		}
	}
	//loop thru all symbols and add them to new command symbol list
	for( i = 0; i < symbs.length; i++ ) {
		//add symbol to existing command
		cmd.addSymbol( symbs[i] );
	}
	//return to caller resulting command
	return cmd;
};

//convert current block object to string representation
//input(s): (none)
//output(s):
//	(string) => string representation
block.prototype.toString = 
	function() {
	return "{" + "id: " + this._id +
			"owner.id: " + (this._owner === null ? "(none)" : this._owner._id ) +
			"cmds: " + arrToStr(this._cmds) + 
			"jumpToThis: " + arrToStr(this._jumpToThis) + 
			"fallInThis: " + (this._fallInThis === null ? "(none)" : this._fallInThis._id) +
			"jumpToOther: " + (this._jumpToOther === null ? "(none)" : this._jumpToOther._id) +
			"fallInOther: " + (this._fallInOther === null ? "(none)" : this._fallInOther._id);
};

//get type name of this object (i.e. block)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
block.prototype.getTypeName =
	function() {
	return RES_ENT_TYPE.BLOCK;
};

//compare with another value (it is a simple comparison operator, just check ids)
//input(s):
//	anotherBlk: (block) block to compare against
//output(s):
//	(boolean) => {true} if this block is equal to {anotherBlk}; {false} if they are not equal
block.prototype.isEqual =
	function(anotherBlk) {
	//make sure that {anotherBlk} is not null, so we can compare
	if( anotherBlk !== null ) {
		//ensure that {this} is of the same type as {anotherBlk}
		if( this.getTypeName() == anotherBlk.getTypeName() ) {
			//compare ids of both blocks objects
			return this._id == anotherBlk._id;
		}
	}
	//if reached this point, then two objects are either of different type or anotherCmd is null
	return false;
};
