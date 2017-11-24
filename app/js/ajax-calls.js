apiAccessUrl 	= window.location.origin+'/api';
dbAccessUrl 	= apiAccessUrl+'/search';
pdfPrintingUrl 	= apiAccessUrl+'/print';


/*
	Translation stuff
*/


/**
 * Retrieve languages available for a given jurisdiction
 * @returns {json} Response of server, either success or error
 */
function ajaxGetLanguages(){
	return $.ajax({
		type:"GET",
		url:apiAccessUrl,
		data: {translationRequired: true, jurisdiction: translation.useCountry},
		error: function(err){
			console.log("Error ajaxGetLanguages :", err);
		}
	});
}

translation = {
	useCountry : undefined,
	useTranslation : undefined
};

/**
 * Set the file country to use for translation
 * @param {string} c - country file name without '.json' extension
 */
function ajaxSetCountry(c){
	if( c == ""){
		translation.useCountry = undefined;
	}
	else{
		translation.useCountry = c;
	}
}

/**
 * Set the translation to use in a given file country
 * @param {string} t - Translation to use within the country file used for translation
 */
function ajaxSetTranslation(t){
	if(t == ""){
		translation.useTranslation = undefined;
	}
	else{
		translation.useTranslation = t;
	}
}













/*
	Helper functions
*/

/**
 * Check if given SQL table is 'Country' or 'Work'
 * @params {string] table - SQL Table name}
 * @return {boolean}
 */
function isCountryOrWork(table){
	return table == 'Country' || table == 'Work';
}

/**
 * Check if given SQL table is a "primary" table : 'SharedUserInput', 'SharedRefValue', 'Question', 'Block', 'Result' or 'Source'
 * @params {string] table - SQL Table name}
 * @return {boolean}
 */
function isPrimaryData(table){
	return table == 'SharedUserInput' || table == 'SharedRefValue' || table == 'Question' || table == 'Block' || table == 'Result' || table == 'Source';
}

/**
 * Check if given SQL table is 'DecisionTree'
 * @params {string] table - SQL Table name}
 * @return {boolean}
 */
function isDecisionTree(table){
	return table == 'DecisionTree';
}

/**
 * Check if given SQL table is 'Form'
 * @params {string] table - SQL Table name}
 * @return {boolean}
 */
function isForm(table){
	return table == 'Form';
}


















/*
	Specific getter
*/

/**
 * Retrieve countries list
 * @return {json} response of server, either success or error
 */
function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country', language: translation},
		error: function(err){
			console.log("Error ajaxGetCountries :", err);
		}
	});
}

/**
 * Retrieve works list for a given country
 * @param {number} countryId - country id for SQL research
 * @return {json} response of server, either success or error
 */
function ajaxGetWorks(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', language: translation, countryId: countryId},
		error: function(err){
			console.log("Error ajaxGetWorks :", err);
		}
	});
}

/**
 * Retrieve specific work by giving its id
 * @param {number} workId - work id for SQL research
 * @return {json} response of server, either success or error
 */
function ajaxGetWorkById(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', language: translation, workId: workId},
		error: function(err){
			console.log("Error ajaxGetWorkById :", err);
		}
	});
}
















/*
	Form ajax handler
*/

/**
 * Retrieve specific form by giving its reference and its version
 * @param {string} webHook - reference of the form
 * @param {number} version version of the form
 * @return {json} response of server, either success or error
 */
function ajaxGetForm(webHook, version){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Form', webHook: webHook, version: version},
		error: function(err){
			console.log("Error ajaxGetForm :", err);
		}
	});
}

/**
 * Insert a form within the database
 * @param {object} form - form object to insert
 * @param {number} foreignKey - form SQL foreign key : work id
 * @param {callback} callback - function to execute on success or error
 */
function ajaxPutForm(form, foreignKey, callback){
	console.log("injecting form", dbAccessUrl, form);
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

/**
 * Update a form within the database
 * @param {object} form - form object to update
 * @param {number} foreignKey - form SQL foreign key : work id
 * @return {json} response of server, either success or error
 */
function ajaxUpdateForm(form, foreignKey){
	console.log("Updating form", dbAccessUrl, form);
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {
			table: 'Form',
			foreignKeyId: foreignKey,
			update: true,
			webHook: form.webHook,
			value:JSON.stringify(form.json)
		},
		error: function(error){
			console.log("ERROR ajaxUpdateForm : element ", eltId, " not removed from ", table, " - ", error.status);
		}
	});
}

/*
	PDF printing handler
*/

/**
 * Send html data to the server for a pdf generation
 * @params {string} htmlContent - html content to print
 * @params {string} key - future name of the pdf to download
 * @returns {json} response of server, either success or error
 */
function ajaxPrintPdf(htmlContent, key){
	$.ajax({
		type:"POST",
		url: pdfPrintingUrl,
		data: {html: htmlContent, key:key},
		success: function(success){
			if(success.file){
				window.open(pdfPrintingUrl+'/'+success.file);				
			}
			// Unlock button
			$('#work-print-btn').removeAttr("disabled");
		},
		error: function(err){
			console.log("Error ajaxPrintPdf :", err);
			// Unlock button
			$('#work-print-btn').removeAttr("disabled");
		}
	});
}


/*
	Generic element manipulation handler
*/

/**
 * Get a database generic element
 * @params {string} table - SQL table name
 * @params {number} foreignKey - SQL foreign key to use for the given SQL table
 * @returns {json} response of server, either success or error
 */
function ajaxGetElt(table, foreignKey){
	if( isDecisionTree(table) || isPrimaryData(table)){
		return $.ajax({
			type:"GET",
			url:dbAccessUrl,
			data: {
				table: table, 
				foreignKeyId: foreignKey,
				language: translation
			},
			error: function(err){
				console.log("Error ajaxGetElt :", err);
			}
		});
	}
	else{
		console.log("table not recognized : ", table);
		return null;
	}
}

/**
 * Wrapper to save a database generic element
 * @params {string} table - SQL table name
 * @params {object} elt - element to save into database
 * @params {number} foreignKey - SQL foreign key to use for the given SQL table
 * @params {callback} callback - function to execute on success or error
 */
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


/**
 * Wrapper to update a database generic element
 * @params {string} table - SQL table name
 * @params {object} elt - element to save into database
 * @params {callback} callback - function to execute on success or error
 */
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

/**
 * Wrapper to remove a database generic element
 * @params {string} table - SQL table name
 * @params {number} eltId - element SQL id
 * @params {callback} callback - function to execute on success or error
 */
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













/*
	Ajax calls for generic elements
*/

/**
 * Insert a database generic element
 * @params {string} table - SQL table name
 * @params {object} elt - element to save into database
 * @params {number} foreignKeyId - SQL foreign key to use for the given SQL table
 * @returns {json} response of server, either success or error
 */
function ajaxInsertElt(table, elt, foreignKeyId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: table,
			foreignKeyId: foreignKeyId,
			insert: true,
			value: JSON.stringify(elt)
		},
		error: function(error){
			console.log("ERROR ajaxInsertElt : element ", elt, " not inserted from ", table, " - ", error.status);
		}
	});
}

/**
 * Update a database generic element
 * @params {string} table - SQL table name
 * @params {number} eltId - element SQL id
 * @params {string} eltJson - new content of the SQL object
 * @returns {json} response of server, either success or error
 */
function ajaxUpdateElt(table, eltId, eltJson){
	return $.ajax({
		type: 'POST', 
		url: dbAccessUrl,
		data: {
			table: table,
			update: true,
			id: eltId,
			value: JSON.stringify(eltJson)
		},
		error: function(error){
			console.log("ERROR ajaxUpdateElt : element ", eltId, " not removed from ", table, " - ", error.status);
		}
	});
}

/**
 * Remove a database generic element
 * @params {string} table - SQL table name
 * @params {number} eltId - element SQL id
 * @returns {json} response of server, either success or error
 */
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
			console.log("ERROR ajaxRemoveElt : element ", eltId, " not removed from ", table, " - ", error.status);	
		}
	});
}