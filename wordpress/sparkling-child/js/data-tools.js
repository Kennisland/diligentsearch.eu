/*
	Data model
	Specific data constructors are kept within dedicated modal for a better ID visibility
*/

// Global model
countries = [];
works = [];
userInputs = [];
referenceValues = [];
results = [];
questions = [];
blocks = [];
source = [];
information = []

// Form dedicated model
languages = [];
decisionTree = [];
dumpedForm = {
	webHook: undefined,
	json: ''
};

// Root id of decision tree
ROOT_NODE_ID = 'lvl_0';

// Graph editor dedicated model
graphicNodesDatabaseId = undefined;
graphicNodes = [];

// Graphical objects
svg = undefined;
svgGroup = undefined;
graphic = undefined;
zoom = undefined;
initialScale = 0.7;




/*
	Data model helper
*/
function logData(){	
	console.log("userInputs ", userInputs);
	console.log("referenceValues ", referenceValues);
	console.log("questions ", questions);
	console.log("blocks ", blocks);
	console.log("results ", results);
	console.log("decisionTree", decisionTree);
	console.log("sources", source);
	console.log("General information", information);
}


/**
 * Retrieve a user input data
 * @param {number} userInputId - javascript id of the data to retrieve
 * @returns {object} element of userInputs array or null if not found
 */
function getUserInput(userInputId){
	for (var i = 0; i < userInputs.length; i++) {
		if(userInputs[i].id == userInputId){
			return userInputs[i];
		}
	}
	return null;
}

/**
 * Retrieve a user input data by its name
 * @param {string} n - javascript name of the data to retrieve
 * @returns {object} element of userInputs array or null if not found
 */
function getUserInputByName(n){
	for (var i = 0; i < userInputs.length; i++) {
		if(userInputs[i].name == n){
			return userInputs[i];
		}
	}
	return null;
}

/**
 * Retrieve a reference data 
 * @param {number} refValueId - javascript id of the data to retrieve
 * @returns {object} element of referenceValues array or null if not found
 */
function getReference(refValueId){
	for (var i = 0; i < referenceValues.length; i++) {
		if(referenceValues[i].id == refValueId){
			return referenceValues[i];
		}
	}
	return null;
}

/**
 * Retrieve a reference data by its name
 * @param {string} n - javascript name of the data to retrieve
 * @returns {object} element of referenceValues array or null if not found
 */
function getReferenceByName(n){
	for (var i = 0; i < referenceValues.length; i++) {
		if(referenceValues[i].name == n){
			return referenceValues[i];
		}
	}
	return null;
}

/**
 * Replace specific references values by javascript dedicated functions (ie. "now" --> Dat().getFullYear())
 * @param {string} value - reference value to change
 * @returns {object} corresponding function or the value if not found
 */
function replaceReference(value){
	switch(value){
		case 'now':
			return new Date().getFullYear();
		default:
			return value;
	}
}

/**
 * Retrieve a question data
 * @param {number} questionId - javascript id of the data to retrieve
 * @returns {object} element of questions array or null if not found
 */
function getQuestion(questionId){
	for (var i = 0; i < questions.length; i++) {
		if(questions[i].id == questionId){
			return questions[i];
		}
	}
	return null;
}

/**
 * Convert a category to the corresponding array of data
 * @param {string} category - name of the array of data to retrieve
 * @returns {object} the array of data asked if it exists
 */
function getDataSource(category){
	if(category == 'question')
		return questions;
	if(category == 'block')
		return blocks;
	if(category == 'result')
		return results;
	if(category == 'source')
		return source;
	if(category == 'information')
		return information;
}

/**
 * Retrieve a graphicNodes data
 * @param {number} nodeId - javascript id of the data to retrieve
 * @returns {object}  element of graphicNodes array or undefined if not found
 */
function getGraphicNode(nodeId){
	for (var j = 0; j < graphicNodes.length; j++) {
		if(graphicNodes[j].id == nodeId){
			return graphicNodes[j];
		}
	}
	return undefined;
}

/**
 * Retrieve a specific data by giving the corresponding name of the array of data and the id
 * @param {string} dataSource - name of the array of data to retrieve
 * @param {number} dataId - javascript id of the data to retrieve
 * @returns {object}  element of the requested array of data or undefined if not found
 */
function getDataElt(dataSource, dataId){
	var source = getDataSource(dataSource);
	for (var i = 0; i < source.length; i++) {
		if( source[i].id == dataId){
			return source[i];
		}
	}
	return undefined;
}






/*
	Modal data injection
*/
/**
 * Inject the data provided by data edition modals, into dedicated array of data and HTML
 * @param {string} elementType - type of the data to inject
 * @param {number} index - javascript id of the data to retrieve, or -1 if it's a new one
 * @param {object} element - data to inject
 * @param {callback} modalCallback - modal specific callback
 */
function injectData(elementType, index, element, modalCallback){
	var dataModel = undefined;
	if(elementType == 'userInput'){
		dataModel = userInputs;
	}
	else if(elementType == 'referenceValue'){
		dataModel = referenceValues;
	}
	else if(elementType == 'result'){
		dataModel = results;
	}
	else if(elementType == 'question'){
		dataModel = questions;
	}
	else if(elementType == 'block'){
		dataModel = blocks;
	}
	else if(elementType == 'source'){
		dataModel = source;
	}
	else if(elementType == 'information'){
		dataModel = information;
	}
	else {
		console.log('unknown elementType', elementType);
		return;
	}

	if(dataModel){
		if(index == -1){
			index = dataModel.push(element);
		}
		else{
			dataModel[index] = element;
			index++;
		}
		updateHtmlData(elementType, index, element, modalCallback);		
	}
}

/**
 * Update the HTML with the provided data
 * @param {string} elementType - type of the data to inject
 * @param {number} index - html index of the data to inject
 * @param {object} element - data to inject
 * @param {callback} modalCallback - modal specific callback to trigger on click
 */
function updateHtmlData(elementType, index, element, modalCallback){
	var selector = '#data-'+elementType+'s',
		jQueryTiming = 150;

	function updateInnerHtmlData(){
		$(selector+' li:nth-child('+index+')').attr('id', 'data-'+elementType+'s-'+element.id);
		$(selector+' li:nth-child('+index+')').text(element.name);
		$(selector+' li:nth-child('+index+')').off().on('click', function(){
			modalCallback(index-1, element);
		});
	}

	// Create list element if needed
	if($(selector+' li').length < index){
		var elementHtml = '<li class="list-group-item"></li>';
		$(selector).append(elementHtml);
		//Wait a bit to ensure jQuery has finished to insert html
		setTimeout(updateInnerHtmlData(), jQueryTiming);		
	}
	else{
		updateInnerHtmlData();
	}
}

/*
	Database interaction wrapper
*/

/**
 * Save or update the data into the database
 * @param {string} dataTable - SQL table name
 * @param {object} data - data object to save
 * @param {number} dataId - database id of the data to inject, or undefined if it's a new one
 * @param {number} foreignKeyId - foreignkey id to use for SQL injection
 * @param {callback} callback - specific callback to use after save or update
 */
function saveData(dataTable, data, dataId, foreignKeyId, callback){
	if(!dataId){
		saveElt(dataTable, data, foreignKeyId, callback);
	}else{
		data.id = dataId
		updateElt(dataTable, data, callback);
	}
}

/**
 * Ensure the value field within the db is correctly updated with the associated ID of the DB
 */
function forceDataId(srcArr, destArr){	
	$.map(srcArr, function(elt){
		var tmp = JSON.parse(elt.value);
		if(!tmp.id){
			tmp.id = elt.id;
		}
		destArr.push(tmp);
	});
}






/**
 * Delete the data from the database
 * @param {string} dataTable - SQL table name
 * @param {number} dataId - database id of the data to remove
 * @param {callback} callback - specific callback to use after remove
 */
function deleteData(dataTable, dataId, modalCallback){
	if(dataId !== undefined){
		removeElt(dataTable, dataId, function(success){
			if(success){
				// Format if necessary the dataTable name 
				if(dataTable == 'SharedUserInput'){
					dataTable = 'userInput';
				}
				else if(dataTable == 'SharedRefValue'){
					dataTable = 'referenceValue';
				}
				else{
					dataTable = dataTable.charAt(0).toLowerCase() + dataTable.slice(1);
				}

				// Generate the html selector
				var selector = '#data-'+dataTable+'s-'+dataId;
				$(selector).remove();
				modalCallback();	
			}else{
				$('.modal-header').notify('Cannot remove element', {position:'bottom-left', className:'error'});
			}			
		});
	}
}


/**
 * Macro to Retrieve specific section of html code based on a HTML id starting pattern (ie. <div id='start-with-' [0, 1, 2, 3, 4, etc..])
 * @param {string} tag - HTML tag name to look for
 * @param {string} sectionId - starting pattern of the HTML section to retrieve
 * @returns {object} array of html elements if found or empty array.
 */
function retrieveSection(tag, sectionId){
	var s = [],
		selector = tag+'[id^="'+sectionId+'"]';
	$(selector).each(function(idx){
		s.push($('#'+sectionId+idx)[0]);
	});
	return s;
}