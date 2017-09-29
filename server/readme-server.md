Diligent search Server Configuration
==========

This file explains how to run the back end server, handling the database requests and the pdf generation.

Start the server
	
	node server.js

*You can run it with the pm2 node module, to benefit of a better monitoring*

## Architecture

The server gives access to two routes : /search and /print

The /search route provides access to the database, and accept both GET and POST requests
POST requests are used in order to insert, update, or delete data from database.

The /print route provides access to the pdf generation, the process needs firstly a POST request with the html data to print. After a GET request is received, to get the produced pdf file.

## PDF generation

Users can generate pdf report of their activity. Those pdf are stored within the pdf folder, and deleted once the user has download or open them.

The access to those files is achieved with a GET requests on the /print route, with the given pdf file name.

## Translation support

Data provided by the database can be translated, according to the language argument of the POST request received on the main route.
This argument allows to access a specific json file located into the i18n folder.

This json file corresponds to a specific jurisdiction. It can handle several languages for a same jurisdiction.

> **Why ?** Some country benefits from several languages, such as Luxembourg, so for a same jurisdiction, we need to provide several translations.

The data required for the research work of an end user is appended into this file, **only if** a reference to this language  exists within the json file.

> **Language key** is the **javascript object key** of the sub part of the json file dedicated to the translation in a given language.

### Adding a new translation

1. Create a file which has the following pattern : jurisdiction.json where jurisdiction is replaced by the lowercase version of the given name of the jurisdiction as it appears in the tool.
2. Initiate it as an empty JSON object : **{}**
3. Copy json template content and paste it inside. Update the **"language"** to your needs, it can be for example **"English"**.

> This file is auto populated by the data coming out from the database. The jurisdiction.json file is **auto-filled in**.

### How does it work ?

The end user filling in the dynamic form will have access, by choosing a jurisdiction, to the associated **jurisdiction.json** file.

After what he choses an available language.

> Available languages are those present into jurisdiction.json file. (the template.json content copy pasted in).

The translation support returns the translated content if it exists, or the original content coming out from the database.

#### Setting up the translation

Once a jurisdiction.json is created, and one of the available language is populated, **thanks to user's activity**, translation manager can initiate the translation work.

Each data received from the database will offer the translation manager variables to fill in.

Those variables correspond to the translation of displayed elements. 

> If no translation is provided for a specific language, there will always be the raw data coming out from the database, present into this file

