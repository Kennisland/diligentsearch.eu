/*

	Graphic node main management
		graphic model creation and updates
		graphic data model creation and updates
		graphic model cleaning
	
*/
// Create a new node with the given ID
function createGraphicNode(id){
	graphic.setNode(id, {
		labelType: 'html',
		label: '<div style="text-align:center;overflow:auto">Click to edit</div>',
		rx: 5,
		ry: 5,
		margin: 2,
		width: 100,
		id: id,
		index: undefined
	});
}

// Ensure there is no orphan nodes drawn
function  cleanUpGraph(){
	graphic.nodes().forEach(function(id){
		if(id != ROOT_NODE_ID && graphic.children(id).length == 0){
			if(graphic.predecessors(id).length == 0){
				console.log('\tno preds  --> removing ', id);
				recursiveDelete(id, 0);
			}
		}
	});
}


// Externally called by node-config-modal.js
function injectGraphicNodeData(index, graphicNodeElt){
	if(index != -1){
		graphicNodes[index] = graphicNodeElt;
		index++;
	}
	else{
		index = graphicNodes.push(graphicNodeElt);
	}

	// Get node by the modal hidden input node-graphic-id
	var node = graphic.node($('#node-graphic-id').val());	
	node.index = index-1; //  Update drawable graphic node information

	setUpGraphicNode(graphicNodeElt);
	cleanUpGraph();
	customRender();
}

// Update graphic, take care of block case, generate outputs
function setUpGraphicNode(graphicNodeElt){
	formatNodeLabel(graphicNodeElt);
	styleGraphicNode(graphicNodeElt.category, graphicNodeElt.id);

	// Delete all outEdges of this node if they exist to better recreate them
	graphic.outEdges(graphicNodeElt.id).forEach(function(e){
		graphic.removeEdge(e);
	});

	// Prepare edgeLabels
	var edgeLabel = [];
	if(graphicNodeElt.category == "block"){		
		// Generate block of questions if necessary
		setNewGraphicBlock(graphicNodeElt.id, graphicNodeElt.dataId);
		edgeLabel.push("Block output");
	}
	else{
		var question = getQuestion(graphicNodeElt.dataId);
		if(question){
			edgeLabel = question.outputs;
		}
	}

	// Regarding number of Outputs, draw new nodes if necessary
	for (var i = 0; i < graphicNodeElt.targets.length; i++) {
		if(graphicNodeElt.targets[i] == "New node"){
			graphicNodeElt.targets[i] = createChildNode(graphicNodeElt.id);
		}

		// Bind to the target with the specified edgeLabel
		var targetId = graphicNodeElt.targets[i];
		targetGraphicNode(graphicNodeElt.id, targetId, edgeLabel[i]);
		styleGraphicNode(graphicNodeElt.category, targetId);
	}
}

// Create a child node of parentNodeId
function createChildNode(parentNodeId){
	// Extract id components
	var raw = parentNodeId.split('_'),
		base = raw[0],
		parentLvl = parseInt(raw[1]),
		childLvl = parentLvl + 1;

	// Get the position, to prevent node erasing
	var childPosition = 0,
		nodesList = graphic.nodes();
	for (var i = 0; i < nodesList.length; i++) {
		// Increase child position if position already taken
		if(nodesList[i].indexOf(base+'_'+childLvl+'_'+childPosition) == 0){
			childPosition++;		
		}
	}

	var nodeId = base+'_'+childLvl+'_'+childPosition;
	createGraphicNode(nodeId);
	return nodeId;
}


// Create a node, representing a block element
function setNewGraphicBlock(blockNodeId, blockNodeDataId){

	// Register a parent node, which will help graphical identification of the block
	var clusterId = blockNodeId+":";
	graphic.setNode(clusterId, {
		id: clusterId
	});
	graphic.setParent(blockNodeId, clusterId);

	// DB effect : get back block element
	var blockElt = getDataElt('block', blockNodeDataId);
	if(!blockElt){
		console.log("BlockElt not found");
		return;
	}
	
	// For all questions, create id, node, edge, and register them as child of the created parent
	for (var i = 0; i < blockElt.questions.length; i++) {

		// Get question index to jump to question data model
		var idx = blockElt.questions[i];
		for (var j = 0; j < questions.length; j++) {

			if(idx == questions[j].id){
				// Dump question and create specific id for the graphical representation
				var q = questions[j],
					questionBlockId = clusterId + i;

				// Register this question as a new node, belonging to the cluster, and child of the blockNodeId
				createGraphicNode(questionBlockId);
				graphic.node(questionBlockId).questionIndex = idx;
				graphic.node(questionBlockId).label = '<div style="text-align:center; overflow:auto">'+q.name+'</div>';
				graphic.setParent(questionBlockId, clusterId);
				graphic.setEdge(blockNodeId, questionBlockId, {
					style: "fill: none; stroke-dasharray:5,5;"
				});
				styleGraphicNode('questionBlock', questionBlockId);	
				break;
			}

		}
	}
}



/*

	Style formatting

*/

// Customize graphical nodes aspect
function styleGraphicNode(category, nodeId){
	if(category == "result"){
		graphic.node(nodeId).style += 'stroke-width: 4;';
	}
	else if(category == "questionBlock"){
		graphic.node(nodeId).shape = 'circle';
	}
}

// Replace '_' by newLine HTML tags
function formatNodeLabel(graphicNodeElt){
	var labelText = '<div style="text-align: center; width: 150px; padding: 5px">';
	labelText += graphicNodeElt.dataName.replace(/(_|\s+)/g, '<br>');
	labelText += '</div>';
	graphic.node(graphicNodeElt.id).label = labelText;
}


/*

	Graphic node helper

*/

// Points to an existing node and remove the edge Number i and the node if no predecessors
function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
}

// Inject a graphicelement at a given position
function reinjectDeletedGraphicNode(index, graphicNodeElt){
	graphicNodes.splice(index, 0, graphicNodeElt);
}


// Get parents recursively, to get all ascendance
function recursiveParents(nodeId, nodeList, depth){
	// Push current element
	nodeList.push(nodeId);

	// Check for predecessors and recall if necessary
	var parents = graphic.predecessors(nodeId);
	if(parents.length > 0){
		parents.map(function(parentId){
			recursiveParents(parentId, nodeList, depth+1);
		});
	}

	// If initial caller, return the appended list
	if(depth == 0){
		return nodeList;
	}
}


// Disconnect a node from its children
function disconnectChildren(nodeId){	
	
	// Retrieve parents id and their labels connecting the node we want to refresh
	var parentsId = [],
		labels = [],
		inEdges = graphic.inEdges(nodeId);
	inEdges.forEach(function(e){
		parentsId.push(e.v);
		labels.push(getInEdgeLabel(e.v, nodeId));
	});


	// Remove current node, and recreate it at the same place within the list
	var nodeIndex = graphic.node(nodeId).index,
		graphicNodeElt = graphicNodes[nodeIndex];
	recursiveDelete(nodeId, 0);
	reinjectDeletedGraphicNode(nodeIndex, graphicNodeElt);
	createGraphicNode(nodeId);

	// Rebind edges of parent
	parentsId.forEach(function(originId, index){
		var parent = getGraphicNode(originId);
		parent.targets.forEach(function(t, idx){
			if(t == ""){
				parent.targets[idx] = nodeId;
			}
		});
		targetGraphicNode(originId, nodeId, labels[index]);
	});
}

// Returns the label used on the edge linking parentId to nodeId
function getInEdgeLabel(parentId, nodeId){
	var	parentNode = getGraphicNode(parentId);
	if(parentNode){

		var parentNodeElt = getDataElt(parentNode.category, parentNode.dataId);
		if(parentNodeElt){
			if(parentNodeElt.outputs){
				var targets = parentNode.targets;
				for (var i = 0; i < targets.length; i++) {
					if(targets[i] == nodeId){
						return parentNodeElt.outputs[i];
					}
				}				
			}
			else{
				return 'Block output';
			}
		}
	}
}





/*

	Graphic node deletion

*/

// Remove the node and its children if they have no other parents
function deleteGraphicNode(nodeId){
	recursiveDelete(nodeId, 0);
	customRender();
}

function recursiveDelete(nodeId, depth){
	// Child node, with at least 2 parents : don't delete it
	if(depth != 0 && graphic.predecessors(nodeId).length > 1){
		return;
	}

	// Look at all children of this ndoe, and try to delete them
	var children = graphic.successors(nodeId);
	if(children.length > 0){
		children.map(function(childId){
			recursiveDelete(childId, depth+1);
		});
	}

	// Start node : update predecessors targets
	if(depth == 0){
		resetParentTargets(nodeId);
	}

	// Finally remove the current node
	removeGraphicNodeElt(nodeId);	
}


// For all predecessors, remove the question which points to the node identified by nodeId
function resetParentTargets(nodeId){
	graphic.predecessors(nodeId).map(function(parentId){
		// Look for this parent in the model and its targets
		var parentIndex = graphic.node(parentId).index,
			targets = graphicNodes[parentIndex].targets;
		targets.forEach(function(t, idx){
			if(t == nodeId){
				targets[idx] = ""; // will  be cast to 'New node' string in dumpNode function
			}
		});
	});
}

// Remove the elt from the data model, and from the decision tree
function removeGraphicNodeElt(nodeId){
	var nodeIndex = graphic.node(nodeId).index;
	if(nodeIndex !== undefined){
		var isBlock = graphicNodes[nodeIndex].category == "block";

		// Remove from data model		
		graphicNodes.splice(nodeIndex, 1);

		// Update graphical model : refresh other elements index (pointing nowhere is not funny)
		if(isBlock){
			graphic.removeNode(nodeId+':'); // Block case : delete parent node
		}
		for (var i = 0; i < graphicNodes.length; i++) {
			var node = graphic.node(graphicNodes[i].id);
			if(node && node.index > nodeIndex){
				node.index--;
			}
		}
	}

	// Update graphical model
	graphic.removeNode(nodeId);	
}


/*

	Database interaction
	
*/
function saveDecisionTree(){
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

	// Callback function
	function cb(success){
		if(success)
			$.notify('Decision process correctly saved in database', 'success');
		else
			$.notify('Error in decision process saving', 'error');
	}
}

// Load DecisionTree from database
// Called from data-editor, as it requires the entire basic data model
function getDecisionTree(){
	$.when(ajaxGetElt('DecisionTree', selectedWork.id)).then(
		function(decisionTree){
			if(decisionTree && decisionTree[0] && decisionTree[0].json && decisionTree[0].id){
				graphicNodes = JSON.parse(decisionTree[0].json);
				graphicNodesDatabaseId = decisionTree[0].id;
				graphicNodes.forEach(function(node, idx){
					loadGraphicalNodeData(node, idx);
				});
			}
			else{
				createGraphicNode(ROOT_NODE_ID);				
			}
			customRender();
		},
		function(error){
			$.notify('Fail to retrieve decision process', "error");
		}
	);
}

// Load element from the database json format
function loadGraphicalNodeData(node, idx){
	createGraphicNode(node.id);
	node.targets.forEach(function(targetId){
		createGraphicNode(targetId);
	});

	// Find out what is the name of the current node
	var current = getDataElt(node.category, node.dataId);
	if(!current)
		node.dataName = 'Click to edit';
	else
		node.dataName = current.name;

	graphic.node(node.id).label = '<div style="text-align:center;">'+node.dataName+'</div>';
	graphic.node(node.id).index = idx; // Set up the interactive part
	setUpGraphicNode(node); // Finalize setup
}