function loadExample(){
	
	injectUserInputData(-1, {
		id: 0,
		name: "Date_publication",
		question: "When was the work published ?",
		information: "",
		value : undefined
	});
	injectUserInputData(-1, {
		id: 1,
		name: "Date_birth_author",
		question: "When is the author born",
		information: "This is good to know for further computations",
		value : undefined
	});



	injectRefValueData(-1, {
		id: 0,
		name: "NOW",
		value: "Now",
		information: "Current year"
	});
	injectRefValueData(-1, {
		id: 1,
		name: "Book_protection",
		value: 75,
		information: "Number of years during the time a book is protected"
	});


	injectResultData(-1, {
		id: 0,
		name: "Result_work_free",
		content: "It appears this work is totally free"
	});
	injectResultData(-1, {
		id: 1,
		name: "Result_not_orphan",
		content: "This work doesn't appear to be an orphan work"
	});









	injectQuestionData(-1, {
		id: 0,
		name: "Broadcaster's_name_&_successors'_names",
		title: "Broadcaster name and all of its legal successors: ",
		type: "text",
		numerical: undefined,
		outputs : ['set']
	});
	injectQuestionData(-1, {
		id: 1,
		name: "Broadcaster_/_successors_in_business",
		title: "Broadcaster, or any of its legal succesors, still in business?",
		type: "list",
		numerical: undefined,
		outputs : ['Yes', 'No']
	});
	injectQuestionData(-1, {
		id: 2,
		name: "Broadcaster_public",
		title: "Is this broadcaster, or any of its legal succesors, a public broadcaster?",
		type: "list",
		numerical: undefined,
		outputs : ['Yes', 'No']
	});
	injectQuestionData(-1, {
		id: 3,
		name: "Instructions_followed",
		title: "I followed the instructions.",
		type: "check",
		numerical: undefined,
		outputs : ['Checked', 'Not checked']
	});
	injectQuestionData(-1, {
		id: 4,
		name: "Contact_details",
		title: "Please fill any contact details you found: ",
		type: "text",
		numerical: undefined,
		outputs : ['set']
	});
	injectBlockData(-1, {
		id: 0,
		name: "Broadcaster_informations",
		introduction: "Please input the details below: ",
		questions: [0, 1, 2, 3, 4]
	});



	injectQuestionData(-1, {
		id: 5, 
		name: "Numerical_computation_example",
		title: "This is an example of computation between referenced data",
		type: "numeric",
		numerical: {
			refId: 0,
			condition: "==",
			expression: [{
				sources: userInputs,
				idx: 0
			},{
				sources: userInputs,
				idx: 1
			}],
			operations: ['+']
		},
		outputs : ['True', 'False']
	});
}