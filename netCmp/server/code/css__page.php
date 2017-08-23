<!-- styles -->
<style type="text/css">
	<?php //styles for vw__page.php, i.e. footer section and expand button ?>
	.pageFooter {
		background-color: #777;
		color: #ffffff;
		width: 100%;
		text-align: center;
		padding-top: 2px;
	}
	.expandView {
		float: right;
	}
	.expandView:hover {
		color: red;
	}
	<?php //login ?>
	.nc-login-pwd-outter {
		position: relative;
	}
	.nc-login-pwd-tooltip {
		position: absolute;
		width: auto;
		color: darkgray;
		height: 20%;
		border: 2px solid blue;
		border-radius: 5px;
		left: 101%;
		top: -50%;
		display: table;
		background-color: whitesmoke;
		padding: 1%;
	}
	.nc-login-pwd-tooltip-rule {
		display: table-row;
	}
	<?php //styles for vw__toolbar.php, i.e. buttons in the toolbar on a side ?>
	.vertBarIcon {
		height: 115px;
		padding: 10%;
		text-align: center;
		background-color: #f9f9f9;
	}
	.vertBarIcon:hover {
		color: purple;
	}
	<?php //styles for vw__user.php ?>
	.logo-border {
		border-style: solid;
		border-width: 10px;
		border-radius: 25px;
		padding: 15px;
	}
	.logo-unkown-style {
		font-size:600%;
		padding: 5%;
		border-right: 3px solid red;
		color: blue;
	}
	<?php //styles for vw__codeview.php, i.e. style the typed in code ?>
	.nc-lang-keyword {
		font-weight: bold;
		color: green;
	}
	.nc-type {
		color: purple;
		text-decoration: underline;
	}
	.nc-identifier {
		font-style: italic;
		color: blue;
	}
	.nc-constant-value {
		background-color: lightgray;
		color: red;
	}
	.nc-tab {
		margin-left: 2em;
	}
	.nc-editor-current-line {
		background-color: #f2dede;
	}
	.nc-line {
		display: block;
		min-height: 2ex;
	}
	.nc-console {
		background-color: #bb8181;
		width: 1em;
		height: 2ex;
		display: inline-block;
		top: 2px;
		opacity: 0.5;
	}
	.nc-emphasize-identifiers {
		font-weight: bold;
		font-size: 3ex;
	}
	.nc-current-word {
		/* nothing */
	}
	.nc-current-letter {
		background-color: aqua;
		border-right-color: red;
		border-right-style: solid;
		border-right-width: 2px;
	}
	.nc-comment {
		color: #a3cab6;
		/* subsequent styles override all other that are defined for SPANs */
		font-weight: normal;
		text-decoration: initial;
		font-style: initial;
		background-color: initial;
		font-size: initial;
	}
	.nc-comment-start {
		/* nothing */
	}
	.nc-comment-end {
		/* nothing */
	}
	.nc-comment-one-line {
		/* nothing */
	}
	.nc-clicked-element {
		border-width: 2px;
		border-color: red;
		border-style: solid;
	}
	<?php //open file dialog styles ?>
	.nc-io-entry-format {
		padding: 1% 5%;
		float: left;
	}
	.nc-io-entry-icon-selected {
		background-color: cyan;
	}
	.nc-io-entry-format:hover {
		background-color: lavender;
	}
	.nc-io-entry-view {
		width: 100%;
	}
	.nc-io-view-modes {
		width: 100%;
	}
	.nc-folder-icon-color {
		color: blue;
	}
	.nc-img-icon-color {
		color: purple;
	}
	.nc-unkown-file-color {
		color: red;
	}
	.nc-cfg-icon-color {
		color: darkgreen;
	}
	.nc-fileopen-icon {
		float: right;
		padding: 5px;
		border: 1px solid grey;
		margin: 2px;
	}
	.nc-fileopen-icon:hover {
		background-color: lavender;
	}
	<?php //context menu styles ?>
	.nc-context-menu {
		position: absolute;
		display: none;
	}
	.nc-drop-down-menu {
		display:block;
		position:static;
		margin-bottom:5px;
	}
	.nc-io-file-name-box {
		margin-left: 10px;
		margin-right: 10px;
	}
	<?php //vw__properties.php for showing file/folder properties/attributes ?>
	.nc-prop-table-cell-value {
		border-left: 2px solid black;
		padding-left: 5px;
	}
	.nc-prop-table-cell-name {
		padding-right: 5px;
	}
	.nc-prop-table {
		margin-bottom: 5px;
	}
	<?php //vw__fileexp.php for showing file hierarchy ?>
	.show-file-win {
		text-align: center;
		height: 100%;
		/* see: http://stackoverflow.com/questions/2939914/vertically-align-text-in-a-div */
		display: table;
	}
	.browse-file-sys-win {
		border-right: 2px solid black;
		height: 100%;
		/* see: http://stackoverflow.com/questions/11219931/how-to-force-div-element-to-keep-its-contents-inside-container */
		overflow: auto;	/* make content to be inside div, even if it is larger (not fits) */
	}
	.show-file-win-span {
		/* see: http://stackoverflow.com/questions/2939914/vertically-align-text-in-a-div */
		display: table-cell;
		vertical-align: middle;
	}
	<?php //vw__vars.php to show variables during debugging ?>
	.nc-vars-header {
		background-color:#444444;
		color:white;
		font-weight:bold;
	}
	.nc-vars-definition {
		display: block;
		background-color: rgb(221, 221, 221);
	}
	.nc-vars-table-header {
		background-color:purple;
		color:white;
	}
	<?php //progress bar ?>
	.nc-progress-bar {
		<?php //center div on page, see: http://stackoverflow.com/a/13356401 ?>
		width: 200px;
		height: 50px;
		position: absolute;
		top:0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}
	.nc-progress-msg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
	}
</style>
