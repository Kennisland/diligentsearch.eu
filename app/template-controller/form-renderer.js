html_formRenderer =`
	<h2>Search-report()</h2>

	<div class="form-group">
		<label for="choose-country">
			Select the jurisdiction you want to determine an orphan work in:
		</label>
		<br>
		<select id="choose-country">
			<option value="">Choose a country</option>
		</select>
	</div>

	<div class="form-group">
		<label for="choose-work">
			Of what type of work do you want to determine the orphan work status?
		</label>
		<br>
		<select id="choose-work">
			<option value="">Choose a type of work</option>
		</select>
	</div>

	<div class="form-decision-tree-renderer">
		<label>This is where the decision tree begins</label>
	</div>
`;


countries = [];
works = [];
userInputs = [];
refValues = [];
questions = [];
blocks = [];
results = [];
decisionTree = [];


function injectFormRenderer(){
	getCountry();
	$('#form-renderer').html(html_formRenderer);
}


function getCountry(){
	$.when(ajaxGetCountries()).then(
		function(result){
			countries = result;
			injectCountriesIntoForm();
		}, 
		function(error){
			alert(error.statusText);
	});
	$('#select-country').show();
}

function getWork(countryId){
	$.when(ajaxGetWorks(countryId)).then(
		function(result){
			works = result;
			injectWorksIntoForm();
		},
		function(error){
			alert(error.statusText);
	});
}

function getSharedValue(countryId){
	$.when(ajaxGetElt('SharedUserInput', countryId), ajaxGetElt('SharedRefValue', countryId)).then(
		function(resultUserInputs, resultRefValues){
			userInputs = resultUserInputs;
			refValues = resultRefValues;
		},
		function(error){
			alert(error.statusText);
	});	
}

function getData(workId){
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree){
			questions = resultQuestions[0];
			blocks = resultBlocks[0];
			results = resultResults[0];
			decisionTree = resultDecisionTree[0];
			// console.log("q", questions);
			// console.log("b", blocks);
			// console.log("r", results);
			// console.log("T", decisionTree);
		},
		function(error){
			alert(error.statusText);
	});
}

function injectCountriesIntoForm(){
	var selectContent = '<option value="">Choose a country</option>';
	for (var i = 0; i < countries.length; i++) {
		var countryId = countries[i].id,
			countryName = countries[i].name;
		selectContent += '<option value="'+countryId+'">'+countryName+'</option>';
	}
	$('#choose-country').html(selectContent);
	bindTypeOfWork();
}

function bindTypeOfWork(){
	$('#choose-country').on('change', function(){
		var countryId = $(this).val();
		getWork(countryId);
		getSharedValue(countryId);
	});	
}

function injectWorksIntoForm(){
	var selectContent = '<option value="">Choose a type of work</option>';
	for (var i = 0; i < works.length; i++) {
		var workId = works[i].id,
			workName = works[i].name;
		selectContent += '<option value="'+workId+'">'+workName+'</option>';
	}
	$('#choose-work').html(selectContent);
	bindDecisionTreeData();
}

function bindDecisionTreeData(){
	$('#choose-work').on('change', function(){
		var workId = $(this).val();
		console.log("changed : ", workId);
		getData(workId);
	});
}
