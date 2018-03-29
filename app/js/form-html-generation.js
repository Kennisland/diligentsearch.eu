REGEX_URL = /(https?:\/\/|www\.)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-?#\&-]*)*\/?[^\., ]/g;


/*
	Information html
*/

/**
 * Get the corresponding HTML content of an information element
 * @param {number} decisionTreeId - Id of the decision tree element, used as main div id
 * @param {object} information - general information to format to html
 * @returns {string} html content
 */
function getInformationElementHtml(infoElements){	
	// Stop if no infoElements.
	if (infoElements.length == 0) {
		return "";
	}
	
	var content = '<div id="information" class="form-information-input">';
	content += '<label>Please fill in the information below to identify the work you are calculating:</label>';
	jQuery.each(infoElements, function(i, infoElement) {
		content += '<div id="info_' + infoElement.id + '" class="form-information-input">';
		content += '<label class="form-information-text">'+infoElement.content+'</label>';
		content += '<input type="textarea" value=""></input>';
		if(infoElement.details && infoElement.details != ""){
			content += ' <a oncLick="moreInfo(`'+infoElement.details+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
		}
		content += '<br>';
		content += '</div>';

	});

	content += '<br>';
	content += "</div>";
	return content;
}

/*
	Information events
*/

// TODO add listeners to on change of answers.

/**
 * Configure the change event of a information question.
 * @param {string} htmlId - id of the element within html page
 * @param {objects} outputs - array of possible outputs of this question
 * @param {objects} targets - array of possible targets of this question
 */
function informationTextEvent(htmlId){
	var selector = htmlId+' input';

	$('#'+selector).on('change', function(){	
		bindHtmlForPdf($(this));
	});
}


/*
	Source html
*/

/**
 * Get the corresponding HTML content of a sources element
 * @param {number} decisionTreeId - Id of the decision tree element, used as main div id
 * @param {object} sources - sources to format to html
 * @returns {string} html content
 */
function getSourcesElementHtml(sources){	
	// Stop if no sources.
	if (sources.length == 0) {
		return "";
	}
	
	var content = '<div id="sources" class="form-sources-input">';
	content += '<label>Search the requested information by consulting the sources below. Choose the source or sources you consider relevant to your search and tick the box once consulted:</label>';
	jQuery.each(sources, function(i, source) {
		content += '<div id="src_' + source.id + '" class="form-sources-input">';
		content += '<input type="checkbox" value=""></input>';
		content += '<label class="form-source-check">';
		// Add link if available.
		if ('url' in source && source.url != "") {
			content +=  "<a href=\"" + source.url + "\" target=”_blank”>" + source.content + "</a>";
		} else {
			content +=  source.content;	
		}
		if(source.details && source.details != ""){
			escapedDetails = source.details.replace(/'/g, '\'');
			content += ' <a oncLick="moreInfo(`'+escapedDetails+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
		}
		content += '</label>';
		content += '<br>';
		content += '</div>';

	});

	content += '<br>';
	content += "</div>";
	return content;
}

/*
	Source events
*/

/**
 * Configure the change event of a source checkbox.
 * @param {string} htmlId - id of the element within html page
 */
function sourceCheckEvent(htmlId){
	var selector = htmlId +' input';
	$('#'+selector).on('change', function(){
		if($('#'+selector).is(':checked')){
			$(this).val('on');
		}
		else{
			$(this).val('off');
		}
		bindHtmlForPdf($(this));
	}).trigger('change');
}


/*
	Question html
*/


/**
 * Get the corresponding HTML content of a basic question element
 * @param {number} decisionTreeId - Id of the decision tree element, used as main div id
 * @param {object} question - Object to format to html
 * @returns {string} html content
 */
function getQuestionElementHtml(decisionTreeId, question){
	var content = '<div id="'+decisionTreeId+'" class="form-group form-question-input">';

	if(question.type == 'text'){
		content += '<label>'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += ' <a oncLick="moreInfo(`'+question.information+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
		}
		content += '<br>';
		content += '<input type="text"></input>';
	}
	else if(question.type == 'check'){
		content += '<input type="checkbox" value=""></input>';
		content += '<label class="form-question-check">'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += ' <a oncLick="moreInfo(`'+question.information+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
		}
	}
	else if(question.type == 'list'){
		content += '<label>'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += ' <a oncLick="moreInfo(`'+question.information+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
		}
		content += '<br>';	
		content += '<select>';
		content += '<option val=""></option>';
		for (var i = 0; i < question.outputs.length; i++) {
			content += '<option val="'+question.outputs[i]+'">'+question.outputs[i]+'</option>';
		}
		content += '</select>';
	}	
	content += '<br>';
	content += "</div>";
	return content;
}

/**
 * Get the corresponding HTML content of a numerical question element
 * @param {number} decisionTreeId - Id of the decision tree element, used as main div id
 * @param {object} question - Object to format to html
 * @returns {string} html content for a numerical question
 */
function getNumericQuestionElementHtml(decisionTreeId, question){
	var content = '<div id="'+decisionTreeId+'" class="form-group form-question-numeric">';

	var inputs = extractExpression(question.numerical.expression).inputs;
	if(inputs.length > 0){
		var isFirst = true;
		inputs.map(function(elt, i){
			if(!elt.value){
				if(isFirst){
					content += '<div>';
					isFirst = false;
				}else{
					content += '<div style="display:none">';
				}
				content += '<label>'+elt.question+'</label>';
				if(elt.information && elt.information != ""){
					content += ' <a oncLick="moreInfo(`'+elt.information+'`)"><i class="fa fa-info-circle" aria-hidden="true"></i></a>';
				}
				content += '<br>';
				content += '<input></input>';
				content += '</div>';
			}
		});
	}
	content += "</div>";
	return content;
}

/*
	More information handler
*/

/**
 * Open up the more information pop-up displayling the extra information of a question. If there are URLs inside the information provided, they are formatted to html link tags.
 * @param {string} information - information to display within the modal
 * @param {object} question - Object to format to html
 * @returns {string} html content for a numerical question
 */
function moreInfo(information){
	// Convert new line to br tags and replace url by a tags
	information = information.replace(/\n/g, ' <br> ');
	information = information.replace(REGEX_URL, function(match){
		return ['<a href="'+match+'" target="_blank">'+match+'</a>'];
	});

	$('#form-infoModal-content').html(information);
	$('#form-infoModal').modal('show');
}

/**
 * Close the more information pop-up
 */
function hideInfo(){
	$('#form-infoModal-content').html('');
	$('#form-infoModal').modal('hide');
}

/**
 * Close the more Save pop-up
 */
function hideSaveModal(){
	$('#form-saveModal').modal('hide');
}


/*
	Question events
*/

/**
 * Configure the change event of a text question.
 * @param {string} htmlId - id of the element within html page
 * @param {objects} outputs - array of possible outputs of this question
 * @param {objects} targets - array of possible targets of this question
 */
function questionTextEvent(htmlId, outputs, targets){
	var selector = htmlId+' input';
	$('#'+selector).on('change', function(){

		var toFollow = undefined;
		if($(this).val() != ""){
			toFollow = targets[0];
		}
		handleFollowers(toFollow, targets);		
		bindHtmlForPdf($(this));
	});

	setUpWarningModal($('#'+selector));
}

/**
 * Configure the change event of a checkbox question.
 * @param {string} htmlId - id of the element within html page
 * @param {objects} outputs - array of possible outputs of this question
 * @param {objects} targets - array of possible targets of this question
 */
function questionCheckEvent(htmlId, outputs, targets){
	var selector = htmlId+' input';
	$('#'+selector).on('change', function(){

		var toFollow = undefined;
		if($('#'+selector).is(':checked')){
			$(this).val('on');
			toFollow = targets[0];
		}
		else{
			$(this).val('off');
			toFollow = targets[1];
		}
		handleFollowers(toFollow, targets);		
		bindHtmlForPdf($(this));
	}).trigger('change');

	setUpWarningModal($('#'+selector));
}

/**
 * Configure the change event of a list question.
 * @param {string} htmlId - id of the element within html page
 * @param {objects} outputs - array of possible outputs of this question
 * @param {objects} targets - array of possible targets of this question
 */
function questionListEvent(htmlId, outputs, targets){
	var selector = htmlId+' select';

	var oldValue = '';
	$('#'+selector).on('change', function(){
		setUpListWarningModal($(this), oldValue);
		if(oldValue != '' && $(this).val() != oldValue){
			$('#form-warningModal').modal('show');
		}
		oldValue = $(this).val();

		var toFollow = undefined;
		console.log(outputs, $(this).val());
		for (var i = 0; i < outputs.length; i++) {
			if(outputs[i].trim() == $(this).val()){
				toFollow = targets[i];
			}
		}
		console.log(toFollow, targets);
		handleFollowers(toFollow, targets);
		bindHtmlForPdf($(this));
	});
}

/**
 * Configure the change event of a specific user input within a numerical question.
 * @param {string} htmlId - id of the element within html page
 * @param {number} htmlIndex - index of the user HTML input to manage
 * @param {objects} inputs - array of possible inputs of this numerical question
 * @param {number} inputIdx - index of the user input within the data model to use
 */
function questionNumericEvent(htmlId, htmlIndex, inputs, inputIdx){
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){

		inputs[inputIdx].value = $(this).val();
		if($(this).val() == ""){
			hideInputsElement(selector, inputIdx, inputs.length);
		}
		else{
			showNextInputElement(selector, inputIdx);
		}
		bindHtmlForPdf($(this));
	});
	setUpWarningModal($('#'+selector+' input').eq(htmlIndex));
}

/**
 * Configure the change event of the last user input within a numerical question, which leads to the computation.
 * @param {string} htmlId - id of the element within html page
 * @param {number} htmlIndex - index of the user HTML input to manage
 * @param {objects} inputs - array of possible inputs of this numerical question
 * @param {number} inputIdx - index of the user input within the data model to use
 * @param {object} numConfig - numerical configuration of the numerical question
 * @param {object} targets - list of possible targets
 */
function questionNumericDecisionEvent(htmlId, htmlIndex, inputs, inputIdx, numConfig, targets){	
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){

		inputs[inputIdx].value = $(this).val();
		var toFollow = undefined;
		if($(this).val() != ""){
			var evalResult = evalExpression(inputs, numConfig),
				targetIdx = evalResultToTargetIdx(evalResult),
				toFollow = targets[targetIdx];
		}
		handleFollowers(toFollow, targets)
		bindHtmlForPdf($(this));
	});
	setUpWarningModal($('#'+selector+' input').eq(htmlIndex));
}

/**
 * Remove a specific user input within a numerical question and reset the value within the data model
 * @param {string} htmlId - id of the element within html page
 * @param {objects} inputs - array of possible inputs of this numerical question
 * @param {number} i - index of the user input to reset within the data model
 */
function questionNumericRemoveEvent(htmlId, inputs, i){
	$('#'+htmlId).on('remove', function(){
		inputs[i].value = undefined;
	});
}


/*
	Warning modal handler
*/

/**
 * Configure a warning modal for html input tags to warn a user who wants to change a field value
 * @param {objects} element - element the user has clicked on
 */
function setUpWarningModal(element){
	element.on('click', function(event){
		if(element.val() != "" ){
			event.preventDefault();

			// Check if element value is 
			// * http://blablablablablabla.somewhere
			// * wwww.blablablablablabla.somewhere
			if(element.val().match(REGEX_URL)){
				$('#form-warning-modal-is-link').show();			
				$('#form-warning-modal-redirect').on('click', function(){
					window.open(element.val());
				});
				$('#form-warning-modal-redirect').show();
			}
		


			// Configure modal buttons to perform click, or to just do nothing on the current element
			$('#form-warning-modal-proceed').off().on('click', function(){
				element.val("");
				if(element.attr("type") == "checkbox" ){
					var v = !element.is(':checked');
					element.attr("checked", v);
					element.prop("checked", v);
				}
				element.trigger('change');
				$('#form-warningModal').modal('hide');
			});

			// Cancel configuration
			$('#form-warning-modal-cancel').off().on('click', function(){
				$('#form-warning-modal-open-link').blur();
				$('#form-warning-modal-is-link').hide();	
				$('#form-warningModal').modal('hide');
			});
		
			// Display finally the modal
			$('#form-warningModal').modal('show');
		}
	});
}

/**
 * Configure a warning modal for html select tags to warn a user who wants to change a field value
 * @param {objects} element - element the user has clicked on
 */
function setUpListWarningModal(element, oldValue){
	element.blur();

	// Focus on modal appearance
	$('#form-warningModal').off().on('shown.bs.modal', function(){
		$('#form-warning-modal-cancel').focus();
	});

	// Configure modal buttons to perform click, or to just do nothing on the current element
	$('#form-warning-modal-proceed').off().on('click', function(){
		$('#form-warningModal').modal('hide');
	});

	// Cancel configuration
	$('#form-warning-modal-cancel').off().on('click', function(){
		element.val(oldValue).trigger('change');
		$('#form-warningModal').modal('hide');
	});

	// Display finally the modal
	// $('#form-warningModal').modal('show');
}





/*
	Block HTML / onCLick stuff
*/
/**
 * Get the corresponding HTML content of a block of questions
 * @param {number} decisionTreeId - Id of the decision tree element, used as main div id
 * @param {object} block - Object to format to html
 * @param {number} blockIndex - Index of the current block, used to differenciate multiple same blocks
 * @return {string} content - html content
 */
function getBlockElementHtml(decisionTreeId, block, blockIndex){
	var content = '<div id="'+decisionTreeId+'" class="form-group form-block-header">';
		content += '<label>'+block.introduction+'</label>';

	// Set / Get question data
	var	innerBlockId = decisionTreeId+'-'+blockIndex,
		innerBlockHtml = getBlockQuestionElementHtml(block.questions, innerBlockId);

	// Inject question data
	content += '<div class="form-block">';
	content += innerBlockHtml;
	content += '</div>';

	// Inject add button
	var nextBlockIdx = blockIndex+1;
	content += '<a>Add another answer</a>';
	content += '</div>';
	return content;
}

/**
 * Get the corresponding HTML content of questions contained within a block
 * @param {object} questions - list of question to retrieve the content
 * @param {number} innerBlockId - id of the parent block, used for id generation of inner questions
 * @return {string} content - html content
 */
function getBlockQuestionElementHtml(questions, innerBlockId){
	var content = '';
	questions.map(function(dataId){		
		var eltToDisplay = getDataElt('question', dataId),
			eltHtml = '',
			innerQuestionId = innerBlockId+'-'+dataId;

		if(eltToDisplay.type != 'numeric'){
			eltHtml += getQuestionElementHtml(innerQuestionId, eltToDisplay);
		}
		else{
			eltHtml += getNumericQuestionElementHtml(innerQuestionId, eltToDisplay);
		}

		// HTML formatting
		eltHtml = eltHtml.replace(/<br>/g, '');
		eltHtml = eltHtml.replace(/class="form-group"/g, '');
		eltHtml = eltHtml.replace(/ style="display:none"/g, '');
		
		//Revert the a tag and the input tag for more information
		if(eltToDisplay.type != "numeric"){
			var moreInfo = eltHtml.match(/<a(.*)<\/a>/g) || '';
			eltHtml = eltHtml.replace(/<a(.*)<\/a>/g, '');
			eltHtml = eltHtml.replace(/<\/div>/g, '<br>'+moreInfo+'<\/div>');
		}
		else{			
			var arr = eltHtml.split('<label>');
			for (var i = 0; i < arr.length; i++) {
				arr[i] = arr[i].replace(/(<a.+<\/a>)(<input><\/input>)/g, function(match, p1, p2){
					return [p2, '<br>', p1].join('');
				});
			}
			eltHtml = arr.join('<label>');
		}
		content += eltHtml;
	});
	return content;
}

/**
 * Configure the change event for questions within a block
 * @param {number} blockId - id of the block
 */
function bindBlockQuestionsToValue(blockId){
	// Handle input (text & chockbox)
	$('#'+blockId+' input').on('change', function(){
		if($(this).attr("type") == "checkbox"){
			if($(this).is(':checked')){
				$(this).val('on');
			}
			else{
				$(this).val('off');
			}
		}
		bindHtmlForPdf($(this));
		setUpWarningModal($(this));
	});


	// Handle select
	var oldValue = '';
	$('#'+blockId+' select').on('change', function(event, isLoading){
		bindHtmlForPdf($(this));
		setUpListWarningModal($(this), oldValue);

		// Display modal only if it's not a loading operation and the value changed
		if(!isLoading && oldValue != '' && $(this).val() != oldValue){
			$('#form-warningModal').modal('show');
		}
		oldValue = $(this).val();
	});
}

/**
 * Configure the button to get an additional same block
 * @param {number} blockId - id of the block to dupplicate
 * @param {object} questions - list of questiosn to dupplicate
 * @param {number} index - index of the future dupplicated block
 */
function bindAddBlock(blockId, questions, index){
	// Half global function for this variable
	blockIdx = index;
	$('#'+blockId+' >a').on('click', function(){
		addBlock(questions, blockId, blockIdx);
	});
}

/**
 * Configure the fonctionnality to add a block
 * @param {object} questions - list of questiosn to dupplicate
 * @param {number} blockId - id of the html main block
 * @param {number} blockIdx - index of the block to add
 */
function addBlock(questions, blockId, blockIdx){
	var innerBlockId 	= blockId+'-'+blockIdx;
		htmlContent = '<div class="form-block">';		
		htmlContent += getBlockQuestionElementHtml(questions, innerBlockId);
		htmlContent += '</div>';

	var selector = blockId+' div.form-block',
		selectorIdx = blockIdx-1;

	$('#'+selector).eq(selectorIdx).after(htmlContent);
	bindBlockQuestionsToValue(blockId);
	bindAddBlock(questions, blockId, blockIdx+1);
}







/*
	Result 
*/

/**
 * Get the corresponding HTML content of result
 * @param {number} decisionTreeId - id of the result in the decision tree
 * @param {object} result - object to format to html
 * @return {string} content - html content
 */
function getResultElementHtml(decisionTreeId, result){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
	content += '<p class="form-result">Result:<br>'+result.content+'</p>';
	content += '<br>';
	content += "</div>";
	return content;
}