<?php
$file = '../../ball.png';

if (file_exists($file)) {
    //header('Content-Description: File Transfer');
    //header('Content-Type: application/octet-stream');
    header('Content-Type: application/json');
    /*header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));*/
	set_time_limit(0);
    $response = array();
    //echo "{properties:123,b64data:";
    $response["properties"] = 123;
    //readfile($file);
	ignore_user_abort(false);
	ini_set('output_buffering', 0);
	ini_set('zlib.output_compression', 0);
    /*$chunk = 10 * 1024 * 1024; // bytes per chunk (10 MB)
    $fh = fopen($file, "rb");
    if ($fh === false) { 
	    echo "Unable open file"; 
	}
	$data = array();
	while (!feof($fh)) { 
	    $data[] = fread($fh, $chunk);
	    
	    ob_flush();  // flush output
	    flush();
	}
	$response["b64data"] = $data;*/
	$response["b64data"] = base64_encode(file_get_contents($file));
	//$json = file_get_contents($file);
	//$response["b64data"] = "my file contents";//json_decode($json);
    //echo "}";
    echo json_encode($response);
    exit;
}
?>