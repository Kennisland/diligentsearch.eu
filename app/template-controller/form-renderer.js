html_formRenderer =`
	<h2 id="search-report-ref">Search-report not saved yet</h2>

	<label>
		Language : 
		<select id="choose-lg">
			<option value="">Default</option>
		</select>
	</label>

	<div id="language-selected" class="form-group" style="display:none">
		<label for="choose-country">
			Select the jurisdiction you want to determine an orphan work in:
		</label>
		<br>
		<select id="choose-country">
			<option value="">Choose a country</option>
		</select>
	</div>

	<div id="country-data-selected" style="display:none">

		<div class="form-group">
			<label for="choose-work">
				Of what type of work do you want to determine the orphan work status?
			</label>
			<br>
			<select id="choose-work">
				<option value="">Choose a type of work</option>
			</select>
		</div>


		<div id="work-data-selected" style="display:none">			
		</div>

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

		<div id="work-data-selected-save" style="display:none">
			<button id="work-print-btn" type="button" class="btn btn-primary pull-left" onclick="printPDF()">Get Pdf</button>
			<button id="work-save-btn" type="button" class="btn btn-success pull-right" onclick="saveForm()">Save</button>
		</div>		
	</div>
`;

function injectFormRenderer(){
	getLanguages();
	$('#form-renderer').html(html_formRenderer);
}

/*
	Get data model
*/
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
				getCountryForm();
				$('#language-selected').show();
			});
		},
		function(error){
			$('#form-renderer').notify("Error in languages retrieval", {position:'bottom-left', className:'error'});
		});
}


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

function getWorkForm(countryId){
	// Reset works data
	works = [];
	$('div [id^="work-data-selected"]').hide();

	// Get works data
	$.when(ajaxGetWorks(countryId)).then(
		function(result){
			works = result;
			injectWorksIntoForm();
		},
		function(error){
			$('#form-renderer').notify("Error in type of work retrieval", {position:'bottom-left', className:'error'});
	});
}

function getSharedValue(countryId){
	$.when(ajaxGetElt('SharedUserInput', countryId), ajaxGetElt('SharedRefValue', countryId)).then(
		function(resultUserInputs, resultRefValues){
			userInputs = resultUserInputs[0].map(function(elt){ return JSON.parse(elt.json); 	});;
			referenceValues = resultRefValues[0].map(function(elt){ 	return JSON.parse(elt.json); 	});;
		},
		function(error){
			$('#form-renderer').notify("Error in global data retrieval", {position:'bottom-left', className:'error'});
	});	
}

function getDataForm(workId){	
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree){
			questions 	= resultQuestions[0].map(function(elt){ return JSON.parse(elt.json); 	});
			blocks 		= resultBlocks[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			results 	= resultResults[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			decisionTree = JSON.parse(resultDecisionTree[0][0].json);
			logData();
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
	for (var i = 0; i < countries.length; i++) {
		var countryId = countries[i].id,
			countryName = countries[i].name;
		selectContent += '<option value="'+countryId+'">'+countryName+'</option>';
	}
	$('#choose-country').html(selectContent);
	bindTypeOfWork();
}

function bindTypeOfWork(){	
	$('#choose-country').on('change', function(){
		ajaxSetCountry($('#choose-country option:selected').text().toLowerCase());
		var countryId = $(this).val();
		if(countryId == ""){
			$('#country-data-selected').hide();			
		}
		else{
			getWorkForm(countryId);
			getSharedValue(countryId);
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
	$('#search-report-ref').text('Search-report('+dumpedForm.webHook+')');
}



/*
	Generic HTML element injection for the rest of Form
*/
function injectElementIntoForm(html){
	$('#work-data-selected').append(html);
}