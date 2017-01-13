
function saveDecisionTree(){
	// Callback function
	function cb(success){
		if(success){
				alert('Decision tree correctly saved in database');
		}
		else{
			alert('Error in decision tree saving process');	
		}
	}

	// Get the data, but remove dataName, has it can change easily
	var toSave = graphicNodes;
	toSave.forEach(function(node){
		delete node.dataName;
	});

	// Either save / update the decision tree
	if(graphicNodesDatabaseId === undefined){
		saveElt('DecisionTree', toSave, selectedWork.id, cb);
	}
	else{
		// Format the data to benefit of others standardized ajax calls
		var toSave = {id: graphicNodesDatabaseId, json: toSave};
		updateElt('DecisionTree', toSave, cb);
	}
}

// Load DecisionTree from database
// Called from data-editor, as it requires the entire basic data model
function getDecisionTree(){

	$.when(ajaxGetElt('DecisionTree', selectedWork.id)).then(
		function(decisionTree){
			graphicNodes = JSON.parse(decisionTree[0].json); 	// Save only this part, not the database requirements

			if(graphicNodes.length == 0){
				// New graph
				createGraphicNode('lvl_0');
			}
			else{
				// Dump old graph
				graphicNodesDatabaseId = decisionTree[0].id;

				graphicNodes.forEach(function(node, idx){
					loadGraphicalNodeData(node, idx);
				});
			}
			render();
		},
		function(error){
			console.log("get work ajaxGetUserInputs", error);
		}
	);
}



// Load element from the database json format
function loadGraphicalNodeData(node, idx){
	// Create current node and its target
	createGraphicNode(node.id);
	node.targets.forEach(function(targetId){
		createGraphicNode(targetId);
	});

	// Find out what is the name of the current node
	var current = getGraphicNodeElt(node.category, node.dataId);
	if(!current)
		node.dataName = 'Click to edit';
	else
		node.dataName = current.name;
	graphic.node(node.id).label = '<div style="text-align:center;">'+node.dataName+'</div>';


	// Set up the interactive part
	graphic.node(node.id).index = idx;
	
	// Finalize setup
	setUpGraphicNode(node);
}