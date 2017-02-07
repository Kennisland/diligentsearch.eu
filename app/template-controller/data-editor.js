html_dataModelEditor = `
<div style="text-align:center">
	<h3>Data model editor</h3>
	<small>Use this panel to view and edit the data model to use for the creation of decision trees</small>
</div>

<ul id="breadcrumb" class="breadcrumb">
	<li><a onclick="getCountry()">Choose a Country</a></li>
	<li style="display: none"><a onclick="getWork()">Choose a type of Work</a></li>
	<li style="display: none"><a onclick="">Data</a></li>
</ul>

<div id="select-country" style="display: none">
</div>

<div id="select-work" style="display: none">
</div>

<div id="display-data-model" style="display: none">

	<div>
		<label>User inputs:</label>
		<ul id="data-userInputs" class="list-group">		
		</ul>
		<button class="btn btn-default" onclick="add('userInput')" style="text-align:right">Add</button>
	</div>

	<div>
		<label>References values:</label>
		<ul id="data-referenceValues" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('referenceValue')" style="text-align:right">Add</button>
	</div>

	<div>
		<label>Results to display:</label>
		<ul id="data-results" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('result')" style="text-align:right">Add</button>
	</div>

	<div>
		<label>Questions already prepared:</label>
		<ul id="data-questions" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('question')" style="text-align:right">Add</button>
	</div>

	<div>
		<label>Available blocks of questions:</label>
		<ul id="data-blocks" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('block')" style="text-align:right">Add</button>
	</div>
</div>

`;


countries = [];
selectedCountry = '';
works = [];
selectedWork = '';
userInputs = [];
referenceValues = [];
results = [];
questions = [];
blocks = [];



function injectDataModelEditor(){
	getCountry();
	$('#data-editor').html(html_dataModelEditor);
}


function getCountry(){
	// Reset country data
	countries = [];
	selectedCountry = '';

	// Reset and hide unecessary divs
	resetWorkModel();
	$('#select-work').hide();
	$('#display-data-model').hide();

	// Ajax call to get data from server and display them as list
	$.when(ajaxGetCountries()).then(
		function(result){
			countries = result;
			injectCountryData();
		}, 
		function(error){
			$('#select-country').notify("Service unavailable", "error", {position: 'top-left'});
	});
	$('#select-country').show();
}


function getWork(countryId){
	// Reset and hide unecessary divs
	resetDataModel();
	$('#select-country').hide();
	$('#display-data-model').hide();

	selectedCountry = undefined;
	for (var i = 0; i < countries.length; i++) {
		if( countries[i].id == countryId){
			selectedCountry = countries[i];
			break;
		}
	}

	if(!selectedCountry){
		$('#select-country').notify("Country selection error", "error", {position: 'top-left'});
	}
	else{
		// Ajax call to get works from server for this country
		$.when(ajaxGetWorks(selectedCountry.id), ajaxGetElt('SharedUserInput', selectedCountry.id), ajaxGetElt('SharedRefValue', selectedCountry.id)).then(
			function(resultWorks, resultUserInputs, resultRefValues){
				works = resultWorks[0];
				userInputs = resultUserInputs[0];
				refValues = resultRefValues[0];
				injectWorkData();					
			},
			function(error){
				$('#select-work').notify("Error in type of work and global data retrieval", "error", {position: 'top-left'});
		});	
	}
	$('#select-work').show();
}

function getData(workIdx){
	// Reset and hide unecessary divs
	resetDataModel();
	$('#select-work').hide();

	selectedWork = works[workIdx];
	// Ajax call to get data for a specific work
	$.when(ajaxGetElt('Question', selectedWork.id), ajaxGetElt('Block', selectedWork.id), ajaxGetElt('Result', selectedWork.id)).then(
		function(resultQuestions, resultBlocks, resultResults){
			questions = resultQuestions[0];
			blocks = resultBlocks[0];
			results = resultResults[0];

			// Retrieve index of country
			$('#breadcrumb li:nth-child(2) a').text(selectedWork.name).attr('onclick', 'getWork('+selectedCountry.id+')');	
			$('#breadcrumb').children().show();
			injectDataBasePrimaryModel();
			getDecisionTree();
		},
		function(error){
			$('#display-data-model').notify("Error in specific data retrieval", "error", {position:'top-left'});
	});
	$('#display-data-model').show();
}


function resetWorkModel(){
	// Reset work part
	works = [];
	selectedWork = '';
	$('#select-work').html('');

	// Reset shared data part
	userInputs = [];
	referenceValues = [];
	$('#data-userInputs > li').remove();
	$('#data-referenceValues > li').remove();

	// Reset implicitely work dependant part
	resetDataModel();
}

function resetDataModel(){
	results = [];
	questions = [];
	blocks = [];
	$('#data-results > li').remove();
	$('#data-questions > li').remove();
	$('#data-blocks > li').remove();
}

function injectCountryData(){	
	var countriesHtml = '<ul class="list-group">';
	for (var i = countries.length - 1; i >= 0; i--) {
		countriesHtml += '<li class="list-group-item" onclick="getWork('+countries[i].id+')">'+countries[i].name+'</li>';
	}
	countriesHtml += '</ul>';
	countriesHtml += '<button class="btn btn-default" onclick="add(\'country\')" style="text-align:right">Add</button>';
	$('#select-country').html(countriesHtml);

	selectedCountry = '';
	$('#breadcrumb li:nth-child(1) a').text("Choose a Country");
	selectedWork = '';
	$('#breadcrumb li:nth-child(2) a').text("Choose a type of Work");
	$('#breadcrumb').children().hide();
	$('#breadcrumb li:first-child').show();
}

function injectWorkData(){
	var worksHtml = '<ul class="list-group">';
	for (var i = works.length - 1; i >= 0; i--) {
		worksHtml += '<li class="list-group-item" onclick="getData('+i+')">'+works[i].name+'</li>';
	}
	worksHtml += '</ul>';
	worksHtml += '<button class="btn btn-default" onclick="add(\'work\')" style="text-align:right">Add</button>';
	$('#select-work').html(worksHtml);

	$('#breadcrumb li:nth-child(1) a').text(selectedCountry.name).attr('onclick', 'getCountry()');
	$('#breadcrumb').children().show();
	$('#breadcrumb li:last-child').hide();	
}


function injectDataBasePrimaryModel(){
	userInputs.forEach(function(elt, idx){
		injectUserInputData(idx, JSON.parse(elt.json));
	});
	refValues.forEach(function(elt, idx){
		injectRefValueData(idx, JSON.parse(elt.json));
	});
	questions.forEach(function(elt, idx){
		injectQuestionData(idx, JSON.parse(elt.json));
	});
	results.forEach(function(elt, idx){
		injectResultData(idx, JSON.parse(elt.json));
	});
	blocks.forEach(function(elt, idx){
		injectBlockData(idx, JSON.parse(elt.json));
	});
}


/*
	Modal interactions
*/

function add(elementType){
	switch(elementType){
		case 'country':
			$('#add-countryModal').modal('show');
			break;
		case 'work':
			$('#add-workModal').modal('show');
			break;
		case 'userInput':
			$('#add-userInputModal').modal('show');
			break;
		case 'referenceValue':
			$('#add-refValueModal').modal('show');
			break;
		case 'result':
			$('#add-resultModal').modal('show');
			break;
		case 'question':
			$('#add-questionModal').modal('show');
			break;
		case 'block':
			$('#add-blockModal').modal('show');
			break;
	}
}

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