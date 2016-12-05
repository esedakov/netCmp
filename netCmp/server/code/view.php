<!---
	Developer:	Eduard Sedakov
	Date:		2015-10-14
	Description:	test HTML for loading all JS and running/debugging
	Used by:	(testing)
	Dependencies:	(everything)
--->

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<!-- external libraries -->
	<link rel="stylesheet" type="text/css" href="../../external/joint.css">
	<!-- ES 2016-09-11 (b_debugger): added 2 stylesheets to make viewport DIVs resizable -->
	<link rel="stylesheet" href="../../external/jquery/ui/1.12.0/themes/base/jquery-ui.css">
	<link rel="stylesheet" href="../../external/resources/demos/styles.css">
	<script src="../../external/jquery.min.js"></script>
	<script src="../../external/lodash.min.js"></script>
	<script src="../../external/backbone-min.js"></script>
	<script src="../../external/joint.js"></script>
	<!-- ES 2016-09-11 (b_debugger): added UI jquery library to make DIV resizable -->
	<script src="../../external/jquery-ui.js"></script>
	<!--<script src="../external/jquery-1.11.3.min.js"></script>-->
	<!-- lexer -->
	<script src="../../lexer/type__token.js"></script>	<!-- constants -->
	<script src="../../lexer/obj__token.js"></script>	<!-- token object -->
	<script src="../../lexer/lexer.js"></script>		<!-- lexer -->
	<!-- pre-processor -->
	<script src="../../preprocessor/preprocessor.js"></script>
	<!-- utilities -->
	<script src="../../parsing/util__sha256.js"></script>	<!-- hashing algorithm -->
	<script src="../../parsing/util__type__entity.js"></script>	<!-- entity types -->
	<script src="../../parsing/util__lib.js"></script>		<!-- library of auxilary functions -->
	<script src="../../parsing/util__result.js"></script>	<!-- result object -->
	<script src="../../parsing/util__type__vis.js"></script><!-- type: visualizer -->
	<!-- types -->
	<script src="../../parsing/type__argument.js"></script>		<!-- type: argument -->
	<script src="../../parsing/type__blockToBlockTransfer.js"></script>	<!-- type: b2b -->
	<script src="../../parsing/type__command.js"></script>		<!-- type: command -->
	<script src="../../parsing/type__function.js"></script>		<!-- type: function -->
	<script src="../../parsing/type__obj.js"></script>			<!-- type: object -->
	<script src="../../parsing/type__scope.js"></script>		<!-- type: scope -->
	<script src="../../parsing/type__symbol.js"></script>		<!-- type: symbol -->
	<script src="../../parsing/type__log_node.js"></script>		<!-- type: logic node -->
	<script src="../../parsing/type__log_op.js"></script>		<!-- type: logic operation -->
	<script src="../../interpreter/type__dbgMode.js"></script>
	<!-- entities -->
	<script src="../../parsing/obj__argument.js"></script>		<!-- argument entity -->
	<script src="../../parsing/obj__block.js"></script>			<!-- block entity -->
	<script src="../../parsing/obj__command.js"></script>		<!-- command entity -->
	<script src="../../parsing/obj__functinoid.js"></script>		<!-- function definition entity -->
	<script src="../../parsing/obj__program.js"></script>		<!-- program entity -->
	<script src="../../parsing/obj__scope.js"></script>			<!-- scope entity -->
	<script src="../../parsing/obj__symbol.js"></script>		<!-- symbol entity -->
	<script src="../../parsing/obj__type.js"></script>			<!-- type entity -->
	<script src="../../parsing/obj__value.js"></script>			<!-- constant entity -->
	<!-- pre-defined language types (not finished, yet) -->
	<script src="../../parsing/obj__objectType.js"></script>		<!-- text type -->
	<script src="../../parsing/obj__arrayGenericType.js"></script>	<!-- array<...> type -->
	<script src="../../parsing/obj__boolType.js"></script>		<!-- boolean type -->
	<script src="../../parsing/obj__hashGenericType.js"></script>	<!-- hash<... , ...> type -->
	<script src="../../parsing/obj__intType.js"></script>		<!-- int type -->
	<script src="../../parsing/obj__realType.js"></script>		<!-- floating point type -->
	<script src="../../parsing/obj__textType.js"></script>		<!-- text type -->
	<script src="../../parsing/obj__voidType.js"></script>		<!-- void type -->
	<script src="../../parsing/obj__drawingType.js"></script>	<!-- ES 2016-06-05 (b_interpreter_2): setup drawing type -->
	<script src="../../parsing/obj__pointType.js"></script>		<!-- ES 2016-10-09 (b_db_init): point type -->
	<script src="../../parsing/obj__cast.js"></script>			<!-- ES 2016-10-09 (b_db_init): cast module -->
	<script src="../../parsing/obj__datetime.js"></script>		<!-- ES 2016-10-09 (b_db_init): datetime module -->
	<script src="../../parsing/obj__file.js"></script>			<!-- ES 2016-10-09 (b_db_init): file module -->
	<!-- ES 2016-10-09 (b_db_init): file properties module -->
	<script src="../../parsing/obj__file_properties.js"></script>
	<script src="../../parsing/obj__math.js"></script>			<!-- ES 2016-10-09 (b_db_init): math module -->
	<script src="../../parsing/obj__timer.js"></script>			<!-- ES 2016-10-09 (b_db_init): timer module -->
	<!-- logic tree -->
	<script src="../../parsing/obj__log_node.js"></script>		<!-- logic node -->
	<script src="../../parsing/obj__logic_tree.js"></script>	<!-- logic tree -->
	<!-- actual parser code -->
	<script src="../../parsing/parser.js"></script>				<!-- parser -->
	<!-- interpreting objects -->
	<script src="../../interpreter/obj__position.js"></script>	<!-- position in the code -->
	<script src="../../interpreter/obj__iterator.js"></script>	<!-- FOREACH loop iterator -->
	<script src="../../interpreter/obj__content.js"></script>	<!-- singleton value objects -->
	<script src="../../interpreter/obj__funcCall.js"></script>	<!-- function call information -->
	<script src="../../interpreter/obj__entity.js"></script>	<!-- instantiated symbol -->
	<script src="../../interpreter/obj__frame.js"></script>	<!-- instantiated scope -->
	<!-- load language libraries -->
	<!-- 1. B+ tree -->
	<script src="../../lib/B+Tree/type__b+_node.js"></script>
	<script src="../../lib/B+Tree/obj__pair.js"></script>
	<script src="../../lib/B+Tree/obj__b+_node.js"></script>
	<script src="../../lib/B+Tree/b+_tree.js"></script>
	<!-- 2. Drawing -->
	<script src="../../lib/Drawing/drawing.js"></script>
	<!-- 3. Cast -->
	<script src="../../lib/Cast/cast.js"></script>
	<!-- 4. Datetime -->
	<script src="../../lib/Datetime/Datetime.js"></script>
	<!-- 5. File -->
	<script src="../../lib/File/file.js"></script>
	<script src="../../lib/File/fileProp.js"></script>
	<script src="../../lib/File/type__file.js"></script>
	<!-- 6. Math -->
	<script src="../../lib/Math/math.js"></script>
	<!-- 7. Point -->
	<script src="../../lib/Point/point.js"></script>
	<!-- 8. Timer -->
	<script src="../../lib/Timer/timer.js"></script>
	<!-- actual interpreter code -->
	<script src="../../interpreter/interpreter.js"></script>
	<!-- debugger -->
	<script src="../../interpreter/dbg.js"></script>
	<!-- debugging function state -->
	<script src="../../interpreter/obj__dbgFuncState.js"></script>
	<!-- test file -->
	<!--<script src="./test__utils.js"></script>-->		<!-- test for utilities -->
	<!--<script src="./test__parsingEntities.js"></script>-->	<!-- test for parsing -->
	<!--<script src="./test__objType.js"></script>-->
	<script src="../../parsing/util__vis.js"></script>
</head>
<body>
	<!-- according to example on http://www.jointjs.com/tutorial, create
		global container for joint to draw elements inside -->
	<div>
		<div 
			id="dbg_viewport" 
			class="ui-resizable" 
			style="width: 65vw; height: 90vh; display: inline-block; border-right: medium solid #ff0000; border-style: solid;"
		>
			<div
				id="dbg_holder"
				style="width: 100%; height: 100%; overflow: scroll; position: relative;">
			</div>
		</div>
		<div 
			id="app_viewport" 
			class="ui-resizable" 
			style="width: 25vw; height: 90vh; display: inline-block; border-left: medium solid #ff0000; border-style: solid;"
			orig-width="100"
		>
			<div
				id="app_holder"
				style="width: 100%; height: 100%; overflow: scroll; position: relative;">
			</div>
		</div>
	</div>
	<script type="text/javascript">
		//ES 2016-09-11 (b_debugger): set special attribute in DIV for application viewport
		//	to remember last used width
		$("#app_viewport").attr("orig-width", $("#app_viewport").width());
		//ES 2016-09-11 (b_debugger): make debugger viewport DIV resizable
		$( "#dbg_viewport" ).resizable({
			handles: "e",
			resize: function( event, ui ) {
				//get amount by which debugger's view was resized
				var dx = ui.originalSize.width - ui.size.width;
				//calculate resulting size difference for app view
				var nw = parseInt($("#app_viewport").attr("orig-width")) + dx;
				//make sure that right view is not collapsed entirely
				if( nw <= 20 ){
					//set minimum width size
					nw = 20;
					return false;
				}
				//apply calculated width for the application view
				$("#app_viewport").width(nw);
			},
			stop: function( event, ui ) {
				$("#app_viewport").attr("orig-width", $("#app_viewport").width());
			}
		});
		$("#app_viewport").resizable({
			handles: "e",
			stop: function( event, ui ) {
				$("#app_viewport").attr("orig-width", $("#app_viewport").width());
			}
		});
		function run_tests(){
			//////test utilities
			//////run_util_tests();
			//////test parsing entities
			//////run_parsing_entities_tests();
			////run_obj_type_tests();
			////return false;
			//var glWidth = 1600, glHeight = 1600;
			//test_viz('dbg_holder', glWidth, glHeight);
			//initialize code segement to parse
			//var code = "object goo{\n" +
			//				"foo<integer>:_k\n" +
			//			"};\n" +
			//			"object<K> foo{\n" + 
			//				"integer:_i,\n" + 
			//				"real:_f,\n" + 
			//				"function foo:__create__(integer i,real f){},\n" +
			//				"function integer:getI(){return this._i;\n" + 
			//				"}\n" +
			//			"};\n" + 
			//			"function foo<integer>:__main__(){}.";
			/*var code  = "object<_Ty> foo{\n" +
							"integer:_idx,\n" +
							"_Ty:_data,\n" +
							"function integer:getIndex(){\n" +
								"return this._idx\n" +
							"},\n" +
							"function _Ty:getData(){\n" +
								"return this._data\n" +
							"}\n" +
						"};\n" +
						"object goo{\n" +
							"foo<<integer>>:_data,\n" +
							"function integer:getFooData(boolean doGetIdx){\n" +
								"if doGetIdx == true {\n" +
									"return this._data._idx\n" +
								"} else {\n" +
									"return this._data._data\n" +
								"}\n" +
							"}\n" + 
						"};\n" +
						"function integer:__main__(){\n" +
							"var goo it;\n" +
							"return call it.getFooData(true)\n" +
						"}.";*/
			/*var code  = "function integer:print(integer i){\n" +
							"return i * 2\n" +
						"};\n" +
						"function integer:__main__(){\n" +
							"var integer i = 0;\n" +
							"while i < 10 {\n" +
								"if i == 0 {\n" +
									"let i = 1\n" +
								"} else {\n" + 
									"if i =< 4 {\n" +
										"let i = i + 1\n" +
									"} else {\n" +
										"let i = 11\n" +
									"}\n" +
								"};\n" +
								"call print(i)\n" +
							"};\n" +
							"return i mod 5\n" +
						"}.";*/
			/*var code = "function void:__main__(){" +
							"var array<<integer>> arr;" +
							"call arr.insert(1);" +
							//"var integer i_0 = call arr.get(0);" +
							"var integer i_0 = arr[0];" +
							"let arr[1] = i_0 / 2;" +
							"var integer i_1 = call arr.remove(i_0)" +
						"}.";*/
			//-----------------------STARTED TESTING FROM HERE---------------------------//
			/*var code = "object elem{\n" +
							"integer:_type,\n" +	//0:nothing, 1:wall, 2:block, 3:keeper
							"integer:_x,\n" +
							"integer:_y,\n" +
							"function elem:__constructor__(integer type, integer x, integer y){\n" +
								"let this._type = type;\n" +
								"let this._x = x;\n" +
								"let this._y = y;\n" +
								"return this\n" +
							"}\n" +
							//"function text:__toString__(){\n" +
							//	"return \"elem:\" + this._type.__toString__()\n" +
							//"}\n" +
						"};\n" +
						"function elem:createElement(integer type, integer x, integer y){\n" +
							"var elem e;\n" +
							"let e._type = type;\n" +
							"let e._x = x + 1;\n" +
							"let e._y = y;\n" +
							"return e\n" +
						"};\n" +
						"object pos{\n" +
							"integer:_x,\n" +
							"integer:_y,\n" +
							"function pos:__constructor__(integer x, integer y){\n" +
								"let this._x = x;\n" +
								"let this._y = y;\n" +
								"return this\n" +
							"},\n" +
							"function text:getText(){\n" +
								"var integer tx = this._x;\n" +
								"var integer ty = this._y;\n" +
								"return call tx.__tostring__() + call ty.__tostring__()\n" +
							"}\n" +
						"};\n" +
						//"function pos:createPosition(integer x, integer y){\n" +
						//	"var pos p;\n" +
						//	"let p._x = x;\n" +
						//	"let p._y = y;\n" +
						//	"return p\n" +
						//"};\n" +
						"function void:__main__(){\n" +
						
							"var array<<elem>> arr;" +
							//X0123
							//0****
							//1*b *
							//2* k*
							//3****
							"call arr.addfront(call createElement(1, 0, 0));\n" +
							"call arr.addback(var elem(1, 1, 0));\n" +
							"call arr.addfront(call createElement(1, 2, 0));\n" +
							"call arr.addback(call createElement(1, 3, 0));\n" +
							"call arr.addback(call createElement(1, 0, 1));\n" +
							"call arr.addfront(call createElement(2, 1, 1));\n" +
							"call arr.addfront(call createElement(0, 2, 1));\n" +
							"call arr.addback(call createElement(1, 3, 1));\n" +
							"call arr.addback(call createElement(1, 0, 2));\n" +
							//"call arr.addback(call createElement(0, 1, 2));\n" +
							//"call arr.addback(call createElement(3, 2, 2));\n" +
							//"call arr.addback(call createElement(1, 3, 2));\n" +
							//"call arr.addback(call createElement(1, 0, 4));\n" +
							//"call arr.addback(call createElement(1, 1, 4));\n" +
							//"call arr.addback(call createElement(1, 2, 4));\n" +
							//"call arr.addback(call createElement(1, 3, 4));\n" +
							"var pos keeper = var pos(1,9);\n" +
							"var text t_keeper = call keeper.getText();\n" +
							//"var pos block;\n" +
							//"foreach( cur:arr ){\n" +
							//	"if cur._type == 2 {\n" +
							//		"let block._x = cur._x;\n" +
							//		"let block._y = cur._y\n" +
							//	"} else {\n" +
							//	//"} else if cur._type == 3 {\n" +
							//		"let keeper._x = cur._x;\n" +
							//		"let keeper._y = cur._y\n" +
							//	"}\n" +
							//"};\n" +
							"call arr.remove(5)\n" +
						"}.\n";*/
			/*var code = "function void:__main__(){\n" +
							"var tree<<integer, real>> t = var tree<<integer, real>>();\n" +
							"call t.insert(1.4, 5);\n" +	//1
							"call t.insert(2.1, 11);\n" +	//2
							"call t.insert(3.4, 17);\n" +	//3
							"call t.insert(4.1, 1);\n" +	//4
							"call t.insert(5.4, 9);\n" +	//5
							"call t.insert(6.1, 10);\n" +	//6
							"call t.insert(7.4, 2);\n" +	//7
							"call t.insert(8.1, 30);\n" +	//8
							"call t.insert(9.4, 6);\n" +	//9
							"call t.insert(10.1, 8);\n" +	//10
							"call t.insert(11.4, 3);\n" +	//11
							"call t.insert(12.1, 15);\n" +	//12
							"call t.insert(13.4, 31);\n" +	//13
							"call t.insert(14.1, 18);\n" +	//14
							"call t.insert(15.4, 20);\n" +	//15
							"var integer max = call t.getmax();\n" +
							"var real maxVal = call t.get(max);\n" +
							"var integer min = call t.getmin();\n" +
							"var real minVal = call t.get(min);\n" +
							"call t.remove(2);\n" +		//1
							"call t.remove(11);\n" +	//2
							"call t.remove(18);\n" +	//3
							"call t.remove(4);\n" +		//4 -- miss
							"call t.remove(17);\n" +	//5
							"call t.remove(6);\n" +		//6
							"call t.remove(30);\n" +	//7
							"call t.remove(5);\n" +		//8
							"call t.remove(15);\n" +	//9
							"call t.remove(17);\n" +	//10 -- miss
							"call t.remove(10);\n" +	//11
							"call t.remove(1);\n" +		//12
							"call t.remove(9);\n" +		//13
							"call t.remove(8);\n" +		//14
							"call t.remove(20);\n" +	//15
							"call t.remove(3);\n" +		//16
							"call t.remove(31)\n" +		//17 -- at this point tree is empty
						"}.\n";*/
			/*var code = "function void:__main__(){\n" +
							"var array<<real>> a = var array<<real>>();\n" +
							//is empty
							"var boolean ise1 = call a.isempty();\n" +	//empty
							//inserts
							"call a.insert(1.4, 0);\n" +				//insert at start
							"call a.insert(2.1, 1);\n" +				//insert at end
							"call a.insert(3.4, 0);\n" +				//insert at start
							"call a.insert(4.1, 2);\n" +				//insert at middle
							"call a.insert(5.4, 1);\n" +				//insert at middle
							"call a.insert(6.1, 5);\n" +				//insert at end
							//[3.4, 5.4, 1.4, 4.1, 2.1, 6.1]
							"var integer i1 = call a.index(4.1);\n" +	//index = 3
							"var integer i2 = call a.index(6.1);\n" +	//index = 5
							"var integer i3 = call a.index(3.4);\n" +	//index = 0
							//[3.4, 5.4, 1.4, 4.1, 2.1, 6.1]
							"var real a1 = call a.get(0);\n" +			//value = 3.4
							"var real a2 = call a.get(3);\n" +			//value = 4.1
							"var real a3 = call a.get(5);\n" +			//value = 6.1
							//is empty
							"var boolean ise2 = call a.isempty();\n" + 	//not empty
							//get length
							"var integer l1 = call a.length();\n" +		//length = 6
							//removes
							"call a.remove(0);\n" +						//remove at start	= 3.4
							"call a.remove(1);\n" +						//remove at middle	= 1.4
							"call a.remove(3);\n" +						//remove at end		= 6.1
							"call a.remove(2);\n" +						//remove at end		= 2.1
							"call a.remove(0);\n" +						//remove at start	= 5.4
							//get length
							"var integer l2 = call a.length();\n" +		//length = 1
							//[4.1]
							//remove all
							"call a.removeall();\n" +					//remove all
							//is empty
							"var boolean ise3 = call a.isempty()\n" +	//empty
						"}.\n";*/
			var code =	"function void:__main__(){\n" +
							"var drawing drw = var drawing();\n" +
							"call drw.settxtposition(0.5, 0.35);\n" +
							"call drw.drawrect(100, 100, 500, 300, 1.0, 'red', 2, 'green', 15, 15, 'hello world! hello world.\nhello world?')\n" +
						"}.\n";
			/*var code =	"object<_Ty> point{\n" +
							"integer:_idx,\n" +
							"_Ty:_x,\n" +
							"_Ty:_y,\n" +
							"function _Ty:square(){\n" +
								"return this._x * this._x + this._y * this._y\n" +
							"},\n" +
							"function point<<_Ty>>:__constructor__(_Ty x, _Ty y){\n" +
								"let this._x = x;\n" +
								"let this._y = y;\n" +
								"return this\n" +
							"},\n" +
							"function _Ty:getX(){\n" +
								"return this._x\n" +
							"},\n" +
							"function _Ty:getY(){\n" +
								"return this._y\n" +
							"}\n" +
						"};\n" +
						"function void:__main__(){\n" +
							"var array<<point<<integer>>>> a;\n" +
							"call a.insert(var point<<integer>>(0,1),0);\n" +
							"call a.insert(var point<<integer>>(2,3),1);\n" +
							"call a.insert(var point<<integer>>(4,5),2);\n" +
							"var drawing drw = var drawing();\n" +
							"var text txt;\n" +
							"call drw.settxtposition(0.5, 0.35);\n" +
							"foreach( cur : a ){\n" +
								"let txt = txt + call (call cur.square()).tostring() + ','\n" +
							"};\n" +
							"call drw.drawrect(100,100,500,300,1.0,'red',2,'green',15,15,txt)\n" +
						"}.\n";*/
			//other issue: referencing inside inner loop's condition PHI's of outter loop
			//	need to check it
			//	b:99 (c:378 - isnext c_377 c_362) -- but c_362 is not the nearest declaration of
			//		array 'a'. It is PHI of outer loop, but we have PHI of inner loop for array
			//		'a' declared in b:98 (b_375)
			/*var code = "function void:__main__(){\n" +
							"var array<<integer>> a;\n" +
							"if(call a.length() == 0){\n" +
								"var integer i = 0;\n" +
								"while(i < 4){\n" +
									"if(i == 0){\n" +
										"call a.insert(1, 0)\n" +
									"} else {\n" +
										"if(i == 3){\n" +
											"call a.insert(3,3)\n" +
										"}\n" +
									"};\n" +
									"if(i == 1){\n" +// || i == 2
										"call a.insert(7,1)\n" +
									"};\n" +
									"if(i == 2){\n" +
										"call a.insert(7,2);\n" +
										"foreach(m : a){\n" +
											"break\n" +
										"}\n" +
									"};\n" +
									"let i = i + 1\n" +
								"};\n" +
								"while(call a.length() > 2){\n" +
									"foreach(k : a){\n" +
										"let a[1] = a[1] + k\n" +	//error (b:102, c:389,c:387)
										//"let a[1] = a.get(1) + k\n"
									"};\n" +
									"foreach(j : a){\n" +
										"if(a[0] == j){\n" +
										//"if(a.get(0) == j){\n" +
											"continue\n" +			//error (b:109, c:413) => BRA without any argument, and block transfers to two other blocks, yet it should lead to one, since there is no conditional jump in it
																	//should b:107 -> b:111
																	//but, b:107 -> b.110 (nop)
																	//not even sure if b:112 should exist?
										"};\n" +
										"let a[0] = a[0] + j\n" +
										//"let a[0] = a.get(0) + j\n" +
									"};\n" +
									"call a.remove(call a.length() - 1)\n" +
								"}\n" +
							"}\n" +
							//"var text txt = 'hello world';\n" +
							//"var drawing drw = var drawing();\n" +
							//"call drw.settxtposition(0.5, 0.35);\n" +
							//"foreach( cur : a ){\n" +
							//	"let txt = txt + call cur.tostring() + ','\n" +
							//"};\n" +
							//"call drw.drawrect(100,100,500,300,1.0,'red',2,'green',15,15,txt)\n" +
						"}.\n";
			*/
			/*var code =  "function integer:__main__(){\n" +
							//"var i = 0;\n" +			//pars.1 - missing type specifier
							//"var = 0;\n" +			//pars.1 - missing type specifier
							//"var;\n" +				//pars.1 = missing type specifier
							//"var integer = 0;\n" +	//pars.2 - missing variable name in declaration
							//"var integer i 0;\n" +	//pars.3 - missing equal sign in declaration
							//"var integer i =;\n" +	//pars.4 - error right exp in declaration
							//"let i = 0;\n" +			//pars.5 - undeclared variable
							"var integer i;\n" +
							//"let integer i = 0;\n" +	//pars.5 - undeclared variable
							//"let i;\n" +				//pars.6 - missing assignment exp in let stmt
							//"var void j;\n" +			//pars.7 - cannot declare VOID variable
							//"var real i;\n" +			//pars.8 - variable re-declared
							//"var int j;\n" +			//pars.9 - unkown type in declaration
							//"let = 0;\n" +			//pars.2 - missing variable name in declaration
							//"call __main__;\n" +		//pars.10 - missing '(' after function name
							//"call i.__main__();\n" +	//pars.11 - this function is not declared in this object
							//"call __main__(;\n" +		//lex.1 - unmatched paranthesis
							//"call __main();\n" +		//pars.12 - invoking non-existing function
							//"call i();\n" +			//pars.13 - attempting to call non-functinoid entity
							//"call;\n" +				//pars.13 - attempting to call non-functinoid entity
							//"return 0;\n" +			//to avoid infinite recursion, by call below
							//"call __main__();\n" +	//pars.14 - infinite recursion
							//"var real m = call foo(1,2.0);\n" +	//pars.15 - assigning wrong type
							//"var integer m = call foo(1,'red');\n" +	//pars.16 - arg type mismatch
							//"var integer m = call foo(1,2.0,0);\n" +	//pars.17 - wrong num of args
							//"var integer m = call foo(1);\n" +		//pars.17 - wrong num of args
							"var bar<<integer>> m;\n" +
							"var integer k = i + 1;\n" +
							"return 0\n" +
						"};\n" +
						//"object {\n" +				//pars.40 - missing object name in obj-def
						//"object bar kwar{\n" +		//pars.41 - expecting '{' after object name
						//"object bar,{\n" +			//pars.41 - expecting '{' after object name
						//"object:bar{\n" +				//pars.40 - missing object name in obj-def
						//"object<> bar{\n" +			//pars.42 - expecting templ specifier
						//"object<_Ty,> bar{\n" +		//pars.43 - expecting templ spec in obj-def
						//"object<_Ty K> bar{\n" +		//pars.44 - expecting comma in templ list
						//"object<<_Ty>> bar{\n" +		//pars.41 - expecting '{' after object name
						//"object<_Ty,_Ty> bar{\n" +	//pars.45 - templ spec re-decl in obj-def
						"object<_Ty> bar{\n" +
							//"_Ty:,\n" +				//pars.46 - expecting field name in obj-def
							//"_Ky:_idx,\n" +			//pars.47 - undecl templ specifier
							"_Ty:_idx,\n" +
							//"_Ty:_idx\n" +			//pars.48 - field re-declared
							"integer:_dup\n" +
						"};\n" +
						//"function :foo(){\n" +		//pars.20 - missing type specifier in func-def
						//"function void foo(){\n" +	//pars.21 - missing colon in func-def
						//"function void:(){\n" +		//pars.22 - missing function name in func-def
						//"function void:foo{\n" +		//pars.23 - missing '(' in func-def
						//"function void:foo({\n" +		//lex.1 - unmatched paranthesis
						//"function void:foo(void x){\n" +//pars.24 - cannot instantiate VOID type
						//"function int:foo(){\n" +		//pars.25 - unkown type in func-def
						//"function void:foo(int x){\n" +	//pars.26 - unkown type in func-arg-list
						//"function void:foo(,){\n" +	//pars.27 - exp ')' in func-arg-list
						//"function void:foo(integer x,){\n" +//pars.27 - exp ')' in func-arg-list
						"function integer:foo(integer x, real k){\n" +
							"var array<<bar<<integer>>>> arr;\n" +
							//"foreach(k : u){\n" +		//pars.50 - undeclared var in foreach loop
							//"foreach k : arr){\n" +	//lex.1 - unmatched paranthesis
							//"foreach k : arr {\n" +	//pars.51 - expecting '(' after FOREACH
							//"foreach(k : arr, u : arr){\n" +	//pars.52 - expecting ')' in FOREACH
							//"foreach( : arr){\n" +	//pars.53 - expect ID as iter in FOREACH
							//"foreach( k : ){\n" +		//pars.54 - expect collection
							//"foreach( k : arr ){\n" +	//pars.8 - iterator's name collision
							//"foreach( u == arr ){\n" +//pars.55 - expecting ':' in FOREACH loop
							"foreach(u : arr){\n" +
								"var boolean temp = true;\n" +
								//"if(u._idx){\n" +		//pars.60 - IF condition needs to be boolean
								//"if(u._idx == 'red'){\n" + //pars.61 - wrong types are compared
								//"if(temp > false){\n" + //pars.62 - wrong operator for conditon types
								//"if(temp : false){\n" + //pars.63 - condition is incorrectly formed
								//"if(){\n" +			//pars.63 - condition is incorrectly formed
								//"if(temp){\n" +		//pars.66 - cond needs at least one comp op
								"if(u._idx == 123){\n" +
								//"} else if( temp ) {\n" +	//pars.67 - place IF inside ELSE clause
								//"} else while( temp ) {\n" + //pars.68 - expecting '{' after ELSE
								"};\n" +
								//"while u._idx {\n" +	//pars.60 - WHILE condition needs to be bool
								//"while u._idx == 'red' {\n" +	//pars.61 - wrong types are compared
								"while(temp == true){\n" +
									//"let temp = false;\n" +	//pars.70 - no ';' at last stmt of scp
									"let temp = false\n" +
								"}\n" +
							"};\n" +
							//"return k;\n" +			//pars.30 - returning wrong object type
							//"if( x == 0 ){\n" +		//pars.31 - not all control paths return
								"return x\n" +
							//"}\n" +					//pars.31 - not all control paths return
							//"return\n" +				//pars.32 - missing exp in ret stmt
						"}.\n";*/
			//ES TODO (may be later -- requires possibly large re-thinking of expression parsing):
			//	need to think of a way to create logical tree terminal nodes every time we have
			//	used boolean constant (i.e. true or false => see declaration of b1) or boolean
			//	variable (see declaration of a1). So that we would not have to write b1 == true.
			//	But just creating terminal node is not enough, we need to setup CMD and conditional
			//	jump as well. Not a trivial issue, but it is worth looking into it.
			//var code = "function void:__main__(){\n" +
			//				"var boolean b1 = true;\n" +
			//				"var boolean b2 = (1 == 2);\n" +
			//				/*"var boolean b3 = ('red' == 'green' | 'dark' == 'dark');\n" +
			//				"var boolean a1 = (b1 == true) & (b2 == true) & (b3 == true);\n" +
			//				"var boolean a2 = (b1 == true | b2 == true) & (b1 == true & b3 == true) & (a1 == true)\n" +*/
			//				"if( (b1 == true | b2 == true) & (b1 == false | b2 == false) ){\n" +
			//					"let b1 = b2\n" +
			//				"}\n" +
			//				//"var boolean a3 = b1 | (b2 && b3) | (a1 | a2)\n" +
			//			"}.\n";
			//this code line is inside interpreter
			//create instance of parser
			var p = new parser(code);
			//this code line is inside interpreter
			//process program
			p.process__program();
			//ES 2016-10-10 (b_db_init): send parsing data to the server
			comToServ();
			////Next code block is responsible for drawing CFG
			////start of CFG drawing code block:
			//var w = 1600, h = 55600, id = 'dbg_holder';
			////run test function
			//var g_scp = p._gScp;
			////create visualization component
			////ES 2016-08-13 (b_cmp_test_1): replace call to 'viz' with a function that either
			////	creates a new viz instance or returns existing one
			//var v = viz.getVisualizer(p, id, w, h);	//arguments for 'getVisualizer' changed
			////draw CFG
			//v.drawCFG(g_scp);
			////end of CFG drawing code block.
			//start of interpreter code block:
			//ES 2016-09-05 (b_debugger): pass width, height, and html element id to create debugger
			////TODO: test debugger's step out mode
			////var intrp = new interpreter(code, w, h, id);
			//ES 2016-08-13 (b_cmp_test_1): add Execution Command Stack entries to JointJS
			//intrp._drwCmp._viz.addStackEntriesToJointJS('ecsEntries');
			//end of interpreter code block.
		};
		//ES 2016-10-08 (b_db_init): communicate parser data to server
		//input(s): (none)
		//output(s): (none)
		function comToServ(){
			//create pull of objects to send to the server
			var objPull = [];
			//add scopes to the object pull
			objPull = objPull.concat(
				$.map(
					getValues(scope.__library),
					function( elem, idx ){
						//init object defintition for this scope
						var objId = null;
						//if this scope represents function
						if( elem._funcDecl != null ){
							objId = elem._funcDecl._id;
						}
						//if this scope represents type
						if( elem._typeDecl != null ){
							objId = elem._typeDecl._id;
						}
						return {
							'id': elem._id,
							'kind': RES_ENT_TYPE.SCOPE.value,
							'prn_id': (elem._owner != null ? elem._owner._id : null),
							'type': elem._type.value,
							'name': null,
							'obj_id': objId,
							'start': elem._start._id,
							'end': elem._end != null ? elem._end._id : null
						}
					}
				)
			);
			//add blocks and commands to the object pull
			$.map(
				getValues(block.__library),
				function( elem, idx ){
					objPull.push({
						'id': elem._id,
						'kind': RES_ENT_TYPE.BLOCK.value,
						'prn_id': (elem._owner != null ? elem._owner._id : null),
						'type': null,
						'name': null,
						'related_scp_id': elem._relatedScope != null ? elem._relatedScope._id : null

					});
					//loop thru commands of this block and them to object pull
					objPull = objPull.concat($.map(
						elem._cmds,
						function( elem2, idx2 ){
							return {
								'id': elem2._id,
								'kind': RES_ENT_TYPE.COMMAND.value,
								'prn_id': elem2._blk._id,
								'type': elem2._type._id,
								'name': null
							}
						})
					);
				}
			);
			//add types, and values to the object pull
			objPull = objPull.concat(
				$.map(
					[].concat(
						getValues(type.__library)
					).concat(
						getValues(value.__library)
					),
					function( elem, idx ){
						//init name value
						var tmpName = null;
						var tmpOwnerId = null;
						//if this element is a function
						if( elem.getTypeName() == RES_ENT_TYPE.TYPE ){
							tmpName = elem._name;
							tmpOwnerId = elem._scope._id;
						//if this element is a value
						} else if( elem.getTypeName() == RES_ENT_TYPE.VALUE ){
							tmpName = JSON.stringify(elem._value);
						}
						//init owner
						return {
							'id': elem._id,
							'kind': elem.getTypeName().value,
							'prn_id': tmpOwnerId,
							'type': ('_type' in elem ? elem._type._id : null),
							'name': tmpName
						};
					}
				)
			);
			//initialize associative array of symbols
			var tmpSymbMap = {};
			//loop thru scopes to add functions and symbols to object pull
			for( var tmpCurScpId in scope.__library ){
				//get scope object
				var tmpCurScp = scope.__library[tmpCurScpId];
				//if this scope is a function
				if( tmpCurScp._funcDecl != null ){
					//add this function to the object pull
					objPull = objPull.concat(
						{
							'id': tmpCurScp._funcDecl._id,
							'kind': RES_ENT_TYPE.FUNCTION.value,
							'prn_id': tmpCurScp._funcDecl._scope != null ? tmpCurScp._funcDecl._scope._id : null,
							'type': tmpCurScp._funcDecl._func_type.value,
							'name': tmpCurScp._funcDecl._name,
							'ret_type_id': tmpCurScp._funcDecl._return_type._id
						}
					);
				}	//end if this scope is a stand alone function
				//loop thru symbols of this scope
				for( var tmpCurSymbName in tmpCurScp._symbols ){
					//get symbol object
					var tmpSymb = tmpCurScp._symbols[tmpCurSymbName];
					//check if this symbol is not yet inside associative array of symbols
					if( !(tmpSymb._id in tmpSymbMap) ){
						//add symbol id to the symbol associative array
						tmpSymbMap[tmpSymb._id] = null;
						//add symbol to the object pull
						objPull.push({
							'id': tmpSymb._id,
							'kind': RES_ENT_TYPE.SYMBOL.value,
							'prn_id': null,
							'type': tmpSymb._type._id,
							'name': tmpSymb._name
						});
					}	//end if this symbol is not yet inside associative array of symbols
				}	//end loop thru symbols
			}	//end loop thru scopes
			///send data to the server using jquery POST method
			$.post(
				'http://localhost/netCmp/server/code/interreq.php',
				{data: objPull},
				function(data, status, xhr){
					//if success
					if( status == "success" ){
						//TODO: do smth when transfer completed successfully
						//test -- redirect to another page
						window.location.replace("http://localhost/netCmp/server/code/parser/getParserData.php");
					} else {	//else, error took place
						//create error alert
						alert("error: " + xhr.status + xhr.statusText);
					}
				}
			);
			/*
			//see: http://stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
			var data = new FormData();
			data.append('user', 'person');
			data.append('pwd', 'password');
			data.append('organization', 'place');
			data.append('requiredkey', 'key');
			//see: http://www.openjs.com/articles/ajax_xmlhttp_using_post.php
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					document.getElementById("comToServP").innerHTML = this.responseText;
				}
			};
			xmlhttp.open("POST", "interreq.php?q=" + str, true);
			xmlhttp.send(data);
			*/
		};	//end function 'comToServ'
	</script>
	<!-- rather then start test runs right away, use click event (easier to debug) -->
	To start testing press <a
		href="javascript:void(0);"
		onclick="run_tests();"
	>here</a>.
	<p id="comToServP"></p>
	<!--<div id="outputDiv"></div>-->
</body>
</html>