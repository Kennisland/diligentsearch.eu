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
			userInputs = resultUserInputs[0].map(function(elt){ return JSON.parse(elt.json); 	});;
			refValues = resultRefValues[0].map(function(elt){ 	return JSON.parse(elt.json); 	});;
		},
		function(error){
			alert(error.statusText);
	});	
}

function getData(workId){	
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree){
			questions 	= resultQuestions[0].map(function(elt){ return JSON.parse(elt.json); 	});
			blocks 		= resultBlocks[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			results 	= resultResults[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			decisionTree = JSON.parse(resultDecisionTree[0][0].json);
			logData();

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
			$('#work-data-selected').html('');
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
	var content = '<div class="form-group">';
	content += '<label for="'+decisionTreeId+'">'+question.title+'</label>';

	if(question.type == 'text'){
		content += '<br>';
		content += '<input id="'+decisionTreeId+'" type="text"></input>';		
	}
	else if(question.type == 'check'){
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
	content += '<br>';
	content += "</div>";
	$('#work-data-selected').append(content);
}

function injectNumericQuestionElement(decisionTreeId, question){
	var content = '<div class="form-group">';
	content += '<label>'+question.title+'</label>';	

	var inputs = extractExpression(question.numerical.expression).inputs;
	if(inputs.length > 0){
		content += '<div id="'+decisionTreeId+'" style="padding:10px">';
		var eltStyle = '';

		inputs.map(function(elt, i){
			content += '<label for="'+decisionTreeId+'-'+i+'" '+eltStyle+'>'+elt.question+'</label>';
			content += '<br>';
			content += '<input id="'+decisionTreeId+'-'+i+'" '+eltStyle+'></input>';
			content += '<br>';
			content += '<small id="'+decisionTreeId+'-'+i+'-info" '+eltStyle+'>'+elt.information+'</small>';
			content += '<br>';
			// Other elements not displayed on beginning
			if(i==0){
				eltStyle = ' style="display:none"';
			}
		});

		content += "</div>";
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

function questionTextEvent(htmlId, outputs, targets){
	$('#'+htmlId).on('change', function(){
		var toFollow = undefined;
		if($(this).val() != ""){
			toFollow = targets[0];
		}
		handleFollowers(toFollow, targets);
	});
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

function questionNumericEvent(htmlId, inputs, inputIdx){
	$('#'+htmlId+'-'+inputIdx).on('change', function(){
		inputs[inputIdx].value = $(this).val();
		if($(this).val() == ""){
			hideInputsElement(htmlId, inputIdx, inputs.length);
		}
		else{
			showNextInputElement(htmlId, inputIdx);
		}
	});
}

function questionNumericDecisionEvent(htmlId, inputs, inputIdx, numConfig, targets){
	$('#'+htmlId+'-'+inputIdx).on('change', function(){
		var toFollow = undefined;
		inputs[inputIdx].value = $(this).val();
		if($(this).val() != ""){
			var evalResult = evalExpression(inputs, inputIdx, numConfig),
				targetIdx = evalResultToTargetIdx(evalResult),
				toFollow = targets[targetIdx];
		}
		handleFollowers(toFollow, targets)
	});
}

function showNextInputElement(htmlId, inputIdx){
	var next = inputIdx + 1,
		nextSelector = htmlId+'-'+next;
	$('label[for="'+nextSelector+'"]').show();
	$('#'+nextSelector).show();
	$('#'+nextSelector+'-info').show();
}

function hideInputsElement(htmlId, inputIdx, inputsLength){
	var next = inputIdx + 1;
	while(next < inputsLength){
		var nextSelector = htmlId+'-'+next;
		$('label[for="'+nextSelector+'"]').hide();
		$('#'+nextSelector).hide();
		$('#'+nextSelector+'-info').hide();
		next++;
	}
}