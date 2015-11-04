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
};

//process CFG (control flow graph) and update drawing stack
//input(s): (none)
//output(s): (none)
viz.prototype.process = function(){
	//TODO
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