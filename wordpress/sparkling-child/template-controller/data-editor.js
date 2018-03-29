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
		<button class="btn btn-default" onclick="add('userInput')">Add a numerical user input</button>
	</div>

	<div>
		<label>References values:</label>
		<ul id="data-referenceValues" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('referenceValue')">Add a reference value</button>
	</div>

	<div>
		<label>Results to display:</label>
		<ul id="data-results" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('result')">Add a result</button>
	</div>

	<div>
		<label>Questions already prepared:</label>
		<ul id="data-questions" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('question')">Add a question</button>
	</div>

	<div>
		<label>Available blocks of questions:</label>
		<ul id="data-blocks" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('block')">Add a block</button>
	</div>
	
	<div>
		<label>Sources:</label>
		<ul id="data-sources" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('source')">Add a source</button>&nbsp;<button class="btn btn-default" onclick="add('sources')">Bulk add source</button>
	</div>
	
	<div>
		<label>General Information:</label>
		<ul id="data-informations" class="list-group">
		</ul>
		<button class="btn btn-default" onclick="add('information')">Add General information input</button>
	</div>
</div>
`;

// Initialisation
selectedCountry = '';
selectedWork = '';

function injectDataModelEditor(){
	$('#data-editor').html(html_dataModelEditor);
	getCountry();
}

function getCountry(){
	// Reset country data & work
	countries = [];
	selectedCountry = '';
	resetWorkModel();

	// Ajax call to get data from server and display them as list
	$.when(ajaxGetCountries()).then(
		function(result){
			countries = result;
			injectCountryData();
		}, 
		function(error){
			$('#data-editor').notify("Service unavailable", {position:'top-left', className:'error'});
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
		$('#data-editor').notify("Country selection error", {position:'top-left', className:'error'});
	}
	else{
		// Ajax call to get works from server for this country
		$.when(ajaxGetWorks(selectedCountry.id), ajaxGetElt('SharedUserInput', selectedCountry.id), ajaxGetElt('SharedRefValue', selectedCountry.id)).then(
			function(resultWorks, resultUserInputs, resultRefValues){
				works = resultWorks[0];
				userInputs = [];
				referenceValues = [];
				forceDataId(resultUserInputs[0], userInputs);
				forceDataId(resultRefValues[0], referenceValues);				
				injectWorkData();					
			},
			function(error){
				$('#data-editor').notify("Error in type of work and global data retrieval", {position:'top-left', className:'error'});
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
	$.when(ajaxGetElt('Question', selectedWork.id), ajaxGetElt('Block', selectedWork.id), ajaxGetElt('Result', selectedWork.id), ajaxGetElt('Source', selectedWork.id), ajaxGetElt('Information', selectedWork.id)).then(
		function(resultQuestions, resultBlocks, resultResults, resultSources, resultInformation){
			forceDataId(resultQuestions[0], questions);
			forceDataId(resultBlocks[0], blocks);
			forceDataId(resultResults[0], results);
			forceDataId(resultSources[0], sources);
			forceDataId(resultInformation[0], information);

			// Retrieve index of country
			$('#breadcrumb li:nth-child(2) a').text(selectedWork.name).attr('onclick', 'getWork('+selectedCountry.id+')');	
			$('#breadcrumb').children().show();
			injectDataBasePrimaryModel();
			getDecisionTree();
		},
		function(error){
			$('#data-editor').notify("Error in specific data retrieval", {position:'top-left', className:'error'});
	});
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

	// Hide unecessary divs
	$('#select-work').hide();
	$('#display-data-model').hide();
}

function resetDataModel(){
	results = [];
	questions = [];
	blocks = [];
	sources = [];
	information = [];
	$('#data-results > li').remove();
	$('#data-questions > li').remove();
	$('#data-blocks > li').remove();
	$('#data-results > li').remove();
	$('#data-sources > li').remove();
	$('#data-informations > li').remove();
}

function injectCountryData(){	
	var countriesHtml = '<ul class="list-group">';
	countries.sort(function(a, b) {
	  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
	  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
	  // reverse sort.
	  if (nameA > nameB) {
		return -1;
	  }
	  if (nameA < nameB) {
		return 1;
	  }
	  // names must be equal
	  return 0;
	});
	for (var i = countries.length - 1; i >= 0; i--) {
		countriesHtml += '<li class="list-group-item" onclick="getWork('+countries[i].id+')">'+countries[i].name+'</li>';
	}
	countriesHtml += '</ul>';
	countriesHtml += '<button class="btn btn-default" onclick="add(\'country\')" style="text-align:right">Add a country</button>';
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
	worksHtml += '<button class="btn btn-default" onclick="add(\'work\')" style="text-align:right">Add a type of work</button>';
	$('#select-work').html(worksHtml);

	$('#breadcrumb li:nth-child(1) a').text(selectedCountry.name).attr('onclick', 'getCountry()');
	$('#breadcrumb').children().show();
	$('#breadcrumb li:last-child').hide();	
}

function injectDataBasePrimaryModel(){	
	userInputs.forEach(function(elt, idx){
		injectData('userInput', idx, elt, loadUserInput);
	});
	referenceValues.forEach(function(elt, idx){
		injectData('referenceValue', idx, elt, loadRefValue);
	});
	questions.forEach(function(elt, idx){
		injectData('question', idx, elt, loadQuestion);
	});
	results.forEach(function(elt, idx){
		injectData('result', idx, elt, loadResult);
	});
	blocks.forEach(function(elt, idx){
		injectData('block', idx, elt, loadBlock);
	});
	sources.forEach(function(elt, idx){
		injectData('source', idx, elt, loadSource);
	});
	information.forEach(function(elt, idx){
		injectData('information', idx, elt, loadInformation);
	});
	$('#display-data-model').show();
}

function add(elementType){
	switch(elementType){
		case 'country':
			$('#add-countryModal').modal('show');
			break;
		case 'work':
			$('#work-foreignKey').val(selectedCountry.name);
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
		case 'source':
			$('#add-sourceModal').modal('show');
			break;
		case 'sources':
			$('#add-sourcesModal').modal('show');
			break;
		case 'information':
			$('#add-informationModal').modal('show');
			break;
	}
}