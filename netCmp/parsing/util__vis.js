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
        },
        size: { width: 300, height: 300 }
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
}	//end function 'measureTextDim'

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
			//traverse thru child scopes
			traverseThruCollection(ent._children);
			//traverse thru child blocks
			traverseThruCollection(ent._blks);
			break;
		case RES_ENT_TYPE.BLOCK.value:
			//traverse thru set of commands
			var arrOfCmdStats = traverseThruCollection(ent._cmds);
			//TODO: loop thru command stats and calculate width and height
			//	then create object block and add it to drawing stack
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
						text: cmdArgTxt;
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
viz.prototype.traverseThruCollection = function(coll){
	//TODO: create array of hashmaps returned by 'process' and return this
	//	array back to the caller
	//iterate thru elements of collection
	$.each(
		coll,
		function(key, value){
			//ensure that this entry is an object
			if( typeof value == "object" ){
				process(value);
			}	//end if ensure entity is object
		}	//end iterating function
	)	//end traversing thru collection
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