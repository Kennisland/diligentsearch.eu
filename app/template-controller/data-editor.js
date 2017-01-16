html_dataModelEditor = `
<div style="text-align:center">
	<h3>Data model editor</h3>
	<small>Use this panel to view and edit the data model to use for the creation of decision trees</small>
</div>

<ul id="breadcrumb" class="breadcrumb">
	<li><a onclick="getCountry()">Choose a Country</a></li>
	<li style="display: none"><a onclick="getWork()">Choose a type of Work</a></li>
	<li style="display: none"><a onclick="getData()">Data</a></li>
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
			$('#select-country').html(error.statusText);
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
		$('#select-work').html('Country id not found');
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
				$('#select-work').html(error.statusText);
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
			$('#display-data-model').prepend(error.statusText);			
	});
	$('#display-data-model').show();
}


function resetWorkModel(){
	// Reset work part
	works = [];
	selectedWork = '';
	userInputs = [];
	referenceValues = [];
	$('#select-work').html('');

	// Reset implicitely wor dependant part
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



// called from specific modal
function injectUserInputData(index, userInputElt){

	if(index == -1){
		// Insert data in array and update index
		index = userInputs.push(userInputElt);
	}
	else{
		// Update the data array and increment index (0 based array)
		userInputs[index] = userInputElt;
		index++;
	}

	// Create list element if needed
	if($('#data-userInputs li').length < index){
		var userInputHtml = '<li class="list-group-item"></li>';
		$('#data-userInputs').append(userInputHtml);
	}

	// Fill in the created element / update the appropriate list element
	$('#data-userInputs li:nth-child('+index+')').attr('id', 'data-userInputs-'+userInputElt.id);
	$('#data-userInputs li:nth-child('+index+')').text(userInputElt.name);
	$('#data-userInputs li:nth-child('+index+')').click(function(){
		loadUserInput(index-1, userInputElt);
	});
}

// called from specific modal
function injectRefValueData(index, refValueElt){
	// Insert data at given position if there are already in
	if(index == -1){
		index = referenceValues.push(refValueElt);
	}
	else{
		referenceValues[index] = refValueElt;
		index++;
	}

	// Update html
	// Create list element if needed
	if($('#data-referenceValues li').length < index){
		var refValueHtml = '<li class="list-group-item"></li>';
		$('#data-referenceValues').append(refValueHtml);
	}

	$('#data-referenceValues li:nth-child('+index+')').attr('id', 'data-referenceValues-'+refValueElt.id);
	$('#data-referenceValues li:nth-child('+index+')').text(refValueElt.name);
	$('#data-referenceValues li:nth-child('+index+')').click(function(){
		loadRefValue(index-1, refValueElt);
	});
}



// called from specific modal
function injectResultData(index, resultElt){
		// Insert data at given position if there are already in
	if(index == -1){
		index = results.push(resultElt);
	}
	else{
		results[index] = resultElt;
		index++;
	}

	// Update html
	// Create list element if needed
	if($('#data-results li').length < index){
		var resultHtml = '<li class="list-group-item"></li>';
		$('#data-results').append(resultHtml);	
	}
	
	// Update html
	$('#data-results li:nth-child('+index+')').attr('id', 'data-results-'+resultElt.id);
	$('#data-results li:nth-child('+index+')').text(resultElt.name);
	$('#data-results li:nth-child('+index+')').click(function(){
		loadResult(index-1, resultElt);
	});
}




// called from specific modal
function injectQuestionData(index, questionElt){
		// Insert data at given position if there are already in
	if(index == -1){
		index = questions.push(questionElt);
	}
	else{
		questions[index] = questionElt;
		index++;
	}
	
	// Update html
	// Create list element if needed
	if($('#data-questions li').length < index){
		var questionHtml = '<li class="list-group-item"></li>';
		$('#data-questions').append(questionHtml);
	}	
	
	// Update html
	$('#data-questions li:nth-child('+index+')').attr('id', 'data-questions-'+questionElt.id);
	$('#data-questions li:nth-child('+index+')').text(questionElt.name);
	$('#data-questions li:nth-child('+index+')').click(function(){
		loadQuestion(index-1, questionElt);
	});
}



// Called from specific modal
function injectBlockData(index, blockElt){
	// Insert data at given position if there are already in
	if(index == -1){
		index = blocks.push(blockElt);
	}
	else{
		// Rewrite 
		blocks[index] = blockElt;
		index++;
	}

	// Update html
	// Create list element if needed
	if($('#data-blocks li').length < index){
		var blockHtml = '<li class="list-group-item"></li>';
		$('#data-blocks').append(blockHtml);	
	}
	
	// Update html
	$('#data-blocks li:nth-child('+index+')').attr('id', 'data-blocks-'+blockElt.id);
	$('#data-blocks li:nth-child('+index+')').text(blockElt.name);
	$('#data-blocks li:nth-child('+index+')').click(function(){
		loadBlock(index-1, blockElt);
	});
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