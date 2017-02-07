
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


function saveData(dataTable, data, dataId, foreignKeyId, callback){
	if(!dataId){
		saveElt(dataTable, data, foreignKeyId, callback);
	}else{
		data.id = dataId
		updateElt(dataTable, data, callback);
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