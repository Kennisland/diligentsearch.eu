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
		content += '<input type="checkbox" value="off"></input>';
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
					content += '<div display:none">';				
				}
				content += '<label>'+elt.question+'</label>';
				// content += '<br>';
				content += '<input></input>';
				// content += '<br>';
				content += '<small>'+elt.information+'</small>';
				// content += '<br>';
				content += "</div>";
			}
		});
	}
	content += "</div>";
	return content;
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
	});
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
	});
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
	});
}

function questionNumericDecisionEvent(htmlId, htmlIndex, inputs, inputIdx, numConfig, targets){	
	var selector = htmlId+' div';
	$('#'+selector+' input').eq(htmlIndex).on('change', function(){
		var toFollow = undefined;
		inputs[inputIdx].value = $(this).val();
		if($(this).val() != ""){
			var evalResult = evalExpression(inputs, numConfig),
				targetIdx = evalResultToTargetIdx(evalResult),
				toFollow = targets[targetIdx];
		}
		handleFollowers(toFollow, targets)
	});
}

function questionNumericRemoveEvent(htmlId, inputs, i){
	$('#'+htmlId).on('remove', function(){
		inputs[i].value = undefined;
	});
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
	content += '<a onclick="addBlock(['+block.questions+'], `'+decisionTreeId+'`, '+nextBlockIdx+')">Add a block section</a>';
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

function addBlock(questions, nodeId, index){
	var innerBlockId 	= nodeId+'-'+index;
		htmlContent = '<div class="form-block">';		
	htmlContent += getBlockQuestionElementHtml(questions, innerBlockId);
	htmlContent += '</div>';

	var selector = nodeId+' div',
		selectorIdx = index-1;
	$('#'+selector).eq(selectorIdx).after(htmlContent);
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