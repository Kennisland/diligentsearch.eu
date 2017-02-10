# Application architecture

The objective of this file is to outline how this application was build, and how you can find what you want, if you need to bring changes.

You can firstly find the documentation of all the functions contained within the js folder by opening the index.html file located within the docs folder.

> This documentation is not exhaustive, as it doesn't include the template-controller folder documentation.


## Where to look at first ?

The data-tools.js is a good file to begin with, as it contains basic data model of the application. You will find a bunch of helpers, and database interaction functions.

The database interaction is provided by the ajax-calls.js file, which acts as an interface with the server side. 

> The server connection configuration is present in ajax-calls.js file.

From this point, you will need to get deeper inside the architecture...

The application contains two main features :

1. Editor
2. Form

The first one is used to edit, update, and delete data. The second is used to visualize the data, that has been composed as a decision process in the first part.

Each of those functionality refers to data-tools.js and ajax-calls.js files.

## Data model of the application

Before digging in the features, here is schema of the data model used

- Basic Data :
 - user inputs 
 - references values 
 - results 
 - question 
 - block
- Graph data :
 - all basic data
- Form
 - Graph data

This is a kind of hierarchy, where a modification on the basic data will have side effects on the form.


## Editor

The objective of this feature is to edit, update, and delete data.

The entry point is the editor.html file, and will require the following files:

+ js/data-tools.js
+ js/ajax-calls.js
+ js/graph-tools.js
+ js/graph-svg-tools.js
+ template-controller/data-editor.js
+ template-controller/graph-editor.js
+ template-controller/data-modal/*
+ template-controller/graph-modal/*

Each file contained within the template controller folder possess its own html content, and javascript controller.

The html content is injected once javascript is loaded in the editor.html file.

User interactions will be then triggered by dedicated functions, contained within the associated controller.

### Data edition concept

To edit data, the user will have to display a specific modal, which is configured to use its own specific controllers.

That's why there are so many files ending with "-modal.js". Those files are directly connected to the functions of data-tools.js, for a better management of the data insertion, update, and deletion.

The objective is to create and store a set of data within the remote database, that will be accessed by the graph editor

### Graph edition concept

The graph edition uses specific function and modal to edit graphical nodes and display them.

The graphical nodes are rendered with the Dagre D3 js library, which is initialized with the function contained in the graph-svg-tools.js file.

The graph edition requires the data model created thanks to others modals **contained into data-modal/ folder**.

Each created node refers to the database ID of a specific data created before.

Finally the created graph can be stored, and updated within the remote database.
This is the database version which is accessed by the form, the second feature of the application.

## Form

The objective of this feature is to display a dynamic form, which corresponds to the graph retrieved from the database.

The entry point of this feature is the form.html file, and will require the following files:

+ js/data-tools.js
+ js/ajax-calls.js
+ js/form-tools.js
+ js/form-html-generation.js
+ template-controller/form-renderer.js

The html template contained in form-renderer.js is injected once the javascript code is fully loaded.

### Loading data 

Data are retrieved from the database, and the created graph is explored, according to the answers given by the user.

The form evolves dynamically, respecting the created graph, and exposes the data referred by the graph.

### Saving the form

The form filled in by the user can be saved into the database.

The user can access it further, by giving its reference id. He will then be able to continue to fill in his form.