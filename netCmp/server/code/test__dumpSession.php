<?php if(!isset($_SESSION)){session_start();}
        //include library for function 'nc__util__reInitSession'
        require_once './lib/lib__utils.php';
        //include library for debugging functions
        require_once './lib/lib__dbg.php';
        //re-initialize session
        nc__util__reInitSession();
        //var_dump($_SESSION);
        //echo("\n=================================\n");
        //var_dump($GLOBALS);
        nc__dbg__printDump($_SESSION, true);

        //session_unset();

?>
