/*
	New / Loading stuff
*/

/**
 * Initiate a new diligent search
 */
function newSearch(){
	$('#form-menu').hide();
	injectFormRenderer();
}


/**
 * Retrieve a previous research, by giving its reference and optionnaly its version. Load dyamically hmtl content.
 */
function getSearch(){
	// Get the web hook provided by user
	var hook = $('#search-hook').val();
	if(hook == ""){
		$('#search-hook').notify("Research ID required", {position:'bottom-left', className:'warning'});
		return;
	}
	
	var version = $('#search-version').val();
	if(version && version != parseInt(version, 10)){
		$('#search-version').notify("Version not a number", {position:'bottom-left', className:'warning'});
		return;	
	}

	// Retrieve the form
	$.when(ajaxGetForm(hook, version)).then(
		function(success){
			if(success.length == 0){
				$('#search-hook').notify("No form found for this ID or version", {position:'bottom-left', className:'error'});
				return;
			}
			else{
				// Inject silently html to avoid concurrency issue on html set up afterwards
				$('#form-renderer').hide();
				injectFormRenderer();

				console.log("saved data:", success);
				var workId 	= success[0].workId
					json = JSON.parse(success[0].value);

				// Update local object
				dumpedForm.webHook = hook;
				dumpedForm.json = json.formData;

				updateSearchReportId();

				// Get jurisdiction
				$.when(ajaxGetWorkById(workId)).then(
					function(success){
						var workName = success[0].name;
						var countryId = success[0].countryId;
						$('#choose-country').val(countryId).trigger('change');

						setTimeout(function(){
							$('#choose-lg').val(json.lg).trigger('change');

							setTimeout(function(){
								if($('#choose-work').html != ""){
									$('#choose-work').val(workId).trigger('change');
									$('#form-menu').hide();
									$('#form-renderer').show();
									loadSearch();
									if(version){
										$('#work-save-btn').attr("disabled", "disabled");
									}
								}
							}, 100);
						}, 100);							
					},
					function(error){
						$('#choose-country').notify("Country associated to research not found", {position:'bottom-left', className:'error'});
				});
			}
		},
		function(error){
			$('#search-hook').notify("Error detected in form retrieval", {position:'bottom-left', className:'error'});
	});
}

/**
 * Load the form data step by step, and triggering 'change' event after each insertion, to get further input via the loadElement function
 */
function loadSearch(){
	// Load all consulted sources first
	LoadSavedSourcesandInformation();	
	
	// Load decision tree stored answers
	setTimeout(function(){
		var data = dumpedForm.json;
		for (var i = 0; i < data.length; i++) {
			// Inject a new block section if necessary
			var isBlock = data[i].htmlId.split('-').length > 1;
			if(isBlock){
				var s = data[i].htmlId.split('-')
					rank = parseInt(s[1]),
					nbBlock = $('#'+s[0]+' > div').length;

				if(nbBlock - rank == 0){
					// Simulate click on the addBlock button
					$('#'+s[0]+' > a').trigger('click');
				}
			}

			// According to element to fill in, append the right value at the good place
			// The 'trigger('change')'' will trigger the next element of the form to display
			var	isText = $('#'+data[i].htmlId).find('input').length == 1 && $('#'+data[i].htmlId+' input').attr("type") == "text",
				isCheckBox = $('#'+data[i].htmlId).find('input').length == 1 && $('#'+data[i].htmlId+' input').attr("type") == "checkbox",
				isMultiple = $('#'+data[i].htmlId).find('div input').length > 0,
				isSelect = $('#'+data[i].htmlId).find('select').length > 0;

			var v;
			if(isCheckBox){
				v = data[i].value == "on" ? true : false;
				$('#'+data[i].htmlId+' input').prop('checked', v).trigger('change');
			}
			if(isText){
				v = data[i].value;
				$('#'+data[i].htmlId+' input').val(v).trigger('change');
			}
			if(isMultiple){
				for (var j = 0; j < data[i].value.length; j++) {
					$('#'+data[i].htmlId+' input').eq(j).val(data[i].value[j]).trigger('change');
				}
			}
			if(isSelect){
				// Specify the 'isLoading' flag to this trigger function to prevent warning modal to show up
				v = data[i].value;
				$('#'+data[i].htmlId+' select').val(v).trigger('change', [true]);
			}
		}
	}, 250);
}

/**
 * Load
 */
function LoadSavedSourcesandInformation() {
	setTimeout(function(){
		var data = dumpedForm.json;
		for (var i = 0; i < data.length; i++) {
			if (data[i].htmlId.substring(0, 4) == "src_") {
				v = data[i].value == "on" ? true : false;
				$('#'+data[i].htmlId+' input').prop('checked', v).trigger('change');
			}
		}
	}, 250);
	
	setTimeout(function(){
		var data = dumpedForm.json;
		for (var i = 0; i < data.length; i++) {
			if (data[i].htmlId.substring(0, 5) == "info_") {
				v = data[i].value;
				$('#'+data[i].htmlId+' input').val(v).trigger('change');
			}
		}
	}, 250);
}


/*
	HTML injection
*/

/**
 * Present all sources if they are available into the HTML page
 *
 */
function loadSources(source)
{
	htmlContent = getSourcesElementHtml(source);
	injectElementIntoForm(htmlContent);
	bindSourcesToTarget(source);
}

/**
 * Present all sources if they are available into the HTML page
 *
 */
function loadGeneralInformation(information)
{
	htmlContent = getInformationElementHtml(information);
	injectElementIntoForm(htmlContent);
	bindInformationToTarget(information);
}



/**
 * Load a decision tree element into the HTML page
 * @param {number} [id=ROOT_NODE_ID] - id of the decision tree element to display
 */
function loadElement(id){
	if(!id){
		id = ROOT_NODE_ID;
	}

	var element = getDecisionTreeElement(id);
	if(element){
		generateElementHtml(element);
	}
}

/**
 * Retrieve a decisionTree element
 * @param {number} id - id of the decision tree element to retrieve
 */
function getDecisionTreeElement(id){
	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == id){
			return decisionTree[i];
		}
	}
	if (sources != undefined) {
		for (var i = 0; i < sources.length; i++) {
			if(decisionTree[i].id == id){
				return decisionTree[i];
			}
		}
	} 
	return undefined;
}


/**
 * Inject corresponding HTML and bind events for a specific decision tree element
 * @param {object} nodeElt - decision tree element to display
 */
function generateElementHtml(nodeElt){
	var htmlContent = '',
		eltToDisplay = getDataElt(nodeElt.category, nodeElt.dataId);
	
	if(nodeElt.category == 'question'){
		if(eltToDisplay.type != 'numeric'){
			htmlContent = getQuestionElementHtml(nodeElt.id, eltToDisplay);
		}
		else{
			htmlContent = getNumericQuestionElementHtml(nodeElt.id, eltToDisplay);
		}
		injectElementIntoForm(htmlContent);
		bindQuestionToTarget(nodeElt, eltToDisplay);
	}
	else if(nodeElt.category == 'block'){
		// Block generation: title + content
		htmlContent = getBlockElementHtml(nodeElt.id, eltToDisplay, 0);
		injectElementIntoForm(htmlContent);
		bindBlockQuestionsToValue(nodeElt.id, eltToDisplay.questions, 0);
		bindAddBlock(nodeElt.id, eltToDisplay.questions, 1);

		// Block output generation: the follow up question / block / result
		loadElement(nodeElt.targets[0]);
	}
	else if(nodeElt.category == 'result'){
		htmlContent = getResultElementHtml(nodeElt.id, eltToDisplay);
		injectElementIntoForm(htmlContent);
	}
}



/*
	HTML Jquery event / remove / hide / show
*/

/**
 * Generic sources binding
 * @param {object} sources - lists of all sources injected into display
 */
function bindSourcesToTarget(sources){

	jQuery.each(sources, function(i, source) {
		sourceCheckEvent("src_" + source.id);
	});

}

/**
 * Generic information binding
 * @param {object} informationElements - lists of all information injected into display
 */
function bindInformationToTarget(informationElements){

	jQuery.each(informationElements, function(i, information) {
		informationTextEvent("info_" + information.id);
	});

}

/**
 * Generic question binding according to question type
 * @param {object} nodeElt - decision tree element to display
 * @param {object} eltToDisplay - data model element corresponding to the decision tree element
 */
function bindQuestionToTarget(nodeElt, eltToDisplay){
	var targets	= nodeElt.targets,
		type 	= eltToDisplay.type,
		outputs = eltToDisplay.outputs;

	if(type == 'text'){
		questionTextEvent(nodeElt.id, outputs, targets);
	}
	else if(type == 'check'){
		questionCheckEvent(nodeElt.id, outputs, targets);
		
	}
	else if(type == 'list'){
		questionListEvent(nodeElt.id, outputs, targets);
	}
	else if(type == 'numeric'){
		bindNumericQuestionToTarget(nodeElt, eltToDisplay, targets);
	}
}

//Numeric question binding, allowing direct computation if possible

/**
 * Numeric question binding, allowing direct computation if possible
 * @param {object} nodeElt - decision tree element to display
 * @param {object} eltToDisplay - data model element corresponding to the decision tree element
 * @param {object} targets - array of targets to use for the given nodeElt
 */
function bindNumericQuestionToTarget(nodeElt, eltToDisplay, targets){
	var numConfig 	= eltToDisplay.numerical,
		inputs 		= extractExpression(numConfig.expression).inputs,
		lastToCompute = getLastToCompute(inputs);

	// Run computation if all inputs already have value
	if(lastToCompute == -1){
		var evalResult = evalExpression(inputs, numConfig),
			targetIdx = evalResultToTargetIdx(evalResult),
			toFollow = targets[targetIdx];
		handleFollowers(toFollow, targets);
	}
	else{
		// Bind the html / jquery
		var i = 0,
			htmlIdx = 0;
		while(i <= lastToCompute){
			if(!inputs[i].value){
				if(i == lastToCompute){
					questionNumericDecisionEvent(nodeElt.id, htmlIdx, inputs, i, eltToDisplay.numerical, targets);	
				}
				else{
					questionNumericEvent(nodeElt.id, htmlIdx, inputs, i);				
				}
				// Handle model reset on deletion
				questionNumericRemoveEvent(nodeElt.id, inputs, i);
				htmlIdx++;
			}
			i++;
		}
	}
}

/**
 * Handle the following question element when 'change' Jquery event is triggered in html
 * @param {number} toFollow - id of the decision tree element to load
 * @param {object} targets - array of targets to remove if they are displayed
 */
function handleFollowers(toFollow, targets){
	removeTargetsElement(targets);	
	if(toFollow){
		loadElement(toFollow);
	}
}


/**
 * Recursively remove given list of decision tree elements if they are displayed in HTML
 * @param {object} targets - array of targets to remove 
 */
function removeTargetsElement(targets){
	targets.map(function(id){		
		// Launch recursion on targets of the given analyzed target
		var subTargets = getTargets(id);
		if(subTargets.length > 0 ){
			removeTargetsElement(subTargets);			
		}
		// Remove the current target group, hold by the parent of target
		// The trigger event allow to reset user inputs if needed
		$('#'+id).trigger('remove').remove();
	});
}


/**
 * Retrieve targets of a given decision tree element
 * @param {number} nodeId - javascript id of the decisionTree element
 * @param {object} list of targets if element is found, empty list otherwise
 */
function getTargets(nodeId){
	for (var i = 0; i < decisionTree.length; i++) {
		if(decisionTree[i].id == nodeId){
			return decisionTree[i].targets;
		}
	}
	return [];
}


/**
 * Display following user input element for a numerical question
 * @param {string} selector - jQuery selector of the numerical element ot display
 * @param {number} inputIdx - index of the current displayed element, to compute the next one
 */
function showNextInputElement(selector, inputIdx){
	var next = inputIdx + 1;
	$('#'+selector).eq(next).show();
}

/**
 * Hide following user input element for a numerical question
 * @param {string} selector - jQuery selector of the numerical element ot display
 * @param {number} inputIdx - index of the current displayed element
 * @param {number} inputsLength - number of elements possibly visible, and must be hidden
 */
function hideInputsElement(selector, inputIdx, inputsLength){
	var next = inputIdx + 1;
	while(next < inputsLength){
		$('#'+selector).eq(next).hide();
		next++;
	}
}



/* 
	Numerical question stuff
*/
/**
 * Get the index of the  last element to compute for a specific numerical question
 * @param {object} inputs - array of inputs required by a numerical question
 * @return {number} lastToCompute - index of last element, -1 if not found
 */
function getLastToCompute(inputs){
	var lastToCompute = -1;
	for(var i=0; i<inputs.length; i++){
		if(!inputs[i].value){
			lastToCompute = i;
		}
	}
	return lastToCompute;
}

/**
 * Extract the expression that needs to be computed for a numerical question
 * @param {string} expression - numerical expression to compute
 * @return {object} inputs and references used within the expression are sorted
 */
function extractExpression(expression){
	var usedInputs = [],
		usedReferences = [];
	expression.map(function(elt){
		if(elt.source == 'userInputs'){
			usedInputs.push(getUserInput(elt.dataId));
		}
		else if(elt.source == 'referenceValues'){
			usedReferences.push(getReference(elt.dataId));
		}
	});
	return {inputs:usedInputs, references:usedReferences};
}

/**
 * Extract and evaluate the expression corresponding to a numerical question
 * @param {object} inputs - array of inputs required by the numerical question
 * @param {object} numConfig - numerical configuration of question
 * @return {boolean} result of the computation, either true or false
 */
function evalExpression(inputs, numConfig){
	var	ref = getReference(numConfig.refId),
		condition  = numConfig.condition,
		expression = numConfig.expression,
		references = extractExpression(expression).references;
		operations = numConfig.operations;

	var exp = ref.value+" "+condition+" ",
		i = 0,
		j = 0,
		k = 0;
	expression.map(function(elt){
		if(elt.source == 'userInputs'){
			exp += inputs[i].value+" ";
			i++;
		}
		else if(elt.source == 'referenceValues'){
			exp += replaceReference(references[j].value)+" ";
			j++;
		}

		if(k < operations.length){
			exp += operations[k]+" ";
			k++;
		}
	});
	console.log("EXP", exp, eval(exp));
	return eval(exp);
}

/**
 * Convert a numerical result boolean to target index 
 * @param {boolean} result - result of a numerical computation
 * @return {number} 0 if true, 1 therwise
 */
function evalResultToTargetIdx(result){
	var targetIdx = result ? 0 : 1;
	return targetIdx
}



/*
	Form dumping 
*/

/**
 * Retrieve all id starting by 'lvl_'
 * @return {object} list of corresponding id
 */
function getHtmlId(){
	var elementsId = [];
	$('#work-data-selected').find('[id^="lvl_"]').map(function(elt){
		elementsId.push($(this)[0].id);
	});
	return elementsId;
}

/**
 * Retrieve all id starting by 'src_'
 * @return {object} list of corresponding id
 */
function getSourcesHtmlID(){
	// Add sources
	var elementsId = [];
	$('#work-data-selected').find('[id^="src_"]').map(function(elt){
		elementsId.push($(this)[0].id);
	});
	return elementsId;
}

/**
 * Retrieve all id starting by 'info_'
 * @return {object} list of corresponding id
 */
function getInformationHtmlID(){
	// Add information sources
	var elementsId = [];
	$('#work-data-selected').find('[id^="info_"]').map(function(elt){
		elementsId.push($(this)[0].id);
	});
	return elementsId;
}


/**
 * Retrieve a question by giving the retrieved html id
 * @param {string} id - html id to parse for retrieving the data element id
 * @param {object} element - decision tree element
 */
function getQuestionFromHtmlId(id, element){
	var dataId = undefined;
	if(element){
		dataId = element.dataId;
	}
	else{
		var s = id.split('-');
		dataId = s[s.length-1];
	}
	return getDataElt('question', dataId);
}

/**
 * Retrieve the answer given by a user for a given question
 * @param {string} id - html id
 * @param {object} question - data question
 */
function extractQuestionHtmlAnswer(id, question){
	var value;
	if(question.type == 'text' || question.type == 'check'){
		value = $('#'+id).find('input').val() || undefined;
	}
	else if(question.type == 'list'){
		value = $('#'+id).find('select').val() || undefined;
	}
	else if(question.type == 'numeric'){
		value = [];
		$('#'+id).find('input').map(function(elt){
			value.push($(this)[0].value || undefined);
		});
	}
	return value;
}

/**
 * Dump the html form to get the corresponding data
 */
function dumpHtmlForm(){
	var language = $('#choose-lg').val(),
		formData = [];
	getHtmlId().map(function(id){
		var element 	= getDecisionTreeElement(id),
			isBlock 	= element && element.category == 'block',
			isResult 	= element && element.category == 'result',
			isQuestion 	= !isBlock && !isResult,
			value 		= undefined;

		if(isQuestion){
			var question = getQuestionFromHtmlId(id, element);
			value = extractQuestionHtmlAnswer(id, question);
		}
		else if(isResult){
			value = $('#'+id).find('p').val() || undefined;
		}

		if(!isBlock){
			formData.push(new FormEntry(id, value));
		}
	});
	
	// Add sources to formData
	getSourcesHtmlID().map(function(id){
		value = $('#'+id).find('input').val() || undefined;
		console.log(id, value);
		formData.push(new FormEntry(id, value));
	});
	
	// Add information fields to formData
	getInformationHtmlID().map(function(id){
		value = $('#'+id).find('input').val() || undefined;
		console.log(id, value);
		formData.push(new FormEntry(id, value));
	});
	
	
	return {'lg':language, 'formData':formData};
}


/**
 * Create a new form entry for save purpose
 * @constructor()
 * @param {string} htmlId
 * @param {string} value
 */
function FormEntry(htmlId, value){
	this.htmlId = htmlId;
	this.value 	= value;
}

/**
 * Dump the form and save it into the databases
 */
function saveForm(){
	var workId = $('#choose-work').val();
	dumpedForm.json = dumpHtmlForm();

	if(!dumpedForm.webHook){
		function cb(status){
			if(status){
				$('#form-renderer').notify('Report injected in database', {position:'top-left', className:'success'});
				updateSearchReportId();
			}
			else{
				$('#form-renderer').notify('Failed to save report in database', {position:'top-left', className:'error'});
			}
		}
		ajaxPutForm(dumpedForm, workId, cb);
	}
	else{
		$.when(ajaxUpdateForm(dumpedForm, workId)).then(
			function(success){
				$('#form-renderer').notify('Report correctly updated', {position:'top-left', className:'success'});
			}, 
			function(error){
				$('#form-renderer').notify('Failed to update report', {position:'top-left', className:'error'});
			});
	}
}




/*
	PDF stuff
*/

/**
 * Bind the html manipulation to enable a correct pdf generation
 * @param {object} element - element on which an jQuery event has been triggered
 */
function bindHtmlForPdf(element){
	// Bind value
	element.attr("value", element.val());

	if(element.prop("tagName") == 'INPUT'){
		if(element.attr("type") == "checkbox" ){
			element.attr("checked", element.is(':checked'));
			element.prop("checked", element.is(':checked'));
		}
	}
	else if(element.prop("tagName") == 'SELECT'){
		element.find('option:not(:selected)').removeAttr("selected");
		element.find('option:selected').attr("selected", "selected");
	}
}

/**
 * Get a random key of 8 alphanumerical characters
 * @param {string} text - random key
 */
function getRandomKey(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 8; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

/**
 * Print a pdf version of the html data
 */
function printPDF(){
	var htmlContent = $('#work-data-selected').html();
	var pdfKey = dumpedForm.webHook ? dumpedForm.webHook : getRandomKey();
	ajaxPrintPdf(htmlContent, pdfKey);
}