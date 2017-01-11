var express   	=	require("express");
var dbRoute		= 	"/"; //http://localhost:8000
var mysql     	=	require('mysql');
var app       	=	express();

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

		console.log('connected as id ' + connection.threadId);

		console.log(req.query);
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
			case 'SharedUserInputs':
				var countryId = req.query.countryId;
				connection.query("select * from SharedUserInput where countryId='"+countryId+"'",function(err,rows){
					connection.release();
					if(!err) {
						res.json(rows);
					}          
				});
				break;
			case 'SharedRefValues':
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
		

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
  });
}

app.get(dbRoute,function(req,res){      
	handle_database(req,res);
});

app.listen(8000);