Diligent search Server Configuration
==========

This file explains how to run the back end server, handling the database requests and the pdf generation.

Start the server
	
	node server.js

*You can run it with the pm2 node module, to benefit of a better monitoring*

## Architecture

The server gives access to two routes : /search and /print

The /search route provides access to the database, and accept both GET and POST requests
POST requests are used in order to insert / delete data from database.

The /print route provides access to the pdf generation, the process needs firstly a POST request with the html data print. Afterwar a GET request is received, to get the produced pdf file.

## PDF generation

Users can generate pdf report of their activity. Those pdf are stored within the pdf folder, and deleted once the user has download or open them.
The access to those files are achived thanks to GET requests on the /print route.

## Translation support

Data provided by the database can be translated, according to the language argument of the POST request received.
This argument allows to access a specific json file located into the i18n folder.

By default, those files are empty JSON objects. They're filled in according to the end-user usage.
All the data required by the activity of the user on a specific jurisdiction is dumped into. 

The raw data dumped in provides fields in whcih authorized user can translate in the appropriate language.