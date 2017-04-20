/*

	Graphic node main management
		graphic model creation and updates
		graphic data model creation and updates
		graphic model cleaning
	
*/

/**
 * Create a new node with the given ID
 * @param {string} id - id of the node to create
 */
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

/**
 * Remove orphan graphical nodes from the displayed graph
 */
function  cleanUpGraph(){
	graphic.nodes().forEach(function(id){

		// Ensure the id is still inside the loop, because it could have been deleted in a previous iteration
		if(graphic.node(id)){
			var isNotRoot = id != ROOT_NODE_ID,
				isNotParent = graphic.children(id).length == 0;

			if(isNotRoot && graphic.children(id).length == 0){
				if(graphic.predecessors(id).length == 0){
					console.log('\tno preds  --> removing ', id);
					recursiveDelete(id, 0);
				}
			}
		}
	});
}



/**
 * Inject the data within the graphicNode data model and configure its display within the graph
 * @param {number} index - index used for insertion within javascript data model, equals -1 if new one
 * @param {object} graphicNodeElt - element to inject within graphicNodes array
 */
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

/**
 * Configure the graphical aspect of a node
 * @param {object} graphicNodeElt - element to use for the configuration
 */
function setUpGraphicNode(graphicNodeElt){
	formatNodeLabel(graphicNodeElt.id, graphicNodeElt.dataName);
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


/**
 * Create a child empty node
 * @param {string} parentNodeId - Graphical id of the parent node
 * @return {string} childId - Graphical id of the child node
 */
function createChildNode(parentNodeId){
	// Extract id components
	var raw = parentNodeId.split('_'),
		base = raw[0],
		parentLvl = parseInt(raw[1]),
		childLvl = parentLvl + 1;

	// Get the position, to prevent node erasing
	var childPosition = 0,
		nodesList = graphic.nodes().sort();
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
/**
 * Create a node, representing a block element
 * @param {string} blockNodeId - Graphical id of the parent block node
 * @param {number} blockNodeDataId - id of the block element within the javascript data model
 */
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
				formatNodeLabel(questionBlockId, q.name);
				styleGraphicNode('questionBlock', questionBlockId);	
				break;
			}

		}
	}
}



/*

	Style formatting

*/

/**
 * Configure the style of the graphical node
 * @param {string} category - array of data of the data represented within the graphical node to display
 * @param {string} nodeId - Graphical id of the node to configure
 */
function styleGraphicNode(category, nodeId){
	if(category == "result"){
		graphic.node(nodeId).style += 'stroke-width: 4;';
	}
	else if(category == "questionBlock"){
		graphic.node(nodeId).shape = 'circle';
	}
}


/**
 * Replace '_' by HTML newLine tags : <br>
 * @param {string} category - array of data of the data represented within the graphical node to display
 * @param {string} dataName - original short name of the element represented within the graphical node to display
 */
function formatNodeLabel(nodeId, dataName){
	var labelText = '<div style="text-align: center; width: 150px; padding: 5px">';
	labelText += dataName.replace(/(_|\s+)/g, '<br>');
	labelText += '</div>';
	graphic.node(nodeId).label = labelText;
}


/*

	Graphic node helper

*/

/**
 * Create an edge labelized between two nodes
 * @param {string} originId - Graphical id of the parent node
 * @param {string} targetId - Graphical id of the target node
 * @param {string} edgeLabel - label of the edge
 */
function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
}


/**
 * Inject a graphicelement at a given position
 * @param {number} index - Index to insert the element
 * @param {object} graphicNodeElt - GraphicNode element to inject
 */
function reinjectDeletedGraphicNode(index, graphicNodeElt){
	graphicNodes.splice(index, 0, graphicNodeElt);
}



/**
 * Get parents recursively, to get all ascendance
 * @param {string} nodeId - graphical node id to delete
 * @param {object} nodeList - List of nodes that are parents
 * @param {number} depth - Depth of recursive call, defaults to 0
 * @return {object} nodeList - list of parents
 */
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



/**
 * Disconnect a node from its children
 * @param {string} nodeId - graphical node id of the parent node
 */
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


/**
 * Returns the label used on the edge linking two nodes
 * @param {string} parentId - graphical node id of the parent node
 * @param {string} nodeId - graphical node id of the current node
 */
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

/**
 * Remove recursively a node
 * @param {string} nodeId - graphical node id to remove
 */
function deleteGraphicNode(nodeId){
	recursiveDelete(nodeId, 0);
	customRender();
}

/**
 * Remove the node and its children if they have no other parents
 * @param {string} nodeId - graphical node id to remove
 * @param {number} depth - Depth of recursive call, defaults to 0
 */
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



/**
 * Remove the edges pointing to a specific node
 * @param {string} nodeId - graphical node id pointed by edges
 */
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


/**
 * Remove a graphical element from the data model, and from the graphical display
 * @param {string} nodeId - graphical node id to remove
 */
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


/**
 * Save the decision tree constructed within the database
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
			$('#graph-editor').notify('Decision process correctly saved in database', {position:'top-right', className:'success'});
		else
			$('#graph-editor').notify('Error in decision process saving', {position:'top-right', className:'error'});
	}
}


/**
 * Load the decision tree of a specific type of work from the database and display it
 */
function getDecisionTree(){
	$.when(ajaxGetElt('DecisionTree', selectedWork.id)).then(
		function(decisionTree){
			if(decisionTree && decisionTree[0] && decisionTree[0].value && decisionTree[0].id){
				graphicNodes = JSON.parse(decisionTree[0].value);
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
			$('#graph-editor').notify('Fail to retrieve decision process', {position:'top-right', className:'error'});
		}
	);
}


/**
 * Load the graphical display of a decision tree element
 * @param {object} node - GraphicNode element to display
 * @param {number} idx - Index of the graphicNode element for click bindings
 */
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