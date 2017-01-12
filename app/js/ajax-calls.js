dbAccessUrl = window.location.origin+"/db-access";




function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country'},
		success: function(data){
			console.log("ajaxGetCountries success : ", data);
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
			console.log("ajaxGetWorks success : ", data);
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
			console.log("ajaxGetUserInput success : ", data);
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
			console.log("ajaxGetRefValues success : ", data);
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
			console.log("ajaxGetQuestions success : ", data);
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
			console.log("ajaxGetBlocks success : ", data);
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
			console.log("ajaxGetResults success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetLast(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {last: true},
		success: function(data){
			console.log("ajaxGetLast success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}




function saveElt(table, elt, foreignKey){
	if(table == 'SharedUserInput' || table == 'SharedRefValue'){
		$.when(ajaxInsertSharedElt(table, elt, foreignKey)).then(
			function(result){
				$.when(ajaxGetLast()).then(
					function(last){
						elt.id = last[0]['LAST_INSERT_ID()'];
						ajaxUpdateElt(table, elt);
					}
				);
			});
	}
	else if(table == 'Question' || table == 'Block' || table == 'Result'){
		$.when(ajaxInsertElt(table, elt, foreignKey)).then(
			function(result){
				$.when(ajaxGetLast()).then(
					function(last){
						elt.id = last[0]['LAST_INSERT_ID()'];
						ajaxUpdateElt(table, elt);
					}
				);
			});
	}
	else{
		console.log("table not recognized : ", table);
	}
}

function updateElt(table, elt){
	if(table == 'SharedUserInput' || table == 'SharedRefValue' || table == 'Question' || table == 'Block' || table == 'Result'){
		$.when(ajaxUpdateElt(table, elt)).then(
			function(result){
				console.log(result);
			}, 
			function(error){
				console.log(error);
			});
	}
	else{
		console.log("table not recognized : ", table);
	}
}



function ajaxInsertSharedElt(table, elt, countryId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: table,
			countryId: countryId,
			json: JSON.stringify(elt)
		},
		success: function(data){
			console.log("Shared element ", elt.name, " inserted with success");
		},
		error: function(error){
			console.log("ERROR : shared element ", elt.name, " not inserted; ", error.status);	
		}
	});
}

function ajaxInsertElt(table, elt, workId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: table,
			workId: workId,
			json: JSON.stringify(elt)
		},
		success: function(data){
			console.log("Basic element ", elt.name, " inserted with success");
		},
		error: function(error){
			console.log("ERROR : basic element ", elt.name, " not inserted; ", error.status);	
		}
	});
}

function ajaxUpdateElt(table, elt){
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {
			table: table,
			update: true,
			id: elt.id,
			json: JSON.stringify(elt)
		},
		success: function(data){
			console.log("Element ", elt.name, " updated with success");
		},
		error: function(error){
			console.log("ERROR : element ", elt.name, " not updated; ", error.status);	
		}
	});
}