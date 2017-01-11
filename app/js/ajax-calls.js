dbAccessUrl = "http://ds.local/db-access";

function ajaxGetCountries(){

	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		crossDomain: false,
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}