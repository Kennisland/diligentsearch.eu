/*

	Data retrieval

*/

// Returns the specific data model
function getDataSource(category){
	if(category == 'question')
		return questions;
	if(category == 'block')
		return blocks;
	if(category == 'result')
		return results;
}

function getGraphicNode(nodeId){
	for (var j = 0; j < graphicNodes.length; j++) {
		if(graphicNodes[j].id == nodeId){
			return graphicNodes[j];
		}
	}
	return undefined;
}

// Returns a specific element based on its db ID
function getGraphicNodeElt(category, dataId){
	var source = getDataSource(category);
	for (var i = 0; i < source.length; i++) {
		if( source[i].id == dataId){
			return source[i];
		}
	}
	return undefined;
}



/*

	Style formatting

*/

// Customize graphical nodes aspect
function styleGraphicNode(category, nodeId){
	// Configure css
	var s = '';
	if(category == "result"){
		graphic.node(nodeId).style += 'stroke-width: 4;';
	}
	else if(category == "question"){
		graphic.node(nodeId).style += 'stroke: #57723E'; //; stroke-width: 2';
	}
	else if(category == "block"){
		graphic.node(nodeId).style += s;	
	}
	else if(category == "questionBlock"){
		graphic.node(nodeId).shape = 'circle';
	}

	// format label text if there is one
	graphic.node(nodeId).label = formatGraphicNodeLabel(graphic.node(nodeId).label);
}

// Replace '_' by newLine characters
function formatGraphicNodeLabel(text){
	return text.replace(/_/g, '<br>');
}


/*

	Graphical node management
		creation
		data injection from modal
		creation of children
		configuration of blocks
		deletion (recursion)

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
	node.label = '<div style="text-align:center;">'+graphicNodeElt.dataName+'</div>';

	setUpGraphicNode(graphicNodeElt);	
	render();
}

// Update graphic, take care of block case, generate outputs
function setUpGraphicNode(graphicNodeElt){
	// Update graphical node style of current node
	styleGraphicNode(graphicNodeElt.category, graphicNodeElt.id);

	// Generate block of questions if necessary
	if(graphicNodeElt.category == "block"){
		setNewGraphicBlock(graphicNodeElt.id, graphicNodeElt.dataId);		
	}

	// Regarding number of Outputs, draw new nodes if necessary
	for (var i = 0; i < graphicNodeElt.targets.length; i++) {
		// Configure/Get answer text
		var answer = '';
		if(graphicNodeElt.category == "block"){
			answer = "Block output";				
		}
		else if(graphicNodeElt.category == "question"){
			// DB mandatory binding
			for (var j = 0; j < questions.length; j++) {
				if(questions[j].id == graphicNodeElt.dataId){
					answer = questions[j].outputs[i];
					break;
				} 
			}
		}

		// Create or connect to a node
		var targetId = graphicNodeElt.targets[i];
		if(targetId == "New node"){
			targetId = createChildNode(graphicNodeElt.id, answer);
			graphicNodeElt.targets[i] = targetId;
		}
		else{
			targetGraphicNode(graphicNodeElt.id, targetId, answer);
		}
		styleGraphicNode(graphicNodeElt.category, targetId);
	}
}

// Create a child node of parentNodeId
function createChildNode(parentNodeId, edgeLabel){
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
		// console.log("nodeId :", nodesList[i], "base :", base+'_'+childLvl, "current pos :", childPosition);
	}

	var nodeId = base+'_'+childLvl+'_'+childPosition;
	createGraphicNode(nodeId);
	graphic.setEdge(parentNodeId, nodeId, {label:edgeLabel});

	// Return nodeId, to reference the created/used target
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
	var blockElt = getGraphicNodeElt('block', blockNodeDataId);
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

// Points to an existing node
function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
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

// Call from external
function deleteGraphicNode(nodeId){
	recursiveDelete(nodeId, 0);
	render();
}


// Delete recursively this node
function recursiveDelete(nodeId, depth){
	// Child node, with at least 2 parents : don't delete it
	if(depth != 0 && graphic.predecessors(nodeId).length > 1){
		return;
	}

	// Look at all children
	var children = graphic.successors(nodeId);
	if(children.length > 0){
		children.map(function(childId){
			recursiveDelete(childId, depth+1);
		});
	}

	// Start node : update predecessors
	if(depth == 0){
		// For all predecessors, remove the question which points to this current node
		graphic.predecessors(nodeId).map(function(parentId){
			// Look for this parent in the model and its targets
			var parentIndex = graphic.node(parentId).index,
				targets = graphicNodes[parentIndex].targets;

			// Update its targets list
			targets.forEach(function(t, idx){
				if(t == nodeId){
					targets[idx] = ""; // will  be cast to 'New node' string in dumpNode function
				}
			});
		});
	}

	// Update node data model
	var nodeIndex = graphic.node(nodeId).index;
	if(nodeIndex !== undefined){
		// Block case : delete parent node
		if(graphicNodes[nodeIndex].category == "block"){
			graphic.removeNode(nodeId+':');
		}

		// Remove element from graphicNodes model
		graphicNodes.splice(nodeIndex, 1);

		// Update other elements index (pointing nowhere is not funny)
		for (var i = 0; i < graphicNodes.length; i++) {
			var node = graphic.node(graphicNodes[i].id);
			if(node.index > nodeIndex){
				node.index--;
			}
		}
	}

	// Update graphical model
	graphic.removeNode(nodeId);	
}


function refreshChildren(nodeId){
	var parentId = graphic.inEdges(nodeId)[0].v,
		edgeLabel = getInEdgeLabel(parentId, nodeId);
	
	// Remove current node, and recreate it
	recursiveDelete(nodeId, 0);
	createGraphicNode(nodeId);
	graphic.setEdge(parentId, nodeId, {label:edgeLabel});
}


function getInEdgeLabel(parentId, nodeId){
	// get parent node
	var	parentNode = getGraphicNode(parentId);

	if(parentNode){
		var parentNodeElt = getGraphicNodeElt(parentNode.category, parentNode.dataId);
		if(parentNodeElt){
			var outputs = parentNodeElt.outputs,
				targets = parentNode.targets;

			for (var i = 0; i < targets.length; i++) {
				if(targets[i] == nodeId){
					return outputs[i];
				}
			}
		}
	}
}