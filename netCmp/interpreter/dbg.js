/**
	Developer:	Eduard Sedakov
	Date:		2016-09-04
	Description:	derived from visualizer (parsing/util_vis.js), it further extends CFG
						drawer, by adding extra functionallities to implement debugger.
						Such functionallities are: (1) stepping thru code cmd-by-cmd,
						(2) running execution non-stop, (3) breakpoints, (4) showing
						currently accessible variables
	Used by:	(interpreter) and main HTML
	Dependencies:	(parsing\util_vis.js), (interpreter), (frame)
**/

//instance of debugger
dbg.__debuggerInstance = null;

//create debugger
//input(s):
//	prs: (parser) instance of parser
//	id: (text) id for HTML component around JointJS chart
//	w: (integer) width of JointJS viewport
//	h: (integer) height of JointJS viewport
//	pos: (position) starting execution position
//	mode: (DBG_MODE) debugger mode
//	fr: (frame) starting frame
//output(s):
//	(dbg) => new or existing instance of debugger
dbg.getDebugger = function(prs, id, w, h, mode, fr){
	//if debugger instance does not exist
	if( dbg.__debuggerInstance == null ){
		//make sure that parser is defined and not null
		if( typeof prs == "undefined" || prs == null ){
			throw new Error("debugger: need instance of parser");
		}
		//make sure that html ID is defined and not null
		if( typeof id == "undefined" || id == null ){
			throw new Error("debugger: need id of HTML element container around jointJS");
		}
		//make sure that mode is defined and not null
		if( typeof mode == "undefined" || typeof mode == null ){
			throw new Error("debugger: need debugging mode");
		}
		//make sure that frame is defined and not null
		if( typeof fr == "undefined" || typeof fr == null ){
			throw new Error("debugger: need starting frame");
		}
		//make sure that viewport dimensions are defined and not null
		if( typeof w == "undefined" || typeof h == "undefined" || w == null || h == null ){
			throw new Error("debugger: need dimensions for jointJS viewport");
		}
		//create new instance and store it inside global variable
		dbg.__debuggerInstance = new dbg(prs, id, w, h, mode, fr);
	}
	//return instance of debugger
	return dbg.__debuggerInstance;
};	//end function 'getDebugger'

//ctor for debugger
//draws CFG and extends it further by allowing user to step-thru interpreter code
//	and analyze current set of accessible variables. In addition debugger allows
//	to place breakpoints.
//input(s):
//	prs: (parser) instance of parser
//	id: (text) id for HTML component around JointJS chart
//	w: (integer) width of JointJS viewport
//	h: (integer) height of JointJS viewport
//	mode: (DBG_MODE) debugger mode
//	fr: (frame) starting frame
//output(s): (none)
function dbg(prs, id, w, h, mode, fr){
	//save instance of visualizer
	this._vis = viz.getVisualizer(
		VIS_TYPE.DBG_VIEW,				//debugging viewport
		prs,							//parser instance
		id,								//HTML element id
		w,								//width
		h,								//height
		function(cellView, evt, x, y){	//mouse-click event handler
			//if clicked command (we can put breakpoint only on command)
			if( cellView.model.attributes.type == "command" ){
				//get debugger (do not need to pass any values, since
				//	debugger should exist by now, and thus we should
				//	not try to create new debugger instance)
				var tmpDbg = dbg.getDebugger();
				//get command id for this jointJS entity
				var tmpCmdId = cellView.model.attributes.attrs['.i_CmdId'].text;
				//right now command id contains ':' -- filter it out
				tmpCmdId = tmpCmdId.substring(0, tmpCmdId.indexOf(':'));
				//check if this breakpoint already has been added for this command
				if( tmpCmdId in tmpDbg._breakPoints ){
					//diconnect breakpoint from this command
					cellView.model.unembed(tmpDbg._breakPoints[tmpCmdId]);
					//remove circle that represents a breakpoint
					tmpDbg._breakPoints[tmpCmdId].remove();
					//delete breakpoint entry in our collection
					delete tmpDbg._breakPoints[tmpCmdId];
				} else {	//else, create a breakpoint
					//create visual attributes for breakpoint
					var brkPtAttrs = {
						position : {	//place breakpoint to the left of command id
							x : cellView.model.attributes.position.x - 20,
							y : cellView.model.attributes.position.y
						},
						size : {	//show small circle
							width : 20,
							height : 20
						},
						attrs : {
							circle : {
								stroke: '#00E000',	//border with green color
								fill : '#E00000'	//fill with red color
							}
						}
					};
					//create breakpoint circle
					var tmpCircle = new joint.shapes.basic.Circle(brkPtAttrs);
					//show it in viewport
					viz.getVisualizer(VIS_TYPE.DBG_VIEW)._graph.addCells([tmpCircle]);
					//add this command to collection that maps command id to breakpoint
					tmpDbg._breakPoints[tmpCmdId] = tmpCircle;
					//connect breakpoint with this command (so if command moves, so does breakpoint)
					cellView.model.embed(tmpCircle);
				}	//end if breakpoint for this command already exists
			}	//end if clicked command
		}	//end mouse-click event handler
	);	//end retrieve/create visualizer
	//draw CFG, starting from global scope
	this._vis.drawCFG(prs._gScp);
	//if mode is not set
	if( typeof mode == "undefined" || mode == null ){
		//set it to be NON_STOP
		mode = DBG_MODE.NON_STOP;
	}
	//reference to the jointJS cursor
	this._cursorEnt = null;
	//array of jointJS objects for current command arguments
	this._cmdArgArrEnt = [];
	//collection of breakpoints
	//	key: command_id
	//	value: jointJS entity (visual representation of breakpoint)
	this._breakPoints = {};
	//collection that maps command id to jointJS objects for resulting command value
	//	key: command id
	//	value: jointJS object for resulting value
	this._cmdToResValEnt = {};
	//call stack -- collects DFS (debugging function state(s))
	this._callStack = [];
	//create current debugging function state
	this._callStack.push(
		new dfs(mode, fr, null, null)
	);
	//create key stroke handler
	$(document).keypress(	//when key is pressed, fire this event
		function(e){			//handler for key press event
			//get debugger (do not need to pass any values)
			var tmpDbg = dbg.getDebugger();
			//depending on the character pressed by the user
			switch(e.which){
				case 97:			//'a' - again run program
					//reset static and non-static fields, set current frame, and load vars
					entity.__interp.restart();
					break;
				case 110:			//'n' - next command (step thru)
					tmpDbg.getDFS()._mode = DBG_MODE.STEP_OVER;
					break;
				case 115:			//'s' - step in
					tmpDbg.getDFS()._mode = DBG_MODE.STEP_IN;
					break;
				case 114:			//'r' - run non stop
					tmpDbg.getDFS()._mode = DBG_MODE.NON_STOP;
					break;
				case 118:			//'v' - variables
					//Comment: do not reset mode, we just want to show/hide lookup box
					//show lookup box with all accessible variables
					tmpDbg.showEntityLookUpBox();
					//quit to prevent running next command
					return;
				case 113:			//'q' - quit
					//quit debugger
					tmpDbg.quitDebugger();
					//quit to prevent running next command
					return;
				case 99:			//'c' center on cursor
					tmpDbg.scrollTo(tmpDbg.getDFS()._pos._cmd._id);
					break;
			}	//end switch -- depending on the key pressed by the user
			//declare var for returned value from RUN function
			var tmpRunVal;
			//if returning function value from stepped in function
			if( tmpDbg.getDFS()._val != 0 ){
				//invoke run and pass in return value
				entity.__interp.run(tmpDbg.getDFS()._frame, tmpDbg.getDFS()._val);
				//reset return value to 0
				tmpDbg.getDFS()._val = 0;
			} else {	//regular execution
				//invoke interpreter's run function
				tmpRunVal = entity.__interp.run(tmpDbg.getDFS()._frame);
			}
			//if return value from RUN function is defined and NULL
			if( typeof tmpRunVal != "undefined" &&	//make sure that RUN returned smth 
				tmpRunVal == null && 				//make sure RUN function quit
				tmpDbg._callStack.length > 0 &&		//call stack is not empty

				//make sure it is not EXIT command
				tmpDbg._callStack[tmpDbg._callStack.length - 1]._funcCall != null ){
				//pop last entry from call stack
				var tmpLstCallStk = tmpDbg._callStack.pop();
				//get functinoid id for the completed function call
				var tmpFuncId = tmpLstCallStk._funcCall._funcRef._id;
				//get function call object
				var tmpFuncCallObj = tmpLstCallStk._frame._funcsToFuncCalls[tmpFuncId];
				//get return value from completed function call
				tmpDbg.getDFS()._val = tmpFuncCallObj._returnVal;
				//re-draw cursor
				tmpDbg.showCursor();
			}
		}	//end handler function
	);
	//reference to box that stores set of entities currently accessible in the code
	this._entLookupBox = null;
};	//end function ctor for debugger

//get current debugging function state
//input(s): (none)
//output(s):
//	(DFS) => current debugging function state
//	null => if there are not any
dbg.prototype.getDFS = function(){
	//if call stack is not empty
	if( this._callStack.length > 0 ){
		//retrieve last entry of call stack
		return this._callStack[this._callStack.length - 1];
	}	//end if call stack is not empty
	//else, return null
	return null;
};	//end method 'getDFS'

//quit debugger
//input(s): (none)
//output(s): (none)
dbg.prototype.quitDebugger = function(){
	//remove keypress event handler
	$(document).unbind("keypress");
	//reset mode to null
	this.getDFS()._mode = DBG_MODE.QUIT;
	//change cursor's color to red
	this._cursorEnt.attr('path/fill', '#F00000')
};

//show entity lookup box
//input(s): (none)
//output(s): (none)
dbg.prototype.showEntityLookUpBox = function(){
	//if entity lookup box is not created
	if( this._entLookupBox == null ){
		//create entity lookup box
		//	see: parsing/util_vis.js => createSymbDlg()
		this._entLookupBox = new joint.shapes.basic.Path({
			
			//specify dimensions of lookup box (it does not matter, it will be reset later)
			size: {
				width: 25,
				height: 25
			},

			//specify position of lookup box (it does not matter, it will be reset later)
			position: {
				x: 0,
				y: 0
			},

			//shape contour and visual attributes
			attrs: {

				//visual component
				path: {

					//filling and border color
					fill: '#E000E0',		//purple filling
					stroke: '#00E000',		//purple border
					//opacity: 0.5,			//half transparent
					'stroke-width': 1,		//border width

					//shape contour
					//	Notation:	upper case (absolute coordinates), 
					//				lower case (relative coordinatesto last action)
					//	M: move to (X,Y)
					//	L: line to (X,Y)
					//	  0 1 2 3 4 .. 8 -> each segment is 5 pixels
					//	0 + - - - - -  *
					//	1  \           |
					//	2   +          |
					//	3   |          |
					//	4   |          |
					//	5   * - - - -  *
					//	|
					//	v
					//	each segment is 5 pixels
					//http://www.svgbasics.com/paths.html
					'd': 'M 0 0 L 5 10 L 5 40 L 25 40 L 25 0 L 0 0',

					//set it to be invisible (initially)
					display: 'none'
				},

				//text component
				text: {

					//specify font size
					'font-size': 23,

					//specify vertical position of text relative to the shape
					'ref-y': 0.4,

					//specify empty text
					text: '',

					//set font color to be white
					fill: '#FFFFFF',

					//specify vertical offset relative to offset
					'ref-y': 0.1,

					//specify horizontal offset relative to offset
					'ref-x': 0.60
				}
			}	//end shape contour and visual attributes
		});
		//show cursor
		viz.getVisualizer(VIS_TYPE.DBG_VIEW)._graph.addCells([this._entLookupBox]);
	}	//end if entity lookup box is not created
	//get visibility flag
	var tmpIsVisible = this._entLookupBox.attr('path/display') != 'none';
	//if visible
	if( tmpIsVisible ){
		//hide it and quit
		//see: http://stackoverflow.com/questions/27114905/hiding-elements-in-a-diagram
		this._entLookupBox.attr('path/display', 'none');
		this._entLookupBox.attr('text/display', 'none');
		return;
	} else {	//else, it is invisible
		//show it and finish running this function (to show proper lookup box)
		this._entLookupBox.attr('path/display', 'block');
		this._entLookupBox.attr('text/display', 'block');
	}
	//get jointjS entity for current command
	var tmpPos = this.cmdIdToXY(this.getDFS()._pos._cmd._id);
	//make sure that acquired information is valid
	if( typeof tmpPos == "undefined" || tmpPos == null ){
		//error
		throw new Error("debugger: cannot get position for command " + this.getDFS()._pos._cmd._id + " to show entity lookup box");
	}
	//move lookup box to current position
	this._entLookupBox.position(tmpPos.X, tmpPos.Y);
	//get text for lookup box (i.e. all accessible entities)
	var tmpLookupBoxTxt = this.getDFS()._frame.getAllAccessibleEntities({});
	//measure dimensions of this text
	var tmpDim = viz.measureTextDim(tmpLookupBoxTxt);
	//resize lookup box
	this._entLookupBox.resize(tmpDim.width * 1.25, tmpDim.height + 10);
	//set text in the lookup box
	this._entLookupBox.attr('text/text', tmpLookupBoxTxt);
};	//end method 'showEntityLookUpBox'

//scroll into view specified command
//	see: http://stackoverflow.com/a/32046714
//input(s):
//	cid: (integer) command id
//output(s): (none)
dbg.prototype.scrollTo = function(cid){
	//get position of specified command
	var tmpPos = this.cmdIdToXY(cid);
	//make sure that returned position is valid
	if( typeof tmpPos == "undefined" || tmpPos == null ){
		//error
		throw new Error("debugger: cannot scroll to command, id: " + cid);
	}
	//stop previous animation
	$('#dbg_holder').stop();
	//get width of div container surrounding debugging viewport
	var tmpDivWidth = $('#dbg_holder').width();
	//get height of div container surrounding debugging viewport
	var tmpDivHeight = $('#dbg_holder').height();
	//calculate difference between position of command and center of current view
	var tmpDiffX = tmpPos.X - ( tmpDivWidth / 2 );
	var tmpDiffY = tmpPos.Y - ( tmpDivHeight / 2 );
	//animate scrolling
	$('#dbg_holder').animate(
		{
			scrollTop: tmpDiffY > 0 ? tmpDiffY : 0,
			scrollLeft: tmpDiffX > 0 ? tmpDiffX : 0
		}, 
		5000
	);
};	//end method 'scrollTo'

//show values for current command arguments
//input(s):
//	f: (frame) frame reference
//	cmd: (command) command reference
//output(s): (none)
dbg.prototype.showCmdArgs = function(f, cmd){
	//get current command jointJS object attributes
	var tmpCmdJJAttr = this._vis._cmdToJointJsEnt[cmd._id];
	//init x-position for the first argument value
	var x = tmpCmdJJAttr.x + tmpCmdJJAttr.width + 10;
	//init y-position for all argument values
	var y = tmpCmdJJAttr.y;
	//loop thru command arguments
	for( var tmpCmdArgIdx = 0; tmpCmdArgIdx < cmd._args.length; tmpCmdArgIdx++ ){
		//get command argument
		var tmpArgObj = cmd._args[tmpCmdArgIdx];
		//skip null command argument
		if( typeof tmpArgObj == "undefined" || tmpArgObj == null ){
			continue;
		}
		//init variable for an entity/content, representing command argument object
		var tmpArgVal = null;
		//if argument is command
		if( tmpArgObj.getTypeName() == RES_ENT_TYPE.COMMAND ){
			//check if frame has mapping for this command argument object
			if( tmpArgObj._id in f._cmdsToVars ){
				//translate command to an entity/content
				tmpArgVal = f._cmdsToVars[tmpArgObj._id];
			}	//end if frame has mapping for this command
		} else if( tmpArgObj.getTypeName() == RES_ENT_TYPE.SYMBOL ){
			//check if frame has mapping for this symbol
			if( tmpArgObj._id in f._symbsToVars ){
				//translate symbol to an entity
				tmpArgVal = f._symbsToVars[tmpArgObj._id];
			}
		} else {	//otherwise, some other parsing object
			//set this object as is
			tmpArgVal = tmpArgObj;
		}	//end if argument is command
		//get text representation for current command argument
		var tmpCurCmdArgTxt = getCompactTxt(tmpArgVal);
		//draw command argument
		var tmpJJobj = this.drawTextRect(
			cmd._id,			//command id
			tmpCurCmdArgTxt,	//text representation for command argument
			"#00A000",			//green background color
			x,
			y
		);
		//uodate x-position for the next command argument
		x += tmpJJobj.width + 10;
		//add this command argument JointJS object to array of args
		this._cmdArgArrEnt.push(tmpJJobj);
	}	//end loop thru command arguments
};	//end method 'showCmdArgs'

//show resulting command value for specified command id
//input(s):
//	cid: (integer) command id
//	val: (text) command value
//	col: (text) background color for rectangle
//	x: (integer) optional argument: x-position, where to draw rectangle
//	y: (integer) optional argument: y-position, where to draw rectangle
//output(s): (none)
dbg.prototype.drawTextRect = function(cid, val, col, x, y){
	//get jointJS object for this command
	var tmpCmdAttr = this._vis._cmdToJointJsEnt[cid];
	//if x is not passed in
	if( typeof x == "undefined" ){
		//set x to be start of command
		x = tmpCmdAttr.x + tmpCmdAttr.width + 10;
	}
	//if y is not passed in
	if( typeof y == "undefined" ){
		//set y to be start of command
		y = tmpCmdAttr.y;
	}
	//if background color is not passed in
	if( typeof col == "undefined" ){
		//set background color to be yellow
		col = "#A0A000";
	}
	//measure size of command text value
	var tmpCmdValDim = viz.measureTextDim(val);
	//create visual attributes for resulting command value
	var resCmdAttrs = {
		position : {	//place value to the right of command object
			x : x,
			y : y
		},
		size : {	//use determined dimensions
			width : tmpCmdValDim.width,
			height : tmpCmdValDim.height
		},
		attrs : {	//set visual attributes
			rect : {
				stroke: col,
				fill: col
			},
			text: {

				//specify font size
				'font-size': 23,

				//specify empty text
				text: val,

				//set font color to be black
				fill: '#000000'
			}
		}
	};
	//create resulting command value rectangle
	var tmpCmdVal = new joint.shapes.basic.Rect(resCmdAttrs);
	//create wrap-up object
	var tmpWrapUpObj = {
		x: tmpCmdVal.attributes.position.x,
		y: tmpCmdVal.attributes.position.y,
		width: tmpCmdVal.attributes.size.width,
		height: tmpCmdVal.attributes.size.height,
		obj: tmpCmdVal
	};
	//show it in viewport
	viz.getVisualizer(VIS_TYPE.DBG_VIEW)._graph.addCells([tmpCmdVal]);
	//connect this rect with this command (so if command moves, so does this rect)
	tmpCmdAttr.obj.embed(tmpCmdVal);
	//return jointJS object to the caller
	return tmpWrapUpObj;
};	//end method 'drawTextRect'

//show cursor (small arrow near currently executed command), providing current position
//	is set to specific place in CFG
//input(s): (none)
//output(s): (none)
dbg.prototype.showCursor = function(){
	//if current posiition is not set
	if( this.getDFS()._pos == null ){
		//quit
		return;
	}
	//if cursor does not exist
	if( this._cursorEnt == null ){
		//create cursor
		//	see: parsing/util_vis.js => createSymbDlg()
		this._cursorEnt = new joint.shapes.basic.Path({
			
			//specify dimensions of the arrow
			size: {
				width: 30,
				height: 24
			},

			//specify position (it does not matter, it will be reset later on)
			position: {
				x: 0,
				y: 0
			},

			//shape contour and visual attributes
			attrs: {

				path: {

					//filling and border color
					fill: '#0000E0',		//blue filling
					stroke: '#00E000',		//green border
					'stroke-width': 1,		//border width

					//shape contour
					//	Notation:	upper case (absolute coordinates), 
					//				lower case (relative coordinatesto last action)
					//	M: move to (X,Y)
					//	L: line to (X,Y)
					//	  0 1 2 3 4 5 -> each segment is 6 pixels
					//	0     +
					//	1     | \
					//	2 * - *   \
					//	3 |         *
					//	4 * - *   /
					//	5     | /
					//	6     +
					//	|
					//	v
					//	each segment is 4 pixels
					//http://www.svgbasics.com/paths.html
					'd': 'M 0 8 L 12 8 L 12 0 L 30 12 L 12 24 L 12 16 L 0 16 L 0 8'
				}
			}	//end shape contour and visual attributes
		});
		//show cursor
		viz.getVisualizer(VIS_TYPE.DBG_VIEW)._graph.addCells([this._cursorEnt]);
	}	//end if cursor does not exist
	//get jointjS entity for current command
	var tmpPos = this.cmdIdToXY(this.getDFS()._pos._cmd._id);
	//make sure that position is valid
	if( typeof tmpPos == "undefined" || tmpPos == null ){
		//error
		throw new Error("debugger: cannot get position for command " + this.getDFS()._pos._cmd._id + " to show cursor");
	}
	//set horizontal offset
	var off_x = 30;
	//check if cursor will point at breakpoint command
	if( this.getDFS()._pos._cmd._id in this._breakPoints ){
		//adjust horizontal offset, so that cursor does not overlap with breakpoint
		off_x += 20;
	}
	//move cursor to current position
	this._cursorEnt.position(tmpPos.X - off_x, tmpPos.Y);
	//scroll this command into the view
	this.scrollTo(this.getDFS()._pos._cmd._id);
	//connect cursor with next command (so if command moves, so does the cursor)
	this._vis._cmdToJointJsEnt[this.getDFS()._pos._cmd._id].obj.embed(this._cursorEnt);
};	//end method 'showCursor'

//get <x,Y> position for the given command id
//input(s):
//	cid: (integer) command id
//output(s):
//	(JS structure) => {X,Y}
//	or, NULL -- if such command id is not mapped to jointJS entity
dbg.prototype.cmdIdToXY = function(cid){
	//check if cid is defined and not null
	if( typeof cid == "undefined" || cid == null ){
		//if not, then quit
		return null;
	}
	//make sure that command id has mapping for jointJS entity
	if( !(cid in this._vis._cmdToJointJsEnt) ){
		//quit
		return null;
	}
	//get jointJS for this command id
	var tmpJointJSEnt = this._vis._cmdToJointJsEnt[cid];
	//create and return structure with position
	return {X: tmpJointJSEnt.x, Y: tmpJointJSEnt.y};
};	//end method 'cmdIdToXY'

//set execution position
//input(s):
//	f: (frame) execution position
//output(s): (none)
dbg.prototype.setPosition = function(f){
	//make sure new position is different then the old one
	if( this.getDFS()._pos != null && this.getDFS()._pos.isEqual(f._current) == true ){
		//it is the same position, so quit
		return;
	}
	//if there was previous command
	if( this.getDFS()._pos != null ){
		//disconnect cursor from previous command (so that if this command is moved,
		//	cursor does not move)
		this._vis._cmdToJointJsEnt[this.getDFS()._pos._cmd._id].obj.unembed(this._cursorEnt);
	}
	//set current execution position
	//	clone position, rather then copy, since we need to know when it changed
	this.getDFS()._pos = new position(f._current._scope, f._current._block, f._current._cmd);
	//reset frame
	this.getDFS()._frame = f;
	//show cursor at new position
	this.showCursor();
	//if there are any command arguments for the previous command
	if( this._cmdArgArrEnt.length > 0 ){
		//loop thru jointJS objects, representing command arguments
		for( var tmpCmdArgIdx = 0; tmpCmdArgIdx < this._cmdArgArrEnt.length; tmpCmdArgIdx++ ){
			//get jointJS object for command argument
			var tmpCmdArgObj = this._cmdArgArrEnt[tmpCmdArgIdx];
			//make sure that command argument is not a function
			if( typeof tmpCmdArgObj != "function" ){
				//detach from command
				this._vis._cmdToJointJsEnt[this.getDFS()._pos._cmd._id].obj.unembed(tmpCmdArgObj.obj);
				//remove it from viewport
				tmpCmdArgObj.obj.remove();
			}	//end if not a function
		}	//end loop thru jointJS objects
	}	//end if there are any command arguments
	//if there is resulting command value for this command
	if( f._current._cmd._id in this._cmdToResValEnt ){
		//get resulting command value jointJS object
		var tmpResCmdVal = this._cmdToResValEnt[f._current._cmd._id];
		//make sure that this value is not null and it is defined
		if( typeof tmpResCmdVal != "undefined" && tmpResCmdVal != null ){
			//detach from command
			this._vis._cmdToJointJsEnt[this.getDFS()._pos._cmd._id].obj.unembed(tmpResCmdVal.obj);
			//remove it
			tmpResCmdVal.obj.remove();
		}	//end if value is defined and not null
	}	//end if there is resulting command value
	//show current command's arguments
	this.showCmdArgs(f, f._current._cmd);
	//check if next command is a breakpoint
	if( this.getDFS()._pos._cmd._id in this._breakPoints && this.getDFS()._mode == DBG_MODE.NON_STOP ){
		//change mode to step_in
		this.getDFS()._mode = DBG_MODE.STEP_IN;
	}
	//bring cursor to the front
	this._cursorEnt.toFront();
};	//end method 'setPosition'

//get type name of this object (i.e. debugger)
//input(s): (none)
//output(s):
//	(RES_ENT_TYPE) => type of object
dbg.prototype.getTypeName = function(){
	return RES_ENT_TYPE.DBG;
};	//end operator 'getTypeName'