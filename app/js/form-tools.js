root_node_id = 'lvl_0';


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
	// console.log("nodeElt ", nodeElt);
	var eltToDisplay = getGraphicNodeElt(nodeElt.category, nodeElt.dataId);
	// console.log("eltToDisplay ", eltToDisplay);
	
	if(nodeElt.category == 'question'){
		injectQuestionElement(nodeElt.id, eltToDisplay);
	}
	else if(nodeElt.category == 'block'){
		console.log("Block");
	}
	else if(nodeElt.category == 'result'){
		console.log("Result");
	}
	bindQuestionToTarget(nodeElt, eltToDisplay);
}

function bindQuestionToTarget(nodeElt, eltToDisplay){
	var decisionTreeId	= nodeElt.id,
		targets			= nodeElt.targets,
		type 			= eltToDisplay.type,
		outputs 		= eltToDisplay.outputs,
		toFollow 		= undefined;

	if(type == 'text'){
		questionTextEvent(decisionTreeId, outputs, targets);
	}
	else if(type == 'check'){
		questionCheckEvent(decisionTreeId, outputs, targets);
	}
	else if(type == 'list'){
		questionListEvent(decisionTreeId, outputs, targets);
	}
	else if(type == 'numeric'){
		console.log("Numeric config ", eltToDisplay.numerical);
	}	
}

function getTargets(nodeId){
	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == nodeId){
			console.log("\t", decisionTree[i].targets);
			return decisionTree[i].targets;
		}
	}
	return [];
}

// Recursively remove given targets
function removeTargetsElement(targets){
	targets.map(function(id){		
		// Launch recursion on targets of the given analyzed target
		var subTargets = getTargets(id);
		if(subTargets.length > 0 ){
			removeTargetsElement(subTargets);			
		}

		// Remove the current target
		$('label[for="'+id+'"]').remove();
		$('#'+id).remove();
	});
}
