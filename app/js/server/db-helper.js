/*
	MySql global setup
*/
var mysql     	=	require('mysql');
var mysqlConfig = 	require('./db-config.js').dbConfig();
var pool      	=	mysql.createPool({
	connectionLimit : 100, //important
	host		: mysqlConfig.host,
	user		: mysqlConfig.user,
	password	: mysqlConfig.password,
	database	: mysqlConfig.database,
	debug    :  false
});


/*
	Exposed function
*/
var handle_database = function(req,res) {
	pool.getConnection(function(err,connection){
		if (err) {
		  res.json({"code" : 100, "status" : "Error in connection database"});
		  return;
		}

		// nb : both req.query / req.body exist and equal at least {} (empty object)
		if(req.query){
			handle_get_request(req, res, connection);
		}
		if(req.body){
			handle_post_request(req, res, connection);
		}
	});
}

/*
	Http GET requests --> select element in table
*/
function handle_get_request(req, res, connection){
	var currentTable = req.query.table;

	// Stop condition
	if(!currentTable)
		return;

	// Callbacks
	function defaultCallback(err, rows){
		connection.release();
		if(!err){
			translate(currentTable, rows, req.query.language);
			res.json(rows);
		}else{
			res.json(err);
		}
	}

	// Define request arguments
	var q = "",
		params = [],
		error = "",
		cb = defaultCallback;

	// Analyse request
	if(currentTable == 'Country'){
		q = "select * from Country";
	}
	else if(currentTable == 'Work'){
		if(req.query.countryId){
			q = "select * from Work where countryId = ?";
			params.push(req.query.countryId);
		}
		else if(req.query.workId){
			q = "select * from Work where id = ?";
			params.push(req.query.workId);
		}
		else{
			error += "Error Mysql parameter not found   ";
		}
	}
	else if(currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue'){
		q = "select * from "+currentTable+" where countryId = ?"
		params.push(req.query.foreignKeyId);
	}
	else if(currentTable == 'DecisionTree' || currentTable == 'Question' || currentTable == 'Block' || currentTable == 'Result') {
		q = "select * from "+currentTable+" where workId = ?";
		params.push(req.query.foreignKeyId);
		if(currentTable == 'DecisionTree'){
			cb = function(err, rows){
				connection.release();
				if(!err){
					res.json(rows);
				}else{
					res.json(err);
				}
			}
		}
	}
	else if(currentTable == 'Form'){
		q = "select * from "+currentTable+" where hook = ?"
		params.push(req.query.webHook);
		cb = function(err, rows, webHook){
			connection.release();
			if(!err){
				rows.webHook = req.query.webHook;
				res.json(rows);
			}else{
				res.json(err);
			}
		};
	}
	else{
		error += "Error SQL table provided not defined   ";
	}


	if(error != ""){
		res.json({"code" : 100, "error" : error});	
		return;
	}

	connection.query(q, params, cb);
}


/*
	HTTP POST request --> insert / update element in databse
*/
function handle_post_request(req, res, connection){
	var currentTable = req.body.table;

	// Stop condition
	if(!currentTable)
		return;

	// Callback
	function defaultCallback(err, rows){
		connection.release();
		if(!err){
			res.json(rows);
		}else{
			res.json(err);
		}
	}

	// Define request arguments
	var q = "",
		params = [],
		error = "",
		cb = defaultCallback;

	if(currentTable == 'Country'){
		if(req.body.insert){
			var countryObj = JSON.parse(req.body.json);
			q = "insert into Country (code, name) values ( ?, ?)";
			params.push(countryObj.code);
			params.push(countryObj.name);
		}
		else{
			error += "Error Mysql parameter not found   ";
		}
	}
	else if(currentTable == 'Work'){
		if(req.body.insert){
			var workObj = JSON.parse(req.body.json);
			q = "insert into Work (countryId, name) values ( ?, ?)";
			params.push(workObj.countryId);
			params.push(workObj.name);
		}
		else{
			error += "Error Mysql parameter not found   ";
		}
	}
	else if(currentTable == 'Form'){
		if(req.body.insert){
			var webHook = genWebHook();
			q = "insert into Form (workId, hook, json) values (? , ?, ?)";
			params.push(req.body.foreignKeyId);
			params.push(webHook);
			params.push(req.body.json);
			cb = function(err, rows){
				connection.release();
				if(!err){
					rows.webHook = webHook;
					res.json(rows);
				}else{
					res.json(err);
				}
			};
		}
		else if(req.body.update){
			q = "update Form set json = ? where hook = ?";
			params.push(req.body.json);
			params.push(req.body.webHook);
		}
		else{
			error += "Error Mysql parameter not found   ";
		}
	}
	else if( currentTable == 'DecisionTree' || currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue' || currentTable == 'Question' || currentTable == 'Block' || currentTable == 'Result'){

			// Delete case
			if(req.body.remove){
				q = "delete from "+currentTable+" where id = ?";
				params.push(req.body.id);
			}
			else{
				var foreignKeyAttrName = (currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue') ? 'countryId' : 'workId';

				// Insert case or Update case
				if(req.body.insert){
					q = "insert into "+currentTable+" ("+foreignKeyAttrName+",json) values ( ?, ?)";
					params.push(req.body.foreignKeyId);
					params.push(req.body.json);
				}
				else if(req.body.update){
					q = "update "+currentTable+" set json = ? where id = ?";
					params.push(req.body.json);
					params.push(req.body.id);
				}
				else{
					error += "Error Mysql parameter not found   ";
				}
			}			
	}

	if(error != ""){
		res.json({"code" : 100, "error" : error});	
		return;
	}

	connection.query(q, params, cb);
}

function genWebHook(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 8; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

module.exports.handle = handle_database;



/*
	I18n translation support
*/
const fs 	= require('fs');
const path 	= require('path');

var getTranslations = function(req, res){
	console.log("get translation");
	var i18n = path.resolve(__dirname, './i18n/'),
		translations = [];
	fs.readdir(i18n, (err, files) => {
		if(err) throw err,
		console.log("files : ", files);
		files.forEach(file => {
			console.log("\tfile : ", file);
			if(file != "template.json"){
				translations.push(file.replace('.json', ''));				
			}
		});
		console.log("translations :", translations);
		res.json({"lg": translations});
	});
}
module.exports.getTranslations = getTranslations;



function translate(sqlTable, rows, lg){
	// identify language file wanted by user
	var lgFile = path.resolve(__dirname, './i18n/'+lg+'.json');
	if(!fs.existsSync(lgFile)) {
		return;
	}
	else{
		var obj = JSON.parse(fs.readFileSync(lgFile, 'utf8')),
			sqlTranslation = obj[sqlTable],
			modified = false;

		rows.forEach(function(row){	

			if(sqlTable == 'Country' || sqlTable == 'Work'){
				if(sqlTranslation[row.id]){
					if(sqlTranslation[row.id].translated != ""){
						row.name = sqlTranslation[row.id].translated;
					}
				}else{
					sqlTranslation[row.id] = {
						"original"	 : row.name,
						"translated" : ''
					};
					modified = true;
				}
			}
			else{
				// Get sub Json object
				var subJson = JSON.parse(row.json);

				// Operate modification on subJson
				if(sqlTable == 'SharedUserInput'){
					if(sqlTranslation[row.id]){
						if(sqlTranslation[row.id].translatedQuestion != ""){
							subJson.question = sqlTranslation[row.id].translatedQuestion;
						}
						if(sqlTranslation[row.id].translatedInformation != ""){
							subJson.information = sqlTranslation[row.id].translatedInformation;
						}
					}else{
						sqlTranslation[row.id] = {
							"originalQuestion"	 : subJson.question,
							"translatedQuestion" : '',
							"originalInformation"	: subJson.information,
							"translatedInformation" : ''
						};
						modified = true;
					}
				}

				if(sqlTable == 'SharedRefValue'){
					if(sqlTranslation[row.id]){
						if(sqlTranslation[row.id].translatedInformation != ""){
							subJson.information = sqlTranslation[row.id].translatedInformation;
						}
					}else{
						sqlTranslation[row.id] = {
							"originalInformation"	: subJson.information,
							"translatedInformation" : ''
						};
						modified = true;
					}
				}
				
				if(sqlTable == "Question"){
					if(sqlTranslation[row.id]){
						if(sqlTranslation[row.id].translatedTitle != ""){
							subJson.title = sqlTranslation[row.id].translatedTitle;
						}
					}else{
						sqlTranslation[row.id] = {
							"originalTitle"	 : subJson.title,
							"translatedTitle": ''
						};
						modified = true;
					}
				}

				if(sqlTable == "Result"){
					if(sqlTranslation[row.id]){
						if(sqlTranslation[row.id].translatedContent != ""){
							subJson.content = sqlTranslation[row.id].translatedContent;
						}
					}else{
						sqlTranslation[row.id] = {
							"originalContent"	 : subJson.content,
							"translatedContent": ''
						};
						modified = true;
					}
				}

				if(sqlTable == 'Block'){
					if(sqlTranslation[row.id]){
						if(sqlTranslation[row.id].translatedIntroduction != ""){
							subJson.introduction = sqlTranslation[row.id].translatedIntroduction;
						}
					}else{
						sqlTranslation[row.id] = {
							"originalIntroduction"	: subJson.introduction,
							"translatedIntroduction": ''
						};
						modified = true;
					}
				}

				// ReWrite json into the row
				row.json = JSON.stringify(subJson);				
			}


		});
		if(modified){
			fs.writeFileSync(lgFile, JSON.stringify(obj), 'utf8');
		}
	}
}

