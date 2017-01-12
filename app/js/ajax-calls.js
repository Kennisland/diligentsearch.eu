dbAccessUrl = window.location.origin+"/db-access";

function ajaxGetCountries(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Country'},
		success: function(data){
			console.log("ajaxGetCountries success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetWorks(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Work', countryId: countryId},
		success: function(data){
			console.log("ajaxGetWorks success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetUserInputs(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'SharedUserInput', countryId: countryId},
		success: function(data){
			console.log("ajaxGetUserInput success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetRefValues(countryId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'SharedRefValue', countryId: countryId},
		success: function(data){
			console.log("ajaxGetRefValues success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetQuestions(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Question', workId: workId},
		success: function(data){
			console.log("ajaxGetQuestions success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetBlocks(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Block', workId: workId},
		success: function(data){
			console.log("ajaxGetBlocks success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetResults(workId){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {table: 'Result', workId: workId},
		success: function(data){
			console.log("ajaxGetResults success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}

function ajaxGetLast(){
	return $.ajax({
		type:"GET",
		url:dbAccessUrl,
		data: {last: true},
		success: function(data){
			console.log("ajaxGetLast success : ", data);
		},
		error: function(err){
			console.log("error :", err);
		}
	});
}
















function ajaxInsertUserInputElt(UserInputElt, countryId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'SharedUserInput',
			countryId: countryId,
			json: JSON.stringify(UserInputElt)
		},
		success: function(data){
			console.log("ajaxInsertUserInputElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}

function ajaxInsertRefValueElt(RefValueElt, countryId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'SharedRefValue',
			countryId: countryId,
			json: JSON.stringify(RefValueElt)
		},
		success: function(data){
			console.log("ajaxInsertRefValueElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}

function ajaxInsertQuestionElt(QuestionElt, workId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Question',
			workId: workId,
			json: JSON.stringify(QuestionElt)
		},
		success: function(data){
			console.log("ajaxInsertQuestionElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}

function ajaxInsertResultElt(ResultElt, workId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Result',
			workId: workId, 
			json: JSON.stringify(ResultElt)
		},
		success: function(data){
			console.log("ajaxInsertResultElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}


function ajaxInsertBlockElt(BlockElt, workId){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Block',
		 	workId: workId,
		 	json: JSON.stringify(BlockElt)
		},
		success: function(data){
			console.log("ajaxInsertBlockElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}

























function ajaxUpdateInputElt(userInputElt){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'SharedUserInput',
			update: true,
			id: userInputElt.id,
			json: JSON.stringify(userInputElt)
		},
		success: function(data){
			console.log("ajaxInsertUserInputElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}


function ajaxUpdateRefValueElt(refValueElt){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'SharedRefValue',
			update: true,
			id: refValueElt.id,
			json: JSON.stringify(refValueElt)
		},
		success: function(data){
			console.log("ajaxUpdateRefValueElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}


function ajaxUpdateQuestionElt(questionElt){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Question',
			update: true,
			id: questionElt.id,
			json: JSON.stringify(questionElt)
		},
		success: function(data){
			console.log("ajaxUpdateQuestionElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}


function ajaxUpdateResultElt(resultElt){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Result',
			update: true,
			id: resultElt.id,
			json: JSON.stringify(resultElt)
		},
		success: function(data){
			console.log("ajaxUpdateResultElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}


function ajaxUpdateBlockElt(blockElt){
	return $.ajax({
		type: "POST",
		url:dbAccessUrl,
		data: {
			table: 'Block',
			update: true,
			id: blockElt.id,
			json: JSON.stringify(blockElt)
		},
		success: function(data){
			console.log("ajaxUpdateBlockElt success");
		},
		error: function(error){
			console.log('error : ', error);
		}
	});
}