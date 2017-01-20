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

function injectElementIntoForm(html){
	$('#work-data-selected').append(html);
}




function getQuestionElementHtml(decisionTreeId, question){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
		content += '<label>'+question.title+'</label>';

	if(question.type == 'text'){
		content += '<br>';
		content += '<input type="text"></input>';
	}
	else if(question.type == 'check'){
		content += '<input type="checkbox"></input>';
	}
	else if(question.type == 'list'){
		content += '<select>';
		content += '<option val=""></option>';
		for (var i = 0; i < question.outputs.length; i++) {
			content += '<option val="'+question.outputs[i]+'">'+question.outputs[i]+'</option>';
		}
		content += '</select>';
	}
	content += '<br>';
	content += "</div>";
	return content;
}

function getNumericQuestionElementHtml(decisionTreeId, question){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
		content += '<label>'+question.title+'</label>';	

	var inputs = extractExpression(question.numerical.expression).inputs;
	if(inputs.length > 0){
		var isFirst = true;
		inputs.map(function(elt, i){
			if(!elt.value){
				if(isFirst){
					content += '<div style="padding:10px;">';
					isFirst = false;
				}else{
					content += '<div style="padding:10px; display:none">';				
				}
				content += '<label>'+elt.question+'</label>';
				content += '<br>';
				content += '<input></input>';
				content += '<br>';
				content += '<small>'+elt.information+'</small>';
				content += '<br>';
				content += "</div>";
			}
		});
	}
	content += "</div>";
	return content;
}


function getBlockElementHtml(decisionTreeId, block, blockIndex){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
		content += '<label>'+block.introduction+'</label>';

	// Set / Get question data
	var	innerBlockStyle = 'style="border: 1px;border-style: solid;border-color: #34a301;padding: 5px;"',
		innerBlockId = decisionTreeId+'-'+blockIndex
		innerBlockHtml = getBlockQuestionElementHtml(block.questions, innerBlockId);

	// Inject question data
	content += '<div '+innerBlockStyle+'>';
	content += innerBlockHtml;
	content += '</div>';

	// Inject add button
	var nextBlockIdx = blockIndex+1;
	content += '<a onclick="addBlock(['+block.questions+'], `'+decisionTreeId+'`, '+nextBlockIdx+')">Add a block section</a>';
	content += '</div>';
	return content;
}

function getBlockQuestionElementHtml(questions, innerBlockId){
	var content = '';
	questions.map(function(dataId){
		var eltToDisplay = getGraphicNodeElt('question', dataId),
			eltHtml = '';
		if(eltToDisplay.type != 'numeric'){
			eltHtml += getQuestionElementHtml(innerBlockId, eltToDisplay);
		}
		else{
			eltHtml += getNumericQuestionElementHtml(innerBlockId, eltToDisplay);
		}
		eltHtml = eltHtml.replace(/<br>/g, '');
		eltHtml = eltHtml.replace(/class="form-group"/g, '');
		content += eltHtml;
	});
	return content;
}


function getResultElementHtml(decisionTreeId, result){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
	content += '<textarea style="min-width:85%;max-width:85%" disabled>'+result.content+'</textarea>';
	content += '<br>';
	content += "</div>";
	return content;
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
	var selector = htmlId+' input';
	$('#'+selector).on('change', function(){
		var toFollow = undefined;
		if($(this).val() != ""){
			toFollow = targets[0];
		}
		handleFollowers(toFollow, targets);
	});
}

function questionCheckEvent(htmlId, outputs, targets){
	var selector = htmlId+' input';
	$('#'+selector).on('change', function(){
		var toFollow = undefined;
		if($('#'+selector).is(':checked')){
			toFollow = targets[0];
		}
		else{
			toFollow = targets[1];
		}
		handleFollowers(toFollow, targets);
	});
}


function questionListEvent(htmlId, outputs, targets){
	var selector = htmlId+' select';
	$('#'+selector).on('change', function(){
		var toFollow = undefined;
		for (var i = 0; i < outputs.length; i++) {
			if(outputs[i] == $(this).val()){
				toFollow = targets[i];
			}
		}
		handleFollowers(toFollow, targets);
	});
}

function questionNumericEvent(htmlId, htmlIndex, inputs, inputIdx){
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){
		inputs[inputIdx].value = $(this).val();
		if($(this).val() == ""){
			hideInputsElement(selector, inputIdx, inputs.length);
		}
		else{
			showNextInputElement(selector, inputIdx);
		}
	});
}

function questionNumericDecisionEvent(htmlId, htmlIndex, inputs, inputIdx, numConfig, targets){	
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){
		var toFollow = undefined;
		inputs[inputIdx].value = $(this).val();
		if($(this).val() != ""){
			var evalResult = evalExpression(inputs, numConfig),
				targetIdx = evalResultToTargetIdx(evalResult),
				toFollow = targets[targetIdx];
		}
		handleFollowers(toFollow, targets)
	});
}

function questionNumericRemoveEvent(htmlId, inputs, i){
	$('#'+htmlId).on('remove', function(){
		inputs[i].value = undefined;
	});
}

function showNextInputElement(selector, inputIdx){
	var next = inputIdx + 1;
	$('#'+selector).eq(next).show();
}

function hideInputsElement(selector, inputIdx, inputsLength){
	var next = inputIdx + 1;
	while(next < inputsLength){
		$('#'+selector).eq(next).hide();
		next++;
	}
}