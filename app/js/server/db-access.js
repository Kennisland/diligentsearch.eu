var express   	=	require("express");
var dbRoute		= 	"/db-access";
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
       
        connection.query("select * from Country",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }          
        });

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