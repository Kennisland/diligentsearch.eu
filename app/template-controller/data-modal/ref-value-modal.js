html_refValue = `
<div id="add-refValueModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissRefValueModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new reference value</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="reference-name">Reference identifier: </label>
					<br>
					<input id="reference-name" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="reference-value">Value associated to this reference: </label>
					<br>
					<input id="reference-value" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="reference-details">Further information: </label>
					<br>
					<textarea id="reference-details" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteRefValueElt()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissRefValueModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpRefValue()">Save changes</button>
			</div>
		</div>
	</div>
</div>

`;

function injectRefValueModal(){
	$('#modal-section').append(html_refValue);
};

currentReferenceIndex = -1;
currentReferenceId = undefined;
function loadRefValue(index, refElt){
	currentReferenceIndex = index;
	currentReferenceId = refElt.id;
	$('#reference-name').val(refElt.name);
	$('#reference-value').val(refElt.value);
	$('#reference-details').val(refElt.information);
	$('#add-refValueModal').modal('show');
}


function dumpRefValue(){
	var error_log = "";
	if($('#reference-name').val() == ''){
		error_log += "Reference name is empty\n";
	}
	if($('#reference-value').val() == ''){
		error_log += "Reference value is not set\n";
	}
	if(error_log != ""){
		$('.modal-header').notify(error_log, 'error');
		return;
	}

	var ref = new ReferenceElt();
	
	// Save it into db
	saveData('SharedRefValue', ref, currentReferenceId, selectedCountry.id, function(success){
		if(success){
			injectRefValueData(currentReferenceIndex, ref);	
			$.notify('Element saved in database', 'success')
			dismissRefValueModal();				
		}
		else{
			$('.modal-header').notify("Failed to save element within database", 'error');
		}		
	});
};


function dismissRefValueModal(){
	// Reset fields and modal
	$('#reference-name').val('');
	$('#reference-value').val('');
	$('#reference-details').val('');

	if(currentReferenceIndex != -1){
		currentReferenceIndex = -1;
	}
	if(currentReferenceId != undefined){
		currentReferenceId = undefined;
	}
	$('#add-refValueModal').modal('hide');
}


// Reference values for manager
function ReferenceElt(){
	this.id 			= undefined;
	this.name 			= $('#reference-name').val();
	this.value 			= $('#reference-value').val();
	this.information 	= $('#reference-details').val();
}

function deleteRefValueElt(){
	if(currentReferenceId !== undefined){
		removeElt('SharedRefValue', currentReferenceId, function(success){
			if(success){
				$('#data-referenceValues-'+currentReferenceId).remove();
				$.notify('Element deleted from database', 'success');
				dismissRefValueModal();
			}else{
				$('.modal-header').notify("Cannot remove element", 'error');
			}
		});	
	}
}