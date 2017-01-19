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

function getDecisionTreeElement(nodeElt){
	var eltToDisplay = getGraphicNodeElt(nodeElt.category, nodeElt.dataId);
	
	console.log("injecting ", nodeElt.id);
	if(nodeElt.category == 'question'){

		if(eltToDisplay.type != 'numeric'){
			injectQuestionElement(nodeElt.id, eltToDisplay);
		}
		else{
			injectNumericQuestionElement(nodeElt.id, eltToDisplay);
		}
		bindQuestionToTarget(nodeElt, eltToDisplay);
	}
	else if(nodeElt.category == 'block'){
		console.log("Block");
		injectBlockElement(nodeElt.id, eltToDisplay);
	}
	else if(nodeElt.category == 'result'){
		injectResultElement(nodeElt.id, eltToDisplay);
	}
}

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
		var inputs = extractExpression(eltToDisplay.numerical.expression).inputs,
			i = 0;

		while(i < inputs.length){
			var isLast = (i == (inputs.length-1));
			if(isLast){
				questionNumericDecisionEvent(nodeElt.id, inputs, i, eltToDisplay.numerical, targets);	
			}
			else{
				questionNumericEvent(nodeElt.id, inputs, i);				
			}
			i++;
		}
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
		$('#'+id).remove();
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

function replaceReference(value){
	switch(value){
		case 'now':
			return new Date().getFullYear();
		default:
			return value;
	}
}


function evalExpression(inputs, inputIdx, numConfig){
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
	// console.log("EXP", exp);
	return eval(exp);
}

function evalResultToTargetIdx(result){
	var targetIdx = result ? 0 : 1;
	return targetIdx
}