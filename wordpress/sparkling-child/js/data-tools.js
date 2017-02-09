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
}

function getUserInput(userInputId){
	for (var i = 0; i < userInputs.length; i++) {
		if(userInputs[i].id == userInputId){
			return userInputs[i];
		}
	}
	return null;
}

function getUserInputByName(n){
	for (var i = 0; i < userInputs.length; i++) {
		if(userInputs[i].name == n){
			return userInputs[i];
		}
	}
	return null;
}

function getReference(refValueId){
	for (var i = 0; i < referenceValues.length; i++) {
		if(referenceValues[i].id == refValueId){
			return referenceValues[i];
		}
	}
	return null;
}

function getReferenceByName(n){
	for (var i = 0; i < referenceValues.length; i++) {
		if(referenceValues[i].name == n){
			return referenceValues[i];
		}
	}
	return null;
}

// Append here the constant values
function replaceReference(value){
	switch(value){
		case 'now':
			return new Date().getFullYear();
		default:
			return value;
	}
}


function getQuestion(questionId){
	for (var i = 0; i < questions.length; i++) {
		if(questions[i].id == questionId){
			return questions[i];
		}
	}
	return null;
}




function getDataSource(category){
	if(category == 'question')
		return questions;
	if(category == 'block')
		return blocks;
	if(category == 'result')
		return results;
}


function getGraphicNode(nodeId){
	for (var j = 0; j < graphicNodes.length; j++) {
		if(graphicNodes[j].id == nodeId){
			return graphicNodes[j];
		}
	}
	return undefined;
}

// Returns a specific element based on its db ID
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

function updateHtmlData(elementType, index, element, modalCallback){
	var selector = '#data-'+elementType+'s',
		jQueryTiming = 150;

	function updateInnerHtmlData(){
		$(selector+' li:nth-child('+index+')').attr('id', 'data-'+elementType+'s-'+element.id);
		$(selector+' li:nth-child('+index+')').text(element.name);
		$(selector+' li:nth-child('+index+')').click(function(){
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
function saveData(dataTable, data, dataId, foreignKeyId, callback){
	if(!dataId){
		saveElt(dataTable, data, foreignKeyId, callback);
	}else{
		data.id = dataId
		updateElt(dataTable, data, callback);
	}
}

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


// Macro to Retrieve specific section of html code based on common id pattern : id-section-#index
function retrieveSection(tag, sectionId){
	var s = [],
		selector = tag+'[id^="'+sectionId+'"]';
	$(selector).each(function(idx){
		s.push($('#'+sectionId+idx)[0]);
	});
	return s;
}