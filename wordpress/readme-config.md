# Wordpress configuration

A running wordpress is required, providing the sparkling theme of diligentsearch

## Set up - ensure to have the latest source files

Commands to execute from the 'wordpress' folder to get back the data

	cp -R ../app/* ./sparkling-child/
	cd sparkling-child/
	rm css/bootstrap* css/font-awesom*
	rm js/lib/jquery* js/lib/bootstrap*
	rm *.html readme*.md

Don't forget to update ajax-calls.js file, for matching the remote server


## Wordpress integration

Copy paste the sparkling-child folder into the wordpres theme folder, where the sparkling theme resides
The child theme should now be available from the wp-admin interface