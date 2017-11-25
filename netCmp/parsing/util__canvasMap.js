/**
	Developer:		Eduard Sedakov
	Date:			2017-11-19
	Description:	collection of equally sized canvas patch (HTML element), organized in map
	Used by:		(viz)
	Dependencies:	(none)
**/

//==========globals:==========

//width of each canvas patch
canvasMap.__width = 1000;

//height of each canvas patch
canvasMap.__height = 1000;

//==========statics:==========

//reset static variable(s)
//input(s): (none)
//output(s): (none)
canvasMap.reset = function() {
	canvasMap.__width = 1000;
	canvasMap.__height = 1000;
};	//end function 'reset'

//class Canvas Map declaration:
//This class attempts to resolve issue with Canvas, which do not support large sizes.
//In other words, if client JS code attempts to set Canvas to be larger than specific
//max width/height (dependent for each browser and device type), than Canvas starts
//to ignore drawing operations, and it remains blank.
//see: https://stackoverflow.com/a/11585939
//This class creates a cluster of Canvas HTML elements, and they are organized in
//map, with given width and height in terms of Canvas patches, i.e. how many equally
//sized Canvas patches should fit horizontally (width) and vertically (height) inside
//map.
//input(s):
//	parentId: (text) complete HTML element id, inside which to display canvas map
//	prePatch: (text) string that appears inside all Canvas patch IDs, and is followed
//		by '_X_Y' string, where X and Y specify location of Canvas patch in map
//	preRow: (text) string that appears inside all rows (for patches) and is followed
//		by '_Y' that identifies vertical position of row in canvas
//output(s): (none)
function canvasMap(parentId, prePatch, preRow) {
	//assign parent id
	this._parentId = parentId;
	//assign prefix for patch and row
	this._prePatchId = prePatch;
	this._preRowId = preRow;
	//organize map of canvas information
	this._info = [];
	//create single canvas patch to make 'measureTextDim' execute correctly
	//	It needs canvas context to measure dimensions of given text
	this._info.push([]);
	this.createCanvasPatch(this._preRowId + "_0", this._prePatchId + "_0_0", 0);
};	//end ctor

//construct map of canvases
//	width: (number) how many equally sized Canvas patches be horizontally
//	height: (number) how many equally sized Canvas patches be vertically
//output(s): (none)
canvasMap.prototype.createMap = function(width, height) {
	//reset array of patch rows
	this._info = [];
	//assign width and height
	this._horiz = width;	//number of patches per row (width)
	this._vert = height;	//number of rows in canvas (height)
	//loop thru rows of patches
	for( var y = 0; y < this._vert; y++ ) {
		//create canvas row
		this.createCanvasRow(y);
	}	//end loop thru rows of patches
};	//end method 'createMap'

//create DIV row and populate with canvas patches
//input(s):
//	rowIdx: (number) identifier (Y in '_Y') that is used in rowId after row prefix
//output(s): (none)
canvasMap.prototype.createCanvasRow = function(rowIdx) {
	//create row id
	var tmpRowId = this._preRowId + "_" + rowIdx;
	//create DIV and append it to parent element
	$("#" + this._parentId).append(
		"<div id='" + tmpRowId + "' style='display: block; white-space: nowrap;'></div>"
	);
	//create new element in map of canvas information array
	this._info.push([]);
	//loop thru patches that needs to be created and added to this row
	for( var i = 0; i < this._vert; i++ ) {
		//create patch and add it to this new row
		this.createCanvasPatch(
			//row id
			tmpRowId,
			//patch id 
			this._prePatchId + "_" + rowIdx + "_" + i,
			//index in canvas information outer array
			rowIdx
		);
	}	//end loop thru patches to create and add to this row
};	//end methid 'createCanvasRow'

//create single canvas patch and append it to the end of specified DIV row
//input(s):
//	rowId: (text) unique ID of DIV html element, where to insert new canvas patch
//	patchId: (text) unique ID for new canvas patch
//	idx: (number) index of outer array for collecting canvas information
//output(s): (none)
canvasMap.prototype.createCanvasPatch = function(rowId, patchId, idx) {
	//create and setup canvas
	var canvas = document.createElement('canvas');
	canvas.id = patchId;
	canvas.style.width = "" + canvasMap.__width + "px";
	canvas.style.height = "" + canvasMap.__height + "px";
	canvas.style.zIndex = 8;
	canvas.style.border = "1px solid black";
	//make canvas appear on the same row as its neighboring canvas patches
	canvas.style.display = "inline-block";
	//prevent canvas patch from floating down when user shrinks visible user space
	//see: https://stackoverflow.com/a/9978234
	canvas.style["white-space"] = "normal";
	//set also width and height in pixels
	//see: https://stackoverflow.com/a/15794770
	canvas.width = canvasMap.__width;
	canvasMap.height = canvasMap.__height;
	//append new canvas patch to the end of specified DIV row
	$("#" + rowId).append(canvas);
	//create canvas context
	var tmpCtx = canvas.getContext('2d');
	//store canvas information
	this._info[idx].push({
		"canvas": canvas,
		"context": tmpCtx
	});
};	//end method 'createCanvasPatch'

//execute drawing function on all effected canvases
//input(s):
//	funcPtr: (JS function ref) prototype: function(ctx, data), where ctx is
//		provided by this method and data contains other drawing and position
//		information, needed for rendering object
//	data: (JS object) associative array consumed by given function reference
//			It must contain parameters: 'x', 'y', 'width', and 'height'
//output(s): (none)
canvasMap.prototype.execDrawFunc = function(funcPtr, data) {
	//loop thru canvas rows
	for( 
		var y = Math.round(data.y / canvasMap.__height); 
		y < Math.round((data.y + data.height) / canvasMap.__height);
		y++
	){
		//if Y-value exceeds size of info set
		if( y >= this._info.length ) {
			//quit loop
			break;
		}
		//loop thru row patches
		for(
			var x = Math.round(data.x / canvasMap.__width);
			x < Math.round((data.x + data.width) / canvasMap.__width);
			x++
		){
			//if X-value exceeds size of info set
			if( x >= this._info[y].length ) {
				//quit loop
				break;
			}
			//save former X and Y
			var tmpSavedX = data.x, tmpSavedY = data.y;
			//switch data's X and Y with local position for this canvas
			data.x = data.x - x * canvasMap.__width;
			data.y = data.y - y * canvasMap.__height;
			//execute function reference
			funcPtr(this._info[y][x].context, data);
			//restore former X and Y
			data.x = tmpSavedX;
			data.y = tmpSavedY;
		}	//end loop thru row patches
	}	//end loop thru canvas rows
};	//end method 'execDrawFunc'

//measure text dimensions
//input(s):
//	text: (string) text that needs to be measured (width and height)
//output(s):
//	(int, int) => height and width
canvasMap.prototype.measureTextDim = function(text) {
	//get any (first) canvas context
	var tmpCtx = this._info[0][0].context;
	//save former font
	var tmpFontStyle = tmpCtx.font;
	//re-compute height of line to be roughly width of capital 'M' letter
	//	see: https://stackoverflow.com/a/13318387
	tmpCtx.font = "bold " + viz.defFontSize + "px Arial";
	tmpLineHeight = tmpCtx.measureText('M').width;
	//calculate text width using canvas approacg
	tmpTextWidth = tmpCtx.measureText(text).width;
	//restore former font
	tmpCtx.font = tmpFontStyle;
	//return dimensions
	return { height: tmpLineHeight, width: tmpTextWidth };
};	//end function 'measureTextDim'