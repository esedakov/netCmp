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
	.nc-io-view-icon {
		float: right;
		padding: 5px;
	}
	.nc-io-view-icon:hover {
		background-color: lavender;
	}
</style>