html_source = `
<div id="add-sourceModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissSourceModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new source to your decision tree</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="source-reference">Source identifier: </label>
					<br>
					<input id="source-reference" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="source-content">Source to display: </label>
					<br>
					<textarea id="source-content" type="text" style="min-width:100%; max-width:100%"/>					
				</div>

				<div class="form-group">
					<label for="source-category">Category of source: </label>
					<br>
					<textarea id="source-category" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
				
				<div class="form-group">
					<label for="source-details">Further information: </label>
					<br>
					<textarea id="source-details" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
				
				<div class="form-group">
					<label for="source-link">Weblink to resource: </label>
					<br>
					<textarea id="source-link" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteSourceElt()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissSourceModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpSource()">Save changes</button>
			</div>
		</div>
	</div>
</div>

`;

function injectSourceModal(){
	$('#modal-section').append(html_source);
};

currentSourceIndex = -1;
currentSourceId = undefined;
function loadSource(index, resElt){
	currentSourceIndex = index;
	currentSourceId = resElt.id;
	$('#source-reference').val(resElt.name);
	$('#source-content').val(resElt.content);
	$('#source-details').val(resElt.details);
	$('#source-category').val(resElt.category);
	$('#source-link').val(resElt.url);
	$('#add-sourceModal').modal('show');
}


function dumpSource(){
	var error_log = "";
	if($('#source-reference').val() == ''){
		error_log += "Reference to this source is empty\n";
	}
	if($('#source-content').val() == ''){
		error_log += "Reference content is not set\n";
	}
	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var res = new SourceElt();
	
	// Save it into db
	saveData('Source', res, currentSourceId, selectedWork.id, function(success){
		if(success){
			injectData('source', currentSourceIndex, res, loadSource);
			$('#data-editor').notify('Element saved in database', {position:'top-left', className:'success'});
			dismissSourceModal();				
		}
		else{
			console.log("Failed to save element within database");
			$('.modal-header').notify("Failed to save element within database", {position:'bottom-left', className:'error'});
		}
	});
};

function dismissSourceModal(){
	$('#source-reference').val('');
	$('#source-content').val('');
	$('#source-details').val('');
	$('#source-link').val('');
	$('#source-category').val('');
	if(currentSourceIndex != -1){
		currentSourceIndex = -1;
	}
	if(currentSourceId != undefined){
		currentSourceId = undefined;
	}
	$('#add-sourceModal').modal('hide');
};

function SourceElt(){
	this.id 		= undefined;
	this.name	 	= $('#source-reference').val();
	this.content 	= $('#source-content').val();
	this.details 	= $('#source-details').val();
	this.url		= $('#source-link').val();
	this.category	= $('#source-category').val();
};

function deleteSourceElt(){
	deleteData('Source', currentSourceId, dismissSourceModal);
}