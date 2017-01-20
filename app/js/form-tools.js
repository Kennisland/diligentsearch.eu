root_node_id = 'lvl_0';

function logData(){	
	console.log("userInputs ", userInputs);
	console.log("refValues ", refValues);
	console.log("questions ", questions);
	console.log("blocks ", blocks);
	console.log("results ", results);
	console.log("decisionTree", decisionTree);
}

function loadElement(id){
	if(!id){
		id = root_node_id;
	}

	var element = getDecisionTreeElement(id);
	if(element){
		generateElementHtml(element);
	}
}

function getDecisionTreeElement(id){
	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == id){
			return decisionTree[i];
		}
	}
	return undefined;
}


// Inject HTML and bind events on injected html
function generateElementHtml(nodeElt){
	var htmlContent = '',
		eltToDisplay = getGraphicNodeElt(nodeElt.category, nodeElt.dataId);
	
	if(nodeElt.category == 'question'){
		if(eltToDisplay.type != 'numeric'){
			htmlContent = getQuestionElementHtml(nodeElt.id, eltToDisplay);
		}
		else{
			htmlContent = getNumericQuestionElementHtml(nodeElt.id, eltToDisplay);
		}
		injectElementIntoForm(htmlContent);
		bindQuestionToTarget(nodeElt, eltToDisplay);
	}
	else if(nodeElt.category == 'block'){
		htmlContent = getBlockElementHtml(nodeElt.id, eltToDisplay, 0);
		injectElementIntoForm(htmlContent);
		// Load the output direclty, to provide further navigation to user
		loadElement(nodeElt.targets[0]);
	}
	else if(nodeElt.category == 'result'){
		htmlContent = getResultElementHtml(nodeElt.id, eltToDisplay);
		injectElementIntoForm(htmlContent);
	}	
}



/*
	HTML Jquery event / remove / hide / show
*/

// Specific question binding according to question type
function bindQuestionToTarget(nodeElt, eltToDisplay){
	var targets	= nodeElt.targets,
		type 	= eltToDisplay.type,
		outputs = eltToDisplay.outputs;

	if(type == 'text'){
		questionTextEvent(nodeElt.id, outputs, targets);
	}
	else if(type == 'check'){
		questionCheckEvent(nodeElt.id, outputs, targets);
	}
	else if(type == 'list'){
		questionListEvent(nodeElt.id, outputs, targets);
	}
	else if(type == 'numeric'){
		bindNumericQuestionToTarget(nodeElt, eltToDisplay, targets);
	}
}

//Numeric question binding, allowing direct computation if possible
function bindNumericQuestionToTarget(nodeElt, eltToDisplay, targets){
	var numConfig 	= eltToDisplay.numerical,
		inputs 		= extractExpression(numConfig.expression).inputs,
		lastToCompute = getLastToCompute(inputs);

	// Run computation if all inputs already have value
	if(lastToCompute == -1){
		var evalResult = evalExpression(inputs, numConfig),
			targetIdx = evalResultToTargetIdx(evalResult),
			toFollow = targets[targetIdx];
		handleFollowers(toFollow, targets);
	}
	else{
		// Bind the html / jquery
		var i = 0,
			htmlIdx = 0;
		while(i <= lastToCompute){
			if(!inputs[i].value){
				if(i == lastToCompute){
					questionNumericDecisionEvent(nodeElt.id, htmlIdx, inputs, i, eltToDisplay.numerical, targets);	
				}
				else{
					questionNumericEvent(nodeElt.id, htmlIdx, inputs, i);				
				}
				// Handle model reset on deletion
				questionNumericRemoveEvent(nodeElt.id, inputs, i);
				htmlIdx++;
			}
			i++;
		}
	}
}

// Handle the following element when 'change' Jquery event is triggered in html
function handleFollowers(toFollow, targets){
	removeTargetsElement(targets);	
	if(toFollow){
		loadElement(toFollow);
	}
}

// Recursively remove given targets
function removeTargetsElement(targets){
	targets.map(function(id){		
		// Launch recursion on targets of the given analyzed target
		var subTargets = getTargets(id);
		if(subTargets.length > 0 ){
			removeTargetsElement(subTargets);			
		}
		// Remove the current target group, hold by the parent of target
		// The trigger event allow to reset user inputs if needed
		$('#'+id).trigger('remove').remove();
	});
}

// Get targets of the given node
function getTargets(nodeId){
	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == nodeId){
			return decisionTree[i].targets;
		}
	}
	return [];
}

// Display following user input element
function showNextInputElement(selector, inputIdx){
	var next = inputIdx + 1;
	$('#'+selector).eq(next).show();
}

// Hide following user inputs
function hideInputsElement(selector, inputIdx, inputsLength){
	var next = inputIdx + 1;
	while(next < inputsLength){
		$('#'+selector).eq(next).hide();
		next++;
	}
}



/* 
	Numerical question stuff
*/

function getUserInput(userInputId){
	for (var i = 0; i < userInputs.length; i++) {
		if(userInputs[i].id == userInputId){
			return userInputs[i];
		}
	}
	return null;
}

function getReference(refValueId){
	for (var i = 0; i < refValues.length; i++) {
		if(refValues[i].id == refValueId){
			return refValues[i];
		}
	}
	return null;
}


function getLastToCompute(inputs){
	var lastToCompute = -1;
	for(var i=0; i<inputs.length; i++){
		if(!inputs[i].value){
			lastToCompute = i;
		}
	}
	return lastToCompute;
}

function replaceReference(value){
	switch(value){
		case 'now':
			return new Date().getFullYear();
		default:
			return value;
	}
}

function extractExpression(expression){
	var usedInputs = [],
		usedReferences = [];
	expression.map(function(elt){
		if(elt.source == 'userInputs'){
			usedInputs.push(getUserInput(elt.dataId));
		}
		else if(elt.source == 'referenceValues'){
			usedReferences.push(getReference(elt.dataId));
		}
	});
	return {inputs:usedInputs, references:usedReferences};
}

function evalExpression(inputs, numConfig){
	var	ref = getReference(numConfig.refId),
		condition  = numConfig.condition,
		expression = numConfig.expression,
		references = extractExpression(expression).references;
		operations = numConfig.operations;

	var exp = ref.value+" "+condition+" ",
		i = 0,
		j = 0,
		k = 0;
	expression.map(function(elt){
		if(elt.source == 'userInputs'){
			exp += inputs[i].value+" ";
			i++;
		}
		else if(elt.source == 'referenceValues'){
			exp += replaceReference(references[j].value)+" ";
			j++;
		}

		if(k < operations.length){
			exp += operations[k]+" ";
			k++;
		}
	});
	console.log("EXP", exp, eval(exp));
	return eval(exp);
}

function evalResultToTargetIdx(result){
	var targetIdx = result ? 0 : 1;
	return targetIdx
}



/*
	Form dumping 
*/

// Retrieve all id starting by 'lvl_'
function getHtmlId(){
	var elementsId = [];
	$('#work-data-selected').find('[id^="lvl_"]').map(function(elt){
		elementsId.push($(this)[0].id);
	});
	return elementsId;
}

function getQuestionFromHtmlId(id, element){
	var dataId = undefined;
	if(element){
		dataId = element.dataId;
	}
	else{
		var s = id.split('-');
		dataId = s[s.length-1];
	}
	return getGraphicNodeElt('question', dataId);
}

function extractQuestionHtmlAnswer(id, question){
	var value;
	if(question.type == 'text' || question.type == 'check'){
		value = $('#'+id).find('input').val() || undefined;
	}
	else if(question.type == 'list'){
		value = $('#'+id).find('select').val() || undefined;
	}
	else if(question.type == 'numeric'){
		value = [];
		$('#'+id).find('input').map(function(elt){
			value.push($(this)[0].value || undefined);
		});
	}
	return value;
}

// For each id, get interest child element (input/select/textarea), and get value
function dumpHtmlForm(){
	var formData = [];
	getHtmlId().map(function(id){
		var element 	= getDecisionTreeElement(id),
			isBlock 	= element && element.category == 'block',
			isResult 	= element && element.category == 'result',
			isQuestion 	= !isBlock && !isResult,
			value 		= undefined;

		if(isQuestion){
			var question = getQuestionFromHtmlId(id, element);
			value = extractQuestionHtmlAnswer(id, question);
		}
		else if(isResult){
			value = $('#'+id).find('textarea').val() || undefined;
		}

		if(!isBlock){
			formData.push(new FormEntry(id, value));
		}
	});
	return formData;	
}

function saveForm(){
	dumpedForm.json = dumpHtmlForm();
	if(!dumpedForm.webHook){
		function cb(status){
			if(status){
				alert("Report injected in database \nWebhook is : "+dumpedForm.webHook);
			}
			else{
				alert("Failed to save report in database ");
			}
		}
		var workId = $('#choose-work').val();
		ajaxPutForm(dumpedForm, workId, cb);
	}
	else{
		function cb(status){
			if(status){
				alert("Report correclty updated");
			}
			else{
				alert("Failed to update report in database ");
			}
		}
		updateElt('Form', dumpedForm, cb);
	}
}

function FormEntry(htmlId, value){
	this.htmlId = htmlId;
	this.value 	= value;
}