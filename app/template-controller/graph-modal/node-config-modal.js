html_nodeConfig = `
<div id="config-nodeModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissNodeModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Node configuration panel</h4>

				<input id="node-graphic-id" type="hidden"/>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="node-category">Category: </label>
					<br>
					<select id="node-category" style="width:100%">
						<option value="" SELECTED> 	Choose a category	</option>
						<option value="question"> 	Question 			</option>
						<option value="block"> 		Block of questions 	</option>
						<option value="result"> 	Result 				</option>
					</select>			
				</div>

				<div class="form-group">
					<label for="node-data">Select a data: </label>
					<br>
					<input id="node-data" class="ui-autocomplete" type="text" style="width:100%"/>
					<input id="node-data-id" type="hidden" style="width:100%"/>
				</div>

				<div id="node-data-output-block" class="form-group">
					<label>Default outputs : </label>

					<div style="overflow:auto;">
						<div style="float:left; min-width:90%;max-width:90%; margin-left:3%">
							<table class"table table-responsive table-bordered table-stripped" style="width:100%">
								<thead>
									<th style="width:10%; text-align:center">#</th>
									<th style="width:50%; text-align:center">Output</th>
									<th style="width:40%; text-align:center">Target</th>
								</thead>
								<tbody id="node-data-output">
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteNode()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissNodeModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpNode()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;


function injectNodeConfigModal(){
	$('#modal-section').append(html_nodeConfig);
	$('#node-data-output-block').hide();
	configCategorySelection();
}

currentGraphicNodeIndex = -1;
function loadGraphicNode(index, graphicNodeElt){
	currentGraphicNodeIndex = index;
	$('#node-category').val(graphicNodeElt.category);
	$('#node-data').val(graphicNodeElt.dataName);
	$('#node-data-id').val(graphicNodeElt.dataId)


	// Db effect : retrieve data element based on its db id
	var dataElt = getGraphicNodeElt(graphicNodeElt.category, graphicNodeElt.dataId);
	if(!dataElt){
		console.log('DataElt not found in graphicNodeElt.category array');
	}
	else{
		loadDataOutputs(graphicNodeElt.category, dataElt);
		loadGraphicNodeTarget(graphicNodeElt);
	}
	
	$('#config-nodeModal').modal({backdrop: 'static', keyboard: false});
}


function dumpNode(){
	var error_log = "";
	if($('#node-category').val() == ""){
		error_log += "Node category not set\n"; 
	}	
	if($('#node-data').val() == ""){
		error_log += "Node data not correctly selected\n"; 
	}

	if(error_log != ""){
		alert(error_log);
		return;
	}

	var node = new GraphicNodeElt();
	var targets = retrieveSection('input', 'node-data-output-id-');
	targets.forEach(function(elt, idx){
		var t = elt.value != "" ? elt.value : 'New node';
		node.targets[idx] = t;
	});
	console.log("targets : ", node.targets);

	injectGraphicNodeData(currentGraphicNodeIndex, node);
	dismissNodeModal();
}

// Reset and hide the modal
function dismissNodeModal(){
	$('#node-graphic-id').val("");
	$('#node-category').val("");
	$('#node-data-id').val("");
	$('#node-data').val("");
	delOutputs();
	if(currentGraphicNodeIndex != -1){
		currentGraphicNodeIndex = -1;
	}
	$('#config-nodeModal').modal('hide');
}


function GraphicNodeElt(){
	this.id 		= $('#node-graphic-id').val();
	this.category	= $('#node-category').val();
	this.dataId		= $('#node-data-id').val();
	this.dataName 	= $('#node-data').val();
	this.targets	= [];
}

// Delete the current node
function deleteNode(){
	var nodeId = $('#node-graphic-id').val();

	// Root node case
	if(graphic.predecessors(nodeId).length == 0){
		alert('You cannot delete the root node.');
		return;
	}

	// Find this node within the graphic node model
	var found = false;
	for (var i = 0; i < graphicNodes.length; i++) {
		if(graphicNodes[i].id == nodeId){
			found = true;
			break;
		}
	}

	// Not saved node case
	// if(!found){
	// 	alert('The node you try to delete has not been saved yet.\nTry to delete the parent node instead');
	// 	return;
	// }

	// Delete recursively all successors nodes
	deleteGraphicNode(nodeId);
	dismissNodeModal();
}



/* 
 * HTML outputs management
*/

// Configure autocomplete based on selected category
function configCategorySelection(){

	
	$('#node-category').on('change', function(){
		// Reset necessary fields
		$('#node-data').val(''); 
		delOutputs();

		// Configure autocomplete
		var category = $(this).val(),
			sources = getDataSource(category);

		$('#node-data').autocomplete({
			minLength: 0,
			autocomplete: true,
			source: function(request, response){
				response($.map(sources, function(value, key){
					return {
						label: value.name
					}
				}));
			},
			open: function() { 
				var parent_width = $('#node-data').width();
				$('.ui-autocomplete').width(parent_width);
			},
			select: function(event, ui){
				$(this).val(ui.item.value);
				// Look for the id
				for (var i = 0; i < sources.length; i++) {
					if($(this).val() == sources[i].name){
						$('#node-data-id').val(sources[i].id);
						loadDataOutputs(category, sources[i]);
					}
				}
			}
		}).bind('focus', function(){ $(this).autocomplete("search"); } );
	});
}

// Load output texts for the dataElt defined
function loadDataOutputs(dataCategory, dataElt){
	delOutputs();	// Reset existing outputs

	if(dataCategory == 'result'){
		return;
	}
	else if(dataCategory == 'block'){
		addOutput();
		$('#node-data-output-0').val('Block output');
	}
	else if(dataCategory == 'question'){
		for (var i = 0; i < dataElt.outputs.length; i++) {
			addOutput();
			$('#node-data-output-'+i).val(dataElt.outputs[i]);			
		}
	}

	$('#node-data-output-block').show();	// Display output block
}

// Load targets value referencing outputs nodes
function loadGraphicNodeTarget(graphicNodeElt){	
	var targets = graphicNodeElt.targets,
		dataId 	= graphicNodeElt.dataId;

	for (var i = 0; i < targets.length; i++) {
		// Put id of node in hidden field and get the target dataId
		$('#node-data-output-id-'+i).val(targets[i]);
		
		var targetNode = getGraphicNode(targets[i]);		
		if(targetNode){
			var targetNodeElt = getGraphicNodeElt(targetNode.category, targetNode.dataId);
			console.log("\ttargetElt : ", targetNodeElt);
			if(targetNodeElt){
				$('#node-data-output-target-'+i).val(targetNodeElt.name);
			}
		}
		else{
			$('#node-data-output-target-'+i).val('');
		}
	}
}

// Add html content representing output
function addOutput(){
	$('#node-data-output').append(getNewOutput());
	var i = $('#node-data-output > tr').length - 1;
	configOutputComplete(i);
}

// Delete html content for outputs
function delOutputs(){
	$('#node-data-output').html('');
	$('#node-data-output-block').hide();
}

// Create 1 HTML output content
function getNewOutput(){
	var i = $('#node-data-output > tr').length,
		j = i+1,
		output = `
		<tr>
			<th style="text-align:center">`+j+`</th>
			<th style="padding:1%">
				<input id="node-data-output-`+i+`" style="margin-left:5%; margin-right:5%; max-width:90%" type="text" disabled="disabled"/>
			</th>
			<th style="padding:1%">
				<input id="node-data-output-target-`+i+`" class="ui-autocomplete" style="margin-left:5%; margin-right:5%; max-width:90%" placeholder="New node"/>
			</th>
			<th style="padding:1%">
				<input id="node-data-output-id-`+i+`" value="" type="hidden">
			</th>
		</tr>
	`;
	return output;
}

// Configure autocomplete plugin for outputs
function configOutputComplete(i){
	$('#node-data-output-target-'+i).autocomplete({
		minLength: 0,
		autocomplete: true,
		source: function(request, response){
			var potentialTargets = $.map(getPotentialTargets(), function(target){
				return {label:target.dataName, value:target.id}
			});
			response(potentialTargets);
		},
		open: function() { 
			var parent_width = $('#node-data-output-target-'+i).width();
			$('.ui-autocomplete').width(parent_width);
		},
		focus: function(event, ui){
			$(this).val(ui.item.label);
			return false;
		},
		select: function(event, ui){
			// Display label, but save the target value (id)
			$(this).val(ui.item.label);
			$('#node-data-output-id-'+i).val(ui.item.value);
			return false;
		}
	}).bind('focus', function(){ $(this).autocomplete("search"); } );
}


function getPotentialTargets(){
	var nodes 	= graphic.nodes(),
		parents = recursiveParents($('#node-graphic-id').val(), [], 0),
		inUse 	= [];

	retrieveSection('input', 'node-data-output-id-').forEach(function(elt){ 
		console.log("Elt : ", elt);
		if(elt.value != ""){
			inUse.push(elt.value);
		}
	});

	// Avoid parents and inUse
	var targetsId = $(nodes).not(parents).not(inUse).get();

	console.log("nodes", nodes);
	console.log("parents", parents);
	console.log("inUse", inUse);
}


// var targets = retrieveSection('input', 'node-data-output-id-');
// 	targets.forEach(function(elt, idx){
// 		var t = elt.value != "" ? elt.value : 'New node';
// 		node.targets[idx] = t;
// 	});


// function getNotDesiredNodes(){
// 	var a = getNotParentNodes(),
// 		b = getNotCurrentTargets();
// }

// function getNotParentNodes(){
// 	var nodes = graphic.nodes(),
// 		parents = recursiveParents($('#node-graphic-id').val(), [], 0),
// 		targetsId = $(nodes).not(parents).get(),
// 		targets = [];

// 	for (var i = 0; i < graphicNodes.length; i++) {
// 		var currentNode = graphicNodes[i];
// 		for (var j = 0; j < targetsId.length; j++) {
// 			if(currentNode.id == targetsId[j]){
// 				targets.push(currentNode);
// 				break;
// 			}
// 		}
// 	}
// 	return targets
// }

// function getNotCurrentTargets(){
// 	var nodes = graphic.nodes(),
// 		currentTargetsId = retrieveSection('input', 'node-data-output-id-'),
// 		targetsId = $(nodes).not(currentTargetsId).get();
	
// 	for (var i = 0; i < graphicNodes.length; i++) {
// 		var currentNode = graphicNodes[i];
// 		for (var j = 0; j < targetsId.length; j++) {
// 			if(currentNode.id == targetsId[j]){
// 				targets.push(currentNode);
// 				break;
// 			}
// 		}
// 	}
// 	console.log(targets);
// 	return targets;
// }