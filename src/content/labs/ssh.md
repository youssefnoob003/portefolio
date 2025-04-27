---
title: "SSH Brute Force Analysis and Mitigation"
date: "2025-03-15"
description: "Setup SSH, analyze and mitigate SSH brute force attacks in a controlled home lab environment"
technologies: ["Ubuntu Server", "OpenSSH", "Hydra", "Fail2Ban", "SSH Key Authentication"]
---

# **SSH Brute Force Analysis and Mitigation**

## **1. Introduction**

### **1.1 Project Overview**

This project aims to simulate, analyze, and mitigate SSH brute force attacks in a controlled home lab environment. By setting up an Ubuntu server, configuring SSH with password-based authentication, and using Hydra for brute force attacks, we will observe potential security vulnerabilities. The project will then implement Fail2Ban for intrusion prevention and strengthen security through SSH key-based authentication, effectively nullifying brute force threats.

### **1.2 Objectives**

- Establish a secure Ubuntu server environment with SSH access.
    
- Demonstrate an SSH brute force attack using Hydra.
    
- Implement Fail2Ban to detect and block brute force attempts.
    
- Enhance security by configuring SSH key-based authentication.    

### **1.3 Tools, Technologies**

- **Operating System:** Ubuntu Server
    
- **SSH Server:** OpenSSH
    
- **Brute Force Tool:** Hydra
    
- **Intrusion Prevention System:** Fail2Ban
    
- **Key-Based Authentication Tools:** OpenSSH keygen utilities

## **2. Environment Setup**

### **2.1 User Management**

#### **Creating a New User**

1. Log in as the root or default user.
    
2. Create a new user:
    
    ```bash
    sudo adduser <username>
    ```
    
    - This command creates a new user and prompts you to set a password.
        
    - The system will also ask for optional user details (full name, room number, etc.).
        
3. Set a password when prompted and confirm it. (for this part, I've chosen a weak password from the rockyou.txt wordlist)

#### **Assigning and Managing User Privileges**

- Grant sudo privileges to the user:
    
    ```bash
    sudo usermod -aG sudo <username>
    ```
    
    - usermod modifies a user account.
        
    - -aG sudo adds the user to the sudo group, granting administrative privileges.
    
- Verify the user’s sudo access:
    
    ```bash
    su - <username>
    sudo whoami
    ```
    
    - su - <username> switches to the newly created user.
        
    - sudo whoami should return root, confirming sudo access.

![](/Screenshots/ssh_pics/userCreated.png)

### **2.2 SSH Configuration for Password-Based Authentication**

#### **Starting and Validating SSH Service**

1. Start the SSH Service:
    
    ```bash
    sudo systemctl start ssh
    ```
    
2. Check the status of SSH:
    
    ```bash
    sudo systemctl status ssh
    ```
    
    - Displays the status of the SSH service to verify that it's running.
    
3. Test SSH login from a remote machine:
    
    ```bash
    ssh <username>@<server-ip>
    ```
    
    - <username> is the user created earlier.
        
    - <server-ip> is the IP address of the Ubuntu server.
        
    - If successful, you should gain access to the server remotely.

![](/Screenshots/ssh_pics/sshCon.png)

## **3. Brute Force Attack Simulation Using Hydra**

### **3.1 Understanding SSH Brute Force Attacks**

Brute force attacks involve systematically trying different password combinations to gain unauthorized access to a system. Hydra is a powerful tool that automates this process against SSH.

### **3.2 Installing and Configuring Hydra**

1. Install Hydra:
    
    ```
    sudo apt install hydra -y
    ```

### **3.3 Executing the Brute Force Attack**

1. Run Hydra to attempt SSH login:
    
    ```
    hydra -l <username> -P /usr/share/wordlists/rockyou.txt ssh://<server-ip>
    ```
    
    - -l <username> specifies the target username.
        
    - -P /usr/share/wordlists/rockyou.txt points to the password list.
        
    - ssh://<server-ip> targets the SSH server.
    
2. If the password is in rockyou.txt, Hydra will successfully crack it and display the credentials.

![](/Screenshots/ssh_pics/hydra.png)

### **3.4 Gaining Access and Analyzing Results**

1. Once Hydra finds the correct password, log in:
    
    ```
    ssh <username>@<server-ip>
    ```
    
    - Use the cracked password to gain access.
    
2. Review system logs:
    
    ```
    sudo tail /var/log/auth.log
    ```

![](/Screenshots/ssh_pics/logs.png)
## **4. Implementing Brute Force Mitigation with Fail2Ban**

### **4.1 Introduction to Fail2Ban and Its Role in Security**

Fail2Ban is an intrusion prevention software that monitors log files and bans IP addresses after repeated failed authentication attempts. It helps protect against brute force attacks by blocking malicious IPs for a specified duration, reducing the risk of unauthorized access.

### **4.2 Installing and Configuring Fail2Ban**

1. Install Fail2Ban:
    
    ```bash
    sudo apt install fail2ban -y
    ```

2. Enable and start the Fail2Ban service:
    
    ```bash
    sudo systemctl enable --now fail2ban
    ```
    
    - Ensures Fail2Ban starts on boot and runs immediately.
    
3. Create a local configuration file:
    
    ```bash
    sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    ```
    
    - Copies the default configuration to a local file for customization.
    
4. Edit the jail configuration:
    
    ```bash
    sudo nano /etc/fail2ban/jail.local
    ```
    
    - Modify settings such as:
        
```ini
	[sshd]
	enabled = true
	maxretry = 3
	bantime = 60
	findtime = 60
```
        
	- maxretry: Number of failed attempts before banning.
		
	- bantime: Duration (in seconds) an IP remains banned.
		
	- findtime: Time window for counting failed attempts.
            
5. Restart Fail2Ban to apply changes:
    
    ```bash
    sudo systemctl restart fail2ban
    ```

### **4.3 Testing and Verifying Fail2Ban Effectiveness**

1. Attempt multiple failed SSH logins to trigger a ban (We'll try the brute force attack again). 
    
2. Check banned IPs:
    
    ```bash
    sudo fail2ban-client status sshd
    ```

![](/Screenshots/ssh_pics/banned.png)
And obviously, our ip got banned.

![](/Screenshots/ssh_pics/refused.png)
3. To unban our IP, we simply type this command:

    ```bash
    sudo fail2ban-client set sshd unbanip <IP-ADDRESS>
    ```

## **5. Strengthening SSH Security with Key-Based Authentication**

### **5.1 Introduction to SSH Key-Based Authentication**

SSH key-based authentication offers a much more secure method of accessing an SSH server compared to password-based authentication. It uses a pair of cryptographic keys—one public and one private—to authenticate users. The public key is placed on the server, while the private key remains on the client machine. If the keys match, access is granted without needing a password.

This method mitigates the risks associated with password-based logins, such as brute-force attacks, since the private key is never transmitted during the authentication process.

### **5.2 Generating SSH Key Pair**

To use key-based authentication, you first need to generate an SSH key pair on the client machine (your local system).

1. **Generate SSH Key Pair on Client Machine:** Run the following command on your client machine (the machine from which you will connect to the server):
    
    ```bash
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    ```
    
    - -t rsa: Specifies the type of key to generate (RSA in this case).
        
    - -b 4096: Sets the key length to 4096 bits, providing a higher level of security.
        
    - -C "your_email@example.com": An optional comment to help identify the key (often an email address).
    
	    You will be prompted to enter a file path to save the key. Press Enter to use the default location (~/.ssh/id_rsa).
    
    After that, you can choose to enter a passphrase (optional) to further secure your private key.
    
2. **Confirm the Key Pair:** After running the above command, your key pair will be saved in the directory ~/.ssh/ (by default). You can verify that your key pair was created by listing the contents:
    
    ```bash
    ls ~/.ssh/
    ```
    
    You should see the following two files:
    
    - id_rsa (the private key, which must be kept secure).
        
    - id_rsa.pub (the public key, which can be shared with the server).

### **5.3 Copying the Public Key to the Server**

Next, you'll need to copy the public key (id_rsa.pub) to the server where you wish to authenticate. The easiest way to do this is by using the ssh-copy-id command.

1. **Copy the Public Key to the Server:** Run the following command from your client machine:
    
    ```bash
    ssh-copy-id <username>@<server-ip>
    ```
    
    This command will prompt you for the server’s password. Once entered, the public key will be added to the ~/.ssh/authorized_keys file on the server.
    
![](/Screenshots/ssh_pics/sshKey.png)

### **5.4 Disabling Password Authentication for SSH**

After setting up SSH key-based authentication, it’s a good idea to disable password-based authentication to prevent any potential brute-force attacks.

1. **Edit the SSH Configuration:** Open the SSH daemon configuration file on the server:
    
    ```bash
    sudo nano /etc/ssh/sshd_config
    ```

2. **Disable Password Authentication:** Find the line PasswordAuthentication and set it to no:
    
    ```bash
    PasswordAuthentication no
    ```

3. We must also delete an ssh config file that enables password auth by default:

```bash
	rm /etc/ssh/sshd_config.d/50-cloud-init.conf
```

3. **Restart SSH Service:** After saving the configuration file, restart the SSH service to apply the changes:

    ```bash
    sudo systemctl restart ssh
    ```

    With this setting, SSH login will now only be possible using the private key and not a password.

![](/Screenshots/ssh_pics/publicKey.png)

### **5.5 Verifying Key-Based Authentication**

To ensure everything is set up correctly, you can now attempt to SSH into the server without providing a password (since the server will authenticate you using your public key).

1. **Test SSH Connection:** From the client machine, try connecting to the server:
    
    ```bash
    ssh <username>@<server-ip>
    ```
    
    If key-based authentication is successful, you should log in without being asked for a password.

![](/Screenshots/ssh_pics/noPass.png)

## **6. Conclusion and Future Considerations**

This project demonstrates how SSH brute-force attacks can easily compromise a system and how to mitigate such risks using tools like Fail2Ban and SSH key-based authentication. Through these measures, we significantly enhance the security of our server and ensure a more resilient network environment.