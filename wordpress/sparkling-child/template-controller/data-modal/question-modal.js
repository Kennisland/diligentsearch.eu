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

				<div class="form-group">
					<label for="question-details">Further information: </label>
					<br>
					<textarea id="question-details" type="text" style="min-width:100%; max-width:100%"/>					
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
								<input id="numeric-reference" type="text"style=" min-width:100%;" />								
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
								<input id="numeric-expression" type="text" style="width:100%" placeholder="ref_value_1 + ref_value_2 - user_input_1 + user_input_2"/>
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
	$('#numeric-reference, #numeric-condition, #numeric-expression').on('change, input', function(){
		var preview = $('#numeric-reference').val() + ' ' + $('#numeric-condition').val() + ' ' + $('#numeric-expression').val();
		$('#numeric-visualization').val(preview);
	});

	// Manage autocomplete for both input fields
	configAutocomplete();
};

currentQuestionIndex = -1;
currentQuestionId = undefined;
function loadQuestion(index, questionElt){
	currentQuestionIndex = index;
	currentQuestionId = questionElt.id;

	// Basic fields
	$('#question-identifier').val(questionElt.name);
	$('#question-asked').val(questionElt.title);
	$('#question-type').val(questionElt.type);
	$('#question-details').val(questionElt.information);

	// Answers fields
	var increasable = questionElt.type == 'list'; 
	var placeholder = questionElt.outputs;
	injectDefaultAnswers(placeholder.length, placeholder, increasable);

	// Numerical configuration
	if(questionElt.numerical !== undefined){
		var numConfig = questionElt.numerical;

		// Get reference
		var ref = getReference(numConfig.refId);
		if(ref){
			$('#numeric-reference').val(ref.name);
			$('#numeric-reference-id').val(ref.id);	
		}

		// Get condition
		$('#numeric-condition').val(numConfig.condition);

		var expression = "",
			dataSet = undefined,
			element = undefined;
		// Get expression
		numConfig.expression.forEach(function(elt, index){
			// append an operator
			if(index != 0){
				expression += numConfig.operations[index-1]+' ';
			}

			// get the data from its correct datasource
			if(elt.source == 'userInputs'){
				element = getUserInput(elt.dataId);
			}
			else if(elt.source == 'referenceValues'){
				element = getReference(elt.dataId);
			}

			// Append the value if it exists
			if(element){
				expression += element.name+' ';
			}else{
				console.log("Aborting numerical loading to wrong dataset ", elt);
			}
		});
		$('#numeric-expression').val(expression);

		// Set up visualization
		var preview = $('#numeric-reference').val() + ' ' + $('#numeric-condition').val() + ' ' + $('#numeric-expression').val();
		$('#numeric-visualization').val(preview);

		// display numeric part
		$('#isNumeric').show();
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

		// Check correctness of expression
		var regExp = new RegExp(/^([^-+](\s)*)+((-|\+)\s+([^-+](\s)*)+)*$/g);
		if( ! regExp.test($('#numeric-expression').val()) ){
			error_log += "Numeric inputs field contains error\n";
		}
		else{
			// Append numeric config to the question object
			question.numerical = new NumericalElt();
			if(!question.numerical.refId){
				error_log += "Reference value  <"+ $('#numeric-reference').val() +"> not found in references values\n";
			}

			// Get foreach input its id from its name
			var splittedExpr = $('#numeric-expression').val().split(/\s+(-|\+)\s+/);
			splittedExpr.forEach(function(elt){
				var argName = elt.trim();
				if(argName == ""){
					console.log("garbage");
				}
				else if(argName == '+' || argName == '-'){
					question.numerical.operations.push(argName);
				}
				else{
					var found = false;					
					var arg = getUserInputByName(argName);
					if(arg){
						found = true;
						question.numerical.expression.push(new ExpressionElt('userInputs', arg.id));
					}

					if(!found){
						arg = getReferenceByName(argName);
						if(arg){
							found = true;
							question.numerical.expression.push(new ExpressionElt('referenceValues', arg.id));
						}

						if(!found){
							error_log += "Input value <"+ splittedExpr[i] + "> not found in both userInputs and referenceValues\n";
						}
					}
				}
			});
		}
	}

	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'top-right', className:'error'});
		return;
	}

	// Save it into db
	saveData('Question', question, currentQuestionId, selectedWork.id, function(success){
		if(success){
			injectData('question', currentQuestionIndex, question, loadQuestion);
			$('#main').notify('Element saved in database', {position:'top-right', className:'success'});
			dismissQuestionModal();				
		}
		else{
			$('.modal-header').notify('Failed to save element within database', {position:'top-right', className:'error'});
		}
	});
};

function dismissQuestionModal(){
	$('.modal-body').find("input").val("");
	$('.modal-body').find("textarea").val("");
	$('#question-type').val("text");
	toggleQuestionTypeVisibility($('#question-type').val());
	if(currentQuestionIndex != -1){
		currentQuestionIndex = -1;
	}
	if(currentQuestionId != undefined){
		currentQuestionId = undefined;
	}
	$('#add-questionModal').modal('hide');
};


function QuestionElt(){
	this.id 		= undefined;
	this.name 		= $('#question-identifier').val();
	this.title 		= $('#question-asked').val();
	this.type 		= $('#question-type').val();
	this.information= $('#question-details').val();
	this.numerical 	= undefined;
	this.outputs 	= [];				// List of non free choices for the end user
};


// Reference specific attributes for computation
function NumericalElt(){
	this.refId 		= getReferenceId(); 	// Reference value
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
			var ref = getReferenceByName($(this).val());
			if(ref){
				$('#numeric-reference-id').val(ref.id);
			}
		}
	}).bind('focus', function(){ $(this).autocomplete("search"); } );

	$('#numeric-expression').autocomplete({
		minLength: 0,
		autocomplete: true,
		source: function(request, response){

			var sharedData = userInputs.concat(referenceValues);
			var formattedInputs = $.map(sharedData, function(value, key){
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
			var parent_width = $('#numeric-expression').width();
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
			// add the selected item and a space
			terms.push( ui.item.value + ' ' );
			this.value = terms.join( " " );

			var preview = $('#numeric-reference').val() + ' ' + $('#numeric-condition').val() + ' ' + this.value;
			$('#numeric-visualization').val(preview);

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
	var i = $('#question-output > tr').length,
		j = i+1,
		answer = `
		<tr>
			<th style="text-align:center">`+j+`</th>
			<th style="padding:1%">
				<input id="question-output-`+i+`" style="margin-left:5%; margin-right:5%; width:90%" type="text" placeholder="`;

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
	deleteData('Question', currentQuestionId, dismissQuestionModal);
}