/*
	Question html
*/
function getQuestionElementHtml(decisionTreeId, question){	
	var content = '<div id="'+decisionTreeId+'" class="form-group form-question-input">';

	if(question.type == 'text'){
		content += '<label>'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += '<a oncLick="moreInfo(`'+question.information+'`)">more information</a>';
		}
		content += '<br>';
		content += '<input type="text"></input>';
	}
	else if(question.type == 'check'){
		content += '<input type="checkbox" value=""></input>';
		content += '<label class="form-question-check">'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += '<a oncLick="moreInfo(`'+question.information+'`)">more information</a>';
		}
	}
	else if(question.type == 'list'){
		content += '<label>'+question.title+'</label>';
		if(question.information && question.information != ""){
			content += '<a oncLick="moreInfo(`'+question.information+'`)">more information</a>';
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
					content += '<a oncLick="moreInfo(`'+elt.information+'`)">more information</a>';
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
function moreInfo(information){
	$('#infoBox-content').html(information);
	$('#infoBox').show();
}

function hideInfo(){
	$('#infoBox-content').html('');
	$('#infoBox').hide();
}


/*
	Question events
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


function questionListEvent(htmlId, outputs, targets){
	var selector = htmlId+' select';

	$('#'+selector).on('change', function(){

		var toFollow = undefined;
		for (var i = 0; i < outputs.length; i++) {
			if(outputs[i] == $(this).val()){
				toFollow = targets[i];
			}
		}
		handleFollowers(toFollow, targets);		
		bindHtmlForPdf($(this));
	});

	clickNb = 0;
	$('#'+selector).on('click', function(event){
		// Display the modal only on second click
		if(clickNb % 2 == 1){
			setUpListWarningModal($(this));
			event.preventDefault();
		}
		clickNb++;
	});
}

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

function questionNumericRemoveEvent(htmlId, inputs, i){
	$('#'+htmlId).on('remove', function(){
		inputs[i].value = undefined;
	});
}


/*
	Warning modal handler
*/
function setUpWarningModal(element){
	element.on('click', function(event){
		if(element.val() != "" ){
			event.preventDefault();

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
				$('#form-warningModal').modal('hide');			
			});
		
			// Display finally the modal
			$('#form-warningModal').modal('show');
		}
	});
}

function setUpListWarningModal(element){
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
		element.val("").trigger('change');
		$('#form-warningModal').modal('hide');
	});

	// Display finally the modal
	$('#form-warningModal').modal('show');
}





/*
	Block HTML / onCLick stuff
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

function getBlockQuestionElementHtml(questions, innerBlockId){
	var content = '';
	questions.map(function(dataId){		
		var eltToDisplay = getGraphicNodeElt('question', dataId),
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

function bindBlockQuestionsToValue(blockId){
	// Handle input (text & chockbox)
	$('#'+blockId+' input').on('change', function(){		

		// Set up value first
		if($(this).attr("type") == "checkbox"){
			if($(this).is(':checked')){
				$(this).val('on');
			}
			else{
				$(this).val('off');
			}
		}
		bindHtmlForPdf($(this));
	});
	// Handle select
	$('#'+blockId+' select').on('change', function(){
		bindHtmlForPdf($(this));
	});
}

// Work only on direct a child of the block
function bindAddBlock(blockId, questions, index){
	// Half global function for this variable
	blockIdx = index;
	$('#'+blockId+' >a').on('click', function(){
		addBlock(questions, blockId, blockIdx);
	});
}

function addBlock(questions, nodeId, index){
	var innerBlockId 	= nodeId+'-'+index;
		htmlContent = '<div class="form-block">';		
		htmlContent += getBlockQuestionElementHtml(questions, innerBlockId);
		htmlContent += '</div>';

	var selector = nodeId+' div.form-block',
		selectorIdx = index-1;

	$('#'+selector).eq(selectorIdx).after(htmlContent);
	bindBlockQuestionsToValue(nodeId);
	bindAddBlock(questions, nodeId, index+1);
}







/*
	Result 
*/
function getResultElementHtml(decisionTreeId, result){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
	content += '<p class="form-result">Result:<br>'+result.content+'</p>';
	content += '<br>';
	content += "</div>";
	return content;
}