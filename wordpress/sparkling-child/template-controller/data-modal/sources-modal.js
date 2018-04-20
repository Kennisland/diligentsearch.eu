html_sources = `
<div id="add-sourcesModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissSourcesModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Bulk add new sources to your decision tree (advanced usage)</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<p>Add multiple sources by adding tab seperated lubes.</p>
					<p>Each source is one a single. Sources should be source-reference<tab>source-content<tab>source-details<tab>source-url</p>
					<p>Only used by editor with experience creating tab seperated files.</p>
					<label for="sources">Sources: </label>
					<br>
					<textarea id="sources-content" rows="5" style="min-width:100%; max-width:100%"></textarea>				
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-default" onclick="dismissSourcesModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="processSources()">Add Sources</button>
			</div>
		</div>
	</div>
</div>

`;

function injectSourcesModal(){
	$('#modal-section').append(html_sources);
};

function processSources(){
	error_log = "";
	if($('#sources-content').val() == ''){
		error_log += "Source list is empty\n";
	}
	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}
	
	var lines = $('#sources-content').val().split('\n');
	for(var i = 0;i < lines.length;i++){
		line = lines[i];
		values = line.split('\t');
		categoryLabel	= values[0];
		sourceReference = values[1]; 
		sourceContent 	= values[2];
		sourceDetails 	= values[3];
		sourceUrl		= values[4];
		saveSource(sourceReference, sourceContent, sourceDetails, sourceUrl, categoryLabel);
	}
}

function saveSource(sourceReference, sourceContent, sourceDetails, sourceUrl, categoryLabel){
	var error_log = "";
	if(sourceReference == ''){
		error_log += "Reference to this source is empty\n";
	}
	if(sourceContent == ''){
		error_log += "Reference content is not set\n";
	}
	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var res = new BulkSourceElt(sourceReference, sourceContent, sourceDetails, sourceUrl, categoryLabel);
	console.log('Adding source', res, currentSourceId, selectedWork.id);
	// Save it into db
	saveData('Source', res, currentSourceId, selectedWork.id, function(success){
		if(success){
			injectData('source', currentSourceIndex, res, loadSource);
			$('#data-editor').notify('Element saved in database', {position:'top-left', className:'success'});
			dismissSourcesModal();				
		}
		else{
			$('.modal-header').notify("Failed to save element within database", {position:'bottom-left', className:'error'});
		}
	});
};

function dismissSourcesModal(){
	$('#sources-content').val('');
	if(currentSourceIndex != -1){
		currentSourceIndex = -1;
	}
	if(currentSourceId != undefined){
		currentSourceId = undefined;
	}
	$('#add-sourcesModal').modal('hide');
};

function BulkSourceElt(sourceReference, sourceContent, sourceDetails, sourceUrl, categoryLabel){
	this.id 		= undefined;
	this.name	 	= sourceReference;
	this.content 	= sourceContent;
	this.details 	= sourceDetails;
	this.url		= sourceUrl;
	this.category	= categoryLabel;
	
};