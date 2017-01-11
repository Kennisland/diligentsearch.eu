OutOfCopyright Configuration
==========


## Apache configuration

In order to make the project work locally, a specific Apache configuration is needed

### Linux and Apache2

Go to /etc/apache2/sites-available
Activate your Root access if not already done



Get the default configuration pattern and create a new one from it and edit it (for example 001-diligentsearch.conf)

	mv 000-default.conf 001-diligentsearch.conf

Enable serverName 
	
	serverName diligentsearch.local

Set the DirectoryRoot to the location of the index.html master main file of project
	
	DocumentRoot /home/user/diligent-search
	<Directory /home/user/diligent-search>
	        Require all granted
	</Directory>
	ProxyPass "/node" "http://localhost:8000/"
	ProxyPassReverse "/node" "http://localhost:8000/"

*There is no final slash '/' at the end of the DocumentRoot*

The 8000 port is used by default in several nodeJS servers.

The '/node' route is required to perform POST requests to the Github api on the given repo.

Enable this new apache2 configuration with the following commands

	a2ensite 001-diligentsearch.conf

	service apache2 reload


Set the serverName used as a valid IP address

	nano /etc/hosts
	127.0.0.1	diligentsearch.local

The index.html file located in /home/user/diligent-search will be available at the diligentsearch.local URL
