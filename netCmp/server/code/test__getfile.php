
<?php

	$path = "/prj3";
	echo "1 => " . var_dump(preg_split('/\//', $path, -1, PREG_SPLIT_NO_EMPTY));

?>


<html>
	<head>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
	</head>

	<body>

		<a href="#" onclick="getmainfile();">click</a>

		<script>
		
			function getmainfile(){
				$.ajax({
					url: "pr__getfile.php",
					data: {
						p: "/testImageDwn",
						n: "ball.jpg"
					},
					method: "POST",
				}).done(function(data){
					//alert("data received: {" + data + "}");
				});
			}

		</script>

	</body>
</html>
