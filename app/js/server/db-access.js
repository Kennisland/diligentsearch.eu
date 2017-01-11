var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'phpmyadmin',
  password : 'diligentsearch',
  database : 'diligent_search'
});

connection.connect();

connection.query('SELECT * from Country', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});

connection.end();