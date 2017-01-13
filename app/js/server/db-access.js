var express   	=	require("express");
var bodyParser 	= 	require('body-parser');
var mysql     	=	require('mysql');
var dbRoute		= 	"/";
var app       	=	express();
app.use(bodyParser.urlencoded({
	extended: true
}));

var pool      	=	mysql.createPool({
	connectionLimit : 100, //important
	host     : 'localhost',
	user     : 'phpmyadmin',
	password : 'diligentsearch',
	database : 'diligent_search',
	debug    :  false
});

function handle_database(req,res) {
   
	pool.getConnection(function(err,connection){
		if (err) {
		  res.json({"code" : 100, "status" : "Error in connection database"});
		  return;
		} 

		if(req.query){
			handle_get_request(req, res, connection);
		}

		if(req.body){
			handle_post_request(req, res, connection);
		}		

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
  });
}


function handle_get_request(req, res, connection){

	var currentTable = req.query.table;

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
		connection.query("select * from Work where countryId='"+countryId+"'",function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}
		});
	}
	else if(currentTable == 'SharedUserInput' || currentTable == 'SharedRefValue'){
		var countryId = req.query.foreignKeyId;
		connection.query("select * from "+currentTable+" where countryId='"+countryId+"'",function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}
		});
	}
	else if(currentTable == 'DecisionTree' || currentTable == 'Question' || currentTable == 'Block' || currentTable == 'Result') {
		var workId = req.query.foreignKeyId;
		connection.query("select * from "+currentTable+" where workId='"+workId+"'",function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});
	}
	else{
		console.log("Unknown table : ", currentTable);
	}
}


function handle_post_request(req, res, connection){

	var currentTable = req.body.table;

	if( currentTable == 'DecisionTree' || 
		currentTable == 'SharedUserInput' || 
		currentTable == 'SharedRefValue' ||
		currentTable == 'Question' || 
		currentTable == 'Block' || 
		currentTable == 'Result'){

			// Delete case
			if(req.body.remove){
				var q = "delete from "+currentTable+" where id='"+req.body.id+"';";
				connection.query(q, function(err, rows){
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
					var q = "insert into "+currentTable+" ("+foreignKeyAttrName+",json) values ('"+req.body.foreignKeyId+"','"+req.body.json+"');";
					connection.query(q, function(err, rows){
						connection.release();
						if(!err){
							res.json(rows);
						}
					});
				}
				else if(req.body.update){
					var q = "update "+currentTable+" set json='"+req.body.json+"' where id='"+req.body.id+"';";
					connection.query(q, function(err, rows){
						connection.release();
						if(!err){
							res.json(rows);
						}
					});
				}
			}			
	}
	else{
		console.log("Unknown table : ", currentTable);
	}
}

app.get(dbRoute,function(req,res){      
	handle_database(req, res);
});

app.post(dbRoute, function(req, res){
	handle_database(req, res);
});

app.listen(8888);