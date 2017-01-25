dbAccessUrl = window.location.origin+"/db-access";

/*
	Helper functions
*/
function isCountryOrWork(table){
	return table == 'Country' || table == 'Work';
}

function isPrimaryData(table){
	return table == 'SharedUserInput' || table == 'SharedRefValue' || table == 'Question' || table == 'Block' || table == 'Result';
}

function isDecisionTree(table){
	return table == 'DecisionTree';
}

function isForm(table){
	return table == 'Form';
}



/*
	Specific getter
*/
function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country'},
		error: function(err){
			alert('Error in Country retrieval from database\n'+err.statusText);
			console.log("error :", err);
		}
	});
}

function ajaxGetWorks(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', countryId: countryId},
		error: function(err){
			alert('Error in Work retrieval from database\n'+err.statusText);
			console.log("error :", err);
		}
	});
}

function ajaxGetWorkById(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', workId: workId},
		error: function(err){
			alert('Error in Work retrieval from database\n'+err.statusText);
			console.log("error :", err);
		}
	});
}



/*
	Form ajax handler
*/
function ajaxPutForm(form, foreignKey, callback){
	$.when(ajaxInsertElt('Form', form.json, foreignKey)).then(
		function(result){
			form.webHook = result.webHook;
			callback(true);
		},
		function(error){
			callback(false);
		}
	);
}

function ajaxGetForm(webHook){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Form', webHook: webHook},
		error: function(err){
			alert('Error in form retrieval from database\n'+err.statusText);
			console.log("error :", err);
		}
	});
}

function ajaxUpdateForm(form){
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {table: 'Form', update: true, webHook: form.webHook, json:JSON.stringify(form.json)},
		error: function(error){
			console.log("ERROR : element ", eltId, " not removed from ", table, " - ", error.status);
		}
	});
}






/*
	Element manipulation handler
*/
function ajaxGetElt(table, foreignKey){
	if( isDecisionTree(table) || isPrimaryData(table)){
		return $.ajax({
			type:"GET",
			url:dbAccessUrl,
			data: {
				table: table, 
				foreignKeyId: foreignKey
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
	if( isDecisionTree(table) ){
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
	else if( isCountryOrWork(table)){
		$.when(ajaxInsertElt(table, elt, foreignKey)).then(
			function(result){
				callback(true);
			},
			function(error){
				callback(false);
			}
		);
	}
	else if( isPrimaryData(table) ){
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
	if( isForm(table) ){
		$.when(ajaxUpdateForm(elt)).then(
			function(success){
				callback(true);
			},
			function(error){
				callback(false);
			}
		);
	}
	else if( isDecisionTree(table) ){
		$.when(ajaxUpdateElt(table, elt.id, elt.json)).then(
			function(result){
				callback(true);
			}, 
			function(error){
				console.log(error);
				callback(false);
		});
	}
	else if( isPrimaryData(table) ){
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
	if( isPrimaryData(table) ){
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
		error: function(error){
			console.log("ERROR : element ", eltId, " not removed from ", table, " - ", error.status);	
		}
	});
}