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

	<div id="country-data-selected" style="display:none">

		<div class="form-group">
			<label for="choose-work">
				Of what type of work do you want to determine the orphan work status?
			</label>
			<br>
			<select id="choose-work">
				<option value="">Choose a type of work</option>
			</select>
		</div>

		<div id="work-data-selected" style="display:none">
		</div>

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

/*
	Get relevant data
*/

function getCountry(){
	// Reset countries data
	countries = [];
	injectCountriesIntoForm();
	$('#country-data-selected').hide();

	// Get countries data
	$.when(ajaxGetCountries()).then(
		function(result){
			countries = result;
			injectCountriesIntoForm();
		}, 
		function(error){
			alert(error.statusText);
	});
}

function getWork(countryId){
	// Reset works data
	works = [];
	$('#work-data-selected').hide();

	// Get works data
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
			userInputs = resultUserInputs[0];
			refValues = resultRefValues[0];
			console.log("userInputs ", userInputs);
			console.log("refValues ", refValues);
		},
		function(error){
			alert(error.statusText);
	});	
}

function getData(workId){	
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree){

			// retrieve data as JSON format
			questions 	= resultQuestions[0].map(function(elt){ return JSON.parse(elt.json); 	});
			blocks 		= resultBlocks[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			results 	= resultResults[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			decisionTree = JSON.parse(resultDecisionTree[0][0].json);
			
			console.log("questions ", questions);
			console.log("blocks ", blocks);
			console.log("results ", results);
			console.log("decisionTree", decisionTree);

			// Now we have data, we do something --> event
			$('#all-data-downloaded').show();
			loadElement();
		},
		function(error){
			alert(error.statusText);
	});
}

/*
	HTML injection and JS bindings
*/
function bindTypeOfWork(){	
	$('#choose-country').on('change', function(){
		var countryId = $(this).val();
		if(countryId == ""){
			$('#country-data-selected').hide();			
		}
		else{
			getWork(countryId);
			getSharedValue(countryId);
			$('#country-data-selected').show();	
		}
	});	
}

function bindDecisionTreeData(){
	$('#choose-work').on('change', function(){
		var workId = $(this).val();
		if(workId == ""){
			works = [];
			$('#work-data-selected').hide();
		}
		else{

			getData(workId);
			$('#work-data-selected').show();
		}
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

function injectQuestionElement(decisionTreeId, question){
	content = '<div class="form-group">';
	content += '<label for="'+decisionTreeId+'">'+question.title+'</label>';

	if(question.type == 'check'){
		content += '<input id="'+decisionTreeId+'" type="checkbox" checke></input>';
	}
	else if(question.type == 'list'){
		content += '<select id="'+decisionTreeId+'">';
		content += '<option val=""></option>';
		for (var i = 0; i < question.outputs.length; i++) {
			content += '<option val="'+question.outputs[i]+'">'+question.outputs[i]+'</option>';
		}
		content += '</select>';
	}
	else if(question.type == 'text' || question.type == 'numeric'){
		content += '<input id="'+decisionTreeId+'" type="text"></input>';
	}

	content += "</div>";
	$('#work-data-selected').append(content);
}

function injectBlockElement(){

}

function injectResultElement(){

}



/*

	Question type events

*/

function handleFollowers(toFollow, targets){
	removeTargetsElement(targets);	
	if(toFollow){
		loadElement(toFollow);
	}
}

function questionCheckEvent(htmlId, outputs, targets){
	$('#'+htmlId).on('change', function(){
		var toFollow = undefined;
		if($('#'+htmlId).is(':checked')){
			toFollow = targets[0];
		}
		else{
			toFollow = targets[1];
		}
		handleFollowers(toFollow, targets);
	});
}

function questionTextEvent(htmlId, outputs, targets){
	$('#'+htmlId).on('change', function(){
		var toFollow = undefined;
		if($(this).val() != ""){
			toFollow = targets[0];
		}
		console.log("toFollow, targets", toFollow, targets);
		handleFollowers(toFollow, targets);
	});
}

function questionListEvent(htmlId, outputs, targets){
	$('#'+htmlId).on('change', function(){
		var toFollow = undefined;
		for (var i = 0; i < outputs.length; i++) {
			if(outputs[i] == $(this).val()){
				toFollow = targets[i];
			}
		}
		handleFollowers(toFollow, targets);
	});
}

function questionNumericEvent(){

}