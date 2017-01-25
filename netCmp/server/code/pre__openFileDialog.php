<?php if(!isset($_SESSION)){session_start();}  

	//create context menu for general use (create items and get parent folder properties)
	createContextMenu(
		//array of context menu elements (id => caption)
		array(
			"1" => "create folder",
			"2" => "create text file",
			"3" => "create code file",
			"4" => "upload image from client",
			"" => "",
			"5" => "properties"
		),
		//function name to handle click on menu element
		'onIoViewModeClick',
		//container class that where right-click (event:contextmenu) takes place 
		'.nc-open-save-file-dialog',
		//unique id for the context menu
		'nc_cntx_menu_general',
		//ignore objects with this classes when handling right-click (event:contextmenu)
		'.nc-io-entry-format'
	);

	//create context menu for specific itme
	createContextMenu(
		//array of context menu elements (id => caption)
		array(
			"6" => "create copy here",
			"7" => "delete",
			"8" => "rename",
			"9" => "",
			"10" => "properties"
		),
		//function name to handle click on menu element
		'onIoViewModeClick',
		//container class that where right-click (event:contextmenu) takes place 
		'.nc-io-entry-format',
		//unique id for the context menu
		'nc_cntx_menu_entry_specific',
		//no ignored class
		''
	);

?>