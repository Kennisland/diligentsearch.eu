html_question = `
<div id="add-questionModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissQuestionModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new question</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="question-identifier">Question identifier: </label>
					<br>
					<input id="question-identifier" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="question-asked">Question to ask: </label>
					<br>
					<input id="question-asked" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="question-type">Type of answers for this question: </label>
					<select id="question-type" style="float: right">
						<option value="text" SELECTED>	Free text 	</option>
						<option value="check">			Check Box	</option>
						<option value="numeric">		Numeric		</option>
						<option value="list">			List		</option>
					</select>
				</div>

				<div id="question-output-block" class="form-group">
					<label>Default outputs : </label>

					<div style="overflow:auto;">
						<div style="float:left; width:70%; margin-left:3%">
							<table class"table table-responsive table-bordered table-stripped" style="width:100%">
								<thead>
									<th style="width:10%; text-align:center">#</th>
									<th style="width:70%; text-align:center">Answer</th>
								</thead>
								<tbody id="question-output">
								</tbody>
							</table>
						</div>
						<div id="question-output-management" style="float:right" >				
							<button id="addAnswer" type="button">+</button>
							<button id="delAnswer" type="button">-</button>
						</div>
					</div>
				</div>

				<div id="isNumeric" class="form-group" style="display:none">
					<label>Computation configuration</label>

					<table style="width:90%; margin-left:5%">
						<tr>
							<td style="width: 30%; padding-top:2%"> 
								<label>Reference Value</label>
							</td>
							<td>
								<input id="numeric-reference" class="ui-autocomplete" type="text"style=" min-width:100%;" />								
							</td>
							<td>
								<input id="numeric-reference-id" type="hidden">
							</td>
						</tr>

						<tr>
							<td style="width: 30%; padding-top:2%"> 
								<label>Condition</label>
							</td>
							<td style="text-align:left">
								<select id="numeric-condition">
									<option value="==" SELECTED>	= 	</option>
									<option value="<"	>			< 	</option>
									<option value="<="	>			<= 	</option>
									<option value=">"	>			> 	</option>
									<option value=">="	>			>= 	</option>
								</select>
							</td>
						</tr>
						
						<tr>
							<td style="width: 30%; padding-top:2%"> 
								<label>Inputs</label>
							</td>
							<td>
								<input id="numeric-inputs" type="text" style="width:100%" placeholder="ref_value_1 + ref_value_2 - user_input_1 + user_input_2"/>
							</td>
						</tr>
						
						<tr>
							<td style="width: 30%; padding-top:2%"> 
								<label>Visualization</label>
							</td>
							<td>
								<input id="numeric-visualization" type="text" style="width:100%" disabled/>
							</td>
						</tr>
					</table>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteQuestionElt()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissQuestionModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpQuestion()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;




function injectQuestionModal(){
	$('#modal-section').append(html_question);
	toggleQuestionTypeVisibility($('#question-type').val());

	// Manage html updates
	$('#question-type').change(function(){	toggleQuestionTypeVisibility($(this).val());	});
	$('#addAnswer').click(function(){	addAnswer();	});
	$('#delAnswer').click(function(){	delAnswer();	});

	// NUmeric configuration previsualization
	$('#numeric-reference, #numeric-condition, #numeric-inputs').on('change, input', function(){
		var preview = $('#numeric-reference').val() + ' ' + $('#numeric-condition').val() + ' ' + $('#numeric-inputs').val();
		$('#numeric-visualization').val(preview);
	});

	// Manage autocomplete for both input fields
	configAutocomplete();
};

currentQuestionIndex = -1;
currentQuestionId = undefined;
function loadQuestion(index, questionElt){
	console.log("question : ", questionElt);

	currentQuestionIndex = index;
	currentQuestionId = questionElt.id;

	// Basic fields
	$('#question-identifier').val(questionElt.name);
	$('#question-asked').val(questionElt.title);
	$('#question-type').val(questionElt.type);

	// Answers fields
	var increasable = questionElt.type == 'list'; 
	var placeholder = questionElt.outputs;
	injectDefaultAnswers(placeholder.length, placeholder, increasable);

	// Numerical configuration
	if(questionElt.numerical !== undefined){
		$('#isNumeric').show();

		// Get reference
		for (var i = 0; i < referenceValues.length; i++) {
			if(referenceValues[i].id == questionElt.numerical.refId){
				$('#numeric-reference').val(referenceValues[i].name);
				$('#numeric-reference-id').val(referenceValues[i].id);
				break;
			}
		}

		// Get condition
		$('#numeric-condition').val(questionElt.numerical.condition);

		// Get inputs field and inject operation between each element
		var inputsField = "";
		for (var i = 0; i < questionElt.numerical.expression.length; i++) {

			// Insert operation if it's not the first term
			if(i != 0){
				inputsField += questionElt.numerical.operations[i-1]+' ';
			}

			// Retrieve input name and inject it
			var	dataSetName = questionElt.numerical.expression[i].source,
				dataId 	= questionElt.numerical.expression[i].dataId,
				dataSet = undefined,
				element = undefined;

			if(dataSetName == 'userInputs'){
				dataSet = userInputs;
			}
			else if(dataSetName == 'referenceValues'){
				dataSet = referenceValues;				
			}

			if(!dataSet){
				console.log("Aborting numerical loading caseuse to wrong dataset ", dataSetName);
			}
			else{
				for (var i = 0; i < dataSet.length; i++) {
					if(dataSet[i].id == dataId){
						element = dataSet[i];
						break;
					}
				}

				if(element){
					inputsField += element.name+' ';				
				}				
			}

		}

		$('#numeric-inputs').val(inputsField);
		var preview = $('#numeric-reference').val() + ' ' + $('#numeric-condition').val() + ' ' + $('#numeric-inputs').val();
		$('#numeric-visualization').val(preview);
	}
	$('#add-questionModal').modal('show');
}


function dumpQuestion(){

	var error_log = "";
	if($('#question-identifier').val() == ""){
		error_log += "Question identifier is empty\n"; 
	}	
	if($('#question-asked').val() == ""){
		error_log += "Question title is empty\n"; 
	}

	// Create the question object
	var question = new QuestionElt();	

	var outputs = retrieveSection('input', 'question-output-');
	outputs.forEach(function(elt, idx){
		var o = elt.value != "" ? elt.value : elt.placeholder;
		question.outputs[idx] = o;
	});

	if(question.type == "numeric"){
		// Check reference value
		if($('#numeric-reference').val() == ""){
			error_log += "Numeric question requires a reference value\n";
		}

		var regExp = new RegExp(/\w+\s*(\s+(-|\+)\s+\w+)*$/g);
		if( ! regExp.test($('#numeric-inputs').val()) ){
			error_log += "Numeric inputs field contains error\n";
		}
		else{
			// Append numeric config to the question object
			question.numerical = new NumericalElt();
			
			// Get the id of the refValue
			question.numerical.refId = getReferenceId();
			var found = question.numerical.refId != undefined;
			if(!found){
				error_log += "Reference value  <"+ $('#numeric-reference').val() +"> not found in references values\n";
			}

			// Get foreach input its id
			var displayedInputs = $('#numeric-inputs').val().split(/\s+/);
			for(var i=0; i<displayedInputs.length; i++){

				// garbage
				if(displayedInputs[i] == ""){
					console.log("garbage");
				}
				else if(displayedInputs[i] == '+' || displayedInputs[i] == '-'){
					// Check if it's an operation
					question.numerical.operations.push(displayedInputs[i]);
				}
				else{
					found = false;
					// Check first in user input list
					for(var j=0; j<userInputs.length; j++){
						if(displayedInputs[i] == userInputs[j].name){
							var p = question.numerical.expression.push(new ExpressionElt('userInputs', userInputs[j].id));
							found = true;
							break;
						}					
					}
					if(!found){
						// Check in references values list if not found
						for(var j=0; j<referenceValues.length; j++){
							if(displayedInputs[i] == referenceValues[j].name){
								var p = question.numerical.expression.push(new ExpressionElt('referenceValues', referenceValues[j].id));
								found = true;
								break;
							}					
						}

						if(!found){
							error_log += "Input value <"+ displayedInputs[i] + "> not found in user inputs\n";
						}
					}
				}
			}
		}
	}

	if(error_log != ""){
		alert(error_log);
		return;
	}

	saveQuestionElt(question);
};

function dismissQuestionModal(){
	$('.modal-body').find("input").val("");
	$('#question-type').val("text");
	toggleQuestionTypeVisibility($('#question-type').val());
	if(currentQuestionIndex != -1){
		currentQuestionIndex = -1;
	}
	if(currentQuestionId != -1){
		currentQuestionId = -1;
	}
	$('#add-questionModal').modal('hide');
};


function QuestionElt(){
	this.id 		= undefined;
	this.name 		= $('#question-identifier').val();
	this.title 		= $('#question-asked').val();
	this.type 		= $('#question-type').val();
	this.numerical 	= undefined;
	this.outputs 	= [];				// List of non free choices for the end user
};


// Reference specific attributes for computation
function NumericalElt(){
	this.refId 		= undefined; 	// Reference value
	this.condition 	= $('#numeric-condition').val();
	this.expression = []			// List of ExpressionElt
	this.operations = []; 			// List of '+' and '-' to fit between 2 elements
};

// Reference object to store in numerical configuration element
function ExpressionElt(dataSrc, id){
	this.source	= dataSrc;
	this.dataId		= id;
}


function getReferenceId() {
	if($('#numeric-reference-id').val() == ""){
		return undefined;
	}
	return parseInt($('#numeric-reference-id').val());
}


// Save it into db
function saveQuestionElt(question){
	function cb(success){
		if(success){
			injectQuestionData(currentQuestionIndex, question);	
			dismissQuestionModal();				
		}
		else{
			alert("Failed to save element within database");
		}
	};

	if(currentQuestionId === undefined){
		saveElt('Question', question, selectedWork.id, cb);
	}
	else{
		question.id = currentQuestionId;
		updateElt('Question', question, cb);
	}
}



/*
 * HTML add-QuestionModal management
 */


 function configAutocomplete(){
	$('#numeric-reference').autocomplete({
		minLength: 0,
		autocomplete: true,
		source: function(request, response){
			response($.map(referenceValues, function(value, key){
				return {
					label: value.name
				}
			}));
		},
		open: function() { 
			var parent_width = $('#numeric-reference').width();
			$('.ui-autocomplete').width(parent_width);
		},
		select: function(event, ui){
			$(this).val(ui.item.value);

			// Look for the id of this reference
			for (var i = 0; i < referenceValues.length; i++) {
				if($(this).val() == referenceValues[i].name){
					$('#numeric-reference-id').val(referenceValues[i].id);
				}
			}
		}
	}).bind('focus', function(){ $(this).autocomplete("search"); } );

	$('#numeric-inputs').autocomplete({
		minLength: 0,
		autocomplete: true,
		source: function(request, response){
			var formattedInputs = $.map(userInputs, function(value, key){
				return {
					label: value.name
				}
			});

			// Do the autocomplete operation only with the last word inserted, based on the formatted input dataset and 
          	response( $.ui.autocomplete.filter(
            	formattedInputs, ( request.term ).split(/\s*[-+]\s/).pop()) 
          	);
		},
		open: function() { 
			// Match width of combobow to fit parent
			var parent_width = $('#numeric-inputs').width();
			$('.ui-autocomplete').width(parent_width);
		},
		focus: function() {
            // prevent value inserted on focus
            return false;
        },
        select: function( event, ui ) {
			var terms = this.value.split(/\s+/);
			// remove the current input, typed by user
			terms.pop();
			// add the selected item
			terms.push( ui.item.value );
			this.value = terms.join( " " );
			return false;
        }
	}).bind('focus', function(){ $(this).autocomplete("search"); } );
 }



// Display specific predefined answers according to selected type
function toggleQuestionTypeVisibility(type){
	injectDefaultAnswers(0);

	if(type == "numeric"){
		$('#isNumeric').show();
		injectDefaultAnswers(2, ['True', 'False']);
	}
	else{
		$('#isNumeric').hide();
		switch(type){
			case "text" :				
				injectDefaultAnswers(1, ['Set']);
				break;
			case "check" :
				injectDefaultAnswers(2, ['Checked', 'Not checked']);
				break;
			case "bool" :
				injectDefaultAnswers(2, ['True', 'False']);
				break;
			case "list" :
				injectDefaultAnswers(3, ['First choice', 'Second choice', 'Third choice'], true);
			default:
				break;
		}
	}
}

// Insert the given number of label/input for the default answers section
function injectDefaultAnswers(nb, placeholder, increasable){
	var htmlId = 'question-output';
	// Flush default answers section
	if(nb == 0){
		$('#'+htmlId).html('');
		return;
	}

	$('#question-output').html('');
	// Inject as many answers as needed
	for(var i=0; i < nb; i++){
		$('#question-output').append(getNewAnswer(placeholder[i]));
	}

	// Show + and - button if necessary
	if(increasable){
		$('#question-output-management').show();
	}else{
		$('#question-output-management').hide();
	}
}

function getNewAnswer(placeholder){
	var htmlId = 'question-output';

	var i = $('#question-output > tr').length,
		j = i+1,
		answer = `
		<tr>
			<th style="text-align:center">`+j+`</th>
			<th style="padding:1%">
				<input id="`+htmlId+`-`+i+`" style="margin-left:5%; margin-right:5%; width:90%" type="text" placeholder="`;

	if(placeholder){
		answer += placeholder;
	}else{
		answer += 'Output';
	}

	answer += `"/>
			</th>
		</tr>
	`;
	return answer;
}


// Insert one more answer in the default answers section
function addAnswer(){
	$('#question-output').append(getNewAnswer());
}

// Remove the last inserted answer if possible
function delAnswer(){
	if($('#question-output').children().length >= 2){
		$('#question-output > tr:last').remove();
	}	
}


function deleteQuestionElt(){
	if(currentQuestionId !== undefined){
		removeElt('Question', currentQuestionId, function(success){
			if(success){
				$('#data-questions-'+currentQuestionId).remove();
				dismissQuestionModal();				
			}else{
				alert("Cannot remove element");
			}
		})
	}
}