/*
	Question html
*/
function getQuestionElementHtml(decisionTreeId, question){	
	var content = '<div id="'+decisionTreeId+'" class="form-group">';

	if(question.type == 'text'){
		content += '<label>'+question.title+'</label>';
		content += '<br>';
		content += '<input type="text"></input>';
	}
	else if(question.type == 'check'){
		content += '<input type="checkbox" value=""></input>';
		content += '<label class="form-question-check">'+question.title+'</label>';
	}
	else if(question.type == 'list'){
		content += '<label>'+question.title+'</label>';
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
		content += '<label>'+question.title+'</label>';	

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
				content += '<input></input>';
				if(elt.information && elt.information != ""){
					content += '<a oncLick="moreInfo(`'+elt.information+'`)">more information</a>';
				}
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
	console.log("---");
	$('#infoBox-content').html(information);
	console.log("html");
	$('#infoBox').show();
	console.log("showed");
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
		// Pdf generation
		$(this).attr("value", $(this).val());

		var toFollow = undefined;
		if($(this).val() != ""){
			toFollow = targets[0];
		}
		handleFollowers(toFollow, targets);
	}).on('click', function(event){
		setUpWarningModal($(this), event);
	});
}

function questionCheckEvent(htmlId, outputs, targets){
	var selector = htmlId+' input';
	$('#'+selector).on('change', function(){

		console.log('change event triggered');
		// Pdf generation
		$(this).attr("checked", $(this).is(':checked'));
		$(this).prop("checked", $(this).is(':checked'));

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
	}).on('click', function(event){
		setUpWarningModal($(this), event);
	});
}


function questionListEvent(htmlId, outputs, targets){
	var selector = htmlId+' select';
	$('#'+selector).on('change', function(){
		// Pdf generation
		$(this).attr("value", $(this).val());

		var toFollow = undefined;
		for (var i = 0; i < outputs.length; i++) {
			if(outputs[i] == $(this).val()){
				toFollow = targets[i];
			}
		}
		handleFollowers(toFollow, targets);
	}).on('click', function(event){
		setUpWarningModal($(this), event);
	});
}

function questionNumericEvent(htmlId, htmlIndex, inputs, inputIdx){
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){
		// Pdf generation
		$(this).attr("value", $(this).val());

		inputs[inputIdx].value = $(this).val();
		if($(this).val() == ""){
			hideInputsElement(selector, inputIdx, inputs.length);
		}
		else{
			showNextInputElement(selector, inputIdx);
		}
	}).on('click', function(event){
		setUpWarningModal($(this), event);
	});
}

function questionNumericDecisionEvent(htmlId, htmlIndex, inputs, inputIdx, numConfig, targets){	
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){
		// Pdf generation
		$(this).attr("value", $(this).val());

		inputs[inputIdx].value = $(this).val();
		var toFollow = undefined;
		if($(this).val() != ""){
			var evalResult = evalExpression(inputs, numConfig),
				targetIdx = evalResultToTargetIdx(evalResult),
				toFollow = targets[targetIdx];
		}
		handleFollowers(toFollow, targets)
	}).on('click', function(event){
		setUpWarningModal($(this), event);
	});
}

function questionNumericRemoveEvent(htmlId, inputs, i){
	$('#'+htmlId).on('remove', function(){
		inputs[i].value = undefined;
	});
}


/*
	Warning modal handler
*/
function setUpWarningModal(element, event){
	// If avlue already set, cancel this click event
	if(element.val() != ""){
		event.preventDefault();
		
		// Configure modal buttons to perform click, or to just do nothing on the current element
		$('#form-warning-modal-proceed').on('click', function(){
			console.log("proceed");
			element.val("");
			element.trigger('click');
			$('#form-warningModal').modal('hide');
		});
		$('#form-warning-modal-cancel').on('click', function(){
			console.log("hidding");
			$('#form-warningModal').modal('hide');			
		});
		$('#form-warningModal').modal('show');
	}
}







/*
	Block HTML / onCLick stuff
*/
function getBlockElementHtml(decisionTreeId, block, blockIndex){
	var content = '<div id="'+decisionTreeId+'" class="form-group">';
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
	content += '<a>Add a block section</a>'; //onclick="addBlock(['+block.questions+'], `'+decisionTreeId+'`, '+nextBlockIdx+')"
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
		eltHtml = eltHtml.replace(/<br>/g, '');
		eltHtml = eltHtml.replace(/class="form-group"/g, '');
		content += eltHtml;
	});
	return content;
}

function bindBlockQuestionsToValue(blockId){
	// Handle input (text & chockbox)
	$('#'+blockId+' input').on('change', function(){
		if($(this).attr("type") == "checkbox"){
			$(this).attr("checked", $(this).is(':checked'));
			if($(this).is(':checked')){
				$(this).val("on");
			}
			else{
				$(this).val("off");
			}

		}
		else{
			$(this).attr("value", $(this).val());
		}
	});
	// Handle select
	$('#'+blockId+' select').on('change', function(){
		$(this).attr("value", $(this).val());
		// Add selected attribute for pdf generation
		$(this).find('option:not(:selected)').removeAttr("selected");
		$(this).find('option:selected').attr("selected", "selected");
	});
}

function bindAddBlock(blockId, questions, index){
	// Half global function for this variable
	blockIdx = index;
	$('#'+blockId+' a').on('click', function(){
		addBlock(questions, blockId, blockIdx);
	});
}

function addBlock(questions, nodeId, index){
	console.log("adding block at position ", index);
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
	content += '<textarea class="form-result">'+result.content+'</textarea>';
	content += '<br>';
	content += "</div>";
	return content;
}