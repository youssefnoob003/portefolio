---
title: "LAMP Stack Setup Lab"
date: "2025-04-10"
description: "This project sets up a LAMP stack (Linux, Apache, MySQL, PHP) to deploy a PHP-based To-Do List web application. "
technologies: ["Linux (Ubuntu)","Apache","MySQL","PHP","OpenSSL","SSL/TLS","PDO (PHP Data Objects)"]
---

# LAMP Stack Setup

## 1. **Project Overview**

In this project, we will be setting up a **LAMP (Linux, Apache, MySQL, PHP)** stack to host a simple PHP web application, which is a to-do list app. The web application will be deployed on one Ubuntu server running Apache and PHP, and a separate MySQL database server will be used for storing the application’s data. Initially, the connection between the web server and MySQL database will be established without SSL. Later, SSL encryption will be enabled for both MySQL connections and the Apache web server to secure communications.

### **Objectives:**

- Set up Apache web server with PHP on a Ubuntu server.
    
- Set up MySQL database server on a separate Ubuntu server.
    
- Deploy the PHP-based to-do list application on the Apache web server.
    
- Connect the PHP web application to MySQL.
    
- Enable SSL for MySQL communication.
    
- Enable HTTPS on the Apache server using a self-signed certificate.
    

---

## 2. **Setting up the Apache Web Server**

### 2.1 **Installing Apache and PHP**

1. **Update the package list** on the Ubuntu server to ensure you get the latest versions of the software.
    
    ```bash
    sudo apt update
    ```
    
2. **Install Apache and PHP** along with the necessary modules (libapache2-mod-php for integrating PHP with Apache and php-mysql to allow PHP to interact with MySQL).
    
    ```bash
    sudo apt install apache2 -y
    sudo apt install php libapache2-mod-php php-mysql -y
    ```
    
3. **Verify Apache installation** by checking the status of the Apache service:
    
    ```bash
    sudo systemctl status apache2
    ```
    
    This should show that Apache is running. You can also test Apache by opening a web browser and navigating to the server’s IP address. If Apache is working, you should see the default Apache page.
    

### 2.2 **Deploying the PHP Web Application**

Now that Apache is installed, we need to deploy the PHP-based to-do list application to the web server.

1. On your **local machine**, use SCP (Secure Copy Protocol) to copy the application’s directory to the web server. The `-r` flag ensures that all files and directories within the project folder are copied.
    
    ```bash
    scp -r ToPHP/* sibou@192.168.85.141:/home/sibou/ToPHP
    ```
    
    - ToPHP/* specifies the files to be transferred.
        
    - sibou@192.168.85.141:/home/sibou/ToPHP is the remote server's user and destination directory.

![](/Screenshots/lamp_pics/scp.png)

2. **SSH into the remote server** to move the application files to the correct directory for Apache to serve:
    
    ```bash
    ssh sibou@192.168.85.141
    sudo mv /home/sibou/ToPHP /var/www/html/
    ```
    
    - /var/www/html/ is the default document root directory for Apache.
        
3. **Set correct file permissions** for Apache to access the web application files. Apache runs as the www-data user, so we change ownership of the files to www-data and set the appropriate read/write permissions.
    
    ```bash
    sudo chown -R www-data:www-data /var/www/html/ToPHP
    sudo chmod -R 755 /var/www/html/ToPHP
    ```
    
    - chown -R www-data:www-data gives ownership of the files to the www-data user and group (which Apache uses).
        
    - chmod -R 755 ensures that files are readable and executable by the owner and others.
        
4. **Verify the deployment** by visiting the web server's IP address in a browser (e.g., http://192.168.85.141/ToPHP). The application should now be live and accessible.
    
![](/Screenshots/lamp_pics/page_running.png)

## 3. **Setting up the MySQL Database Server**

Now we will set up the MySQL database server on a **separate Ubuntu server** and configure it to allow remote connections from the PHP web application.

### 3.1 **Installing MySQL Server**

1. **Install MySQL** on the MySQL server:
    
    ```bash
    sudo apt update
    sudo apt install mysql-server -y
    ```
    
2. **Verify MySQL installation**:
    
    ```bash
    sudo systemctl status mysql
    ```
    
    This will confirm if MySQL is running.
    
### 3.2 **Configuring MySQL to Accept Remote Connections**

By default, MySQL listens for connections on 127.0.0.1 (localhost), meaning it will only accept local connections. To allow connections from the web server, we need to configure MySQL to listen on the MySQL server’s IP address.

1. **Edit the MySQL configuration file** to allow remote connections by modifying the bind-address to the server's IP address:
    
    ```bash
    sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
    ```
    
2. Find the line:
    
```ini
bind-address = 127.0.0.1
```
    
    And change it to:
    
```ini
bind-address = 192.168.85.139
```
    
    This allows MySQL to listen for connections from remote servers (in this case, the web server). Replace `192.168.85.139` with your MySQL server's actual IP address.
    
3. **Restart MySQL** to apply the changes:
    
    ```bash
    sudo systemctl restart mysql
    ```
    

### 3.3 **Creating the Database and Tables**

Log in to MySQL as the root user and create the required database (todo_db) and tables (users and tasks):

1. **Login to MySQL as root**:
    
    ```bash
    mysql -u root -p
    ```
    
2. **Create the todo_db database**:
    
    ```sql
    CREATE DATABASE todo_db;
    ```
    
3. **Create the users table**:
    
    ```sql
    CREATE TABLE todo_db.users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    ```
    
4. **Create the tasks table**:
    
    ```sql
    CREATE TABLE todo_db.tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('ongoing', 'done') DEFAULT 'ongoing',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ```
    

### 3.4 **Creating a MySQL User and Granting Permissions**

We will create a user (todo_user) and grant them access to the todo_db database:

```sql
CREATE USER 'todo_user'@'192.168.85.141' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON todo_db.* TO 'todo_user'@'192.168.85.141';
FLUSH PRIVILEGES;
```

## 4. **MySQL Client Configuration on the PHP Server**

Now we will configure the PHP web application to connect to the MySQL database on the separate server.

### 4.1 **Installing MySQL Client and Testing the Connection**

Install the MySQL client on the web server:

```bash
sudo apt update
sudo apt install mysql-client -y
```

Next, test the connection to the MySQL server:

```bash
mysql -h 192.168.85.139 -u todo_user -p
```

Enter the password for `todo_user` when prompted. If the connection is successful, you’ll see the MySQL prompt:

![](/Screenshots/lamp_pics/remote.png)
### 4.2 **Configuring the Database Connection in the PHP Application**

In the PHP application’s db.php file, update the connection details to reflect the IP address of the MySQL server and the credentials for the newly created todo_user.

Edit the db.php file:

```php
<?php
session_start();

$host = "192.168.85.139"; // Remote MySQL server IP
$user = "todo_user"; // Remote MySQL user
$password = "password"; // User password
$dbname = "todo_db"; // Database name

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>
```

## **5. Setting Up SSL for MySQL Communication**

This section provides an in-depth guide on how to secure communication between a MySQL server and a client by using SSL (Secure Socket Layer) certificates. This ensures that data transmitted between the client and server is encrypted, protecting sensitive information from potential eavesdropping and man-in-the-middle attacks.

By default, MySQL sends traffic in plaintext, which can be intercepted easily. In this tutorial, we will show you how to enable SSL encryption, verify secure connections, and configure your PHP application to use SSL for secure communication with the MySQL database.

### **5.1 Enable SSL on the MySQL Server**

To enable SSL encryption on your MySQL server, we first need to configure MySQL to generate and use SSL certificates.

1. **Configure MySQL to Auto-Generate SSL Certificates**
    
    SSL certificates are needed for establishing secure connections. MySQL can auto-generate the required certificates. To enable SSL, you will need to modify the MySQL configuration file to specify the location of these certificates.
    
    Start by editing the mysqld.cnf file:
    
    ```bash
    sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
    ```
    
    Add the following lines under the [mysqld] section to specify the locations of the SSL certificates:
    
```ini
ssl-ca = /var/lib/mysql/ca.pem
ssl-cert = /var/lib/mysql/server-cert.pem
ssl-key = /var/lib/mysql/server-key.pem
```
    
    These entries point MySQL to the generated certificates, which include the Certificate Authority (CA) certificate, the server's certificate, and the server's private key.
    
2. **Restart MySQL**
    
    Once you've updated the configuration file, restart the MySQL service to apply the changes:
    
    ```bash
    sudo systemctl restart mysql
    ```
    
3. **Verify SSL Activation**
    
    To confirm that SSL has been successfully enabled, connect to MySQL and check the status of SSL:
    
    ```sql
    SHOW VARIABLES LIKE '%ssl%';
    ```
    
    
    ![](/Screenshots/lamp_pics/sslOn.png)
    

### **5.2 Copy the CA Certificate to the Client**

To enable the client to communicate securely with the MySQL server, we need to transfer the server's CA certificate to the client. This certificate is used to verify the authenticity of the MySQL server during the connection handshake.

1. **Transfer the CA Certificate to the Client**
    
    First, create a directory on the client machine to store the certificate:
    
    ```bash
    sudo mkdir -p /etc/mysql/ssl
    ```
    
    Then, copy the ca.pem file from the MySQL server to the client machine using scp (secure copy):
    
    ```bash
    sudo cp /var/lib/mysql/ca.pem /home/sibou/ca.pem
    sudo scp sibou@192.168.85.139:/home/sibou/ca.pem /etc/mysql/ssl/
    ```
    
    Replace 192.168.85.139 with the actual IP address or hostname of your MySQL server.
    
2. **Set Permissions**
    
    After copying the certificate, ensure it has the appropriate permissions so that it can be accessed by MySQL:
    
    ```bash
    sudo chmod 644 /etc/mysql/ssl/ca.pem
    ```
    
    This ensures that the client machine can read the certificate file when establishing the secure connection.
    
### **5.3 Configure the MySQL Client to Use SSL**

Now that SSL is enabled on both the server and the client, we need to configure the MySQL client to use SSL when connecting to the server.

1. **Connect to the MySQL Server Using SSL**
    
    To establish a secure connection from the MySQL client to the server, you must use the --ssl-ca flag to specify the location of the CA certificate and --ssl-mode=REQUIRED to enforce SSL encryption:
    
    ```bash
    mysql -h mysql_server_ip -u ssl_user -p --ssl-ca=/etc/mysql/ssl/ca.pem --ssl-mode=REQUIRED
    ```
    
    Replace mysql_server_ip with your MySQL server's IP address and ssl_user with the MySQL username.
    
2. **Verify the SSL Connection**
    
    After successfully connecting to the MySQL server, verify that the SSL connection is active by typing the following command in the MySQL client:
    
    ```sql
    \s
    ```
    
    This will show detailed information about the current session, including SSL status. You should see a line similar to the following:
    
    ```
    SSL: Cipher in use
    ```
    
    This confirms that the connection is encrypted using SSL.
    
    ![](/Screenshots/lamp_pics/ssl.png)
    

### **5.4 Configure PHP to Use SSL for MySQL Connections**

In your PHP application, you need to configure the MySQL connection to use SSL for secure communication. To do this, update your db.php (or equivalent) database connection file.

1. **Modify the db.php File**
    
    Use the following template to modify your db.php file. This configuration will include the necessary SSL options for the PDO connection. Make sure to replace the paths to your certificates with the actual file paths on your server.
    

```php
?php
session_start();

$host = "192.168.85.139"; // Remote MySQL server IP
$user = "todo_user"; // Remote MySQL user
$password = "password"; // User password
$dbname = "todo_db"; // Database name

// Path to SSL CA certificate (copied from MySQL server)
$ssl_ca = "/etc/mysql/ssl/ca.pem";

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    
    // Add SSL configuration to options
    $options = [
        PDO::MYSQL_ATTR_SSL_CA => $ssl_ca,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false, // Disable for self-signed certs
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ];
    
    $pdo = new PDO($dsn, $user, $password, $options);

} catch(PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>
```

### **6. Enabling HTTPS on Apache with a Self-Signed Certificate**

This guide walks you through enabling HTTPS on Apache without a domain name or public IP, using a **self-signed SSL certificate**. This setup is useful for local development or internal networks where a public certificate is not required.

---

### **6.1 Understanding HTTP vs. HTTPS**

By default, Apache serves content over **HTTP (port 80)**, which transfers data in plaintext. This means any data exchanged between the server and the client can be intercepted. HTTPS (port 443) encrypts the connection using SSL/TLS, securing sensitive data such as login credentials.

### **6.2 Generate a Self-Signed SSL Certificate**

A self-signed certificate allows HTTPS access without requiring a certificate from a Certificate Authority (CA).

Run the following command to create an SSL certificate and private key:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/selfsigned.key \
-out /etc/ssl/certs/selfsigned.crt
```

- -x509 → Creates an X.509 certificate
    
- -nodes → No passphrase (Apache requires automatic access)
    
- -days 365 → Certificate validity (1 year)
    
- -newkey rsa:2048 → Generates a 2048-bit RSA key
    
After execution, two files will be generated:

- /etc/ssl/certs/selfsigned.crt (Certificate)
    
- /etc/ssl/private/selfsigned.key (Private Key)
    

---

### **6.3 Enable SSL Module in Apache**

Apache needs the ssl module to support HTTPS. Enable it using:

```bash
sudo a2enmod ssl
```

Then restart Apache to apply the changes:

```bash
sudo systemctl restart apache2
```

---

### **6.4 Create an SSL Virtual Host Configuration**

```bash
sudo nano /etc/apache2/sites-available/ssl-site.conf
```

-  **Add the following configuration:**

```apache
<VirtualHost *:443>
    ServerName 192.168.85.141

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/selfsigned.crt
    SSLCertificateKeyFile /etc/ssl/private/selfsigned.key

    DocumentRoot /var/www/html

    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

- ServerName 192.168.85.141 → Specifies the server IP
    
- SSLEngine on → Enables SSL for this virtual host
    
- SSLCertificateFile → Path to the certificate file
    
- SSLCertificateKeyFile → Path to the private key
    
- DocumentRoot → Directory where website files are stored
    

### **6.5 Enable the New SSL Site**

Now, enable the new SSL configuration and restart Apache:

```bash
sudo a2ensite ssl-site.conf
sudo systemctl restart apache2
```

---

### **6.6 Test HTTPS Connection**

1. Open a browser and go to:
    
    ```
    https://192.168.85.141
    ```
    
2. You’ll likely see a **browser warning** stating that the certificate is not trusted. This happens because the certificate is **self-signed** and not issued by a recognized Certificate Authority.
    
3. Click **Advanced → Proceed** to access the site.
    
![](/Screenshots/lamp_pics/certUntrust.png)

### **6.7 Redirect HTTP to HTTPS (Optional)**

To force all HTTP requests to be redirected to HTTPS, modify the Apache default configuration file:

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Add the following line inside the `<VirtualHost *:80>` block:

```apache
Redirect "/" "https://192.168.85.141/"
```

Save and restart Apache:

```bash
sudo systemctl restart apache2
```

Now, all HTTP traffic will automatically be redirected to HTTPS.

---

### **6.8 Verify SSL is Working**

To check if Apache is serving HTTPS properly, use:

```bash
sudo apachectl -S
```

It should list your SSL-enabled virtual host.

You can also test the SSL connection using openssl:

```bash
openssl s_client -connect localhost:443
```

If the connection is successful, the SSL certificate details will be displayed.

You can also try and make a packet capture and check for encrypted traffic.

![](/Screenshots/lamp_pics/https.png)