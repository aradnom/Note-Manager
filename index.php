<?php
require_once( 'inc/defines_and_functions.php' );
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Le Notes</title>
<script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat.js"></script>
<script type="text/javascript" src="js/mootools-more-1.4.0.1.js"></script>
<script type="text/javascript" src="js/Functions.js"></script>
<script type="text/javascript" src="js/Subnote.js"></script>
<script type="text/javascript" src="js/Note.js"></script>
<script type="text/javascript" src="js/Shell.js"></script>
<script type="text/javascript" src="js/menus.js"></script>
<link href="css/fonts.css" rel="stylesheet" type="text/css" />
<link href="css/style.css" rel="stylesheet" type="text/css" />
<link rel="shortcut icon" href="favicon.ico" />
</head>

<body>

<div id="add-new-subnote-container">
    <div id="add-new-subnote-background"></div>
	<div id="add-new-subnote">

        <div id="subnote-container">
            <input type="text" name="subnote" id="subnote" value="enter text" />
        </div>

        <div id="send-subnote">
            <div class="left-shadow"></div>
            <div id="send-text-container" class="button">add</div>
            <div class="right-shadow"></div>
        </div>

        <div id="close-button-container">
            <div id="add-new-subnote-close-button" class="button"></div>
        </div>

    </div>
</div>

<div id="status"></div>

<div id="menu">
    <div id="menu-bg"></div>
    <div id="undo-button" class="button"><img src="img/buttons/undo.png" border="" /></div>
    <div id="redo-button" class="button"><img src="img/buttons/redo.png" border="" /></div>
    <div id="new-subnote" class="add-new-subnote-button button"><img src="img/buttons/new_subnote_menu.png" border="" /></div>
    <div id="new-zone-button" class="button"><img src="img/buttons/new_zone_menu.png" border="" /></div>
    <div id="go-left" class="button"><img src="img/buttons/left.png" border="" /></div>
    <div id="go-right" class="button"><img src="img/buttons/right.png" border="" /></div>
    <div id="go-down" class="button"><img src="img/buttons/down.png" border="" /></div>

    <div id="new-subnote-container"></div>
    <div id="full-url-container"></div>
</div>

<div id="shell-container" name="shell-container">
    <table id="shell-table" name="shell-table" cellpadding="0px" cellspacing="0" >

        <tr id="shell"></tr>

    </table>
</div>

<div id="footer">
    <div id="footer-bg"></div>
    <div id="footer-content">
        <div id="footer-menu">
            <div id="go-up" class="button"><img src="img/buttons/up.png" border="" /></div>
        </div>
        <div id="footer-summary">
            <h1>Summary</h1>
        </div>
        <div id="footer-search">
            <h1 style="display: inline-block;">Search</h1>
            <input type="text" id="s" name="s" value="enter search" />
            <ul id="search-note-container"></ul>
        </div>
    </div>
</div>

</body>
</html>
