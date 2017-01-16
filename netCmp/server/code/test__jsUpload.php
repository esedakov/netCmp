<html>
	<head>
		<script src="../../external/jquery.min.js"></script>
		<title>TEST FILE UPLOAD</title>
	</head>
	<body>
		<form>
			<input 
				type="file" 
				id="userlogofile"
				name="nc_user_logo_file"
			>
			<button id="upload">upload</button>
		</form>
		<script type="text/javascript">
			$('#upload').on('click', function() {
				var file_data = $('#userlogofile').prop('files')[0];   
				var form_data = new FormData();                  
				form_data.append('file', file_data);
				var txtFields = {
					'nc_pars_id': 123,
					'nc_struct': JSON.stringify({k:7,m:'name',l:true})
				};
				form_data.append('text', JSON.stringify(txtFields));
				//alert(form_data);                             
				$.ajax({
					url: 'test__upload.php', // point to server-side PHP script 
					//dataType: 'text',  // what to expect back from the PHP script, if anything
					cache: false,
					contentType: false,
					processData: false,
					mimeType: 'multipart/form-data',
					data: form_data,                         
					type: 'post',
					success: function(php_script_response){
						alert(php_script_response); // display response from the PHP script, if any
					}
				});
			});
		</script>
	</body>
</html>