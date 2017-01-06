html_graphEditor = `
<div style="text-align:center">
	<h3>Decision process editor</h3>
	<small>Use this view to create and edit your decision process by configuring nodes to refer created elements of the data model</small>
</div>

<svg id="decision-process" class="svg-css"></svg>
`;



last_state = -1;
function injectGraphEditor(){
	$('#graph-editor').html(html_graphEditor);

	// Configure graph display if there is data to present / manipulate
	$('#display-data-model').bind("DOMAttrModified",function(event){
		if($(this).is(':visible') && last_state == -1){
			loadGraph();
			last_state = 1;
		}
		else if( ! $(this).is(':visible') && last_state == 1){
			resetGraph();
			last_state = -1;
		}
	});
}

function loadGraph(){
	initSVG();
	createGraphicNode('lvl_0');
	render();
}

function resetGraph(){
	$('#decision-process').html('');
	initSVG();
}



/*
 * SVG dagre D3 set up  
*/


// Graphical objects
svg = undefined;
svgGroup = undefined;
graphic = undefined;
initialScale = 0.75;

// Initiate the graphical object and the first node
function initSVG(){
	graphic = new dagreD3.graphlib.Graph({compound:true})
		.setGraph({})
		.setDefaultEdgeLabel(function() { return {}; });

	svg = d3.select("svg");
	svgGroup = svg.append("g");
	zoom = d3.behavior.zoom();
}

// Render the graphic to display
function render(){	
	graphic.nodes().forEach(function(id) {
		graphic.node(id).rx = graphic.node(id).ry = 5;
	});
	
	var render = new dagreD3.render();
	render(svgGroup, graphic);
	configSVG();
}

// Configure SVG features (centering, translation, zoom, click)
function configSVG(){	
	svg.attr('width', $('#graph-editor').width());	// Update svg width element based on display

	/* Centering */
	// var xCenterOffset = (svg.attr("width") - graphic.graph().width * 2) / 2;
	var xCenterOffset = (svg.attr("width") - graphic.graph().width) / 2;
	svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
	svg.attr("height", graphic.graph().height + 40);

	/* Click bindings with editor */
	d3.select("svg g").selectAll("g.node").each(function(v){		
		var node = graphic.node($(this).context.id);

		// Define default click event if this node has no index yet
		if(node.index !== undefined){
			$(this).off('click').on('click', function(event) {
				$('#node-graphic-id').val($(this).context.id);
				loadGraphicNode(node.index, graphicNodes[node.index]);
			});
		}
		else{
			// Define the custom click event to load node information
			$(this).off('click').on('click', function(event) {
				$('#node-graphic-id').val($(this).context.id);
				$('#config-nodeModal').modal('show');
			});
		}
	});
}


graphicNodes = [];
function createGraphicNode(id){
	graphic.setNode(id, {id:id, index:undefined, label:'Click to edit'});
}


function injectGraphicNodeData(index, graphicNodeElt){
	if(index != -1){
		// Rewrite 
		graphicNodes[index] = graphicNodeElt;
		index++;
	}
	else{
		// Push and create new graphical nodes
		index = graphicNodes.push(graphicNodeElt);
	}

	// Update drawable graphic node information
	var node = graphic.node($('#node-graphic-id').val());
	node.label = graphicNodeElt.dataName;
	node.index = index-1;

	// Regarding number of Outputs, draw new nodes if necessary
	for (var i = 0; i < graphicNodeElt.targets.length; i++) {

		// Get answer text
		if(graphicNodeElt.category == "block"){
			var answer = "Block output";				
		}
		else if(graphicNodeElt.category == "question"){
			var answer = questions[graphicNodeElt.dataId].outputs[i];
		}

		// Create or connect to a node
		if(graphicNodeElt.targets[i] == "New node"){
			setNewGraphicNode(graphicNodeElt.id, answer);
		}
		else{
			targetGraphicNode(graphicNodeElt.id, graphicNodeElt.targets[i], answer);
		}
	}
	render();
}


function setNewGraphicNode(parentNodeId, edgeLabel){
	// Extract id components
	var raw = parentNodeId.split('_'),
		base = raw[0],
		parentLvl = parseInt(raw[1]),
		childLvl = parentLvl + 1;

	// Get the position, to prevent node erasing
	var childPosition = 0,
		nodesList = graphic.nodes();
	for (var i = 0; i < nodesList.length; i++) {
		if(nodesList[i].indexOf(base+'_'+childLvl) == 0){
			childPosition++;
		}
		// console.log("nodeId :", nodesList[i], "base :", base+'_'+childLvl, "current pos :", childPosition);
	}

	var nodeId = base+'_'+childLvl+'_'+childPosition;
	// console.log("creating node :", nodeId);
	createGraphicNode(nodeId);
	graphic.setEdge(parentNodeId, nodeId, {label:edgeLabel});
}


function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
}


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
					targets.splice(idx, 1);
				}
			});
		});
	}

	// If this node is a cluster, delete parent node 
	// var nodeData = questionNodes[nodeId],
	// 	clusterId = questionNodes[nodeId].question.clusterNode;
	// if(nodeData.isBlock && clusterId != ""){
	// 	delete questionNodes[clusterId];
	// 	graphic.removeNode(clusterId);
	// }

	// Delete this node as we have not yet return from this call
	var nodeIndex = graphic.node(nodeId).index;
	delete graphicNodes[nodeIndex];
	graphic.removeNode(nodeId);	
}
