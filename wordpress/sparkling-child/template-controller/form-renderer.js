html_formRenderer =`
	<div id="work-data-selected-save" style="display:none">
		<button id="work-print-btn" type="button" class="btn btn-primary pull-left" onclick="printPDF()">Get Pdf</button>
		<button id="work-reset-btn" type="button" class="btn btn-primary pull-left" onclick="showresetCalculator()">Reset</button>
		<button id="work-save-btn" type="button" class="btn btn-success pull-right" onclick="saveForm()">Save</button>
	</div>	

	<h2>Search</h2>
	<div id="search-report-ref"></div>

	<div class="form-group">	
		<label for="choose-country">
			Select the jurisdiction you want to determine an orphan work in:
		</label>
		<br>
		<select id="choose-country">
			<option value="">Choose a country</option>
		</select>
	</div>

	<div id="country-data-selected" class="form-group" style="display:none">
		<label>
			Language : 
		</label>
		<br>
		<select id="choose-lg">
			<option value="">Default</option>
		</select>
	</div>	


	<div id="language-selected" class="form-group" style="display:none"></div>

	<div id="work-type-selected" class="form-group" style="display:none">
		<label for="choose-work">
			Of what type of work do you want to determine the orphan work status?
		</label>
		<br>
		<select id="choose-work">
			<option value="">Choose a type of work</option>
		</select>
	</div>


	<div id="work-data-selected" style="display:none"></div>

	<div id="form-warningModal" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title">Warning</h3>
				</div>

				<div class="modal-body">
					<p>
						Changing a field can result in losing information.
						Do you want to proceed anyway ?
					</p>
					<div id="form-warning-modal-is-link" style="display:none">
						<p>
							URL detected within this field. You can open it by clicking the redirect button.
						</p>
					</div>
				</div>

				<div class="modal-footer">
					<button id="form-warning-modal-redirect" type="button" class="btn btn-success pull-left" style="display:none">Redirect</button>
					<button id="form-warning-modal-cancel" type="button" class="btn btn-default">Cancel</button>
					<button id="form-warning-modal-proceed" type="button" class="btn btn-primary">Confirm changing value</button>
				</div>
			</div>
		</div>
	</div>

	<div id="form-resetModal" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title">Warning</h3>
				</div>

				<div class="modal-body">
					<p>
						Resetting the calculator will result in losing information that has not been saved.
						Do you want to proceed anyway?
					</p>
				</div>

				<div class="modal-footer">
					<button id="form-reset-modal-redirect" type="button" class="btn btn-success pull-left" style="display:none">Redirect</button>
					<button id="form-reset-modal-cancel" type="button" class="btn btn-default" onclick="hideResetModal();">Cancel</button>
					<button id="form-reset-modal-proceed" type="button" class="btn btn-primary" onclick="hideResetModal();resetCalculator();">Reset calculator</button>
				</div>
			</div>
		</div>
	</div>

	<div id="form-saveModal" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title">Save successful</h3>
				</div>

				<div class="modal-body">
					<p>Diligent search saved.</p>
					<div id="search-report-notice"></div>
				</div>

				<div class="modal-footer">
					<button id="form-saveModal-close" type="button" class="btn btn-default" onclick="hideSaveModal();">Close</button>
				</div>
			</div>
		</div>
	</div>

	<div id="form-infoModal" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title">Information</h3>
				</div>

				<div class="modal-body">
					<p id="form-infoModal-content"></p>
				</div>

				<div class="modal-footer">
					<button id="form-infoModal-close" type="button" class="btn btn-default" onclick="hideInfo();">Close</button>
				</div>
			</div>
		</div>
	</div>
`;

function injectFormRenderer(){
	getCountryForm();
	$('#choose-country').attr("disabled", false);
	$('#choose-lg').attr("disabled", false); 
	$('#form-renderer').html(html_formRenderer);
}

/*
	Get data model
*/
function getCountryForm(){
	// Reset countries data
	countries = [];
	injectCountriesIntoForm();
	$('#country-data-selected').hide();

	// Get countries data
	$.when(ajaxGetCountries()).then(
		function(result){
			countries = result;
			injectCountriesIntoForm();
		}, 
		function(error){
			$('#form-renderer').notify("Error in countries retrieval", {position:'bottom-left', className:'error'});
	});
}

function getLanguages(){
	languages = [];
	$.when(ajaxGetLanguages()).then(
		function(success){
			if(success.lg){
				languages = success.lg;
			}
			if(languages.length == 0){
				languages.push('Default');
			}

			// Inject it into select tag
			injectLanguageIntoForm();
			$('#choose-lg').on('change', function(){
				ajaxSetTranslation($(this).val());
				var countryId = $('#choose-country option:selected').val()
				getWorkForm(countryId);
				getSharedValue(countryId);
				$('#language-selected').show();	
				$('#choose-country').attr("disabled", true);
				$('#choose-lg').attr("disabled", true); 
				
			});
		},
		function(error){
			$('#form-renderer').notify("Error in languages retrieval", {position:'bottom-left', className:'error'});
		});
}



function getWorkForm(countryId){
	// Reset works data
	works = [];
	$('div [id^="work-data-selected"]').hide();

	// Get works data
	$.when(ajaxGetWorks(countryId)).then(
		function(result){
			works = result;
			//  start the new calculator
			injectWorksIntoForm();
		},
		function(error){
			$('#form-renderer').notify("Error in type of work retrieval", {position:'bottom-left', className:'error'});
	});
}

function getSharedValue(countryId){
	$.when(ajaxGetElt('SharedUserInput', countryId), ajaxGetElt('SharedRefValue', countryId)).then(
		function(resultUserInputs, resultRefValues){
			userInputs = resultUserInputs[0].map(function(elt){ return JSON.parse(elt.value); 	});;
			referenceValues = resultRefValues[0].map(function(elt){ 	return JSON.parse(elt.value); 	});;
		},
		function(error){
			$('#form-renderer').notify("Error in global data retrieval", {position:'bottom-left', className:'error'});
	});	
}

function getDataForm(workId){	
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId), ajaxGetElt('Source', workId), ajaxGetElt('Information', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree, resultSources, resultInformation){
			questions 	= resultQuestions[0].map(function(elt){ 	return JSON.parse(elt.value); 	});
			blocks 		= resultBlocks[0].map(function(elt){ 		return JSON.parse(elt.value); 	});
			results 	= resultResults[0].map(function(elt){ 		return JSON.parse(elt.value); 	});
			source	 	= resultSources[0].map(function(elt){ 		return JSON.parse(elt.value); 	});
			information	= resultInformation[0].map(function(elt){ 	return JSON.parse(elt.value); 	});
			decisionTree = JSON.parse(resultDecisionTree[0][0].value);
			logData();
			
			// Load general information Fields
			loadGeneralInformation(information);
			
			// Load list of sources to be consulted. 
			loadSources(source);
			
				
			// Now we have data, we do something --> load first element
			loadElement();			
		},
		function(error){
			$('#form-renderer').notify("Error in specific data retrieval", {position:'bottom-left', className:'error'});
	});
}




/*
	HTML injection and JS bindings
*/
function injectLanguageIntoForm(){
	var lgContent = '<option value="">Choose a language</option>';
	for (var i = 0; i < languages.length; i++) {
		var lgName = languages[i],
			displayedName = languages[i].charAt(0).toUpperCase() + languages[i].slice(1);
		lgContent += '<option value="'+lgName+'">'+displayedName+'</option>';
	}
	$('#choose-lg').html(lgContent);
}

function injectCountriesIntoForm(){
	var selectContent = '<option value="">Choose a country</option>';

	countries.sort(function(a, b) {
	  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
	  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
	  if (nameA < nameB) {
		return -1;
	  }
	  if (nameA > nameB) {
		return 1;
	  }
	  // names must be equal
	  return 0;
	});

	for (var i = 0; i < countries.length; i++) {
		var countryId = countries[i].id,
			countryName = countries[i].name;
		selectContent += '<option value="'+countryId+'">'+countryName+'</option>';
	}
	$('#choose-country').html(selectContent);
	bindLanguage();
}

function bindLanguage(){
	$('#choose-country').on('change', function(){
		ajaxSetCountry($('#choose-country option:selected').text().toLowerCase());
		var countryId = $(this).val();
		if(countryId == ""){
			$('#country-data-selected').hide();			
		}
		else{
			//Reset calculator
			works = [];
			$('div [id^="work-type-selected"]').hide();
			$('div [id^="work-data-selected"]').hide();
			//Get languages
			getLanguages();
			$('#country-data-selected').show();	
		}
	});	
}

function injectWorksIntoForm(){
	var selectContent = '<option value="">Choose a type of work</option>';
	for (var i = 0; i < works.length; i++) {
		var workId = works[i].id,
			workName = works[i].name;
		selectContent += '<option value="'+workId+'">'+workName+'</option>';
	}
	$('#choose-work').html(selectContent);
	$('#work-type-selected').show();
	bindDecisionTreeData();
}

function bindDecisionTreeData(){
	oldWorkId = "";
	$('#choose-work').on('change', function(){

		if($(this).val() != oldWorkId){
			var workId = $(this).val();
			if(workId == ""){
				works = [];
				$('div [id^="work-data-selected"]').hide();
			}
			else{
				getDataForm(workId);
				$('#work-data-selected').html('');
				$('div [id^="work-data-selected"]').show();
			}			
			oldWorkId = $(this).val();
		}
	});
}

function updateSearchReportId(){
	$('#search-report-ref').html('<Label>Research ID:</Label> <p>'+dumpedForm.webHook + '</p>');
}

function showSaveSuccesfull() {
	$('#search-report-notice').text('Research ID: '+dumpedForm.webHook);
	$('#form-saveModal').modal('show');
}

/*
	Generic HTML element injection for the rest of Form
*/
function injectElementIntoForm(html){
	$('#work-data-selected').append(html);
}

function injectElementAfterForm(html){
	$( html ).insertAfter( '#work-data-selected' );
}


function showresetCalculator() {
	$('#form-resetModal').modal('show');
}
/**
 * Close the more reset pop-up
 */
function hideResetModal(){
	$('#form-resetModal').modal('hide');
}

/**
 * Reset calculator
 */
function resetCalculator(){
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	works = [];
	// reset hook
	dumpedForm = [];
	hook = '';
	// remove result
	$('.work-result').hide();
	$('#search-report-ref').html('');
	$('div [id^="work-data-selected"]').hide();
	// reload form renderer
	injectFormRenderer();
}