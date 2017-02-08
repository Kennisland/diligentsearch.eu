Diligent search Wordpress Configuration
==========

This file explains how to set up this wordpress child theme into your running wordpress infrastructure

## Requirements

A running wordpress is required, providing the sparkling theme of diligentsearch.
So it implies that you also have set up the corresponding MySQL database.
It also implies that you have an apache configuration running up.

If you encounter some trouble with the apache configuration, please refer to the readme inside the app folder.
You can also look at the provided apache configuration file 002wordpress.conf and adapt it to your environment.



## Configuration

To benefit of this wordpress child theme, make the sparkling-child folder available into the themes folder of wordpress

rq 1 : themes folder is located into wordpress/wp-content/
rq 2 : the sparkling theme needs to be present into the them folder

To make it accessible, you can rather copy paste sparkling-child folder, or create a symbolik link to this one

To create a symbolik link :

	cd wordpress/wp-content/themes
	ln -s <path/to/sparkling-child> sparkling-child

The child theme will be avilable from the wp-admin dashboard of wordpress.

## Configure templates

Once the child theme is running up, create 2 pages :
* one using the Form-Renderer template
* one using the DataModel-Editor template

Those pages need to have a specific permalink, to match the given apache configuration. Set those permalink to /search and /editor respectively.

You should now be able to display those two pages

## Server bindings

To ensure you ahve acces to the api provided by the running up back-end server, visit the ajax-calls.js file present within the child theme.
Update the apiAccessUrl variable to match your server route api.