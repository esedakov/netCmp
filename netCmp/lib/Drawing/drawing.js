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
	var w = 1600, h = 55600, id = 'app_holder';
	//create visualization component
	//ES 2016-08-13 (b_cmp_test_1): replace call to 'viz' with a function that either
	//	creates a new viz instance or returns existing one
	//ES 2016-09-11 (b_debugger): break single code line into multiple lines AND add
	//	additional argument to 'getVisualizer' => type (type of visualizer)
	this._viz = viz.getVisualizer(
		//ES 2016-09-11 (b_debugger): application viewport
		VIS_TYPE.APP_VIEW,
		//ES 2016-09-11 (b_debugger): pass in instance of parser
		parser.__instance,
		id, 
		w, 
		h, 
		function(cellView, ent, x, y){
			cellView.model.translate(100)
		}
	);
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

//move specified model
//input(s):
//	idx: (content:integer) model index
//	dispX: (content:integer) displacement in X-axis
//	dispY: (content:integer) displacement in Y-axis
//output(s): (none)
drawing.prototype.moveModel = function(idx, dispX, dispY){
	//get model
	var tmpModel = this.getDisplayedObjectInst(idx._value);
	//check if model exists
	if( tmpModel != null ){
		//ES 2017-12-05 (b_01): if vizualizer uses JointJS framework
		if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS ) {
			//move model
			tmpModel.translate(dispX._value, dispY._value);
		//ES 2017-12-05 (b_01): else, visualizer uses Canvas framework
		} else {
			//move model in canvas map
			this._viz._cnvMap.transformCanvasElement(
				//element to be moved
				tmpModel,
				//translation transformation type
				CANVAS_TRANSFORM_OPS_TYPE.TRANSLATE,
				//X and Y displacements
				{
					"x": dispX._value,
					"y": dispY._value
				}
			);
		}	//ES 2017-12-05 (b_01): end if visualizer uses JointJS framework
	}
};	//end method 'moveModel'

//rotate specified model
//input(s):
//	idx: (content:integer) model index
//	deg: (content:integer) absolute degree of rotation
//output(s): (none)
drawing.prototype.rotateModel = function(idx, deg){
	//get model
	var tmpModel = this.getDisplayedObjectInst(idx._value);
	//check if model exists
	if( tmpModel != null ){
		//ES 2017-12-05 (b_01): if visualizer uses JointJS framework
		if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS ) {
			//rotate model
			tmpModel.rotate(deg._value);
		//ES 2017-12-05 (b_01): else, visualizer uses Canvas framework
		} else {
			//rotate model around its center
			this._viz._cnvMap.transformCanvasElement(
				//element to be rotated
				tmpModel,
				//rotation transformation type
				CANVAS_TRANSFORM_OPS_TYPE.ROTATE,
				//rotation information
				{
					//angle of rotation
					"angle": deg,
					//rotational pivot is the center of this element
					"pivot": {
						"x": tmpModel.x + (tmpModel.width / 2),
						"y": tmpModel.y + (tmpModel.height / 2)
					}
				}
			);
		}	//ES 2017-12-05 (b_01): end if visualizer uses JointJS framework
	}
};	//end method 'rotateModel'

//delete specified model
//input(s):
//	idx: (content:integer) model index
//output(s): (none)
drawing.prototype.removeModel = function(idx){
	//get model
	var tmpModel = this.getDisplayedObjectInst(idx._value);
	//check if model exists
	if( tmpModel != null ){
		//ES 2017-12-05 (b_01): if visualizer uses JointJS framework
		if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS ) {
			//rotate model
			tmpModel.remove();
		//ES 2017-12-05 (b_01): else, visualizer uses Canvas framework
		} else {
			//remove this model from canvas map and redraw selected patches
			this._viz._cnvMap.transformCanvasElement(
				//element to be removed
				tmpModel,
				//removal transformation type
				CANVAS_TRANSFORM_OPS_TYPE.REMOVE,
				//no information is needed to be passed
				{}
			);
		}	//ES 2017-12-05 (b_01): end if visualizer uses JointJS framework
	}
};	//end method 'removeModel'

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
//ES 2017-12-05 (b_01): renamed function from 'getJointJSObj' to 'getDisplayedObjectInst'
//	so that its name does not conflict with new drawing approach on canvas
//input(s):
//	idx: (content:integer) associated index for jointJS object
//output(s):
//	(jointJS object) => jointjs element displayed on SCG
//	(canvasElement) => graphic object displayed on canvas
drawing.prototype.getDisplayedObjectInst = function(idx){
	//check if given index exists
	if( idx in drawing.__library ){
		return drawing.__library[idx._value];
	}
	return null;
};	//end method 'getDisplayedObjectInst'

//set font information
//input(s):
//	fontSize: (content:integer) size of the font
//	colorTxt: (content:text) color for the text
//output(s): (none)
drawing.prototype.setFontInfo = function(fontSize, colorTxt){
	this._fontSize = fontSize._value;
	this._colorTxt = colorTxt._value;
};	//end method 'setFontInfo'

//set text position relative to the bounding rectangle
//input(s):
//	x: (content:float) relative position on X-axis inside bounding rectangle
//	y: (content:float) relative position on Y-axis inside bounding rectangle
//output(s): (none)
drawing.prototype.setTxtPosition = function(x, y){
	this._txtRefX = x._value;
	this._txtRefY = y._value;
};	//end method 'setTxtPosition'

//draw rectangle
//input(s):
//	x: (content:integer) X-coordinate for top-left corner of drawing object
//	y: (content:integer) Y-coordinate for top-left corner of drawing object
//	w: (content:integer) width of rectangle
//	h: (content:integer) height of rectangle
//	opacity: (content:float) object's transparency level
//	borderColor: (content:text) color name used for object's border
//	borderSize: (content:integer) border thickness
//	fillColor: (content:text) color name used for object's internals
//	roundX: (content:integer) X-rounding
//	roundY: (content:integer) Y-rounding
//	txt: (content:text) text to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawRect = function(
	x, y, w, h, opacity, borderColor, borderSize, fillColor, roundX, roundY, txt
){
	//reset function arguments to their values
	x = x._value;
	y = y._value;
	w = w._value;
	h = h._value;
	opacity = opacity._value;
	borderColor = borderColor._value;
	borderSize = borderSize._value;
	fillColor = fillColor._value;
	roundX = roundX._value;
	roundY = roundY._value;
	txt = txt._value;
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
	//ES 2017-12-05 (b_01): if visualizer uses JointJS framework
	if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS ) {
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
		viz.getVisualizer(VIS_TYPE.APP_VIEW)._graph.addCells([drawing.__library[tmpIndex]]);
	//ES 2017-12-05 (b_01): else, visualizer uses canvas framework
	} else {
		//setup array of functions needed to draw this rectangle
		var tmpCanvasFuncDrawArr = [];
		//set reference for visualizer
		var tmpVizThis = this._viz;
		//set text coloe
		var tmpTxtColor = this._colorTxt;
		//compute maximum rounding value for rectangle edges
		var tmpRectRoundVal = Math.max(roundX, roundY);
		//create var for storing canvas element representing this object
		var tmpCnvElem = null;
		//add func pointer to draw scope shape
		tmpCanvasFuncDrawArr.push(
			function() {
				//draw rectangular container (block) with caption
				//	and line separator
				tmpVizThis._cnvMap.execDrawFunc(
					//function reference that draws container
					viz.renderRectContainer,
					//data set that contains drawing parameters
					{
						//set of rendering constants for block
						"info": {
							//background color
							"bkgd": fillColor,
							//text color
							"text": tmpTxtColor,
							//border color
							"border": borderColor
						},
						//edge rounding
						"r": tmpRectRoundVal,
						//caption
						"cap": txt
					},
					//reference to canvas element
					tmpCnvElem
				);
			}
		);
		//create canvas element
		tmpCnvElem = new canvasElement(
			x, y,					//top-left edge position
			w, h,					//dimensions
			null,					//no entity type
			null,					//no associated object
			null,					//no symbol list
			null,					//caller will set this field
			tmpCanvasFuncDrawArr	//array of function pointers to draw command on canvas
		);
		//add this canvas element to drawing library
		drawing.__library[tmpIndex] = tmpCnvElem;
	}	//ES 2017-12-05 (b_01): end if visualizer uses JointJS framework
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
//	x: (content:integer) X-coordinate for top-left corner of drawing object
//	y: (content:integer) Y-coordinate for top-left corner of drawing object
//	w: (content:integer) width of rectangle
//	h: (content:integer) height of rectangle
//	imgPath: (content:text) path to the image to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawImage = function(x, y, w, h, imgPath){
	//reset function arguments to their values
	x = x._value;
	y = y._value;
	w = w._value;
	h = h._value;
	imgPath = imgPath._value;
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
	//ES 2017-12-05 (b_01): if visualizer uses JointJS framework
	if( viz.__visPlatformType == VIZ_PLATFORM.VIZ__JOINTJS ) {
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

					//ES 2017-02-14 (soko): specify width and height of image here, as well
					width: w,
					height: h,

					'xlink:href': imgPath
				}

			}
		});
		//ES 2017-02-14 (soko): scale by the specified size
		drawing.__library[tmpIndex].resize(1, 1);
		//add object to paper
		viz.getVisualizer(VIS_TYPE.APP_VIEW)._graph.addCells([drawing.__library[tmpIndex]]);
	//ES 2017-12-05 (b_01): else, visualizer uses canvas framework
	} else {
		//setup array of functions needed to draw this rectangle
		var tmpCanvasFuncDrawArr = [];
		//set reference for visualizer
		var tmpVizThis = this._viz;
		//create var for storing canvas element representing this object
		var tmpCnvElem = null;
		//add func pointer to draw scope shape
		tmpCanvasFuncDrawArr.push(
			function() {
				//draw rectangular container (block) with caption
				//	and line separator
				tmpVizThis._cnvMap.execDrawFunc(
					//function reference that draws container
					viz.renderRectContainer,
					//data set that contains drawing parameters
					{
						//set of rendering constants for block
						"info": {
							//background color
							"img": imgPath
						}
					},
					//reference to canvas element
					tmpCnvElem
				);
			}
		);
		//create canvas element
		tmpCnvElem = new canvasElement(
			x, y,					//top-left edge position
			w, h,					//dimensions
			null,					//no entity type
			null,					//no associated object
			null,					//no symbol list
			null,					//caller will set this field
			tmpCanvasFuncDrawArr	//array of function pointers to draw command on canvas
		);
		//add this canvas element to drawing library
		drawing.__library[tmpIndex] = tmpCnvElem;
	}	//ES 2017-12-05 (b_01): end if visualizer uses JointJS framework
	//return associated index for jointJS object
	return tmpIndex;
};	//end method 'drawImage'

//draw ellipse
//input(s):
//	x: (content:integer) X-coordinate for top-left corner of drawing object
//	y: (content:integer) Y-coordinate for top-left corner of drawing object
//	w: (content:integer) width of ellipse (length of X-axis)
//	h: (content:integer) height of ellipse (length of Y-axis)
//	opacity: (content:float) object's transparency level
//	borderColor: (content:text) color name used for object's border
//	borderSize: (content:integer) border thickness
//	fillColor: (content:text) color name used for object's internals
//	txt: (content:text) text to render
//output(s):
//	(integer) => associated index for this jointJS object
drawing.prototype.drawEllipse = function(x, y, w, h, opacity, borderColor, borderSize, fillColor, txt) {
	//reset function arguments to their values
	x = x._value;
	y = y._value;
	w = w._value;
	h = h._value;
	opacity = opacity._value;
	borderColor = borderColor._value;
	borderSize = borderSize._value;
	fillColor = fillColor._value;
	txt = txt._value;
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
	viz.getVisualizer(VIS_TYPE.APP_VIEW)._graph.addCells([drawing.__library[tmpIndex]]);
	//return associated index for jointJS object
	return tmpIndex;
};	//end method 'drawEllipse'	
