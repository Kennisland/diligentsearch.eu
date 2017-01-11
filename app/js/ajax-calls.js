dbAccessUrl = "http://ds.local/db-access";

function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country'},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetWorks(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', countryId: countryId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetUserInputs(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'SharedUserInput', countryId: countryId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetRefValues(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'SharedRefValue', countryId: countryId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetQuestions(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Question', workId: workId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetBlocks(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Block', workId: workId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetResults(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Result', workId: workId},
		success: function(data){
			console.log("Ajax success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}