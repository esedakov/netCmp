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

//invoke reset
canvasMap.reset();

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
	//X and Y to specify coordinates of canvas patch, if we need to draw specifically
	//	inside this canvas patch and not in any other
	this._drawThisPatch = null;
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
	for( var i = 0; i < this._horiz; i++ ) {
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
	//canvas.style.border = "1px solid black";
	//make canvas appear on the same row as its neighboring canvas patches
	canvas.style.display = "inline-block";
	//prevent canvas patch from floating down when user shrinks visible user space
	//see: https://stackoverflow.com/a/9978234
	canvas.style["white-space"] = "normal";
	//set also width and height in pixels
	//see: https://stackoverflow.com/a/15794770
	canvas.width = canvasMap.__width;
	canvas.height = canvasMap.__height;
	//append new canvas patch to the end of specified DIV row
	$("#" + rowId).append(canvas);
	//create canvas context
	var tmpCtx = canvas.getContext('2d');
	//store canvas information
	this._info[idx].push({
		//graphical components
		"canvas": canvas,
		"context": tmpCtx,
		//collection of canvasElements that are drawn on this canvas patch
		"obj": [],
		//is canvas saved (TRUE) or alrady restored (FALSE) (apply transformations)
		"saved": false
	});
};	//end method 'createCanvasPatch'

//apply rotation transformation
//input(s):
//	patchInfo: (SET) information about stored inside '_info' set for each patch
//	elem: (canvasElement) canvas element which is target of this transformation
//output(s): (none)
//NOTE: see: https://stackoverflow.com/a/17126036
//NOTE: see: https://stackoverflow.com/a/17412387
canvasMap.prototype.applyRotTransform = function(patchInfo, elem) {
	//get context
	var ctx = patchInfo.context;
	//if context is not saved
	if( patchInfo.saved == false ) {
		//save context
		ctx.save();
		//assert flag indicating that context is now saved
		patchInfo.saved = true;
	}	//end if context is not saved
	//move rotation point to center of object
	ctx.translate(elem._pivorRot.x, elem._pivorRot.y);
	//rotate object by specified degree
	ctx.rotate(elem._angleRot * MATH.PI / 180);
};	//end method 'applyTransform'

//close transformation
//input(s):
//	patchInfo: (SET) information about stored inside '_info' set for each patch
//output(s): (none)
canvasMap.prototype.closeTransform = function(patchInfo) {
	//if patch context is saved
	if( patchInfo.saved == true ) {
		//remove transformation(s)
		patchInfo.context.restore();
		//reset flag
		patchInfo.saved = false;
	}	//end if patch context is saved
};	//end method 'closeTransform'

//render objects on specific canvas patch
//input(s):
//	x: (number) x-coordinate of canvas patch
//	y: (number) y-coordinate of canvas patch
//output(s): (none)
canvasMap.prototype.renderPatch = function(x, y) {
	//set the coordinates of patch to draw
	this._drawThisPatch = {"x": x, "y": y};
	//clear canvas patch
	//	see: https://stackoverflow.com/a/2142549
	this._info[y][x].context.clearRect(0, 0, canvasMap.__width, canvasMap.__height);
	//loop thru elements that need to be rendered in indicated canvas patch
	for( var tmpObjIdx = 0; tmpObjIdx < this._info[y][x].obj.length; tmpObjIdx++ ) {
		//get rendering object
		var tmpObjRef = this._info[y][x].obj[tmpObjIdx];
		//get array of function ptrs for this rendering object
		var tmpDrwFuncs = tmpObjRef._drawFuncPtrArr;
		//if need to rotate
		if( tmpObjRef._angleRot != null && tmpObjRef._pivorRot != null ) {
			//apply transformation
			this.applyRotTransform(
				//rendering patch information
				this._info[y][x],
				//canvas element to be transformed
				tmpObjRef
			);
		}	//end if need to rotate
		//loop thru array of func pointers that render this object
		for( var tmpFuncIdx = 0; tmpFuncIdx < tmpDrwFuncs.length; tmpFuncIdx++ ) {
			//invoke rendering function ptr
			tmpDrwFuncs[tmpFuncIdx]();
		}	//end loop thru array of func pointers that render this object
		//close transformation
		this.closeTransform(this._info[y][x]);
	}	//end loop thru elements rendered in indicated patch
	//reset flag that determines which patch to render
	this._drawThisPatch = null;
};	//end method 'renderPatch'

//determine patches (X and Y coordinates of these patches) that contain specified
//	object and need to be rendered again after object's transformation operation
//input(s):
//	elem: (canvasElement) element to be transformed
//output(s):
//	(Array<{X,Y}>) => array of coordinates (X and Y) that specify patches
canvasMap.prototype.detPatchCoordsForCnvElem = function(elem) {
	//create resulting array of patch coordinates
	var res = [];
	//loop thru rows
	for(
		var y = Math.floor(elem.y / canvasMap.__height);
		y < Math.ceil((elem.y + elem.height) / canvasMap.__height);
		y++
	) {
		//loop thru patches in current row
		for(
			var x = Math.floor(elem.x / canvasMap.__width);
			x < Math.ceil((elem.x + elem.width) / canvasMap.__width);
			x++
		) {
			//add coordinate for patch coordinate
			res.push({"x": x, "y": y});
		}	//end loop thru patches in current row
	}	//end loop thru rows
	//return array of patch coordinates
	return res;
};	//end method 'detPatchCoordsForCnvElem'

//transform canvas element
//input(s):
//	elem: (canvasElement) element to be transformed
//	type: (CANVAS_TRANSFORM_OPS_TYPE) type of transformation
//	val: (number) transformation value
//output(s): (none)
canvasMap.prototype.transformCanvasElement = function(elem, type, val) {
	//get patch coordinates that will be effected by this operation
	var tmpPatchCoords = this.detPatchCoordsForCnvElem(elem);
	//if element is rendered
	if( tmpPatchCoords.length > 0 ) {
		//add transformation for this element
		elem.setTransformOp(type, val);
		//if element is BLOCK
		if( elem._type == RES_ENT_TYPE.BLOCK ) {
			//loop thru commands inside this block
			for( var tmpCmdIdx in elem.obj._cmds ) {
				//get currently iterated command reference
				var tmpCmdObj = elem.obj._cmds[tmpCmdIdx];
				//transform currently iterated command
				tmpCmdObj._canvasElemRef.setTransformOp(type, val);
			}	//end loop thru commands inside this block
		}	//end if element is block
	}	//end if element is rendered
	//loop thru patch coordinates
	for( var tmpPatchIdx = 0; tmpPatchIdx < tmpPatchCoords.length; tmpPatchIdx++ ) {
		//get coordinate for currently iterated patch
		var tmpCurCoord = tmpPatchCoords[tmpPatchIdx];
		//render this patch
		this.renderPatch(tmpCurCoord.x, tmpCurCoord.y);
	}	//end loop thru patch coordinates
};	//end method 'transformCanvasElement'


//execute drawing function on all effected canvases
//input(s):
//	funcPtr: (JS function ref) prototype: function(ctx, data), where ctx is
//		provided by this method and data contains other drawing and position
//		information, needed for rendering object
//	data: (JS object) associative array consumed by given function reference
//			It must contain parameters: 'x', 'y', 'width', and 'height'
//	elem: (canvasElements) reference to object that is drawn
//output(s): (none)
canvasMap.prototype.execDrawFunc = function(funcPtr, data, elem) {
	//flag -- are we drawing line
	var tmpDoDrawLine = ('dx' in elem) && ('dy' in elem);
	//if need to draw specific patch only
	if( this._drawThisPatch != null ) {
		//draw this object right away
		this.renderObjInPatch(
			//X- and Y-index for canvas patch where to draw
			this._drawThisPatch.x, this._drawThisPatch.y,
			//drawing information about object
			data, 
			//pass in canvas element
			elem,
			//are we drawing line or not
			tmpDoDrawLine,
			//drawing function pointer
			funcPtr
		);
		//quit
		return;
	}	//end if need to draw specific patch only
	//loop thru canvas rows
	for( 
		var y = Math.floor(elem.y / canvasMap.__height); 
		y < Math.ceil((elem.y + data.height) / canvasMap.__height);
		y += ((tmpDoDrawLine && elem.dy < elem.y) ? -1 : 1)
	){
		//if Y-value exceeds size of info set
		if( y >= this._info.length || y < 0 ) {
			//quit loop
			break;
		}
		//loop thru row patches
		for(
			var x = Math.floor(elem.x / canvasMap.__width); 
			x < Math.ceil((elem.x + data.width) / canvasMap.__width);
			x += ((tmpDoDrawLine && elem.dx < elem.x) ? -1 : 1)
		){
			//if X-value exceeds size of info set
			if( x >= this._info[y].length || x < 0 ) {
				//quit loop
				break;
			}
			//draw object in current canvas patch
			this.renderObjInPatch(x, y, data, elem, tmpDoDrawLine, funcPtr);
			//add rendered canvas element to this canvas patch object list
			this._info[y][x].obj.push(elem);
		}	//end loop thru row patches
	}	//end loop thru canvas rows
};	//end method 'execDrawFunc'

//render object in given patch
//input(s):
//	x,y: (number) specify X- and Y-index for rendering canvas
//	data: (JS object) associative array consumed by given function reference
//			It must contain parameters: 'x', 'y', 'width', and 'height'
//	elem: (canvasElement) canvas element to draw
//	drawLine: (bool) are we drawing line
//	funcPtr: (function pointer) rendering function to be executed
//output(s): (none)
canvasMap.prototype.renderObjInPatch = function(x, y, data, elem, drawLine, funcPtr) {
	//save former X and Y
	var tmpSavedX = elem.x, tmpSavedY = elem.y;
	//declare vars for saving former DX and DY (providing they exist)
	var tmpSaveDx  = null, tmpSaveDy = null;
	//switch element's X and Y with local position for this canvas
	elem.x = elem.x - x * canvasMap.__width;
	elem.y = elem.y - y * canvasMap.__height;
	//if we are drawing line
	if( drawLine ) {
		//save former values of Dx and Dy
		tmpSaveDx = elem.dx;
		tmpSaveDy = elem.dy;
		//re-calc dx and dy position (by analogy)
		elem.dx = elem.dx - x * canvasMap.__width;
		elem.dy = elem.dy - y * canvasMap.__height;
	}	//end if drawing line
	//execute function reference
	funcPtr(this._info[y][x].context, data, elem);
	//restore former X and Y
	elem.x = tmpSavedX;
	elem.y = tmpSavedY;
	//if drawing line
	if( drawLine ) {
		//restore Dx and Dy
		elem.dx = tmpSaveDx;
		elem.dy = tmpSaveDy;
	}	//end if drawing line
};	//end method 'renderObjInPatch'

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