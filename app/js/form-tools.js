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

	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == id){
			getDecisionTreeElement(decisionTree[i]);
			break;
		}
	}
}


// Inject HTML and bind events on injected html
function getDecisionTreeElement(nodeElt){
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