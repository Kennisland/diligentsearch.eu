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

function get_handle_database(req,res) {
   
	pool.getConnection(function(err,connection){
		if (err) {
		  res.json({"code" : 100, "status" : "Error in connection database"});
		  return;
		} 

		// console.log("get_handle_database : ", req.query);

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
		

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
  });
}

function post_handle_database(req, res){

	pool.getConnection(function(err,connection){
		if (err) {
		  res.json({"code" : 100, "status" : "Error in connection database"});
		  return;
		} 

		switch(req.body.table){
			case 'SharedUserInput':
				var countryId = req.body.countryId,
					json = req.body.json;
				// connection.query("insert into SharedUserInput (countryId,json) values ('"+countryId+"','"+json+"');", mysqlGetLastInserted());
				connection.query("insert into SharedUserInput (countryId,json) values ('"+countryId+"','"+json+"');", function(err,rows){
					connection.release();
					if(!err) {
						res.json(rows);
					}          
				});
				break;
			case 'SharedRefValue':
				var countryId = req.body.countryId,
					json = req.body.json;
				connection.query("insert into SharedRefValue (countryId, json) values ('"+countryId+"', '"+json+"');", function(err,rows){
					connection.release();
					if(!err) {
						res.json(rows);
					}          
				});
				break;
			case 'Question':
				// connection.query("insert into Question ")
				break;
			case 'Block':
				// connection.query("insert into Block ")
				break;
			case 'Result':
				// connection.query("insert into Result ")
				break;
			default:
				console.log("default case : ",req.query.table );
				break;
		}

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
	});
}


app.get(dbRoute,function(req,res){      
	get_handle_database(req,res);
});

app.post(dbRoute, function(req, res){
	post_handle_database(req, res);
});

app.listen(8888);