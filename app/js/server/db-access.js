var express   	=	require("express");
var bodyParser 	= 	require('body-parser');
var mysql     	=	require('mysql');
var mysqlConfig = 	require('./db-config.js').dbConfig();
var dbRoute		= 	"/";
var app       	=	express();
app.setMaxListeners(0);
app.use(bodyParser.urlencoded({
	extended: true
}));

var pool      	=	mysql.createPool({
	connectionLimit : 100, //important
	host		: mysqlConfig.host,
	user		: mysqlConfig.user,
	password	: mysqlConfig.password,
	database	: mysqlConfig.database,
	debug    :  false
});

function handle_database(req,res) {
   
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


function handle_get_request(req, res, connection){

	var currentTable = req.query.table;

	// Stop condition
	if(!currentTable)
		return;

	if(currentTable == 'Country'){
		connection.query("select * from Country", function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}
		});
	}
	else if(currentTable == 'Work'){
		var countryId = req.query.countryId;
		connection.query("select * from Work where countryId = ?", [countryId], function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}
		});
	}
	else if(currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue'){
		var countryId = req.query.foreignKeyId;
		connection.query("select * from "+currentTable+" where countryId = ?", [countryId], function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}
		});
	}
	else if(currentTable == 'DecisionTree' || currentTable == 'Question' || currentTable == 'Block' || currentTable == 'Result') {
		var workId = req.query.foreignKeyId;
		connection.query("select * from "+currentTable+" where workId = ?", [workId], function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});
	}
	else if(currentTable == 'Form'){
		var webHook = req.query.webHook;
	}
	else{
		console.log("Unknown table : ", currentTable);
	}
}


function handle_post_request(req, res, connection){

	var currentTable = req.body.table;

	// Stop condition
	if(!currentTable)
		return;

	if(currentTable == 'Country'){
		if(req.body.insert){
			var q = "insert into "+currentTable+" (code, name) values ( ?, ?)",
				countryObj = JSON.parse(req.body.json);
			connection.query(q, [countryObj.code, countryObj.name], function(err, rows){
				connection.release();
				if(!err){
					res.json(rows);
				}
			});
		}
	}
	else if(currentTable == 'Work'){
		if(req.body.insert){
			var q = "insert into "+currentTable+" (countryId, name) values ( ?, ?)",
				workObj = JSON.parse(req.body.json);
			connection.query(q, [workObj.countryId, workObj.name], function(err, rows){
				connection.release();
				if(!err){
					res.json(rows);
				}
			});
		}
	}
	else if( currentTable == 'DecisionTree' || 
		currentTable == 'SharedUserInput' || 
		currentTable == 'SharedRefValue' ||
		currentTable == 'Question' || 
		currentTable == 'Block' || 
		currentTable == 'Result'){

			// Delete case
			if(req.body.remove){
				var q = "delete from "+currentTable+" where id = ?";
				connection.query(q, [req.body.id], function(err, rows){
					connection.release();
					if(!err){
						res.json(rows);
					}
				});
			}
			else{
				var foreignKeyAttrName = (currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue') ? 'countryId' : 'workId';

				// Insert case or Update case
				if(req.body.insert){
					var q = "insert into "+currentTable+" ("+foreignKeyAttrName+",json) values ( ?, ?)";
					connection.query(q, [req.body.foreignKeyId, req.body.json], function(err, rows){
						connection.release();
						if(!err){
							res.json(rows);
						}
					});
				}
				else if(req.body.update){
					var q = "update "+currentTable+" set json = ? where id = ?";
					connection.query(q, [req.body.json, req.body.id], function(err, rows){
						connection.release();
						if(!err){
							res.json(rows);
						}
					});
				}
			}			
	}
	else if(currentTable == 'Form'){
		if(req.body.insert){
			var q = "insert into "+currentTable+" (workId, hook, json) values (? , ?, ?)",
				webHook = genWebHook();
			connection.query(q, [req.body.foreignKeyId, webHook, req.body.json], function(err, rows){
				connection.release();
				if(!err){
					rows.webHook = webHook;
					res.json(rows);
				}
			});
		}
		else if(req.body.update){
			var q = "update "+currentTable+" set json = ? where hook = ?";
			connection.query(q, [req.body.json, req.body.webHook], function(err, rows){
				connection.release();
				if(!err){
					res.json(rows);
				}
			});
		}
	}
	else{
		console.log("Unknown table : ", currentTable);
	}
}

function genWebHook(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


app.get(dbRoute,function(req,res){      
	handle_database(req, res);
});

app.post(dbRoute, function(req, res){
	handle_database(req, res);
});

app.listen(8888);