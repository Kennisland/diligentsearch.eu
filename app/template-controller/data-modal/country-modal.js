html_addCountry = `
<div id="add-countryModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissCountryModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new jurisdiction</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="country-code">Country code: </label>
					<br>
					<input id="country-code" type="text" style="width:100%" placeholder="NL"/>					
				</div>
				<div class="form-group">
					<label for="country-name">Country name: </label>
					<br>
					<input id="country-name" type="text" style="width:100%" placeholder="Netherlands"/>					
				</div>

			</div>

			<div class="modal-footer">
				<!--button type="button" class="btn btn-danger pull-left" onclick="deleteCountry()">Delete</button>-->
				<button type="button" class="btn btn-default" onclick="dismissCountryModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpCountry()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;

function injectCountryModal(){
	$('#modal-section').append(html_addCountry);
}


function dumpCountry(){
	var error_log = "";
	if($('#country-code').val() == ''){
		error_log += "Country code is empty\n";
	}
	if($('#country-name').val() == ''){
		error_log += "Country name is empty\n";
	}

	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var country = new CountryElt();
	saveCountry(country);
}

function CountryElt(){
	this.code 	= $('#country-code').val();
	this.name 	= $('#country-name').val();
}

function saveCountry(country){
	function cb(success){
		if(success){
			getCountry();
			$('#data-editor').notify('Country inserted with success in database', {position:'top-left', className:'success'});
			dismissCountryModal();				
		}
		else{
			$('.modal-header').notify('Failed to save country within database', {position:'bottom-left', className:'error'});
		}
	};

	saveElt('Country', country, '', cb);
}

function dismissCountryModal(){
	$('.modal-body > input').val('');
	$('#add-countryModal').modal('hide');
}
