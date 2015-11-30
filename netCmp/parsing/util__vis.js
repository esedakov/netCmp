/**
	Developer:	Eduard Sedakov
	Date:		2015-11-03
	Description:	create a small-scale visualizer that draws Control  FLow
					Graph (CFG) on the screen using JointJS library.
	Used by:	(no JS component, but actual HTML uses it)
	Dependencies:	(everything)
**/

//==========globals:==========

//create visualizer object definition
//input(s):
//	id: (text) => id for the HTML component that would contain JointJS CFG chart
//	width: (integer) => width of JointJS viewport (they often denote it as paper)
//	height: (integer) => height of JointJS viewport
//output(s): (none)
function viz(id, width, height){
	//assign dimensions
	this._width = width;
	this._height = height;
	//bookkeep container id
	this._id = id;
	//create graph and save it's reference
	this._graph = new joint.dia.Graph;
	//create JointJS viewport
	var viewport = new joint.dia.Paper({
		el: $("#" + this._id),
		width: this._width,
		height: this._height,
		model: this._graph,
		gridsize: 1
	});
	//specify default font size
	this.defFontSize = 23;
	//create drawing stack
	//each object (e.g. scope, block, command or value) should be identified
	//using hashmap that contains following information:
	//	x, y - top left corner of object (usually it is a rectangle)
	//	w, h - dimension of object (width or height)
	//	level - depth-level of node inside graph (start is at 0th level)
	this._drawStack = {
		scope: [],	//array of scopes in the order of drawing (i.e. start drawing 
					//from 0th element and proceed to the end of array)
		block: [],		//same
		command: [],	//same
		value: []		//same
	};
	//collection of functions drawing commands (each has specific number of arguments)
	this.cmdDrawFuncs = {};	//key: (int) => number of args, value: (function) draw cmd
};

//create a new prototype for drawing command with specified number of args
//input(s):
//	numArgs: (integer) => number of arguments
//output(s):
//	(object) => JointJS prototype for drawing command
viz.prototype.createDrawCmdFunc = function(numArgs){
	//create markup for command prototype
	var cmdMarkUp = '<g class="rotatable">' + 
						'<g class="scalable">' +
							'<rect/>' + 
						'</g>' + 
						'<text class="o_CmdId">' +
							'<tspan class="i_CmdId"></tspan>' +
						'</text>' +
						'<text class="o_CmdTy">' +
							'<tspan class="i_CmdTy"></tspan>' +
						'</text>';
	//create set of command attributes
	var cmdAttrs = {
		rect: { 'follow-scale': true, width: 100, height: 100, fill: 'none' },
		'.i_CmdId': { 'font-size': 23, fill: '#ff7700', 'stroke': '#ff7700' },
		'.i_CmdTy': { 'font-size': 23, 'font-weight': 'bold', fill: '#000000', 
						'stroke': '#000000' 
		}
	};
	//create variable number of arguments
	for( var i = 0; i < numArgs; i++ ){
		//create argument index
		var argIdx = i + 1;
		//append new argument markup
		cmdMarkUp = cmdMarkUp + 
					'<text class="o_Arg' + argIdx + '">' +
						'<tspan class="i_Arg' + argIdx + '"></tspan>' +
					'</text>';
		//add new command attribute
		cmdAttrs['.i_Arg' + argIdx] = {
			'font-size': 23, fill: '#00ff00', stroke: '#00ff00'
		};
	}
	//finalize markup
	cmdMarkUp = cmdMarkUp + '</g>',
	//create command shape
	joint.shapes['command_' + numArgs] = joint.shapes.basic.Generic.extend({

		//specify command markup
		markup: cmdMarkUp,

		//setup custom fields for command JointJS shape
		defaults: joint.util.deepSupplement({

			type: 'command',					//prototype name
			attrs: cmdAttrs,					//attributes
			size: { width: 160, height: 35 }	//dimensions
		}, joint.shapes.basic.Generic.prototype.defaults)
	});	//end command shape
	//return resulting command
	return joint.shapes['command_' + numArgs];
};	//end function 'createDrawCmdFunc'

//create scope shape
joint.shapes.scp = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable">' + 
    			'<g class="scalable">' +
    				'<rect/>' + 
    			'</g>' + 
    			'<text class="o_ScpName">' +
    				'<tspan class="i_ScpName"></tspan>' +
    			'</text>' +
    			'<path class="scpSep"></path>' +
    		'</g>',

    defaults: joint.util.deepSupplement({

        type: 'scp',
        attrs: {
            rect: { 'follow-scale': true, width: 300, height: 300, fill: '#000099', opacity: 0.5, rx: 15, ry: 15 },
            '.i_ScpName': { 'font-size': 23, 'stroke': '#ffffff' },
            '.scpSep': { 'stroke': '#00aaff', 'stroke-width': 2, d:'M 0 40 L 300 40' },
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});	//end prototype function for drawing scope

//create block shape
joint.shapes.block = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable">' + 
    			'<g class="scalable">' +
    				'<rect/>' + 
    			'</g>' + 
    			'<text class="o_BlkName">' +
    				'<tspan class="i_BlkName"></tspan>' +
    			'</text>' +
    			'<rect class="minBtn"></rect>' +
    			'<path class="blkSep"></path>' +
    		'</g>',

    defaults: joint.util.deepSupplement({

        type: 'block',
        attrs: {
            rect: { 'follow-scale': true, width: 300, height: 300, fill: '#440044', opacity: 0.5, rx: 15, ry: 15 },
            '.i_BlkName': { 'font-size': 23, 'stroke': '#ffffff' },
            '.minBtn': { width: '15', height: '7', fill: 'red', stroke: 'green', 'stroke-width': 2, rx: 0, ry: 0 },
            '.blkSep': { 'stroke': '#ff00aa', 'stroke-width': 2, d:'M 0 40 L 300 40' },
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});	//end prototype function for drawing block

//measure dimensions of the text given its font size
//input(s):
//	text: (string) => text, whose size to measure
//	fontsize: (int) => font size
//output(s):
//	{int, int} => height and width
viz.prototype.measureTextDim = function(text){
	//break given text by new line characters ('\n') to identify how many lines in text
	var lines = text.split('\n');
	//measure width and height of given text
	return {
		//very crude estimate (works for some of the fontsizes)
		height: (lines.length - 1) * (this.defFontSize - 1),
		//find longest line and use it to determine max width of text segment
		//for '_max' see - http://stackoverflow.com/questions/17386774/javascript-find-longest-word-in-a-string
		width: _.max(lines, function(word) { return word.length; }).length * (this.defFontSize - 3)
	};
};	//end function 'measureTextDim'

//test function for visualization
//input(s):
//	id,w,h
//output(s): nothing
function test_viz(id,w,h){
	//first create program with global scope
	var prog = new program();
	//get global scope
	var g_scp = prog.getGlobalScope();
	//get references for start and end blocks
	var start = g_scp._start, end = g_scp._end;
	//add command NULL 123 to start
	var null123 = start.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(123)],
		[]
	);
	//add command NULL 9 to start
	var null9 = start.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(9)],
		[]
	);
	//add command MUL that uses two previously defined constants 123 and 9
	start.createCommand(
		COMMAND_TYPE.MUL,
		[null123, null9],
		[]
	);
	//add command NULL 'hello world' to end block
	end.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue("hello world!")],
		[]
	);
	//create visualization component
	var v = new viz(id, w, h);
	//draw CFG
	v.drawCFG(g_scp);
};

//draw Control-Flow-Graph (CFG) starting from global scope
//input(s):
//	gScp; (scope) global scope
//output(s): (nothing)
viz.prototype.drawCFG = function(gScp){
	//check if given argument is a global scope
	if( gScp._owner !== null ){
		//gScp is not global scope, so quit
		return;
	}
	//process global scope
	process(gScp);
	//loop thru drawing stacks for scope, block, and command
	//	setup order for looping
	var loopOrd = ["scope", "block", "command"];
	//loop thru stacks in this order
	for( var drwStkIdx = 0; drwStkIdx < loopOrd.length; drwStkIdx++ ){
		//get currently iterated drawing stack
		var curDrwStk = this._drawStack[loopOrd[drwStkIdx]];
		//check that drawing stack is not empty
		if( curDrwStk.length > 0 ){
			//draw elements of this current stack by adding them to the graph
			this._graph.addCells(curDrwStk);
		}
	}
	//TODO: handle connections between blocks and somehow incorporate scope symbols
};	//end function drawCFG

//process CFG (control flow graph) and update drawing stack
//input(s):
//	ent: any parser entity
//output(s):
//	(hashmap) element created by this function in the drawing stack 
viz.prototype.process = function(ent, x, y){
	//make sure that this is a parser entity
	if( typeof ent !== "object" || ('getTypeName' in ent) == false ){
		//this is not a parser entity, quit
		return;
	}
	//initialize object that is returned to the caller -- it is object that
	//	is added to the drawing stack
	var ret = null;
	//determine type of parser entity we are dealing with
	switch(ent.getTypeName().value){
		case RES_ENT_TYPE.SCOPE.value:
			//setup scope overall dimension variables
			var totScpWidth = 0, totScpHeight = 0;
			//traverse thru child scopes
			var  childScpInfo = traverseThruCollection(
				//children scopes inside this scope
				ent._children,
				//mini-class that determines position of children scopes
				{
					//setup position of starting scope
					init: function(){
						return {x: x+20, y: y+100};
					},
					//calculate positions for subsequent chidlren scopes
					update: function(lastElemInfoStruct){
						return {
							x: x+lastElemInfoStruct.x,
							y: y+lastElemInfoStruct.y+lastElemInfoStruct.height
						};
					}
				}
			);
			//initialize stack of blocks in the order to be processed
			var blkPrcsStk = [];
			//initialize associative array for block stack to easily determine
			//	whether block exists in block stack or not
			var blkHashMap = {};
			//find all blocks that source(s) inside this scope
			//"source" block is a block that has no in-comming connections from
			//	the other blocks of this scope, but it may have connections from
			//	block(s) from the other scopes (particularly, parent scope)
			$.each(
				//blocks inside this scope
				ent._blks,
				//iterator function to find all source blocks
				function(blkId, blkRef){
					//make sure that blkRef is an object
					if( typeof blkRef !== "object" && blkRef === null ){
						//skip this block
						return;
					}
					//check if fall-in-this block belongs to this scope
					if( 
						//check that fall-in-this is not null
						blkRef._fallInThis !== null && 

						//check that owner of fall-in-this is not null
						blkRef._fallInThis._owner !== null &&

						//check that owner of fall-in-this equal to this scope
						blkRef._fallInThis._owner._id == ent._id
					){
						//this is not a "source" block, go to next block
						return;
					}
					//if we still here, that means either fall-in-this block
					//	does not exist or it belongs to another scope, so lets
					//	check series of blocks that are jumping in this block
					//check that '_jumpToThis' is not empty set
					if( blkRef._jumpToThis.length > 0 ){
						//loop thru jump blocks
						for( 
							var jumpBlkIdx = 0; 
							jumpBlkIdx < blkRef._jumpToThis.length; 
							jumpBlkIdx++ 
						){
							//get reference to current jump block
							var jumpBlkRef = blkRef._jumpToThis[jumpBlkIdx];
							//check if it belongs to this scope
							if( jumpBlkRef._owner !== null && jumpBlkRef._owner._id == ent._id ){
								//this is not a "source" block, go to next block
								return;
							}
						}
					}
					//set 0th level for this block
					blkRef._level = 0;
					//if we still here, that means either there are no in-comming
					//blocks, or they all belong not to this scope. So add this
					//block to the stack
					blkPrcsStk.push(blkRef);
					//add to associative array
					blkHashMap[blkRef._id] = blkRef;
				}	//end iterator function thru all blocks in this scope
			);	//end $.each to find all source blocks
			//check that resulting block stack is not empty
			if( blkPrcsStk.length == 0 ){
				//if it is empty, then trigger error
				throw new Error('988633134');
			}
			//initialize top-left coordinates for area where blocks are drawn
			var topLeftBlkDrawArea = {
				x: x+20,
				y: y+childScpInfo.parentDims.height
			};
			//update overall dimensions
			totScpWidth = childScpInfo.parentDims.width;
			totScpHeight = childScpInfo.parentDims.height;
			//initialize coordinate set <x,y> for starting item
			var curIterElemX = topLeftBlkDrawArea.x;
			var curIterElemY = topLeftBlkDrawArea.y;
			//initialize graph level
			var cfgLevel = 0;
			//setup maximum height and width of level
			var maxLevHeight = 0, maxLevWidth = 0;
			//perform a variant of BFS (breadth-first-search) thru blocks only
			//	within this scope, starting from source block(s)
			var blkPrcsIdx = 0;
			while( blkPrcsIdx < blkPrcsStk.length ){
				//get reference to the current block
				var curIterBlk = blkPrcsStk[blkPrcsIdx];
				//check if we are still in the same level
				if( cfgLevel != curIterBlk._level ){
					//if not, then update level and current coordinates of block
					cfgLevel++;
					curIterElemX = topLeftBlkDrawArea.x;
					curIterElemY += maxLevHeight + 20;
					//update overall height
					totScpHeight += maxLevHeight + 20;
					totScpWidth += maxLevWidth - 20;	//remove extra '20' (space between neighboring blocks)
					//reset height for the next level
					maxLevHeight = 0;
					maxLevWidth = 0;
				}
				//check if fall-thru outgoing connection goes to block within
				//	this scope and that it was not yet iterated
				if( 
					//fall-thru block is not null
					curIterBlk._fallInOther !== null &&
					//block's owner scope is not null
					curIterBlk._fallInOther._owner !== null && 
					//owner scope is this scope
					curIterBlk._fallInOther._owner._id == ent._id &&
					//this block has not yet been iterated
					!( curIterBlk._fallInOther in blkHashMap )
				){
					//setup CFG current level + 1
					curIterBlk._level = cfgLevel + 1;
					//add block to hashmap
					blkHashMap[curIterBlk._fallInOther._id] = curIterBlk._fallInOther;
					//add block to stack
					blkPrcsStk.push(curIterBlk._fallInOther);
				}
				//check if jump outgoing connection goes to block within
				//	this scope and that it was not yet iterated
				if( 
					//jump block is not null
					curIterBlk._jumpToOther !== null &&
					//block's owner scope is not null
					curIterBlk._jumpToOther._owner !== null && 
					//owner scope is this scope
					curIterBlk._jumpToOther._owner._id == ent._id &&
					//this block has not yet been iterated
					!( curIterBlk._jumpToOther in blkHashMap )
				){
					//setup CFG current level + 1
					curIterBlk._level = cfgLevel + 1;
					//add block to hashmap
					blkHashMap[curIterBlk._jumpToOther._id] = curIterBlk._jumpToOther;
					//add block to stack
					blkPrcsStk.push(curIterBlk._jumpToOther);
				}
				//process currently iterated block
				var prcRes = process(curIterBlk, curIterElemX, curIterElemY);
				//update current element x-offset
				curIterElemX += prcRes.width + 20;
				//update maximum width of this level
				maxLevWidth += prcRes.width + 20;
				//adjust maximum height of this level
				if( maxLevHeight < prcRes.height ){
					maxLevHeight = prcRes.height;
				}
				//go to next item
				blkPrcsIdx++;
			}
			//adjust scope dimensions by size of margins
			totScpWidth += 2*20;
			totScpHeight += 2*100;
			//setup return scope-info-structure
			ret = {

				//x-coordinate of top-left corner
				x: x,
				
				//y-coordinate of top-left corner
				y: y,

				//width of block
				width: totScpWidth,

				//height of block
				height: totScpHeight,

				//reference command object
				obj: new joint.shapes.scp({

					//specify position of block
					position: {
						x: x,
						y: y
					},

					//specify dimensions of block
					size: {
						width: totScpWidth,
						height: totScpHeight
					},

					//specify visual characteristics for command
					attrs: {

						//setup a block title
						'.i_ScpName': {
							text: ent._id + ": scope"
						},

						//position a block title
						'.o_ScpName': {
							transform: "translate(15,10)"
						}
					}

				})	//end object reference
			};
			//add new element to drawing stack
			this._drawStack['scope'].push(ret);
			break;
		case RES_ENT_TYPE.BLOCK.value:
			//traverse thru set of commands
			var info = traverseThruCollection(
				//commands inside block
				ent._cmds,
				//mini-class that should assist in initializing and updating
				//x,y coordinates of commands within this block
				{
					//initialize starting x,y coordinates of first command
					init: function(){
						return {x: x+20, y: y+50};
					},
					//calculate x,y coordinates of subsequent elements of collection
					update: function(lastElemInfoStruct){
						return {
							x: x+lastElemInfoStruct.x,//+lastElemInfoStruct.width,
							y: y+lastElemInfoStruct.y+lastElemInfoStruct.height
						};
					}
				}
			);
			//calculate width of height of block
			var blkWidth = info.parentDims.width + 20;
			var blkHeight = info.parentDims.height + 20;
			//setup return block-info-structure
			ret = {

				//x-coordinate of top-left corner
				x: x,
				
				//y-coordinate of top-left corner
				y: y,

				//width of block
				width: blkWidth,

				//height of block
				height: blkHeight,

				//reference command object
				obj: new joint.shapes.block({

					//specify position of block
					position: {
						x: x,
						y: y
					},

					//specify dimensions of block
					size: {
						width: blkWidth,
						height: blkHeight
					},

					//specify visual characteristics for command
					attrs: {

						//setup a block title
						'.i_BlkName': {
							text: ent._id + ": block"
						},

						//position a block title
						'.o_BlkName': {
							transform: "translate(15,10)"
						},

						//position a block minimizer button
						'.minBtn': {
							transform: "translate(" + (blkWidth - 35) + ",15)"
						}
					}

				})	//end object reference
			};
			//add new element to drawing stack
			this._drawStack['block'].push(ret);
			break;
		case RES_ENT_TYPE.COMMAND.value:
			//initialize array of widths for each element of command
			var cmdElemWidths = [];
			//determine dimension for command id
			cmdIdDims = measureTextDim(ent._id.toString());
			//initialize command's width
			var cmdWidth = cmdIdDims.width;
			//assign width of command id element
			cmdElemWidths[0] = cmdWidth;
			//measure width of command type
			cmdElemWidths[1] += measureTextDim(ent._type.name);
			//increment total width of command by width of command type
			cmdWidth += cmdElemWidths[1];
			//init command attributes
			var attrs = {
				//make command immovable inside block
				isInteractive: false,
				//specify translation of command id element
				'.o_CmdId' : {
					transform: "translate(0, 0)"
				},
				//specify text for command id element
				'.i_CmdId' : {
					text: ent._id.toString() + ' :'
				},
				//specify translation of command type element
				'.o_CmdTy' : {
					transform: "translate(" + cmdElemWidths[0] + "0)"
				},
				//specify text for command type element
				'.i_CmdTy' : {
					text: ent._type.name
				}
			};
			//loop thru arguments to determine their dimensions and
			//	to add their translations/text to attrs
			$.each(
				//command arguments
				ent._agrs,
				//iterating function
				function(idx){
					//get reference to current argument
					var cur = ent._args[idx];
					//init prefix
					var prefix = "";
					//depending on the type of argument
					switch(cur.getTypeName().value){
						case RES_ENT_TYPE.COMMAND.value:
							prefix = 'c_';
							break;
						case RES_ENT_TYPE.VALUE.value:
							prefix = 'v_';
							break;
						case RES_ENT_TYPE.SYMBOL.value:
							prefix = 's_';
							break;
						case RES_ENT_TYPE.TYPE.value:
							prefix = 't_';
							break;
						case RES_ENT_TYPE.FUNCTION.value:
							prefix = 'f_';
							break;
						default:
							prefix = '?_';	//unkown
							break;
					}
					//create command argument text representation
					var cmdArgTxt = prefix + ent._id;
					//if this is not last argument
					if( idx + 1 < ent._args.length ){
						//add comma to the text representation of command argument
						cmdArgTxt += ',';
					}
					//add text representation to attrs
					attrs['.i_Arg' + (idx + 1)] = {
						text: cmdArgTxt
					};
					//calculate width of argument
					cmdElemWidths[2 + idx] = measureTextDim(cmdArgTxt);
					//update total width of command
					cmdWidth += cmdElemWidths[2 + idx];
					//add translation to attrs
					attrs['.o_Arg' + (idx + 1)] = {
						transform: "translate(" + cmdElemWidths[1 + idx] + ",0)"
					};
				}
			);
			//create new command element
			ret = {

				//x-coordinate for top-left corner
				x: x,

				//y-coordinate for top-left corner
				y: y,
				
				//total command's width
				width: cmdWidth,

				//command's height
				height: cmdIdDims.height,

				//reference command object
				obj: new joint.shapes.command({

					//specify position of command
					position: {
						x: x,
						y: y
					},

					//specify visual characteristics for command
					attrs: attrs

				})	//end object reference
			};
			//add new element to drawing stack
			this._drawStack['command'].push(ret);
			break;
		default:
			//other types (even though could be parsing entities) are not needed, skip
			break;
	}
	//return currently created element on the drawing stack
	return ret;
};

//traverse thru collection of underlying entities
//input(s):
//	coll: (Hashmap<Object>): collection of parsing elements (command, block, scope)
//	coordCalc: mini-class that should have two functions: 'init' to initialize
//		starting coordinates of the first element of collection, and 'update' to
//		update coordinates of the subsequent elements of collection given info
//		structure of the last processed object
//output(s):
//	{parentDims, arrayOfChildrenInfoStructs} => collection that contains dimensions
//		for the parent object and an array of children info-structures
viz.prototype.traverseThruCollection = function(coll, coordCalc){
	//create array for keeping track of processed objects information structures
	var resObjs = [];
	//initialize coordinates for the first object in a collection
	var coord = coordCalc.init();
	//initialize minimum width and height of parent that should be enough to
	//contain all of its children
	var totDims = {width: 0, height: 0};
	//iterate thru elements of collection
	$.each(
		coll,
		function(key, value){
			//ensure that this entry is an object
			if( typeof value == "object" ){
				//process parsing object and append returned information structure
				//of resulting object to 'resObjs' array
				var curProcObj = process(value, coord.x, coord.y);
				resObjs.push(curProcObj);
				//update x-coord and y-coord for the next object in a collection
				coord = coordCalc.update(curProcObj);
				//update parent total dimensions
				totDims.width = Math.max(totDims.width, curProcObj.x + curProcObj.width);
				totDims.height = Math.max(totDims.height, curProcObj.y + curProcObj.height);
			}	//end if ensure entity is object
		}	//end iterating function
	)	//end traversing thru collection
	return {
		parentDims: totDims,
		arrayOfChildrenInfoStructs: resObjs
	};
};

//draw a rectangle using JointJS
//input(s):
//	styles: (JSON) JS hashmap that contains style attibutes for drawn rectangle
//			It can contain following fields:
//				'pos' - position of rectangle ('x' and 'y')
//				'dim' - dimensions of rectangle ('width' and 'height')
//				'rectview' - view parameters for rectangle, some of the fields are present below:
//					* fill - background color
//					* rx, ry - how much to round rectangle corners (similar to CSS 'border-radius')
//					* stroke - border color
//					* stroke-width - border thickness
//				'textview' - view parameter for text inside rectangle
//					* text - label to display
//					* fill - text color
//					* font-size - font size
//					* font-weight - 'bold' or 'normal'
//	g: (joint.dia.Graph) JointJS graph reference component
//output(s): (none)
viz.prototype.drawRect = 
	function(styles, g){
	//check if position is not defined in attributes
	if( !("pos" in styles) ){
		//define position
		styles.pos = {};
	}
	//if 'x' is not defined inside position
	if( !('x' in styles.pos) ){
		//generate x-position randomly
		styles.pos.x = Math.random() * glWidth;
	}
	//if 'x' is not defined inside position
	if( !('y' in styles.pos) ){
		//generate y-position randomly
		styles.pos.x = Math.random() * glWidth;
	}
	//check if dimensions is not defined in attributes
	if( !("dim" in styles) ){
		//define dimensions
		styles.dim = {};
	}
	//if 'height' is not defined inside dimensions
	if( !('height' in styles.dim) ){
		//assign default height
		styles.dim.height = 100;
	}
	//if 'x' is not defined inside dimensions
	if( !('width' in styles.dim) ){
		//assign default width
		styles.dim.width = 150;
	}
	//check if rect view is not defined in attributes
	if( !("rectview" in styles) ){
		//define rectangle view
		styles.rectview = {};
	}
	//if 'fill' (background color) is not defined in view
	if( !('fill' in styles.rectview) ){
		//assign default background color
		styles.rectview.fill = "#aa0023";
	}
	//if text view is not defined in attributes
	if( !("textview" in styles) ){
		//define text struct
		styles.textview = {};
	}
	//if 'text' is not defined in textual view
	if( !('text' in styles.textview) ){
		//assign default text inside rectangle
		styles.textview.text = "unknown label";
	}
	//if font color ('fill') is not defined in textual view
	if( !('fill' in styles.textview) ){
		//assign text font color
		styles.textview.fill = "#eeeeee";
	}
	//if font size is not defined in textual view
	if( !('font-size' in styles.textview) ){
		//assign default font size
		styles.textview['font-size'] = 18;
	}
	//create rect
	var rect = new joint.shapes.basic.Rect({
		position: styles.pos,
		size: styles.dim,
		attrs: { 
			rect: styles.rectview, 
			text: styles.textview 
		}
	});
	//add rect to graph
	g.addCells([rect]);
};