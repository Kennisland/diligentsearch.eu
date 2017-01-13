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


function ajaxGetElt(table, foreignKey){
	if( table == 'SharedUserInput' || 
		table == 'SharedRefValue' ||
		table == 'Question' || 
		table == 'Block' || 
		table == 'Result'){

			return $.ajax({
				type:"GET",
				url:dbAccessUrl,
				data: {
					table: table, 
					foreignKeyId: foreignKey
				},
				success: function(data){
					console.log("ajaxGetElt success : ", data);
				},
				error: function(err){
					console.log("error :", err);
				}
			});
	}
	else{
		console.log("table not recognized : ", table);
		return null;
	}
}

// function ajaxGetUserInputs(countryId){
// 	return $.ajax({
// 		type:"GET",
// 		url:dbAccessUrl,
// 		data: {table: 'SharedUserInput', countryId: countryId},
// 		success: function(data){
// 			console.log("ajaxGetUserInput success : ", data);
// 		},
// 		error: function(err){
// 			console.log("error :", err);
// 		}
// 	});
// }

// function ajaxGetRefValues(countryId){
// 	return $.ajax({
// 		type:"GET",
// 		url:dbAccessUrl,
// 		data: {table: 'SharedRefValue', countryId: countryId},
// 		success: function(data){
// 			console.log("ajaxGetRefValues success : ", data);
// 		},
// 		error: function(err){
// 			console.log("error :", err);
// 		}
// 	});
// }

// function ajaxGetQuestions(workId){
// 	return $.ajax({
// 		type:"GET",
// 		url:dbAccessUrl,
// 		data: {table: 'Question', workId: workId},
// 		success: function(data){
// 			console.log("ajaxGetQuestions success : ", data);
// 		},
// 		error: function(err){
// 			console.log("error :", err);
// 		}
// 	});
// }

// function ajaxGetBlocks(workId){
// 	return $.ajax({
// 		type:"GET",
// 		url:dbAccessUrl,
// 		data: {table: 'Block', workId: workId},
// 		success: function(data){
// 			console.log("ajaxGetBlocks success : ", data);
// 		},
// 		error: function(err){
// 			console.log("error :", err);
// 		}
// 	});
// }

// function ajaxGetResults(workId){
// 	return $.ajax({
// 		type:"GET",
// 		url:dbAccessUrl,
// 		data: {table: 'Result', workId: workId},
// 		success: function(data){
// 			console.log("ajaxGetResults success : ", data);
// 		},
// 		error: function(err){
// 			console.log("error :", err);
// 		}
// 	});
// }


function saveElt(table, elt, foreignKey){
	if( table == 'SharedUserInput' || 
		table == 'SharedRefValue' ||
		table == 'Question' || 
		table == 'Block' || 
		table == 'Result'){
			$.when(ajaxInsertElt(table, elt, foreignKey)).then(
				function(result){
					console.log("saveElt : ", result);
					// result.insertId;
			});
	}
	else{
		console.log("table not recognized : ", table);
	}
}

function updateElt(table, elt){
	if( table == 'SharedUserInput' || 
		table == 'SharedRefValue' ||
		table == 'Question' || 
		table == 'Block' || 
		table == 'Result'){
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


function ajaxInsertElt(table, elt, foreignKeyId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: table,
			foreignKeyId: foreignKeyId,
			insert: true,
			json: JSON.stringify(elt)
		},
		success: function(data){
			console.log("Element ", elt.name, " inserted with success");
		},
		error: function(error){
			console.log("ERROR : Element ", elt.name, " not inserted; ", error.status);	
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