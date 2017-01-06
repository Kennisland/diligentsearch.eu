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
									<th style="width:50%; text-align:center">Answer</th>
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
	// Change the autocomplete according to the selected value
	configCategorySelection();
}

currentGraphicNodeId = -1;
currentGraphicNodeIndex = -1;
function loadGraphicNode(index, graphicNodeElt){

	currentGraphicNodeIndex = index;
	currentGraphicNodeId = graphicNodeElt.id;

	$('#node-category').val(graphicNodeElt.category);
	$('#node-data').val(graphicNodeElt.dataName);
	$('#node-data-id').val(graphicNodeElt.id)

	var dataElt = getDataSource(graphicNodeElt.category)[graphicNodeElt.dataId];
	loadDataOutputs(graphicNodeElt.category, dataElt);

	$('#config-nodeModal').modal('show');
}

function dumpNode(){
	var error_log = "";
	if($('#node-category').val() == ""){
		error_log += "Node category not set\n"; 
	}	
	if($('#node-data').val() == ""){
		error_log += "Node data not correctly selected\n"; 
	}

	var node = new GraphicNodeElt();
	node.id = getGraphicNodeId();

	// Get targets
	var targets = retrieveSection('input', 'node-data-output-target-');
	targets.forEach(function(elt, idx){
		var t = elt.value;
		node.targets[idx] = t;
	});



	if(error_log != ""){
		alert(error_log);
		return;
	}

	console.log("dumping : ", node);

	injectGraphicNodeData(currentGraphicNodeIndex, node);
	dismissNodeModal();
}

function dismissNodeModal(){
	// Reset fields
	$('.modal-body > input').val('');
	delOutputs();

	if(currentGraphicNodeIndex != -1){
		currentGraphicNodeIndex = -1;
	}

	if(currentGraphicNodeId != -1){
		currentGraphicNodeId = -1;
	}

	$('#config-nodeModal').modal('hide');
}


function GraphicNodeElt(){
	this.id 		= undefined;
	this.category	= $('#node-category').val();
	this.dataId		= $('#node-data-id').val();
	this.dataName 	= $('#node-data').val();
	this.targets	= [];
}

function getGraphicNodeId(){
	if(currentGraphicNodeId == -1){
		var l = graphicNodes.length;
		if(l == 0){
			return 0;
		}else{
			return graphicNodes[l-1].id + 1;
		}
	}
	else{
		return currentGraphicNodeId;
	}
}


/* 
 * HTML outputs management
*/

function configCategorySelection(){
	$('#node-category').on('change', function(){
		// Reset necessary fields
		$('#node-data').val(''); 
		delOutputs();

		// Configure autocomplete
		var category = $(this).val(),
			sources = getDataSource(category);

		$('#node-data').autocomplete({
			source: function(request, response){
				response($.map(sources, function(value, key){
					return {
						label: value.name
					}
				}));
			},
			minLength: 0,
			autocomplete: true,
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
		});
	});
}

function getDataSource(category){
	if(category == 'question')
		return questions;
	if(category == 'block')
		return blocks;
	if(category == 'result')
		return results;
}

function loadDataOutputs(dataCategory, dataElt){
	// Reset exsting outputs
	delOutputs();

	// If it's a result, nothing to configure
	if(dataCategory == 'result'){
		return;
	}

	// If block, only one output is needed
	if(dataCategory == 'block'){
		addOutput();
		$('#node-data-output-0').val('Block output');
	}

	// If question, load each predefined answers for configuration
	if(dataCategory == 'question'){
		for (var i = 0; i < dataElt.outputs.length; i++) {
			addOutput();
			$('#node-data-output-'+i).val(dataElt.outputs[i]);			
		}
	}

	// Display the output section fiannly
	$('#node-data-output-block').show();
}

function addOutput(){
	$('#node-data-output').append(getNewOutput());
	var i = $('#node-data-output > tr').length - 1;
	configOutputComplete(i);
}

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
				<input id="node-data-output-id-`+i+`" type="hidden">
			</th>
		</tr>
	`;
	return output;
}


nodes = ['lvl_0', 'lvl_1', 'lvl_2'];
function configOutputComplete(i){
			// function(request, response){
			// 	response($.map(graphic.nodes, function(value, key){
			// 		return {
			// 			label: value.label
			// 		}
			// 	}));
			// },
	$('#node-data-output-target-'+i).autocomplete({
		minLength: 0,
		source: nodes,		
		autocomplete: true,
		open: function() { 
			var parent_width = $('#node-data-output-target-'+i).width();
			$('.ui-autocomplete').width(parent_width);
		}
	});
}

function delOutputs(){
	$('#node-data-output').html('');
	$('#node-data-output-block').hide();
}