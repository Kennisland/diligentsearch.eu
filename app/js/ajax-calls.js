dbAccessUrl = window.location.origin+"/db-access";


function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country'},
		success: function(data){
			// console.log("ajaxGetCountries success : ", data);
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
			// console.log("ajaxGetWorks success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}


function ajaxGetElt(table, foreignKey){
	if( table == 'DecisionTree' ||
		table == 'SharedUserInput' || 
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
					// console.log("ajaxGetElt success : ", data);
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





function saveElt(table, elt, foreignKey, callback){
	if( table == 'DecisionTree'){
		$.when(ajaxInsertElt(table, elt, foreignKey)).then(
			function(result){
				graphicNodesDatabaseId = result.insertId;
				callback(true);
			}, 
			function(error){
				callback(false);
			}
		);
	}
	else if(table == 'Country' ||
			table == 'Work'){
		$.when(ajaxInsertElt(table, elt, foreignKey)).then(
			function(result){
				callback(true);
			},
			function(error){
				callback(false);
			}
		);
	}
	else if(table == 'SharedUserInput' || 
			table == 'SharedRefValue' ||
			table == 'Question' || 
			table == 'Block' || 
			table == 'Result')
	{
			$.when(ajaxInsertElt(table, elt, foreignKey)).then(
				function(result){
					console.log("saveElt Id, updating: ", result.insertId);
					elt.id = result.insertId;
					updateElt(table, elt, callback);
				},
				function(error){
					callback(false);
				}
			);
	}
	else{
		console.log("table not recognized : ", table);
		callback(false);			
	}
}

function updateElt(table, elt, callback){
	if( table == 'DecisionTree'){
		$.when(ajaxUpdateElt(table, elt.id, elt.json)).then(
			function(result){
				callback(true);
			}, 
			function(error){
				console.log(error);
				callback(false);
		});
	}
	else if( table == 'SharedUserInput' || 
		table == 'SharedRefValue' ||
		table == 'Question' || 
		table == 'Block' || 
		table == 'Result'){
			$.when(ajaxUpdateElt(table, elt.id, elt)).then(
				function(result){
					callback(true);
				}, 
				function(error){
					console.log(error);
					callback(false);
			});
	}
	else{
		console.log("table not recognized : ", table);
		callback(false);
	}
}

function removeElt(table, eltId, callback){
	if( table == 'SharedUserInput' || 
		table == 'SharedRefValue' ||
		table == 'Question' || 
		table == 'Block' || 
		table == 'Result'){
			$.when(ajaxRemoveElt(table, eltId)).then(
				function(result){
					callback(true);
				}, 
				function(error){
					console.log(error);
					callback(false);
			});
	}
	else{
		callback(false);
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
			// console.log("Element ", elt, " inserted with success from ", table);
		},
		error: function(error){
			console.log("ERROR : element ", elt, " not inserted from ", table, " - ", error.status);
		}
	});
}

function ajaxUpdateElt(table, eltId, eltJson){
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {
			table: table,
			update: true,
			id: eltId,
			json: JSON.stringify(eltJson)
		},
		success: function(data){
			// console.log("Element ", eltId, " updated with success from ", table);
		},
		error: function(error){
			console.log("ERROR : element ", eltId, " not removed from ", table, " - ", error.status);
		}
	});
}

function ajaxRemoveElt(table, eltId){
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {
			table: table,
			remove: true,
			id: eltId
		},
		success: function(data){
			// console.log("Element ", eltId, " removed with success from ", table);
		},
		error: function(error){
			console.log("ERROR : element ", eltId, " not removed from ", table, " - ", error.status);	
		}
	});
}