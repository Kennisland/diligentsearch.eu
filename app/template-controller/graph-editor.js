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
zoom = undefined;
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

	/* Translation */
	zoom.translate([xCenterOffset, 100])
	  .scale(initialScale)
	  .event(svg);
	svg.attr('height', graphic.graph().height * initialScale + 40);

	/* Zoom */
	zoom.on("zoom", function() {
		svgGroup.attr("transform", 
			"translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
	});
	svg.call(zoom);

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
		else if(node.questionIndex !== undefined){
			// do nothing as this is a block question
			// console.log("Question belonging to a block : ", node.questionIndex);
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
	node.label = formatGraphicNodeLabel(graphicNodeElt.dataName);
	node.index = index-1;


	// Generate block of questions if necessary
	if(graphicNodeElt.category == "block"){
		setNewGraphicBlock(graphicNodeElt.id, graphicNodeElt.dataId);		
	}

	// Update graphical node style
	configGraphicNodeStyle(graphicNodeElt.category, graphicNodeElt.id);


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
		var targetId = graphicNodeElt.targets[i];
		if(targetId == "New node"){
			targetId = setNewGraphicNode(graphicNodeElt.id, answer);
			graphicNodeElt.targets[i] = targetId;
		}
		else{
			targetGraphicNode(graphicNodeElt.id, targetId, answer);
		}

		// Configure node style for blocks & questions
		configGraphicNodeStyle(graphicNodeElt.category, targetId);
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

		// Increase child position if position already taken
		if(nodesList[i].indexOf(base+'_'+childLvl+'_'+childPosition) == 0){
			childPosition++;		
		}
		// console.log("nodeId :", nodesList[i], "base :", base+'_'+childLvl, "current pos :", childPosition);
	}

	var nodeId = base+'_'+childLvl+'_'+childPosition;
	// console.log("creating node :", nodeId);
	createGraphicNode(nodeId);
	graphic.setEdge(parentNodeId, nodeId, {label:edgeLabel});

	// Return nodeId, to reference the created/used target
	return nodeId;
}

function setNewGraphicBlock(blockNodeId, blockNodeDataId){
	// Specific id definition
	var baseId = blockNodeId+":";

	// Register a parent node, which will help graphical identification of the block
	graphic.setNode(baseId, {style: 'fill: #d3d7e8'});
	graphic.setParent(blockNodeId, baseId);

	// For all questions, create id, node, edge, and register them as child of the created parent
	var blockElt = blocks[blockNodeDataId];
	for (var i = 0; i < blockElt.questions.length; i++) {

		// Generate question block id
		var questionBlockId = baseId + i;

		// Get question index to jump to question data model
		var idx = blockElt.questions[i];
		for (var j = 0; j < questions.length; j++) {

			if(idx == questions[j].id){
				var q = questions[j];
				graphic.setNode(questionBlockId, {id:questionBlockId, questionIndex:idx, label:formatGraphicNodeLabel(q.name)});
				graphic.setEdge(blockNodeId, questionBlockId);
				graphic.setParent(questionBlockId, baseId);
				graphic.node(questionBlockId).style = 'stroke: #000000; fill: #d3d7e8' ;
				graphic.node(questionBlockId).shape = 'ellipse';
				break;
			}
		}
	}
}

function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
}

function configGraphicNodeStyle(category, nodeId){
	var s = '';
	if(category == "result"){
		graphic.node(nodeId).style = s+'stroke: #57723E; stroke-width: 5;';
	}
	else if(category == "block"){
		graphic.node(nodeId).style = s;	
	}
	else if(category == "question"){
		graphic.node(nodeId).style = s;
	}
}

function formatGraphicNodeLabel(text){
	return text.replace(/_/g, '\r\n');
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
					targets[idx] = "";
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

		graphicNodes.splice(nodeIndex, 1);		
	}

	// Update graphical model
	graphic.removeNode(nodeId);	
}
