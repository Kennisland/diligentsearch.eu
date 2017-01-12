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
			console.log("get_handle_database : ", req.query);
			handle_get_request(req, res, connection);
		}

		if(req.body){
			console.log("post_handle_database : ", req.body);
			handle_post_request(req, res, connection);
		}		

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
  });
}


function handle_get_request(req, res, connection){
	if(req.query.last){
		connection.query("SELECT LAST_INSERT_ID();", function(err, rows){
			connection.release();
			if(!err){
				console.log(rows['LAST_INSERT_ID()']);
				res.json(rows);
			}
		});	
		return;
	}

	switch(req.query.table){
		case 'Country':
			connection.query("select * from Country",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'Work':
			var countryId = req.query.countryId;
			connection.query("select * from Work where countryId='"+countryId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'SharedUserInput':
			var countryId = req.query.countryId;
			connection.query("select * from SharedUserInput where countryId='"+countryId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'SharedRefValue':
			var countryId = req.query.countryId;
			connection.query("select * from SharedRefValue where countryId='"+countryId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'Question':
			var workId = req.query.workId;
			connection.query("select * from Question where workId='"+workId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'Block':
			var workId = req.query.workId;
			connection.query("select * from Block where workId='"+workId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		case 'Result':
			var workId = req.query.workId;
			connection.query("select * from Result where workId='"+workId+"'",function(err,rows){
				connection.release();
				if(!err) {
					res.json(rows);
				}          
			});
			break;
		default:
			break;
	}
}


function handle_post_request(req, res, connection){
	switch(req.body.table){
		case 'SharedUserInput':
			var countryId = req.body.countryId,
				json = req.body.json;
	
			if(req.body.update){
				connection.query("update SharedUserInput set json='"+req.body.json+"' where id='"+req.body.id+"';", function(err, rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}   
				});
			}
			else {
				connection.query("insert into SharedUserInput (countryId,json) values ('"+countryId+"','"+json+"');", function(err,rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}          
				});
			}
			break;
		case 'SharedRefValue':
			var countryId = req.body.countryId,
				json = req.body.json;

			if(req.body.update){
				connection.query("update SharedRefValue set json='"+req.body.json+"' where id='"+req.body.id+"';", function(err, rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}   
				});
			}
			else {
				connection.query("insert into SharedRefValue (countryId, json) values ('"+countryId+"', '"+json+"');", function(err,rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}          
				});
			}
			break;
		case 'Question':
			var workId = req.body.workId,
				json = req.body.json;

			if(req.body.update){
				connection.query("update Question set json='"+req.body.json+"' where id='"+req.body.id+"';", function(err, rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}   
				});
			}
			else {
				connection.query("insert into Question (workId, json) values ('"+workId+"', '"+json+"');", function(err,rows){
						connection.release();
						console.log(err, rows);
					if(!err) {
						res.json(rows);
					}          
				});
			}
			break;
		case 'Block':
			var workId = req.body.workId,
				json = req.body.json;

			if(req.body.update){
				connection.query("update Block set json='"+req.body.json+"' where id='"+req.body.id+"';", function(err, rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}   
				});
			}
			else {
				connection.query("insert into Block (workId, json) values ('"+workId+"', '"+json+"');", function(err,rows){
						connection.release();
						console.log(err, rows);
					if(!err) {
						res.json(rows);
					}          
				});
			}
			break;
		case 'Result':
			var workId = req.body.workId,
				json = req.body.json;

			if(req.body.update){
				connection.query("update Result set json='"+req.body.json+"' where id='"+req.body.id+"';", function(err, rows){
					connection.release();
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}   
				});
			}
			else {
				connection.query("insert into Result (workId, json) values ('"+workId+"', '"+json+"');", function(err,rows){
					connection.release();
					console.log(err, rows);
					console.log(err, rows);
					if(!err) {
						res.json(rows);
					}          
				});
			}
			break;
		default:
			console.log("default case : ",req.body.table );
			break;
	}
}

app.get(dbRoute,function(req,res){      
	handle_database(req, res);
});

app.post(dbRoute, function(req, res){
	handle_database(req, res);
});

app.listen(8888);