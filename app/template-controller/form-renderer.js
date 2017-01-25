html_formRenderer =`
	<h2>Search-report()</h2>

	<div class="form-group">
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

		<div id="infoBox" class="form-infobox">
			<p id="infoBox-content"></p>
			<p><a onclick="hideInfo();">Close</a></p>
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
						<p>Changing a field can result in losing information.</p>
						<p>Do you want to proceed anyway ?</p>
					</div>

					<div class="modal-footer">
						<button type="button" id="form-warning-modal-cancel" class="btn btn-default">Cancel</button>
						<button type="button" id="form-warning-modal-proceed" class="btn btn-primary">Continue</button>
					</div>
				</div>
			</div>
		</div>

		<div id="work-data-selected-save" style="display:none">
			<button type="button" class="btn btn-primary pull-left" onclick="printPDF()">Get Pdf</button>
			<button type="button" class="btn btn-success pull-right" onclick="saveForm()">Save</button>
		</div>		
	</div>
`;


countries = [];
works = [];
userInputs = [];
refValues = [];
questions = [];
blocks = [];
results = [];
decisionTree = [];
dumpedForm = {
	webHook: undefined,
	json: ''
};


function injectFormRenderer(){
	getCountry();
	$('#form-renderer').html(html_formRenderer);
}

/*
	Get data model
*/

function getCountry(){
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
			alert(error.statusText);
	});
}

function getWork(countryId){
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
			alert(error.statusText);
	});
}

function getSharedValue(countryId){
	$.when(ajaxGetElt('SharedUserInput', countryId), ajaxGetElt('SharedRefValue', countryId)).then(
		function(resultUserInputs, resultRefValues){
			userInputs = resultUserInputs[0].map(function(elt){ return JSON.parse(elt.json); 	});;
			refValues = resultRefValues[0].map(function(elt){ 	return JSON.parse(elt.json); 	});;
		},
		function(error){
			alert(error.statusText);
	});	
}

function getData(workId){	
	$.when(ajaxGetElt('Question', workId), ajaxGetElt('Block', workId), ajaxGetElt('Result', workId), ajaxGetElt('DecisionTree', workId)).then(
		function(resultQuestions, resultBlocks, resultResults, resultDecisionTree){
			questions 	= resultQuestions[0].map(function(elt){ return JSON.parse(elt.json); 	});
			blocks 		= resultBlocks[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			results 	= resultResults[0].map(function(elt){ 	return JSON.parse(elt.json); 	});
			decisionTree = JSON.parse(resultDecisionTree[0][0].json);
			logData();

			// Now we have data, we do something --> event
			loadElement();
		},
		function(error){
			alert(error.statusText);
	});
}

/*
	HTML injection and JS bindings
*/
function bindTypeOfWork(){	
	$('#choose-country').on('change', function(){
		var countryId = $(this).val();
		if(countryId == ""){
			$('#country-data-selected').hide();			
		}
		else{
			getWork(countryId);
			getSharedValue(countryId);
			$('#country-data-selected').show();	
		}
	});	
}

function bindDecisionTreeData(){
	$('#choose-work').on('change', function(){
		var workId = $(this).val();
		if(workId == ""){
			works = [];
			$('div [id^="work-data-selected"]').hide();
		}
		else{
			getData(workId);
			$('#work-data-selected').html('');
			$('div [id^="work-data-selected"]').show();
		}
	});
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

function injectElementIntoForm(html){
	$('#work-data-selected').append(html);
}