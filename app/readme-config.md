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



## PhpMyAdmin configuration

This application requires access to a MySQL database, to install it, type the following command:

	sudo apt-get install mysql-server


To simplifie DB management and visualization, we will use the phpmyadmin dashboard

Download phpmyadmin package

	sudo add-apt-repository ppa:nijel/phpmyadmin

	sudo apt-get update

	sudo apt-get install phpmyadmin

Configure phpmyadmin

	Choose apache2 as a default HTTP server
	Choose to confugure the mysql db : password = diligentsearch


Access the dashboard

	Create symbolic link between phpMyAdmin and apache2 default configuration:
	sudo ln -s /usr/share/phpmyadmin/ /var/www/html/phpmyadmin

	Restart apache2 to activate changes:
	sudo /etc/init.d/apache2 restart

	To access phpmyadmin dashboard, go to 
	http://localhost/phpmyadmin

	If you have difficulties to login, refer to the following file:
	/etc/phpmyadmin/config-db.php
	The '$dbuser' and '$dbpass' are the login/password



## MySQL Database configuration

The application will require a specific database we will manage from the previsouly installed/configured dashboard.

Privileges are required for your new phpmyadmin user to create databases from the dashboard. To set him privileges, open up a mysql shell as the mysql root user: 

	mysql -u root -p

Type in the following commands:

	GRANT ALL PRIVILEGES ON *.* TO 'phpmyadmin'@'localhost' WITH GRANT OPTION;
	FLUSH PRIVILEGES;
	
Refer to this if there are problems:

	http://askubuntu.com/questions/763336/cannot-enter-phpmyadmin-as-root-mysql-5-7