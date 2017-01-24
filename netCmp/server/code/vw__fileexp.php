<?php
	/*
	Developer:		Eduard Sedakov
	Date:			2017-01-18
	Description:	show file hierarchy page
	Used by:		(vw__main)
	Dependencies:	(io)
	*/

	//include page view
	//ES 2017-01-22 (b_file_hierarchy): moved into vw__main.php
	//require_once 'vw__page.php';

	//include IO library
	require_once './lib/lib__io.php';

	/* ES 2017-01-22 (b_file_hierarchy): moved into vw__main.php
	//create page header
	vw__page__createHeader(
		
		//no dialogs
		array()

	);
	ES 2017-01-22 (b_file_hierarchy): end moved into vw__main.php */

?>

	<?php //ES 2017-01-22 (b_file_hierarchy): add class to identify DIV that surrounds whole =
			//file explorer component ?>
	<div class="row nc-fileexp-win nc-component-view" style="height:100%; display: none;">

		<!-- this DIV shows tree view with file hierarchy
			See: https://www.jstree.com/ -->
		<div class="browse-file-sys-win col-xs-4 col-md-4" id="jstree_demo_div"></div>
		
		<!-- this DIV previews selected file in the file hierarchy -->
		<div class="col-xs-8 col-md-8 show-file-win">
			<span class="show-file-win-span" id="show_file_win"></span>
		</div>

	</div>

	<script type="text/javascript">

		<?php //on page load ?>
		$(document).ready(function(){
			
			<?php //ES 2017-01-18: create jstree instance for depicting treeview ?>
			$('#jstree_demo_div').jstree({ 
				
				'core' : {

					"animation" : 0,
					"check_callback" : true,
					'force_text' : true,
					"themes" : { "stripes" : true },

					'data' : {
						
						<?php //create url for AJAX request to get entries for the folder ?>
						'url': function(node){

							<?php //init flag that determines if this is a folder ?>
							var t1 = node.id.substring(0, 1) == "5";
							
							<?php //if this node is root ('#') or a any folder ?>
							if( node.id === '#' || t1 ){
								
								<?php
									//specify URL for the AJAX request
									//	see: https://www.jstree.com/docs/json/
								?>
								return 'pr__getFileHierarchyData.php';
								//return 'data.json';
								//return node.id == "#" ? "roots.json" : "children.json";

							}	<?php //end if this node is root or any folder ?>

							<?php //do nothing ?>
							return '';

						},

						<?php //setup data that is send with AJAX request ?>
						'data': function(node){

							<?php //init flag that determines if this is a folder ?>
							var t1 = node.id.substring(0, 1) == "5";

							<?php //if this node is root or any folder ?>
							if( node.id === '#' || t1 ){

								<?php 
									//specify folder id
									//	see: https://www.jstree.com/docs/json/
								?>
								return { 'f' : node.id === '#' ? 2 : node.id.substring(2) };
								//return node.id === "#" ? { 'id' : "%23" } : { 'id' : "j5_1" };

							}	<?php //end if this node is root or any folder ?>

							<?php //do nothing ?>
							return {};
						}

					}	<?php //end core/data ?>

				}	<?php //end core ?>

			});	<?php //end create jstree instance ?>

			$('#jstree_demo_div').on("changed.jstree", function (e, data) {
				
				<?php //get entity type ?>
				var t2 = data.selected.toString().substring(0, 1);
				
				<?php //if this is a file (not a folder) ?>
				if( t2 != "5" ){

					<?php //init file/folder id ?>
					var t1 = data.selected.toString().substring(2);

					<?php //send request for this file to the server ?>
					$.ajax({
						url: 'pr__getfile.php',
						method: 'POST',
						data: {'f': t1, 't': t2 }
					}).done(function(data){

						<?php //init string to describe content of 'show_file_win' DIV ?>
						var tmpCnt = "";

						<?php //if it is an image file ?>
						if( t2 == "2" ){

							<?php //setup IMG with source set to data (url) ?>
							tmpCnt = "<img src='" + data + "' />";

						<?php //else-if, it is a code or text file ?>
						} else if( t2 == "1" || t2 == "3" ) {

							<?php //setup SPAN with text returned ?>
							tmpCnt = "<div>" + data.split("\n").join("</div><div>") + "</div>";

						} else {	<?php //else, CFG (not implemented) ?>

							<?php //error ?>
							alert("not implemented!");

						}	<?php //end if this is an image file ?>

						<?php //substitute new content ?>
						$("#show_file_win").html(tmpCnt);

					});	<?php //end AJAX -- done function ?>

				}	<?php //end if this is a file (not a folder) ?>

			});

		});	<?php //end on page load ?>

	</script>

<?php 

	//create page footer
	//ES 2017-01-22 (b_file_hierarchy): moved into vw__main.php
	//vw__page__createFooter();

?>