/**
	Developer:	Eduard Sedakov
	Date:		2015-11-03
	Description:	create a small-scale visualizer that draws Control  FLow
					Graph (CFG) on the screen using JointJS library.
	Used by:	(no JS component, but actual HTML uses it)
	Dependencies:	(everything)
**/

//==========globals:==========

//ES 2016-08-13 (b_cmp_test_1): instance of visualizer (ES 2016-09-11, b_debugger) for debugger
//ES 2016-09-11 (b_debugger): change name of global variable to reflect its connection to dbg
viz.__visualizerInstanceDbg = null;

//ES 2016-09-11 (b_debugger): instance of visualizer for application
viz.__visualizerInstanceApp = null;

//ES 2017-11-09 (b_01): types of visualization platforms
var VIZ_PLATFORM = {
	//original (the only choice till branch b_01) - slow, but allows to control drawn objects 
	 VIZ__JOINTJS: {value: 1, name: "joint js"}
	//new alternative (b_01) - faster, but if any change takes place, we would be required to
	//	re-draw part or whole canvas
	,VIZ__CANVAS: {value: 2, name: "canvas"}
};

//ES 2017-11-09 (b_01): global flag that determines which visualization platform is used for drawing
viz.__visPlatformType = VIZ_PLATFORM.VIZ__CANVAS;

//ES 2017-11-09 (b_01): id of Canvas html element
viz.__canvasHtmlId = "netcmp__canvas";

//ES 2017-11-11 (b_01): color palette for COMMAND
viz.__PAL_CMD = {
	id: "#ff7700",		//command id font color
	type: "#000000",	//command type font (e.g. 'cmp', 'null', ...) color
	arg: "#00ff00",		//command argument font color
};

//ES 2017-11-11 (b_01): color palette for BLOCK
viz.__PAL_BLK = {
	bkgd: "#440044",
	text: "#ffffff",
	"min_btn_fill": "red",
	"min_btn_stroke": "green",
	sep: "#ff00aa"
};

//ES 2017-11-11 (b_01): color palette for SCOPE
viz.__PAL_SCP = {
	bkgd: "#000099",	//scope background color
	text: "#ffffff",	//scope title font color
	sep: "#00aaff",		//scope separator line color
};

//ES 2016-08-13 (b_cmp_test_1): create new or retrieve existing visualizer
//input(s):
//	type: (VIS_TYPE) => (ES 2016-09-11: b_debugger) type of visualizer
//	p: (parser) => (ES 2016-08-28: b_log_cond_test) parer instance
//	id: (text) => id for the HTML component that would contain JointJS CFG chart
//	width: (integer) => width of JointJS viewport (they often denote it as paper)
//	height: (integer) => height of JointJS viewport
//	pointerClickOverload => (ES 2016-09-11, fix comments) handle for mouse click event
//output(s): (none)
viz.getVisualizer = function(type, p, id, width, height, pointerClickOverload){
	//ES 2016-09-11 (b_debugger): init variable for chosen visualizer based on given type
	var tmpVisInst = type == VIS_TYPE.DBG_VIEW ? viz.__visualizerInstanceDbg : viz.__visualizerInstanceApp;
	//check if visualizer instance does not exist
	//ES 2016-09-11 (b_debugger): change from global (viz.__visualizerInstance) to local
	//	(tmpVisInst), which now contains reference to one of the global, depending on type
	if( tmpVisInst == null ){
		//create new instance and store it in a global variable
		//ES 2016-08-28 (b_log_cond_test): add argument for parser instance
		//ES 2016-09-11 (b_debugger): change variable (see comment above) 
		tmpVisInst = new viz(id, width, height, pointerClickOverload, type, p);
	}
	//ES 2016-09-11 (b_debugger): if visualizer is for the debugger
	if( type == VIS_TYPE.DBG_VIEW ){
		//assign global variable for debugger instance
		viz.__visualizerInstanceDbg = tmpVisInst;
	} else if( type == VIS_TYPE.APP_VIEW ){
		//assign global variable for application instance
		viz.__visualizerInstanceApp = tmpVisInst;
	} else {
		//error -- type of visualizer has to be provided
		throw new Error("7482657326958679");
	}
	//return existing instance of visualizer
	//ES 2016-09-11 (b_debugger): change variable (see comment above)
	return tmpVisInst;
};	//end function 'getVisualizer'

//create visualizer object definition
//input(s):
//	id: (text) => id for the HTML component that would contain JointJS CFG chart
//	width: (integer) => width of JointJS viewport (they often denote it as paper)
//	height: (integer) => height of JointJS viewport
//	p: (parser) => (ES 2016-08-28: b_log_cond_test) parer instance
//	type: (VIS_TYPE) => (ES 2016-09-11: b_debugger) type of visualizer
//	pointerClickOverload => (ES 2016-09-11, fix comments) handle for mouse click event
//output(s): (none)
function viz(id, width, height, pointerClickOverload, type, p){
	
	//ES 2016-08-16 (b_cmp_test_1): global variable for number of indentations
	this._numIndents = 1;
	//ES 2016-09-11 (b_debugger): assign type of visualizer
	this._type = type;
	//setup static variables
	//specify default font size
	viz.defFontSize = 23;
	//initialize symbol dialog instance to null
	viz.symbDlgInst = null;
	//create graph and save it's reference
	//ES 2016-09-11 (b_debugger): convert global variable to data field, since now we
	//	have several visualizers (i.e. for debugging, for application ...)
	this._graph = new joint.dia.Graph;

	//ES 2016-08-28 (b_log_cond_test): assign parser instance
	this._parser = p;

	//specify class variables
	//assign dimensions
	this._width = width;
	this._height = height;
	//bookkeep container id
	this._id = id;
	//ES 2017-11-09 (b_01): moved out statement from IF condition below, since it can be used for
	//	all visualization platform types
	this._postponeConnectionTasks = [];
	//ES 2017-11-09 (b_01): if drawing platform relies on Canvas
	if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__CANVAS ) {
		//create canvas object (this._vp will now be Canvas context, which allows to perform pixel drawing operations)
		this.createCanvasObj(type, id, width, height);
	//ES 2017-11-09 (b_01): else, drawing platform depends on JointJS (SVG)
	} else {
		//create JointJS viewport
		var viewport = new joint.dia.Paper({
			el: $("#" + this._id),
			width: this._width,
			height: this._height,
			model: this._graph,
			gridsize: 10,
		});
		//ES 2016-09-11 (b_debugger): assign viewport to object data field '_vp'
		this._vp = viewport;
		//create collection of postponed 'tasks' for connecting blocks
		//ES 2017-11-09 (b_01): move statement out of this condition, since it can be used for both
		//	visualization platform types
		//this._postponeConnectionTasks = [];
		//attach mouse-move event to show/hide symbolDlg
		viewport.on('cell:pointerclick', 
			function(cellView, evt, x, y) {
				if( typeof pointerClickOverload == "undefined" ){
					//if symbol dialog already exists
					if( viz.symbDlgInst !== null ){
						//remove this element
						viz.symbDlgInst.remove();
					}
					//check that currently hovered entity is a command or scope
					if( cellView.model.attributes.type == "command" ||
						cellView.model.attributes.type == "scp" ){

						//get this command's chain of definition symbols
						var dChainTxt = cellView.model.attributes.defSymbChain;
						//measure size of symbol info text to be displayed
						var symbInfoTextDims = viz.measureTextDim(dChainTxt);
						//create globally accessible variable in VIZ scope for symbol dialog
						//initially it will be hidden
						viz.symbDlgInst = viz.createSymbDlg(

							//set position of symbol dialog
							x, y, 

							//set dimensions for the symbol dialog
							symbInfoTextDims.width + 40, symbInfoTextDims.height + 40,

							//specify symbols
							dChainTxt
						);
						//draw symbolic dialog
						viz.__visualizerInstanceDbg._graph.addCells([viz.symbDlgInst]);

					}
				} else {
					pointerClickOverload(cellView, evt, x, y);
				} 
			}
		);
	}	//ES 2017-11-09 (b_01): end if drawing platform relies on Canvas
	//create drawing stack
	//each object (e.g. scope, block, command or value) should be identified
	//using hashmap that contains following information:
	//	x, y - top left corner of object (usually it is a rectangle)
	//	w, h - dimension of object (width or height)
	//	level - depth-level of node inside graph (start is at 0th level)
	this._drawStack = {
		scope: [],	//array of scopes in the order of drawing (i.e. start drawing 
					//from 0th element and proceed to the end of array)
		block: [],		//series of blocks to draw
		command: [],	//series of commands to draw
		cons: [],		//series of connections (arrows) to render
		value: []		//series of symbols to draw (subject to change...)

		//ES 2016-08-13 (b_cmp_test_1): series of Execution Command Stack (ECS) entries
		,ecsEntries: []
	};
	//ES 2016-09-04 (b_debugger): create collection that maps command id to jointJS entity
	this._cmdToJointJsEnt = {};
	//collection of functions drawing commands (each has specific number of arguments)
	this.cmdDrawFuncs = {};	//key: (int) => number of args, value: (function) draw cmd
};

//ES 2017-11-09 (b_01): create canvas object and attach it inside specified HTML component (id)
//input(s):
//	vizType: (VIS_TYPE) => type of visualizer
//	id: (string) id of HTML element where to insert canvas object, if it is not specified, then
//			canvas will be inserted directly inside body
//	width: (number) width of canvas
//	height: (number) height of canvas
//output(s):
//	(Canvas) => created canvas object
viz.prototype.createCanvasObj = function(vizType, id, width, height) {
	//if id of owner is not specified
	if( id == "" ) {
		//set owner to be document.body
		id = "body";
	//else, ID is specified
	} else {
		id = "#" + id;
	}	//end if owner is not specified
	//get visualizer object
	var tmpVizObj = viz.getVisualizer(vizType);
	//flag - is width value provided
	var tmpIsWidthGiven = width != "" && width != 0 && width != "0";
	//flag - is height value given
	var tmpIsHeightGiven = height != "" && height != 0 && height != "0";
	//create and setup canvas
	var canvas = document.createElement('canvas');
	canvas.id = viz.__canvasHtmlId;
	canvas.style.width = tmpIsWidthGiven ? ("" + width + "px") : '100%';
	canvas.style.height = tmpIsHeightGiven ? ("" + height + "px") : '100%';
	canvas.style.zIndex = 8;
	canvas.style.border = '1px solid black';
	//set also width and height in pixels
	//see: https://stackoverflow.com/a/15794770
	canvas.width = tmpIsWidthGiven ? canvas.style.width : $(id).width();
	canvas.height = tmpIsHeightGiven ? canvas.style.height : $(id).height();
	//create a event handler that would be triggered when OWNER is resized
	$(window).resize(function() {
		//get content of canvas
		var tmpCanvasContent = tmpVizObj._vp.getImageData(0, 0, canvas.width, canvas.height);
		//change number of pixels in width and height of canvas accordingly
		canvas.width = $(id).width();
		canvas.height = $(id).height();
		//place back content of canvas, since after resizing of canvas, it will clear up
		//see: https://stackoverflow.com/a/3543909
		tmpVizObj._vp.putImageData(tmpCanvasContent, 0, 0);
	});
	//insert canvas into DOM hierarchy
	$(id).append(canvas);
	//generate and save context
	this.vp = canvas.getContext('2d');
};	//ES 2017-11-09 (b_01): end function 'createCanvasObj'

//ES 2017-11-11 (b_01): draw rounded rectangle
//input(s):
//	x: (number) left x coordinate
//	y: (number) left y coordinate
//	width: (number) width of the rectangle
//	height: (number) height of the rectangle
//	radius: (number) corner radius
//output(s): (none)
//Note: code is derived from: https://stackoverflow.com/a/3368118
viz.prototype.roundRect = function (x, y, width, height, radius) {
	//create rectangle path with curved edges
	this._vp.beginPath();
	this._vp.moveTo(x + radius, y);
	this._vp.lineTo(x + width - radius, y);
	this._vp.quadraticCurveTo(x + width, y, x + width, y + radius);
	this._vp.lineTo(x + width, y + height - radius);
	this._vp.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	this._vp.lineTo(x + radius, y + height);
	this._vp.quadraticCurveTo(x, y + height, x, y + height - radius);
	this._vp.lineTo(x, y + radius);
	this._vp.quadraticCurveTo(x, y, x + radius, y);
	this._vp.closePath();
	//fill out path
	this._vp.fill();
};	//ES 2017-11-11 (b_01): end function 'roundRect'

//ES 2017-11-11 (b_01): re-size canvas to the size of its parent
//input(s):
//	canvas: (Canvas) js canvas object
//output(s): (none)
//Note: code is copied from https://stackoverflow.com/a/10215724
viz.prototype.fitToContainer = function(canvas){
	// Make it visually fill the positioned parent
	canvas.style.width ='100%';
	canvas.style.height='100%';
	// ...then set the internal size to match
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
};	//ES 2017-11-11 (b_01): end function 'fitToContainer'

//ES 2017-11-11 (b_01): draw arrow shape that indicates currently executing command
//input(s):
//	x: (number) top-left x-coordinate
//	y: (number) top-left y-coordinate
//output(s): (none)
viz.prototype.drawExecArrow = function(x, y) {
	//save filling and stroke colors
	var tmpStrokeColor = this._vp.strokeStyle;
	var tmpFillColor = this._vp.fillStyle;
	//assign filling and stroke colors for execution arrow shape
	this._vp.strokeStyle = "#00ff00";
	this._vp.fillStyle = "#ff0000";
	//start arrow path (it is 30 px wide and 24 px high)
	this._vp.beginPath();
	ctx.moveTo(x, y + 8);
	ctx.lineTo(x + 12, y + 8);
	ctx.lineTo(x + 12, y);
	ctx.lineTo(x + 30, y + 12);
	ctx.lineTo(x + 12, y + 24);
	ctx.lineTo(x + 12, y + 16);
	ctx.lineTo(x, y + 16);
	this._vp.closePath();
	//fill out resulting arrow shape
	this._vp.fill();
	//assign prior stroke and filling colors
	this._vp.strokeStyle = tmpStrokeColor;
	this._vp.fillStyle = tmpFillColor;
};	//ES 2017-11-11 (b_01): end function 'drawExecArrow'

//make sure that function that draws a command with speicified number of arguments
//is defined, and return it. (actually return value has never been used)
//input(s):
//	numArgs: (integer) => number of arguments
//output(s):
//	(object) => jointJS object that draws rectangle with customized properties
viz.prototype.setupDrawCmdFunc = function(numArgs){
	//check if function for command with specified number of arguments
	//has been already created
	if( 'command_' + numArgs in joint.shapes ){
		return joint.shapes['command_' + numArgs];
	}
	//otherwise, create a brand new one
	return this.createDrawCmdFunc(numArgs);
};	//end function 'setupDrawCmdFunc'

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
		//ES 2017-11-11 (b_01): replace constant value for color of command id with variable
		'.i_CmdId': { 'font-size': 23, fill: viz.__PAL_CMD['id'], 'stroke': viz.__PAL_CMD['id'] },
		//ES 2017-11-11 (b_01): replace constant value for color of command type with variable
		'.i_CmdTy': { 'font-size': 23, 'font-weight': 'bold', fill: viz.__PAL_CMD['type'], 
						'stroke': viz.__PAL_CMD['type'] 
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
		//ES 2016-08-13 (b_cmp_test_1): declare color variable for argument's text
		//ES 2017-11-11 (b_01): replace constant value for color of command argument with variable
		var tmpClr = viz.__PAL_CMD['arg'];
		//ES 2016-08-13 (b_cmp_test_1): if rendering ECS and it is the last argument
		if( interpreter.__doRenderECS && (numArgs - 1) == i ){
			//change text color
			tmpClr = "#00ddff";
		}
		//add new command attribute
		cmdAttrs['.i_Arg' + argIdx] = {
			//ES 2016-08-13 (b_cmp_test_1): factor out color const into variable tmpClr
			'font-size': 23, fill: tmpClr, stroke: tmpClr
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
        	//ES 2017-11-11 (b_01): replace scope's filling constant color with variable
            rect: { 'follow-scale': true, width: 300, height: 300, fill: viz.__PAL_SCP['bkgd'], opacity: 0.5, rx: 15, ry: 15 },
            '.i_ScpName': { 'font-size': 23, 'stroke': viz.__PAL_SCP['text'] },
            '.scpSep': { 'stroke': viz.__PAL_SCP['sep'], 'stroke-width': 2, d:'M 0 40 L 300 40' },
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
        	//ES 2017-11-11 (b_01): replace constant color value for scope background with variable 'bkgd'
            rect: { 'follow-scale': true, width: 300, height: 300, fill: viz.__PAL_BLK['bkgd'], opacity: 0.5, rx: 15, ry: 15 },
            //ES 2017-11-11 (b_01): replace constant color value for scope title with variable 'text'
            '.i_BlkName': { 'font-size': 23, 'stroke': viz.__PAL_BLK['text'] },
            //ES 2017-11-11 (b_01): replace constant color values for minimizing button with variables
            '.minBtn': { width: '15', height: '7', fill: viz.__PAL_BLK['min_btn_fill'], stroke: viz.__PAL_BLK['min_btn_stroke'], 'stroke-width': 2, rx: 0, ry: 0 },
            //ES 2017-11-11 (b_01): replace constant color value for scope separator line with variable 'sep'
            '.blkSep': { 'stroke': viz.__PAL_BLK['sep'], 'stroke-width': 2, d:'M 0 40 L 300 40' },
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});	//end prototype function for drawing block

//function to create shape for showing symbols attached to command
//input(s):
//	x,y: (integers) position for symbol dialog
//	w,h: (integers) dimensions for symbol dialog
//output(s):
//	(jointJS element) => jointJS shape element
viz.createSymbDlg = function(x,y,w,h,text){

	//create and return jointJS shape element
	//http://stackoverflow.com/questions/23539127/creating-octagon-in-jointjs
	return new joint.shapes.basic.Path ({
		
		//specify dimensions of the dialog
		size: {
			width: w,
			height: h
		},

		//specify position of the dialog
		position: {
			x: x,
			y: y
		},
		//specify attributes of the shape
		attrs: {

			//specify shape path
			path: {

				//specify shape visual attributes
				fill : 'green',
				stroke : 'black', 
				'stroke-width' : 3,

				//draw path, for more infor see http://www.svgbasics.com/paths.html
				'd': 'M 0 0 L ' + w + ' 0 L ' + w + ' ' + h + ' L 20 ' + h + ' L 20 20 L 0 0'
			},

			//specify text atttributes rendered inside shape
			text: {

				//specify font size for the text
				'font-size': 23,

				//specify actual symbolic text representation
				text: text,

				//specify vertical position of text relative to the shape
				'ref-y': 0.4
			}
		}
	});

};	//end function 'createSymbDlg'

//measure dimensions of the text given its font size
//input(s):
//	text: (string) => text, whose size to measure
//output(s):
//	{int, int} => height and width
viz.measureTextDim = function(text){
	//break given text by new line characters ('\n') to identify how many lines in text
	var lines = text.split('\n');
	//measure width and height of given text
	return {
		//very crude estimate (works for some of the fontsizes)
		height: lines.length * (viz.defFontSize - 1),
		//find longest line and use it to determine max width of text segment
		//for '_max' see - http://stackoverflow.com/questions/17386774/javascript-find-longest-word-in-a-string
		width: _.max(lines, function(word) { return word.length; }).length * (viz.defFontSize - 11)
	};
};	//end function 'measureTextDim'

//test function for visualization
//input(s):
//	id,w,h
//output(s): nothing
function test_viz(id,w,h){
	//first create program with global scope
	/*var prog = new program();
	//get global scope
	var g_scp = prog.getGlobalScope();

	//setup integer type
	var t_int = new type("integer", OBJ_TYPE.INT, g_scp);

	//setup symbols for null123, null9, and multiplication commands
	var s_null123 = new symbol("i", t_int, g_scp);
	var s_null9 = new symbol("j", t_int, g_scp);
	var s_mul = new symbol("total", t_int, g_scp);
	
	//get references for start and end blocks
	var start = g_scp._start, end = g_scp._end;
	//add command NULL 123 to start
	var null123 = start.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(123)],
		[s_null123]
	);
	//add command NULL 9 to start
	var null9 = start.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(9)],
		[s_null9]
	);
	//add command MUL that uses two previously defined constants 123 and 9
	start.createCommand(
		COMMAND_TYPE.MUL,
		[null123, null9],
		[s_mul,s_null9, s_null123]
	);
	//add command NULL 9 to start
	var null1 = start.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue(1)],
		[]
	);
	//add command NULL 'hello world' to end block
	end.createCommand(
		COMMAND_TYPE.NULL,
		[value.createValue("hello worldddddddddddd!")],
		[]
	);

	//connect start to an end
	block.connectBlocks(start, end);*/

	//run test function
	var g_scp = test__program_scope_block_function();

	//create visualization component
	//ES 2016-08-13 (b_cmp_test_1): replace call to 'viz' with a function that either
	//	creates a new viz instance or returns existing one
	var v = viz.getVisualizer(id, w, h);	//arguments for 'getVisualizer' changed
	//draw CFG
	v.drawCFG(g_scp);
};

//ES 2016-08-16 (b_cmp_test_1): add or remove horizontal indentation, which is used
//	to distinguish code in the caller from the callee (right indented)
//input(s):
//	doIndent: (boolean) should we indent or unindent
//output(s): (none)
viz.prototype.performIndentationAction = function(doIndent){
	this._numIndents = this._numIndents + (doIndent ? 1 : -1);
};	//ES 2016-08-16 (b_cmp_test_1): end method 'performIndentationAction'


//ES 2016-08-13 (b_cmp_test_1): add entry to an execution command stack (ECS)
//input(s):
//	c: (COMMAND) executed command
//	e: (TEXT) text representation of entity associated with this command
//output(s): (none)
viz.prototype.addEntryToECS = function(c, e){
	//init last entry of ECS
	var tmpLastECSEntry = null;
	//init X and Y coordinates for this entry
	//ES 2016-08-16 (b_cmp_test_1): include number of indentations to determine horiz margin
	var ecsEntryX = 50 * this._numIndents, ecsEntryY = 50;
	//if there is at least one ECS entry
	if( this._drawStack['ecsEntries'].length > 0 ){
		//get number of entries in the ECS
		var tmpNumECSEntries = this._drawStack['ecsEntries'].length;
		//get last entry
		tmpLastECSEntry = this._drawStack['ecsEntries'][tmpNumECSEntries - 1];
		//set X and Y coordinates for this entry using data for the last ECS entry
		ecsEntryY += tmpLastECSEntry.y;
	}	//end if there is at least one ECS entry
	//create command element and store it inside ECS entry collection
	this._drawStack['ecsEntries'].push(this.renderCommand(c, e, ecsEntryX, ecsEntryY));
};	//ES 2016-08-13 (b_cmp_test_1): end method 'addEntryToECS'

//ES 2016-08-13 (b_cmp_test_1): add specified stack entries to JointJS environment
//input(s):
//	stkName: (TEXT) stack name
//output(s): (none)
viz.prototype.addStackEntriesToJointJS = function(stkName){
	//get currently iterated drawing stack
	var curDrwStk = this._drawStack[stkName];
	//check that drawing stack is not empty
	if( curDrwStk.length > 0 ){
		//init array of jointJS objects
		var tempArr = [];
		//loop thru collection to construct array of jointJS objects
		for( var i = 0; i < curDrwStk.length; i++ ){
			//add object to jointJS array
			tempArr.push(curDrwStk[i].obj);
		}
		//draw elements of this current stack by adding them to the graph
		//ES 2017-01-26 (b_aws_fix_01): try different approach for pushing
		//	elements to jointJS to avoid browser freezes
		//viz.__visualizerInstanceDbg._graph.addCells(tempArr.reverse());

	}
};	//ES 2016-08-13 (b_cmp_test_1): end function 'addStackEntriesToJointJS'

//ES 2017-01-26 (b_aws_fix_01): current index
nc__pars__viz__curEntIdx = 0;

//ES 2017-01-26 (b_aws_fix_01): stkIdx: (text) name of category of CFG elements to be pushed into JointJS
nc__pars__viz__stkIdx = 0;

//ES 2017-01-26 (b_aws_fix_01): offset: (integer) number of elements to process in each chunk before relasing control to browser
nc__pars__viz__offset = 0;

//ES 2017-01-26 (b_aws_fix_01): period: (integer) number of milliseconds to sleep (time to release control to browser)
nc__pars__viz__period = 0;

//ES 2017-01-26 (b_aws_fix_01): set array of categories of entities to push to jointJS component for rendring CFG
nc__pars__viz__loopOrd = ["scope", "block", "command", "cons"];

//ES 2017-01-27 (b_aws_fix_01): max number of items to upload to jointJS
nc__progressbar__max = 0;
//ES 2017-01-27 (b_aws_fix_01): current total of items uploaded to jointJS
nc__progressbar__cur = 0;

//ES 2017-01-26 (b_aws_fix_01): most intensive part of code is building CFG with jointJS, so we
//	need some what different strategy then function 'addStackEntriesToJointJS', i.e. need
//	to break up work flow in chunks and periodically return control to browser to avoid freezes
//inpu(s): (none)
//output(s): (none)
function uploadEntitiesToJointJS(){

	//reset to shorter names
	var cur = nc__pars__viz__curEntIdx;
	var stkidx = nc__pars__viz__stkIdx;
	var off = nc__pars__viz__offset;
	var period = nc__pars__viz__period;
	var loopOrd = nc__pars__viz__loopOrd;

	//iterate over elementes in the drawing stack to compose array that will be pushed to jointJS
	var tmpArr = [];
	for( 
		var i = cur; 
		i >= ((cur - off + 1) < 0 ? 0 : (cur - off + 1)); 
		i--
	){

		//add object to array
		tmpArr.push(viz.__visualizerInstanceDbg._drawStack[loopOrd[stkidx]][i].obj);

	}	//end iterate over elements to compose array that is pushed to jointJS

	//update current index and value for progress bar
	nc__progressbar__cur += (nc__pars__viz__curEntIdx < off ? nc__pars__viz__curEntIdx : off);
	nc__pars__viz__curEntIdx -= off;

	//if we exhausted current category
	if( nc__pars__viz__curEntIdx <= 0 ){

		//if there is no another category to process
		if( stkidx >= (loopOrd.length - 1) ){

			//hide progress bar
			nc__progress__hide();

			//quit
			return;

		}	//end if there is no another category to process

		//switch to another category
		nc__pars__viz__stkIdx++;
		stkidx = nc__pars__viz__stkIdx;
		nc__pars__viz__curEntIdx = viz.__visualizerInstanceDbg._drawStack[loopOrd[stkidx]].length - 1;

	}	//end if we exhausted current category

	//update progress bar with the new value
	nc__progress__update(
		parseInt(10000 * nc__progressbar__cur / nc__progressbar__max) / 100
	);

	//push array to jointJS
	viz.__visualizerInstanceDbg._graph.addCells(tmpArr);

	//give back control to browser
	setTimeout(
		function(){
			uploadEntitiesToJointJS()
		},
		period
	);

};	//ES 2017-01-26 (b_aws_fix_01): end function 'uploadEntitiesToJointJS'

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
	//ES 2016-09-11 (b_debugger): get resulting value from processing global scope
	var tmpGlobScpRs = this.process(gScp, 0, 0);
	//ES 2016-09-11 (b_debugger): init flag to determine if should change dimensions
	var doUpdDims = false;
	//ES 2016-09-11 (b_debugger): check if viewport width is smaller then resulting
	//	width of global's scope
	if( this._width < tmpGlobScpRs.width ){
		//need to update dimensions
		doUpdDims = true;
		//reset width
		this._width = tmpGlobScpRs.width;
	}
	//ES 2016-09-11 (b_debugger): check if viewport height is smaller then resulting
	//	height of global's scope
	if( this._height < tmpGlobScpRs.height ){
		//need to update dimensions
		doUpdDims = true;
		//reset width
		this._height = tmpGlobScpRs.height;
	}
	//ES 2016-09-11 (b_debugger): is need to update viewport dimensions
	if( doUpdDims ){
		//change viewport dimensions
		V(this._vp.svg).attr({
			width: this._width,		//change width
			height: this._height	//change height
		}); 
	}	//ES 2016-09-11 (b_debugger): end if update viewport dimensions
	//loop thru postponed connections that need to be handled separately
	for( var k = 0; k < this._postponeConnectionTasks.length; k++ ){
		//get source block
		var tmpBlkSource = this._postponeConnectionTasks[k];
		//if jointJS info struct is not defined in source block
		if( !('_jointJSBlock' in tmpBlkSource) ){
			//skip this block
			continue;
		}
		//make a collection of blocks that this jumps in or falls to
		var tmpSet = [];
		//if there is a block to which this one jumps to
		if( tmpBlkSource._jumpToOther ){
			tmpSet.push({block: tmpBlkSource._jumpToOther, fall: false});
		}
		//if there is a block to which this one falls to
		if( tmpBlkSource._fallInOther ){
			tmpSet.push({block: tmpBlkSource._fallInOther, fall: true});
		}
		//loop thru blocks that source fallsIn/jumpTo
		for( var i = 0; i < tmpSet.length; i++ ){
			//get destination block
			var tmpBlkDest = tmpSet[i].block;
			///if jointJS block is not defined
			if( !('_jointJSBlock' in  tmpBlkDest) ){
				//skip this block
				continue;
			}
			//get jointJS object for the destination
			var tmpJointJsDestBlkObj = tmpBlkDest._jointJSBlock;
			//ES 2016-08-28 (b_log_cond_test): declare variable to specify color for the
			//	arrow, that connects destination block with PHI commands with the other
			//	block that is part of boolean logical expression
			var tmpArrowColor = null;		//for now, set it to null
			//ES 2016-08-28 (b_log_cond_test): check if destination block has PHI commands, i.e.
			//	if it is inside associative array that associates phi command argument with
			//	specific block to determine which PHI's argument to take by an interpreter
			if( tmpBlkDest.getTypeName() == RES_ENT_TYPE.BLOCK &&
				tmpBlkDest._id in this._parser._phiArgsToBlks ){
				//if source block (which points at destination) represents PHI's left argument
				if( tmpBlkSource._id in this._parser._phiArgsToBlks[tmpBlkDest._id].left ){
					//assign red color
					tmpArrowColor = "FF0000";
				//otherwise, it represents right argument
				} else if( tmpBlkSource._id in this._parser._phiArgsToBlks[tmpBlkDest._id].right ) {
					//assign green color
					tmpArrowColor = "00FF00";
				}
			}
			//make a connection
			this.connectJointJSBlocks(
				tmpBlkSource._jointJSBlock,
				tmpJointJsDestBlkObj,
				tmpSet[i].fall
				//ES 2016-08-28 (b_log_cond_test): pass in additional argument to represent
				//	arrow color, which is used to distinct LEFT and RIGHT blocks that
				//	connect to the PHI block
				, tmpArrowColor
			);
		}
	}
	//loop thru drawing stacks for scope, block, and command
	//	setup order for looping
	var loopOrd = ["scope", "block", "command", "cons"];
	//loop thru stacks in this order
	//ES 2017-01-26 (b_aws_fix_01): moved and refactored into function 'uploadEntitiesToJointJS'
	//for( var drwStkIdx = 0; drwStkIdx < loopOrd.length; drwStkIdx++ ){
		//get currently iterated drawing stack
		/* ES 2016-08-13 (b_cmp_test_1): modularize code in 'addStackEntriesToJointJS'
		var curDrwStk = this._drawStack[loopOrd[drwStkIdx]];
		//check that drawing stack is not empty
		if( curDrwStk.length > 0 ){
			//init array of jointJS objects
			var tempArr = [];
			//loop thru collection to construct array of jointJS objects
			for( var i = 0; i < curDrwStk.length; i++ ){
				//add object to jointJS array
				tempArr.push(curDrwStk[i].obj);
			}
			//draw elements of this current stack by adding them to the graph
			viz._graph.addCells(tempArr.reverse());
		}
		ES 2016-08-13 (b_cmp_test_1): end modularize code in 'addStackEntriesToJointJS' */
		//ES 2016-08-13 (b_cmp_test_1): add entries for iterated stack to JointJS
                //ES 2017-01-26 (b_aws_fix_01): try different approach for pushing
                //      elements to jointJS to avoid browser freezes
		//this.addStackEntriesToJointJS(loopOrd[drwStkIdx]);

		//ES 2017-01-26 (b_aws_fix_01): setup starting value for glob var current entry index
		nc__pars__viz__curEntIdx = this._drawStack[loopOrd[0]].length - 1;

		//ES 2017-01-26 (b_aws_fix_01): setup name of category of CFG elements to be pushed into JointJS
		nc__pars__viz__stkIdx = 0;

		//ES 2017-01-26 (b_aws_fix_01): setup number of elements to process in each chunk before relasing control to browser
		nc__pars__viz__offset = 30;

		//ES 2017-01-26 (b_aws_fix_01): setup number of milliseconds to sleep (time to release control to browser)
		nc__pars__viz__period = 200;

		//ES 2017-01-27 (b_aws_fix_01): show progress bar
		nc__progress__show();

		//ES 2017-01-27 (b_aws_fix_01): set total number of elements to upload to jointJS
		$.each(this._drawStack, function(key, val){ nc__progressbar__max += val.length; });

		//ES 2017-01-26 (b_aws_fix_01): upload entries to jointJS with periods of sleep to avoid freezes
		uploadEntitiesToJointJS();

	//ES 2017-01-26 (b_aws_fix_01): moved and refactored into function 'uploadEntitiesToJointJS'
	//}
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
			//ES 2017-02-12 (soko): if this scope represents an object AND this object
			//	is non-custom (i.e. not user defined), then do not render it
			if( ent._type.value == SCOPE_TYPE.OBJECT.value && ent._typeDecl._type.value != OBJ_TYPE.CUSTOM.value ){
				//return NULL
				return null;
			}	//ES 2017-02-12 (soko): end if this scope represents non-custom object
			//setup scope overall dimension variables
			var totScpWidth = 0, totScpHeight = 0;
			//traverse thru child scopes
			var  childScpInfo = this.traverseThruCollection(
				//children scopes inside this scope
				ent._children,
				//mini-class that determines position of children scopes
				{
					//setup position of starting scope
					init: function(){
						return {x: x+20, y: y+80};
					},
					//calculate positions for subsequent chidlren scopes
					update: function(lastElemInfoStruct){
						return {
							x: lastElemInfoStruct.x,
							y: lastElemInfoStruct.y+lastElemInfoStruct.height
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
			//if( blkPrcsStk.length == 0 ){
			//	//if it is empty, then trigger error
			//	throw new Error('988633134');
			//}
			//initialize top-left coordinates for area where blocks are drawn
			var topLeftBlkDrawArea = {
				x: x+20,
				y: y+80+childScpInfo.parentDims.height
			};
			//update overall dimensions
			totScpWidth = childScpInfo.parentDims.width + 20;
			totScpHeight = childScpInfo.parentDims.height + 80;
			//initialize coordinate set <x,y> for starting item
			var curIterElemX = topLeftBlkDrawArea.x;
			var curIterElemY = topLeftBlkDrawArea.y;
			//initialize graph level
			var cfgLevel = 0;
			//setup maximum height and width of level
			var maxLevHeight = 0, maxLevWidth = 0;
			//init collection of blocks inside this scope
			var arrBlks = [];
			//check if there are blocks in the stack
			if( blkPrcsStk.length > 0 ){
				//perform a variant of BFS (breadth-first-search) thru blocks only
				//	within this scope, starting from source block(s)
				var blkPrcsIdx = 0;
				while( blkPrcsIdx < blkPrcsStk.length ){
					//get reference to the current block
					var curIterBlk = blkPrcsStk[blkPrcsIdx];
					//check if block was already processed
					if( '_jointJSBlock' in curIterBlk ){
						//go to next item
						blkPrcsIdx++;
						continue;
					}
					//check if we are still in the same level
					if( cfgLevel != curIterBlk._level ){
						//if not, then update level and current coordinates of block
						cfgLevel++;
						curIterElemX = topLeftBlkDrawArea.x;
						curIterElemY += maxLevHeight + 40;
						//update overall height
						totScpHeight += maxLevHeight + 40;
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
					var prcRes = this.process(curIterBlk, curIterElemX, curIterElemY);
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
					//add resulting block to collection
					arrBlks.push({'obj': prcRes.obj});
				}	//end loop thru blocks in the stack
			} else {	//if there are no blocks in the stack
				//add extra width to display empty scopes better
				maxLevWidth += 100;
			}	//end if there are blocks in the stack
			//update overall height
			totScpHeight += maxLevHeight + 80;
			totScpWidth += maxLevWidth - 20 + 20;
			//setup scope label
			var scpLbl = ent._id.toString();
			//depending on the type of scope set its label appropriately
			switch( ent._type.value ){
				case SCOPE_TYPE.OBJECT.value:

					//set type title to display by defaul
					var tpTitle = 'TYPE';

					//check if type title is defined
					if( '_typeTitle' in ent ){
						//specify instead actual name of the type
						tpTitle = ent._typeTitle;
					}

					//identify that scope represents a type with '@'
					//and append type name
					scpLbl += ' @ ' + ent._typeTitle;
					break;

				case SCOPE_TYPE.FUNCTION.value:

					//append function name and '()' to identify it 
					//as a function
					scpLbl = ent._funcDecl._id + ' ' + ent._funcDecl._name + "()";
					break;

				//ES 2017-02-14 (soko): new case for global scope to set the caption
				case SCOPE_TYPE.GLOBAL.value:

					scpLbl += ": GLOBAL";
					break;

				default:

					//state that it is a generic scope
					scpLbl += ': scope';
			}
			//initialize string representation of symbols defined in this scope
			var defChainStr = "";
			//keep track of how many symbols are processed
			var symbCnt = 0;
			//loop thru symbols defined in this scope
			for( var k in ent._symbols ){

				//get symbol object
				var s = ent._symbols[k];

				//if this is a symbol object
				if( typeof s == "object" ){

					//add symbol to text representation
					defChainStr += (defChainStr == "" ? '' : ';') +

						//if symbol count has reached multiple of 5, then add new line
						(symbCnt % 5 == 0 && symbCnt > 0 ? '\n' : '') +

						//add symbol title and id
						s._name + "(" + s._id + ")";

					//increment symbol counter
					symbCnt++;
				}	//end if it is a symbol object

			}	//end loop thru symbol hashmap
			//ES 2017-02-14 (soko): init value for rounding corners
			var tmpRndCorner = 15;
			//ES 2017-02-14 (soko): if this is global scope
			if( ent._type.value == SCOPE_TYPE.GLOBAL.value ){
				tmpRndCorner = 0.5;
			//ES 2017-02-14 (soko): else, if scope represents object type definition
			} else if( ent._type.value == SCOPE_TYPE.OBJECT.value ){
				tmpRndCorner = 5;
			}	//ES 2017-02-14 (soko): end if this is global scope
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

						//ES 2017-02-14 (soko): change size of rounding corners
						rect : {
							rx: tmpRndCorner,
							ry: tmpRndCorner
						},

						//setup a block title
						'.i_ScpName': {
							text: scpLbl
						},

						//position a block title
						'.o_ScpName': {
							transform: "translate(15,10)"
						},

						//set dimension and position of scope separator
						'.scpSep': {
							d:'M 0 40 L ' + totScpWidth + ' 40'
						}
					},

					//additional information can be placed in customized field, here
					//in my case such info is scope's symbols that are defined in
					//this scope
					defSymbChain: defChainStr

				})	//end object reference
			};
			//embed blocks inside scope
			this.embedObjSeriesInsideAnother(arrBlks, ret.obj);
			//add new element to drawing stack
			this._drawStack['scope'].push(ret);
			break;
		case RES_ENT_TYPE.BLOCK.value:
			//traverse thru set of commands
			var info = this.traverseThruCollection(
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
							x: lastElemInfoStruct.x,//+lastElemInfoStruct.width,
							y: lastElemInfoStruct.y+lastElemInfoStruct.height+10
						};
					}
				}
			);
			//calculate width of height of block
			var blkWidth = info.parentDims.width + 20 * 2;
			var blkHeight = info.parentDims.height + 50 * 2;
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
						},

						//set dimension and position of scope separator
						'.blkSep': {
							d:'M 0 40 L ' + blkWidth + ' 40'
						}
					}

				})	//end object reference
			};
			//embed commands inside block
			this.embedObjSeriesInsideAnother(info.arrayOfChildrenInfoStructs, ret.obj);
			
			//Comments only: for blocks that are jumping/falling in this block
			
			//create list of items to link by cloning '_jumpToThis'
			//var itemsToLink = ent._jumpToThis.slice(0);
			var itemsToLink = [];
			for( var l = 0; l < ent._jumpToThis.length; l++ ){
				//add jump object to the set
				itemsToLink.push({block: ent._jumpToThis[l], fall: false});
			}
			//check if '_fallInThis' is not null, then add it to the list
			if( ent._fallInThis != null ){
				itemsToLink.push({block: ent._fallInThis, fall: true});
			}
			
			//create an arrow from them to this block
			for( var k = 0; k < itemsToLink.length; k++ ){
				//get iterated item
				var curItem = itemsToLink[k].block;
				//make sure that this object has been processed
				/*if( '_jointJSBlock' in curItem ){
					//create a connection structure
					this.connectJointJSBlocks(
						curItem._jointJSBlock, 
						ret.obj,
						itemsToLink[k].fall
					);
				} else {	//object should have been processed by now, error
				*/
					//throw new Error('78738678362');
					//add postponed task for connecting blocks
					this._postponeConnectionTasks.push(curItem);
				/*}*/
			}
			//add new element to drawing stack
			this._drawStack['block'].push(ret);
			//add jointJS object reference to the parsing block
			ent._jointJSBlock = ret.obj;
			break;
		case RES_ENT_TYPE.COMMAND.value:
			/* ES 2016-08-13 (b_cmp_test_1): modularize code in 'renderCommand' function
			//initialize array of widths for each element of command
			var cmdElemWidths = [];
			//determine dimension for command id
			cmdIdDims = viz.measureTextDim(ent._id.toString() + ': ');
			//initialize command's width
			var cmdWidth = cmdIdDims.width;
			//assign width of command id element
			cmdElemWidths[0] = cmdWidth;
			//increment total width of command by width of command type
			cmdWidth += viz.measureTextDim(ent._type.name + '  ').width;
			//measure width of command type
			cmdElemWidths[1] = cmdWidth;
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
					text: ent._id.toString() + ': '
				},
				//specify translation of command type element
				'.o_CmdTy' : {
					transform: "translate(" + cmdElemWidths[0] + ", 0)"
				},
				//specify text for command type element
				'.i_CmdTy' : {
					text: ent._type.name
				}
			};
			//loop thru arguments to determine their dimensions and
			//	to add their translations/text to attrs
			for( var idx = 0; idx < ent._args.length; idx++ ){
				//get reference to current argument
				var cur = ent._args[idx];
				//init prefix
				var prefix = "";
				//make sure that cur is legal
				if( typeof cur != "object" || cur == null ){
					//skip this illegal object
					continue;
				}
				//depending on the type of argument
				switch(cur.getTypeName().value){
					case RES_ENT_TYPE.COMMAND.value:
						prefix = 'c_';
						break;
					case RES_ENT_TYPE.VALUE.value:
						prefix = '$';
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
				var cmdArgTxt = 
					prefix + (
						cur.getTypeName().value == RES_ENT_TYPE.VALUE.value ?
							cur._value :
							cur._id
					) + ('_name' in cur ? '(' + cur._name + ')' : '');
				//if this is not last argument
				if( idx + 1 < ent._args.length ){
					//add comma to the text representation of command argument
					cmdArgTxt += ',';
				}
				//add text representation to attrs
				attrs['.i_Arg' + (idx + 1)] = {
					text: cmdArgTxt
				};
				//update total width of command
				cmdWidth += viz.measureTextDim(cmdArgTxt).width;
				//calculate width of argument
				cmdElemWidths[2 + idx] = cmdWidth;
				//add translation to attrs
				attrs['.o_Arg' + (idx + 1)] = {
					transform: "translate(" + cmdElemWidths[1 + idx] + ",0)"
				};
			}
			//get reference to the function that creates jointJS command
			this.setupDrawCmdFunc(ent._args.length);
			//loop thru def-chain to create string representation of def-chain symbols
			var defChainStr = "";
			for( var i in ent._defChain ){
				//get current symbol object
				var s = ent._defChain[i];
				//check that this is an object
				if( typeof s == "object" ){
					defChainStr += (defChainStr != "" ? ", " : "") + 
						s._name + "(" + s._id + ")";
				}	//end if object
			}	//end loop to create string representation fir def-chain symbols
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
				obj: new joint.shapes['command_' + ent._args.length]({

					//specify position of command
					position: {
						x: x,
						y: y
					},

					//specify visual characteristics for command
					attrs: attrs,

					//additional information can be placed in customized field, here
					//in my case such info is about command's symbols, i.e. defChain
					//of symbols - chain of symbols that defined this command.
					defSymbChain: defChainStr

				})	//end object reference
			};
			ES 2016-08-13 (b_cmp_test_1): end modularized code in 'renderCommand' */
			//ES 2016-08-13 (b_cmp_test_1): call 'renderCommand' that contains
			//	commented out code above to setup command element for jointJS rendering
			ret = this.renderCommand(ent, null, x, y);
			//ES 2016-09-04 (b_debugger): map command to jointJS entity
			this._cmdToJointJsEnt[ent._id] = ret;
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

//ES 2017-11-11 (b_01): draw text on cavas
//input(s):
//	color: (string) color for text string
//	txt: (string) text to draw
//	x: (number) top-left x-coordinate
//	y: (number) top-left y-coordinate
//output(s): (none)
viz.prototype.drawTextOnCanvas(color, txt, x, y) {
	ctx.fillStyle = color;
	ctx.font = "" + viz.defFontSize + "px Arial";
	ctx.fillText(txt, x, y);
};	//ES 2017-11-11 (b_01): end function 'drawTextOnCanvas'

//ES 2016-08-13 (b_cmp_test_1): moved code from function 'process' case 'command' into
//	this function, so that it can be called also to render command for ECS
//input(s):
//	ent: (COMMAND) current command entity
//	v: (TEXT) variable text value, associated with this command (only used for rendering ECS)
//	x: (number) x-coordinate of command's top-left corner
//	y: (number) y-coordinate of command's top-left corner
//output(s):
//	(JS object) => command element structure
//	(null) => ES 2017-11-11 (b_01): return NULL when drawing command on Canvas
viz.prototype.renderCommand = function(ent, v, x, y){
	//ES 2017-11-11 (b_01): do draw using jointjs (svg)
	var tmpDrawViaJointJs = viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS;
	//ES 2017-11-11 (b_01): do draw on canvas
	var tmpDrawOnCanvas = viz.__visPlatformType == VIZ_PLATFORM.VIZ__CANVAS;
	//initialize array of widths for each element of command
	var cmdElemWidths = [];
	//ES 2017-11-11 (b_01): declare string that represents command id
	var tmpCmdIdStr = ent._id.toString() + ': ';
	//determine dimension for command id
	//ES 2017-11-11 (b_01): replace exp with variable to remove code dup
	cmdIdDims = viz.measureTextDim(tmpCmdIdStr);
	//initialize command's width
	var cmdWidth = cmdIdDims.width;
	//ES 2017-11-11 (b_01): if draw on canvas
	if( tmpDrawOnCanvas ) {
		//draw command id
		this.drawTextOnCanvas(
			viz.__PAL_CMD['id'],		//color for command id 
			tmpCmdIdStr, 				//command id in string format
			x, y						//position matches the top-left corner of command object
		);
	}	//ES 2017-11-11 (b_01): end if draw on canvas
	//assign width of command id element
	cmdElemWidths[0] = cmdWidth;
	//increment total width of command by width of command type
	cmdWidth += viz.measureTextDim(ent._type.name + '  ').width;
	//measure width of command type
	cmdElemWidths[1] = cmdWidth;
	//ES 2017-11-11 (b_01): if draw on canvas
	if( tmpDrawOnCanvas ) {
		//draw command type
		this.drawTextOnCanvas(
			viz.__PAL_CMD['type'], 		//color for command type
			ent._type.name + '  ', 		//command type name
			x + cmdElemWidths[0], 		//x-offset (by command id from start)
			y							//no y-offset
		);
	}	//ES 2017-11-11 (b_01): end if draw on canvas
	//ES 2017-11-11 (b_01): declared 'attrs'
	var attrs = null;
	//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
	if( tmpDrawViaJointJs ) {
		//init command attributes
		//ES 2017-11-11 (b_01): move declaration into separate stmt out of this IF
		attrs = {
			//make command immovable inside block
			isInteractive: false,
			//specify translation of command id element
			'.o_CmdId' : {
				transform: "translate(0, 0)"
			},
			//specify text for command id element
			'.i_CmdId' : {
				//ES 2017-11-11 (b_01): replace exp with variable to remove code dup
				text: tmpCmdIdStr
			},
			//specify translation of command type element
			'.o_CmdTy' : {
				transform: "translate(" + cmdElemWidths[0] + ", 0)"
			},
			//specify text for command type element
			'.i_CmdTy' : {
				text: ent._type.name
			}
		};
	}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
	//loop thru arguments to determine their dimensions and
	//	to add their translations/text to attrs
	for( var idx = 0; idx < ent._args.length; idx++ ){
		//get reference to current argument
		var cur = ent._args[idx];
		//init prefix
		var prefix = "";
		//make sure that cur is legal
		if( typeof cur != "object" || cur == null ){
			//skip this illegal object
			continue;
		}
		//depending on the type of argument
		switch(cur.getTypeName().value){
			case RES_ENT_TYPE.COMMAND.value:
				prefix = 'c_';
				break;
			case RES_ENT_TYPE.VALUE.value:
				prefix = '$';
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
		var cmdArgTxt = 
			prefix + (
				cur.getTypeName().value == RES_ENT_TYPE.VALUE.value ?
					cur._value :
					cur._id
			) + ('_name' in cur ? '(' + cur._name + ')' : '');
		//if this is not last argument
		if( idx + 1 < ent._args.length ){
			//add comma to the text representation of command argument
			cmdArgTxt += ',';
		}
		//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
		if( tmpDrawViaJointJs ) {
			//add text representation to attrs
			attrs['.i_Arg' + (idx + 1)] = {
				text: cmdArgTxt
			};
		}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
		//update total width of command
		cmdWidth += viz.measureTextDim(cmdArgTxt).width;
		//calculate width of argument
		cmdElemWidths[2 + idx] = cmdWidth;
		//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
		if( tmpDrawViaJointJs ) {
			//add translation to attrs
			attrs['.o_Arg' + (idx + 1)] = {
				transform: "translate(" + cmdElemWidths[1 + idx] + ",0)"
			};
		//else, if drawing on canvas
		} else if( tmpDrawOnCanvas ) {
			//draw command type
			this.drawTextOnCanvas(
				viz.__PAL_CMD['arg'], 		//color for command argument
				cmdArgTxt, 					//command argument in string format
				x + cmdElemWidths[1 + idx], //x-offset (by command id from start)
				y							//no y-offset
			);
		}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
	}
	//should we render Execution Command Stack
	var doRenderECS = typeof v != 'undefined' && v != null;
	//if 'v' is passed in for rendering associated variable in ECS
	if( doRenderECS ){
		//create complete text representation of variable value
		var tmpCompVarTxt = " => " + v;
		//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
		if( tmpDrawViaJointJs ) {
			//add text representation to the attributes
			attrs['.i_Arg' + (ent._args.length + 1)] = {
				text: tmpCompVarTxt
			};
		}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
		//update total width of command, given value of variable
		cmdWidth += viz.measureTextDim(tmpCompVarTxt).width;
		//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
		if( tmpDrawViaJointJs ) {
			//calculate width of argument
			//cmdElemWidths[2 + ent._args.length] = cmdWidth;
			//add translation to attrs
			attrs['.o_Arg' + (ent._args.length + 1)] = {
				transform: "translate(" + cmdElemWidths[cmdElemWidths.length - 1] + ",0)"
			};
		}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
	}	//end if 'v' is passed in for rendering associated variable in ECS
	//determine number of arguments
	var tmpNumCmdArgs = ent._args.length + (doRenderECS ? 1 : 0);
	//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
	if( tmpDrawViaJointJs ) {
		//get reference to the function that creates jointJS command
		this.setupDrawCmdFunc(tmpNumCmdArgs);
	}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
	//loop thru def-chain to create string representation of def-chain symbols
	var defChainStr = "";
	for( var i in ent._defChain ){
		//get current symbol object
		var s = ent._defChain[i];
		//check that this is an object
		if( typeof s == "object" ){
			defChainStr += (defChainStr != "" ? ", " : "") + 
				s._name + "(" + s._id + ")";
		}	//end if object
	}	//end loop to create string representation fir def-chain symbols
	//ES 2017-11-11 (b_01): declare return value
	var ret = null;
	//ES 2017-11-11 (b_01): if drawing via jointjs (svg)
	if( tmpDrawViaJointJs ) {
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
			obj: new joint.shapes['command_' + tmpNumCmdArgs]({

				//specify position of command
				position: {
					x: x,
					y: y
				},

				//specify visual characteristics for command
				attrs: attrs,

				//additional information can be placed in customized field, here
				//in my case such info is about command's symbols, i.e. defChain
				//of symbols - chain of symbols that defined this command.
				defSymbChain: defChainStr

			})	//end object reference
		};
	}	//ES 2017-11-11 (b_01): end if drawing via jointjs (svg)
	//return resulting structure 'ret' for command element
	return ret;
};	//end method 'renderCommand'

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
	for(key in coll){
		//get element from collection for the iterated key
		var value = coll[key];
		//ensure that this entry is an object
		if( typeof value == "object" ){
			//process parsing object and append returned information structure
			//of resulting object to 'resObjs' array
			var curProcObj = this.process(value, coord.x, coord.y);
			//ES 2017-02-12 (soko): check if process returns NULL, i.e. object was skipped
			if( curProcObj == null ){
				//skip the entity
				continue;
			}	//ES 2017-02-12 (soko): end if object was skipped
			resObjs.push(curProcObj);
			//update x-coord and y-coord for the next object in a collection
			coord = coordCalc.update(curProcObj);
			//update parent total dimensions
			totDims.width = Math.max(totDims.width, curProcObj.width);
			totDims.height += 10 + curProcObj.height;
		}	//end if ensure entity is object
	}	//end traversing thru collection
	return {
		parentDims: totDims,
		arrayOfChildrenInfoStructs: resObjs
	};
};

//embed given series of jointJS objects inside another specified jointJS object
//input(s):
//	series: (Array<{x,y,width,height,obj}>) collection of return object structures
//				that contains position (x,y), dimensions (width, height) and the
//				actual object reference (obj), which should be embedded.
//	obj: (jointJS object) containing object inside which to embed series of objects
//output(s): (nothing)
viz.prototype.embedObjSeriesInsideAnother = function(series, obj){
	//embed all given series elements inside this object
	//loop thru series and fix iterated element inside specified object
	for( var j = 0; j < series.length; j++ ){
		//get reference to currently iterated element
		var curIterElem = series[j].obj;
		//fix current element with this object
		obj.embed(curIterElem);
	}
};	//end function 'embedObjSeriesInsideAnother'

//create arrow between source and destination blocks
//input(s):
//	source, dest: (jointJS elements) jointJS elements that represents blocks that
//					needs to be connected with an arrow
//	isFallArrow: (boolean) does source block fall in destination block
//	arrowColor: (optional argument) color for the arrow
//output(s): (nothing)
viz.prototype.connectJointJSBlocks = function(source, dest, isFallArrow, arrowColor){
	//create arrow
	var arrowEnt = new joint.dia.Link({
		source: {id: source.id},
		target: {id: dest.id}
	});
	//determine filling color of arrow end
	var arrowFillColor = isFallArrow ? 'AAAAAA' : '222222';
	//determine stroke color of arrow's body
	var arrowStrokeColor = isFallArrow ? 'CCCCCC' : '333333';
	//ES 2016-08-28 (b_log_cond_test): if color for the arrow is passed in
	if( typeof arrowColor != "undefined" && arrowColor != null ){
		//assign color
		arrowFillColor = arrowColor;
		arrowStrokeColor = arrowColor;
	}
	//set attributes of an arrow
	arrowEnt.attr({
		'.connection': {stroke: '#' + arrowStrokeColor, 'stroke-width': 3},
		'.marker-target': {fill: '#' + arrowFillColor, d: 'M 10 0 L 0 5 L 10 10 z'}
	})
	//add arrow to connection stack
	this._drawStack['cons'].push({'obj': arrowEnt});
};
