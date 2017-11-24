html_information = `
<div id="add-informationModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissInformationModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new information to your decision tree</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="information-reference">Information identifier: </label>
					<br>
					<input id="information-reference" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="information-content">Information to ask: </label>
					<br>
					<textarea id="information-content" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
				
				<div class="form-group">
					<label for="information-details">Further information: </label>
					<br>
					<textarea id="information-details" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteInformationElt()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissInformationModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpInformation()">Save changes</button>
			</div>
		</div>
	</div>
</div>

`;

function injectInformationModal(){
	$('#modal-section').append(html_information);
};

currentInformationIndex = -1;
currentInformationId = undefined;

function loadInformation(index, resElt){
	currentInformationIndex = index;
	currentInformationId = resElt.id;
	$('#information-reference').val(resElt.name);
	$('#information-content').val(resElt.content);
	$('#information-details').val(resElt.details);
	$('#add-informationModal').modal('show');
}


function dumpInformation(){
	var error_log = "";
	if($('#information-reference').val() == ''){
		error_log += "Reference to this information is empty\n";
	}
	if($('#information-content').val() == ''){
		error_log += "Reference content is not set\n";
	}
	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var res = new InformationElt();
	

	// Save it into db
	saveData('Information', res, currentInformationId, selectedWork.id, function(success){
		if(success){
			injectData('information', currentInformationIndex, res, loadInformation);
			$('#data-editor').notify('Element saved in database', {position:'top-left', className:'success'});
			dismissInformationModal();				
		}
		else{
			$('.modal-header').notify("Failed to save element within database", {position:'bottom-left', className:'error'});
		}
	});
};

function dismissInformationModal(){
	$('#information-reference').val('');
	$('#information-content').val('');
	$('#information-details').val('');
	if(currentInformationIndex != -1){
		currentInformationIndex = -1;
	}
	if(currentInformationId != undefined){
		currentInformationId = undefined;
	}
	$('#add-informationModal').modal('hide');
};

function InformationElt(){
	this.id 		= undefined;
	this.name	 	= $('#information-reference').val();
	this.content 	= $('#information-content').val();
	this.details 	= $('#information-details').val();
};

function deleteInformationElt(){
	deleteData('Information', currentInformationId, dismissInformationModal);
}