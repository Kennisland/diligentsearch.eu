html_graphEditor = `
<div style="text-align:center">
	<h3>Decision process editor</h3>
	<small>Use this view to create and edit your decision process by configuring nodes to refer created elements of the data model</small>
</div>

<div id="decision-process-save" style="text-align:center; padding: 10px; display: none">
	<button type="button" class="btn btn-primary" onclick="saveDecisionTree()">Save Decision Process</button>
</div>

<svg id="decision-process" class="svg-css"></svg>
`;



last_state = -1;
function injectGraphEditor(){
	$('#graph-editor').html(html_graphEditor);
	configureVisibility();
}

function configureVisibility(){
	// http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
	var isChromium = window.chrome,
		winNav = window.navigator,
		vendorName = winNav.vendor,
		isOpera = winNav.userAgent.indexOf("OPR") > -1,
		isIEedge = winNav.userAgent.indexOf("Edge") > -1,
		isIOSChrome = winNav.userAgent.match("CriOS");

	if(isIOSChrome || (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) ){
		// is Google Chrome
		var element = $('#display-data-model')[0];
		var observer = new WebKitMutationObserver(function (mutations) {
		  mutations.forEach(attrModified);
		});
		observer.observe(element, { attributes: true, subtree: false });

		function attrModified(mutation) {
			if($('#display-data-model').is(':visible') && last_state == -1){
				loadGraph();
				last_state = 1;
			}
			else if( ! $('#display-data-model').is(':visible') && last_state == 1){
				resetGraph();
				last_state = -1;
			}
		}
	} else { 
		// not Google Chrome 
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
}



function loadGraph(){
	$('#decision-process-save').show();
	initSVG();
}

function resetGraph(){
	$('#decision-process').html('');
	$('#decision-process-save').hide();
}


// Save a copy, from which we remove not necessary properties
function saveDecisionTree(){
	var toSave = graphicNodes;
	toSave.forEach(function(node){
		delete node.dataName;
	});

	if(graphicNodesDatabaseId === undefined){
		saveElt('DecisionTree', toSave, selectedWork.id, function(saved){
			if(saved){
				alert('Decision tree correctly saved in database');
			}
			else{
				alert('Error in decision tree saving process');	
			}
		});
	}
	else{
		// Format the data to benefit of others standardized ajax calls
		var toSave = {id: graphicNodesDatabaseId, json: toSave};
		updateElt('DecisionTree', toSave, function(updated){
			if(updated){
				alert('Decision tree correctly updated in database');
			}
			else{
				alert('Error in decision tree updating process');	
			}
		});
	}
}

// Load DecisionTree from database
// Called from data-editor, as it requires the entire basic data model
function getDecisionTree(){

	$.when(ajaxGetElt('DecisionTree', selectedWork.id)).then(
		function(decisionTree){
			graphicNodes = JSON.parse(decisionTree[0].json);
			console.log("DecisionTree :", graphicNodes);

			if(graphicNodes.length == 0){
				createGraphicNode('lvl_0');
				render();
			}
			else{
				//Dump me everything
				graphicNodesDatabaseId = decisionTree[0].id;

				graphicNodes.forEach(function(node, idx){

					createGraphicNode(node.id);
					node.targets.forEach(function(targetId){
						createGraphicNode(targetId);
					})

					// Find out what is the name of this node
					node.dataName = 'Click to edit';
					var dataSource = getDataSource(node.category);
					for (var i = 0; i < dataSource.length; i++) {
						if( dataSource[i].id == node.dataId){
							node.dataName = dataSource[i].name;
							break;
						}
					}

					graphic.node(node.id).index = idx;
					graphic.node(node.id).label = '<div style="text-align:center;">'+node.dataName+'</div>';
					setUpGraphicNode(node);
				});
				render();
			}

		},
		function(error){
			console.log("get work ajaxGetUserInputs", error);
		}
	);
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


graphicNodesDatabaseId = undefined;
graphicNodes = [];
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

	//  Update drawable graphic node information
	node.index = index-1;
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
			targetId = setNewGraphicNode(graphicNodeElt.id, answer);
			graphicNodeElt.targets[i] = targetId;
		}
		else{
			targetGraphicNode(graphicNodeElt.id, targetId, answer);
		}

		styleGraphicNode(graphicNodeElt.category, targetId);
	}
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
	createGraphicNode(nodeId);
	graphic.setEdge(parentNodeId, nodeId, {label:edgeLabel});

	// Return nodeId, to reference the created/used target
	return nodeId;
}

function setNewGraphicBlock(blockNodeId, blockNodeDataId){

	// Register a parent node, which will help graphical identification of the block
	var clusterId = blockNodeId+":";
	graphic.setNode(clusterId, {
		id: clusterId
	});
	graphic.setParent(blockNodeId, clusterId);

	// DB effect : get back block element
	console.log("BlockElt : ", blockNodeId, blockNodeDataId);
	var blockElt = undefined;
	for (var i = 0; i < blocks.length; i++) {
	 	if( blocks[i].id == blockNodeDataId){
	 		blockElt = blocks[i];
	 		console.log("FOUND");
	 		break;
	 	}
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

function targetGraphicNode(originId, targetId, edgeLabel){
	graphic.setEdge(originId, targetId, {label:edgeLabel});
}

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
