/**
	Developer:	Eduard Sedakov
	Date:		2016-05-28
	Description:	library for drawing simplest 2D objects
	Used by: {interpreter}
	Depends on:	(jointJS)
**/

//==========globals:==========

//store all created jointJS objects with associated numeric indexes
//	key: numeric index
//	value: jointJS object
drawing.__library = {};

//auto-incremented numeric index for jointJS objects
drawing.__nextId = 1;

//==========statics:==========

//class drawing component declaration:
//class creates B+ tree
//input(s): (none)
//output(s): (none)
function drawing(){
	//start of CFG drawing code block:
	var w = 1600, h = 55600, id = 'myholder';
	//create visualization component
	this._viz = new viz(id, w, h, function(cellView, ent, x, y){cellView.model.translate(100)});
	//font information
	this._fontSize = 32;		//font size
	this._colorTxt = "black";	//text color
	//text position relative to the bounding rectangle
	this._txtRefX = 0.5;
	this._txtRefY = 0.5;
};	//end constructor for drawing component

//utility method for checking if function argument has invalid passed-in value (i.e. either not passed in OR it is null)
//input(s):
//	arg: (JS object) argument that has been passed in
//output(s):
//	(boolean) : False => if passed in other then null, True => if either passed in NULL, or not defined
drawing.prototype.isNotLegalArg = function(arg){
	return typeof arg == "undefined" || arg == null;
};	//end method 'isLegal'

//create JointJS mockup method for drawing rectangle
joint.shapes.drawingRect = joint.shapes.basic.Generic.extend({
	markup: '<g class="rotatable">' + 
				'<g class="scalable">' +
					'<rect/>' + 
				'</g>' + 
				'<text class="captionBox">' +
					'<tspan class="captionTxt"></tspan>' +
				'</text>' +
			'</g>',

	defaults: joint.util.deepSupplement({

		type: 'drawingRect',
		attrs: {
			rect: { 
				'follow-scale': true, 
				width: 300, 
				height: 300, 
				fill: '#440044', 
				rx: 1, 
				ry: 1 
			},
			'.captionBox': {
				ref: 'rect'
			},
			'.captionTxt': { 
				'font-size': 23, 
				stroke: '#ffffff',
				'y-alignment': 'middle',
				'text-anchor': 'middle',
				opacity: 1
			}
		}
	}, joint.shapes.basic.Generic.prototype.defaults)
});

//get jointJS object for the specified index
//input(s):
//	idx: (integer) associated index for jointJS object
//output(s):
//	(jointJS object)
drawing.prototype.getJointJSObj = function(idx){
	//check if given index exists
	if( idx in drawing.__library ){
		return drawing.__library[idx];
	}
	return null;
};	//end method 'getJointJSObj'

//set font information
//input(s):
//	fontSize: (integer) size of the font
//	colorTxt: (text) color for the text
//output(s): (none)
drawing.prototype.setFontInfo = function(fontSize, colorTxt){
	this._fontSize = fontSize;
	this._colorTxt = colorTxt;
};	//end method 'setFontInfo'

//set text position relative to the bounding rectangle
//input(s):
//	x: (float) relative position on X-axis inside bounding rectangle
//	y: (float) relative position on Y-axis inside bounding rectangle
//output(s): (none)
drawing.prototype.setTxtPosition = function(x, y){
	this._txtRefX = x;
	this._txtRefY = y;
};	//end method 'setTxtPosition'

//draw rectangle
//input(s):
//	x: (integer) X-coordinate for top-left corner of drawing object
//	y: (integer) Y-coordinate for top-left corner of drawing object
//	w: (integer) width of rectangle
//	h: (integer) height of rectangle
//	opacity: (float) object's transparency level
//	borderColor: (text) color name used for object's border
//	borderSize: (integer) border thickness
//	fillColor: (text) color name used for object's internals
//	roundX: (integer) X-rounding
//	roundY: (integer) Y-rounding
//	txt: (text) text to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawRect = function(x, y, w, h, opacity, borderColor, borderSize, fillColor, roundX, roundY, txt){
	//if 'x' needs to be defaulted
	if( this.isNotLegalArg(x) ){
		x = 100;
	}
	//if 'y' needs to be defaulted
	if( this.isNotLegalArg(y) ){
		y = 100;
	}
	//if 'w' needs to be defaulted
	if( this.isNotLegalArg(w) ){
		w = 500;
	}
	//if 'h' needs to be defaulted
	if( this.isNotLegalArg(h) ){
		h = 500;
	}
	//if 'opacity' needs to be drawingefaulted
	if( this.isNotLegalArg(opacity) ){
		opacity = 1.0;
	}
	//if 'borderColor' needs to be defaulted
	if( this.isNotLegalArg(borderColor) ){
		borderColor = "red";
	}
	//if 'borderSize' needs to be defaulted
	if( this.isNotLegalArg(borderSize) ){
		borderSize = 1;
	}
	//if 'fillColor' needs to be defaulted
	if( this.isNotLegalArg(fillColor) ){
		fillColor = "blue";
	}
	//if 'roundX' needs to be defaulted
	if( this.isNotLegalArg(roundX) ){
		roundX = 1;
	}
	//if 'roundY' needs to be defaulted
	if( this.isNotLegalArg(roundY) ){
		roundY = 1;
	}
	//if 'txt' needs to be defaulted
	if( this.isNotLegalArg(txt) ){
		txt = "";
	}
	//create index and auto-increment it to the next value
	var tmpIndex = drawing.__nextId++;
	//create jointJS rectangle object
	drawing.__library[tmpIndex] = new joint.shapes.drawingRect({

		//specify position of rectangle
		position: {
			x: x,
			y: y
		},

		//specify dimensions of rectangle
		size: {
			width: w,
			height: h
		},

		//other attributes
		attrs: {
			
			rect: {
				fill: fillColor,
				stroke: borderColor,
				'stroke-width': borderSize,
				rx: roundX,
				ry: roundY,
				opacity: opacity
			},

			'.captionBox': {
				'ref-x': this._txtRefX,
				'ref-y': this._txtRefY
			},

			'.captionTxt': {
				text: txt,
				fill: this._colorTxt,
				stroke: this._colorTxt,
				'font-size': this._fontSize
			}

		}
	});
	//add object to paper
	viz._graph.addCells([drawing.__library[tmpIndex]]);
	//return associated index for jointJS object
	return tmpIndex;
};	//end method 'drawRect'

//create JointJS mockup method for drawing image
joint.shapes.drawingImage = joint.shapes.basic.Generic.extend({
	markup: '<g class="rotatable"><g class="scalable"><image/></g></g>',
	defaults: joint.util.deepSupplement({
		type: 'drawingImage',
		attrs: {
			image: {
				'width': 20,
				'height': 20
			}
		}
	}, joint.shapes.basic.Generic.prototype.defaults)
});

//draw image
//input(s):
//	x: (integer) X-coordinate for top-left corner of drawing object
//	y: (integer) Y-coordinate for top-left corner of drawing object
//	w: (integer) width of rectangle
//	h: (integer) height of rectangle
//	imgPath: (text) path to the image to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawImage = function(x, y, w, h, imgPath){
	//if 'x' needs to be defaulted
	if( this.isNotLegalArg(x) ){
		x = 100;
	}
	//if 'y' needs to be defaulted
	if( this.isNotLegalArg(y) ){
		y = 100;
	}
	//if 'w' needs to be defaulted
	if( this.isNotLegalArg(w) ){
		w = 500;
	}
	//if 'h' needs to be defaulted
	if( this.isNotLegalArg(h) ){
		h = 500;
	}
	//create index and auto-increment it to the next value
	var tmpIndex = drawing.__nextId++;
	//create jointJS image object
	drawing.__library[tmpIndex] = new joint.shapes.drawingImage({

		//specify position of image
		position: {
			x: x,
			y: y
		},

		//specify dimensions of image
		size: {
			width: w,
			height: h
		},

		//other attributes
		attrs: {

			image: {
				'xlink:href': imgPath
			}

		}
	});
	//add object to paper
	viz._graph.addCells([drawing.__library[tmpIndex]]);
	//return associated index for jointJS object
	return tmpIndex;
};	//end method 'drawImage'

//draw ellipse
//input(s):
//	x: (integer) X-coordinate for top-left corner of drawing object
//	y: (integer) Y-coordinate for top-left corner of drawing object
//	w: (integer) width of ellipse (length of X-axis)
//	h: (integer) height of ellipse (length of Y-axis)
//	opacity: (float) object's transparency level
//	borderColor: (text) color name used for object's border
//	borderSize: (integer) border thickness
//	fillColor: (text) color name used for object's internals
//	txt: (text) text to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawEllipse = function(x, y, w, h, opacity, borderColor, borderSize, fillColor, txt) {
	//if 'x' needs to be defaulted
	if( this.isNotLegalArg(x) ){
		x = 100;
	}
	//if 'y' needs to be defaulted
	if( this.isNotLegalArg(y) ){
		y = 100;
	}
	//if 'w' needs to be defaulted
	if( this.isNotLegalArg(w) ){
		w = 500;
	}
	//if 'h' needs to be defaulted
	if( this.isNotLegalArg(h) ){
		h = 500;
	}
	//if 'opacity' needs to be defaulted
	if( this.isNotLegalArg(opacity) ){
		opacity = 1.0;
	}
	//if 'borderColor' needs to be defaulted
	if( this.isNotLegalArg(borderColor) ){
		borderColor = "red";
	}
	//if 'borderSize' needs to be defaulted
	if( this.isNotLegalArg(borderSize) ){
		borderSize = 1;
	}
	//if 'fillColor' needs to be defaulted
	if( this.isNotLegalArg(fillColor) ){
		fillColor = "blue";
	}
	//if 'txt' needs to be defaulted
	if( this.isNotLegalArg(txt) ){
		txt = "";
	}
	//create index and auto-increment it to the next value
	var tmpIndex = drawing.__nextId++;
	//create jointJS circle object
	drawing.__library[tmpIndex] = new joint.shapes.basic.Circle({

		//specify position of ellipse
		position:{
			x: x, 
			y: y
		}, 

		//specify dimensions of ellipse
		size:{
			width: w, 
			height: h
		},

		attrs: {
			
			circle: {
				fill: fillColor,
				stroke: borderColor,
				'stroke-width': borderSize,
				opacity: opacity
			},

			text: {
				text: txt,
				fill: this._colorTxt,
				'font-size': this._fontSize,
				ref: 'circle',
				'y-alignment': 'middle',
				'text-anchor': 'middle',
				'ref-x': this._txtRefX,
				'ref-y': this._txtRefY
			}
		}
	});
	//add object to paper
	viz._graph.addCells([drawing.__library[tmpIndex]]);
	//return associated index for jointJS object
	return tmpIndex;
};	//end method 'drawEllipse'	