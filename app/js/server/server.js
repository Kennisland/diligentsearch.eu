/*
	Server global configuration
*/
var express   	=	require("express");
var bodyParser 	= 	require('body-parser');
var mainRoute 	= 	"/";
var dbRoute		= 	"/search";
var pdfRoute 	= 	"/print";
var app       	=	express();

app.setMaxListeners(0);
app.use(bodyParser.urlencoded({
	extended: true
}));


/*
	Server dependencies
*/
var db 	= require('./db-helper.js');
var pdf = require('./pdf-helper.js');


/*
	Route configuration
*/
app.get(mainRoute,function(req,res){
	if(req.query.translationRequired){
		db.getTranslations(req, res);
	}
	else{
		res.json("You are on the main route of the server. Available route : /search & /print");		
	}
});


// Databse access
app.get(dbRoute,function(req,res){  
	db.handle(req, res);
});

app.post(dbRoute, function(req, res){
	db.handle(req, res);
});


// PDF printing
app.get(pdfRoute+'/:file', function(req, res){
	pdf.get(req, res);
});

app.post(pdfRoute, function(req, res){
	pdf.generate(req, res);
});



/*
	Launch server
*/
app.listen(8888);