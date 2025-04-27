---
title: "Advanced SNMP Monitoring and Security Lab"
date: "2025-04-22"
description: "An advanced SNMP monitoring and security lab designed using GNS3, covering basic and secure SNMP configurations, exploitation techniques, and a Flask-based web application for real-time device monitoring."
technologies: ["SNMPv1/v2c/v3","GNS3","Cisco IOS","Python","Flask"]

---

# Advanced SNMP Monitoring and Security Lab

## Table of Contents

1. Introduction to SNMP
    
2. Lab Environment Setup Using GNS3
    
3. Basic SNMP Configuration on Network Devices
    
4. Querying SNMP from a Linux Host
    
5. SNMP Exploitation Techniques
    
    - Eavesdropping on SNMP Traffic
        
    - Brute Forcing SNMP Community Strings
        
6. Introduction to SNMPv3 and Secure Monitoring
    
7. Flask-Based SNMP Monitoring Web Application
    
8. Conclusion
    

---

## 1. Introduction to SNMP

The **Simple Network Management Protocol (SNMP)** is a widely adopted protocol used for monitoring and managing devices on IP networks. It enables network administrators to gather performance data, detect faults, and configure network components remotely. SNMP operates primarily over UDP and uses a client-server model in which agents installed on network devices communicate with a central manager.

SNMP plays a critical role in network management by providing visibility into the operational state of routers, switches, servers, printers, and other networked hardware. It allows administrators to monitor device health, interface statistics, CPU usage, memory consumption, and much more—facilitating proactive network maintenance and rapid fault isolation.

### SNMP Versions

SNMP has evolved through multiple versions, each introducing improvements in functionality and security:

- **SNMPv1**: The original version, which provided basic read/write capabilities using plaintext community strings.
    
- **SNMPv2c**: Introduced performance enhancements and additional protocol operations but retained the same insecure authentication model.
    
- **SNMPv3**: Significantly improved security by adding authentication, encryption, and access control mechanisms, making it suitable for secure environments.
    

### Use Cases in Enterprise Networks

In enterprise settings, SNMP is widely used for:

- Centralized device monitoring and alerting
    
- Automated network mapping and inventory
    
- Performance trend analysis and capacity planning
    
- Fault detection and incident response
    
- Integration with network management systems (NMS) such as SolarWinds, Zabbix, and Nagios
    

SNMP remains an essential protocol in network operations and serves as the foundation for many modern monitoring and automation tools.

---

## 2. Lab Environment Setup Using GNS3

This section outlines the setup of a virtual lab environment using **GNS3** to simulate a network suitable for SNMP monitoring and security testing. The topology includes routers, switches, virtual machines, and PCs to emulate real-world monitoring scenarios.

### 2.1 Overview of the Lab Topology

The lab topology consists of the following components:

- R1 and R2: Two cisco routers.
    
- **SW1 & SW2**: Layer 2 switches used to connect end devices and route traffic within the topology.
    
- **PC1**: A virtual PC (VPCS) used for issuing SNMP queries and simulating user activity.
    
- **WebServ-1**: A Linux-based VM acting as a server.
    
- **SNMPServ-1**: A kali Linux VM dedicated to SNMP operations such as packet capturing, brute force testing, and testing SNMP configuration.

| Device        | Interface | IP Address        |
| ------------- | --------- | ----------------- |
| **R1**        | e0/0      | 10.0.0.253/24     |
| **R1**        | e0/1      | 10.0.1.254/24     |
| **R2**        | f0/0      | 10.0.0.254/24     |
| **SW1**       | VLAN 1    | 10.0.0.100/24     |
| **SW2**       | VLAN 1    | 10.0.0.200/24     |
| **SNMP-Serv** | eth0      | 10.0.0.1/24       |
| **WebServ**   | eth0      | 10.0.0.4/24       |
| **PC1**       | eth0      | 10.0.1.1/24       |

![](/Screenshots/snmp_pics/arch.png)

The layout supports both basic SNMP interactions and security experiments including traffic interception and brute force attacks.

### 2.2 Tools and Software Requirements

To replicate this lab, the following tools and software are required:

- **GNS3**
    
- **Cisco router and switch images**
    
- **GNS3 VM** or local server for VM integration
    
- **Linux VM images** (e.g., Ubuntu or Debian-based for SNMP and Flask setup)
    
- **VPCS** for lightweight PC simulation
    
- **Wireshark** for traffic analysis
    
- **SNMP utilities** (snmpwalk, snmpget, snmp-check, etc.)
    
- **Python 3.7** and Flask framework for the web application
    
---

## 3. Basic SNMP Configuration on Network Devices

In this section, we configure SNMP on network devices to allow external monitoring of system parameters. The focus is on **SNMPv2c**, which uses community strings as a form of access control. While this version lacks encryption and strong authentication, it remains widely used in legacy and controlled environments due to its simplicity.

### 3.1 Introduction to SNMP Community Strings

SNMPv2c relies on _community strings_ to regulate access to device information. These strings act like passwords and are used to determine whether an SNMP manager can read or modify a device’s MIB (Management Information Base) data.

There are typically two types of community strings:

- **Read-Only (RO)**: Grants permission to retrieve data without the ability to make changes.
    
- **Read-Write (RW)**: Grants permission to both retrieve and modify data on the device.
    

By default, some devices may use weak or well-known community strings (e.g., public or private), making them vulnerable to unauthorized access if not changed.

### 3.2 Example Configuration on Cisco Router

The following example demonstrates how to configure SNMPv2c on a Cisco IOS device with a read-only community string:

```plaintext
R1(config)# snmp-server community public RO
R1(config)# snmp-server location Lab-Network
R1(config)# snmp-server contact admin@example.com
```

Explanation:

- `public`: The community string used by the SNMP manager.
    
- `RO`: Specifies read-only access.
    
- `location`: Identifies the physical or logical location of the device.
    
- `contact`: Provides administrative contact information.
    

To verify SNMP is correctly configured and reachable, you can use tools such as `snmpwalk` from a Linux host:

```bash
snmpwalk -v2c -c public <router_ip> 1.3.6.1.2.1.1.1.0
```

This command queries the **system description** OID to retrieve basic information about the device.

![](/Screenshots/snmp_pics/desc.png)

You can also confirm SNMP activity on the router using:

```plaintext
R1# show snmp
R1# show snmp community
```

![](/Screenshots/snmp_pics/snmpShow.png)

These commands display SNMP statistics and configured community strings, confirming that the service is active and properly set up.

### 3.3 SNMP Setup on Ubuntu

To monitor an Ubuntu server or workstation using SNMPv2c, you need to install and configure the SNMP daemon (snmpd). This section covers installation, basic configuration, and verification.

#### Step 1: Install SNMP Packages

Use apt to install the necessary packages:

```bash
sudo apt update
sudo apt install snmp snmpd -y
```

#### Step 2: Configure SNMP Daemon

The main configuration file is located at /etc/snmp/snmpd.conf. Begin by backing up the original and editing the file:

```bash
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.bak
sudo nano /etc/snmp/snmpd.conf
```

Replace the default content with the following minimal SNMPv2c setup:

```plaintext
agentAddress  udp:161
rocommunity public
sysLocation    Ubuntu-Server
sysContact     admin@example.com
```

Explanation:

- agentAddress: Tells SNMP to listen on UDP port 161 for all interfaces.
    
- rocommunity public: Allows SNMP managers with the community string public to perform read-only queries.
    
- sysLocation: Describes where the host is located.
    
- sysContact: Provides a point of contact for system administrators.
    

**Optional**: To allow remote queries (not just from localhost), edit the agent address line:

```plaintext
agentAddress udp:161,udp6:[::1]:161
```

Or, for all IPv4 interfaces:

```plaintext
agentAddress udp:0.0.0.0:161
```

#### Step 3: Restart and Enable SNMP Service

After saving changes:

```bash
sudo systemctl restart snmpd
sudo systemctl enable snmpd
```

---
## 4. Querying SNMP from a Linux Host

Once SNMP is enabled on the network device, a Linux-based host can be used to query the device and retrieve management information. This section covers the installation of SNMP tools and demonstrates how to use them to interact with SNMP-enabled devices using the SNMPv2c protocol.

### 4.1 Installing SNMP Tools on Linux

Most Linux distributions provide a package called snmp or snmp-utils, which includes command-line tools such as snmpwalk, snmpget, and snmptranslate.

To install SNMP utilities:

**Debian/Ubuntu:**

```bash
sudo apt update
sudo apt install snmp
```

**Red Hat/CentOS/Fedora:**

```bash
sudo dnf install net-snmp-utils
```

After installation, the tools will be available from the command line.

### 4.2 Using snmpwalk or snmpget to Retrieve System Description

SNMP queries can be issued using either snmpget (to retrieve a single OID) or snmpwalk (to walk through an entire subtree of OIDs).

```bash
snmpwalk -v2c -c public <router_ip> 1.3.6.1.2.1.1.1.0
```

This command queries the **system description** OID to retrieve basic information about the device.

![](/Screenshots/snmp_pics/desc.png)

You can also confirm SNMP activity on the router using:

```plaintext
R1# show snmp
R1# show snmp community
```

![](/Screenshots/snmp_pics/snmpShow.png)


Alternatively, use snmpwalk to explore a range of information under the system MIB subtree:

```bash
snmpwalk -v2c -c public <device_ip> 1.3.6.1.2.1.1
```

This will return various system-related values, such as uptime, contact, name, and location.

### 4.3 Interpreting SNMP OIDs and MIBs

SNMP data is structured hierarchically using **Object Identifiers (OIDs)**, which represent nodes in the Management Information Base (MIB). Each OID corresponds to a specific piece of information about the device.

For example:

- 1.3.6.1.2.1.1.1.0 → sysDescr (System Description)
    
- 1.3.6.1.2.1.1.3.0 → sysUpTime (System Uptime)
    
- 1.3.6.1.2.1.1.5.0 → sysName (Hostname of the device)
    

---

## 5. SNMP Exploitation Techniques

This section explores security vulnerabilities in SNMP, specifically within versions **SNMPv1** and **SNMPv2c**, which are widely used but inherently insecure due to lack of encryption and authentication. In a real-world setting, these weaknesses can be exploited to gain unauthorized access to sensitive network information or to launch more advanced attacks. The following subsections demonstrate how attackers can eavesdrop on SNMP traffic and perform brute force attacks to discover community strings.

---

### 5.1 Eavesdropping on SNMP Traffic

#### 5.1.1 Overview of SNMPv1/v2c Vulnerabilities

SNMPv1 and SNMPv2c transmit all management traffic—including community strings and system information—in **plaintext over UDP (port 161)**. This creates a significant security risk, particularly on networks where SNMP traffic is not isolated or encrypted. If an attacker gains access to a network segment where SNMP queries are being sent, they can intercept and analyze the data to:

- Retrieve device metadata (model, OS version, hostname)
    
- Discover SNMP community strings
    
- Map network device hierarchies and topologies
    
- Passively collect sensitive metrics over time
    

These vulnerabilities highlight why **SNMPv3** is recommended in any security-conscious environment.

#### 5.1.2 Capturing SNMP Packets Using Wireshark or tcpdump

To simulate an attacker monitoring SNMP traffic, packet capturing tools like Wireshark and tcpdump can be used.

**Wireshark:**

1. Open Wireshark and select the appropriate network interface.
    
2. Apply the following capture filter to isolate SNMP traffic:
    
    ```
    udp.port == 161
    ```
    
3. Initiate SNMP traffic by querying a device (e.g., using snmpwalk from another terminal).
    
4. Examine captured packets. Under the **SNMP** protocol section, the **community string** will be clearly visible, as well as the **OID** being queried and the returned values.

![](/Screenshots/snmp_pics/snmpTraf.png)
#### 5.1.3 Analyzing Captured Community Strings

Within the captured packets, look for the community field. For example:

![](/Screenshots/snmp_pics/community.png)

The community string (in this case, "public") can then be reused by an attacker to issue their own SNMP queries and gather more information about the device, including:

- Running configurations
    
- Interface traffic stats
    
- Routing tables
    
- Device uptime and version information
    

This type of passive data collection is often the first stage in a targeted attack against network infrastructure.

---

### 5.2 Brute Forcing SNMP Community Strings

#### 5.2.1 Introduction to SNMP Brute Force Attacks

When community strings are not known, attackers often turn to brute forcing—attempting many possible strings in rapid succession to identify valid ones. Since SNMPv1/v2c lacks any form of rate limiting or authentication lockout, it is highly susceptible to this method of enumeration.

Read-only access is often enough to map an entire network, while read-write access can lead to dangerous configuration changes or disruption of services.

#### 5.2.2 Common Tools for SNMP Enumeration and Brute Forcing

**1. onesixtyone**  
A lightweight and fast SNMP scanner that tests multiple community strings across multiple hosts simultaneously.

**2. snmp-check**  
A tool designed to extract detailed information from SNMP-enabled devices. Once a valid community string is found, it can output interface lists, routing tables, ARP caches, and more.

**3. snmpenum**  
Used for detailed enumeration and footprinting of SNMP-enabled hosts.

**4. nmap SNMP scripts**  
The snmp-brute and snmp-info scripts within Nmap can also be used to discover valid community strings and gather device info.

#### 5.2.3 Brute Force Demonstration Using onesixtyone

Prepare the following two files:

**community.txt** – contains a list of common or suspected community strings.
**targets.txt** – contains the IP addresses of devices to test.

Run the scan:

```bash
onesixtyone -c community.txt -i targets.txt
```

Sample output:

![](/Screenshots/snmp_pics/brute.png)

Once valid community strings are identified, tools like snmpwalk can be used to further enumerate the target.

#### 5.2.4 Mitigation Strategies

To protect SNMP-enabled infrastructure from brute force and eavesdropping attacks, the following measures should be implemented:

- **Disable SNMPv1 and SNMPv2c**: Migrate to SNMPv3 wherever possible, which introduces user-based authentication and encryption.
    
- **Restrict SNMP Access**:
    
    - Use **Access Control Lists (ACLs)** to limit SNMP access to trusted IP addresses only.
        
    - Segment management traffic using VLANs or a separate management interface.
        
- **Enforce Strong Community Strings**:
    
    - Avoid default strings like public and private.
        
    - Use long, randomized strings that are rotated periodically.
        
- **Monitor and Alert**:
    
    - Set up alerts for unusual SNMP activity such as repeated failed queries or access from unknown hosts.
        
- **Firewall Rules**:
    
    - Block inbound UDP/161 traffic at perimeter firewalls unless explicitly required.
        

---

## 6. Introduction to SNMPv3 and Secure Monitoring

SNMPv3 represents a significant improvement over its predecessors by addressing the security shortcomings inherent in SNMPv1 and SNMPv2c. It introduces mechanisms for strong authentication, message integrity, and optional encryption—making it suitable for secure, enterprise-grade network monitoring.

This section outlines the enhancements introduced with SNMPv3, demonstrates how to configure it on network devices, and explains how to interact with SNMPv3-enabled devices using command-line tools.

---

### 6.1 Differences Between SNMPv2c and SNMPv3

|Feature|SNMPv2c|SNMPv3|
|---|---|---|
|Authentication|Community strings (plaintext)|User-based (HMAC with SHA/MD5)|
|Encryption|None|Optional (AES, DES)|
|Message Integrity|No|Yes|
|Access Control|Basic (community-based)|Role-based (View-based Access Control Model – VACM)|
|Transport Protocol|UDP|UDP (default), can support TCP|
|Security Model|None|User-based Security Model (USM)|

SNMPv3 introduces the **User-based Security Model (USM)** and **View-based Access Control Model (VACM)** to enforce secure and granular access policies.

---

### 6.2 Authentication and Encryption Features

SNMPv3 supports three security levels:

1. **noAuthNoPriv** – No authentication, no privacy (similar to SNMPv2c).
    
2. **authNoPriv** – Authenticated messages (HMAC-SHA or HMAC-MD5), no encryption.
    
3. **authPriv** – Authenticated and encrypted messages (HMAC-SHA/HMAC-MD5 + AES/DES encryption).
    

This flexibility allows administrators to balance performance and security based on environment sensitivity.

---

### 6.3 Configuring SNMPv3 on Routers

**Cisco IOS Configuration Example** (with authentication and encryption):

```plaintext
R1(config)# snmp-server group SNMPv3Group v3 priv
R1(config)# snmp-server user SNMPv3User SNMPv3Group v3 auth sha MyAuthPass123 priv aes 128 MyPrivPass456
R1(config)# snmp-server location SecureLab
R1(config)# snmp-server contact admin@example.com
```

Explanation:

- SNMPv3User: The username for SNMPv3 access.
    
- auth sha: Enables authentication using HMAC-SHA.
    
- priv aes 128: Enables encryption using AES with a 128-bit key.
    

Verify configuration:

```plaintext
R1# show snmp user
R1# show snmp group
```

![](/Screenshots/snmp_pics/snmpUser.png)

---

### 6.4 Querying SNMPv3 Using CLI Tools

To interact with SNMPv3-enabled devices, use tools like snmpwalk or snmpget, specifying the security model and credentials.

**Example – SNMPv3 walk with auth and priv:**

```bash
snmpwalk -v3 -l authPriv -u SNMPv3User -a SHA -A MyAuthPass123 -x AES -X MyPrivPass456 <device_ip> 1.3.6.1.2.1.1.1.0
```

- -v3: Use SNMP version 3.
    
- -l authPriv: Security level (authentication and encryption).
    
- -u: Username.
    
- -a / -A: Authentication protocol and password.
    
- -x / -X: Privacy (encryption) protocol and password.

![](/Screenshots/snmp_pics/snmp3.png)

---
## 7. Flask-Based SNMP Monitoring Web Application

To conclude this lab, we introduce a custom-built SNMP monitoring web application designed specifically to simplify device discovery, monitoring, and control using SNMPv1, v2c, and v3.

This intuitive interface streamlines interactions with SNMP-enabled devices, allowing users to visualize real-time data, set writable OIDs, and monitor traffic across active interfaces.

To access this webapp, refer to this git repo: https://github.com/youssefnoob003/Snmp-app

![](/Screenshots/snmp_pics/interface.png)
### 1. Adding a Device

Start by adding an SNMP-enabled device. The application supports both manual entry of a single device and subnet scanning to discover active SNMP agents.

To add a device manually:

- Navigate to the "Add Device" section.
    
- Enter the target IP address.
    
- Select the SNMP version (v1, v2c, or v3).
    
- Provide the appropriate credentials (community string for v1/v2c, or username and security parameters for v3).
    
- Submit the form to register the device in the interface.
    

Once added, the device appears in the dashboard and is ready to be queried.

![](/Screenshots/snmp_pics/add.png)
### 2. Viewing Device Attributes and Traffic Graphs

Clicking on a device brings up a detailed interface displaying key OID attributes such as:

- Device description
    
- Uptime
    
- Contact and location fields
    
- System model (automatically identified)
    
![](/Screenshots/snmp_pics/oids.png)

The application also identifies active interfaces and displays their traffic statistics in real-time graphs. These charts show inbound and outbound bit rates, offering a clear view of network activity per interface.

![](/Screenshots/snmp_pics/graph.png)

A dropdown menu allows selection of specific interfaces to visualize their performance metrics over time.

### 3. Setting Writable OIDs

Some fields, such as the device’s sysContact or sysLocation, can be modified directly from the interface. Simply enter the desired value and submit the change. The app communicates with the device using a SET operation and confirms whether the operation was successful.

This functionality is particularly useful in environments where bulk device configuration or auditing is required.

---

## Conclusion

This lab has provided a comprehensive exploration of the Simple Network Management Protocol (SNMP), covering both its operational value and associated security concerns. Starting with SNMP fundamentals and basic configurations in a virtualized GNS3 environment, we progressed through practical demonstrations of SNMP queries using command-line tools, followed by controlled exploitation exercises to highlight the vulnerabilities in SNMPv1 and SNMPv2c.

The exposure of plaintext community strings and the ease with which these can be intercepted or brute-forced underscore the importance of transitioning to SNMPv3. Through the integration of authentication, encryption, and access controls, SNMPv3 offers a significantly more secure framework for network monitoring.

Finally, the lab culminated in the deployment of a custom Flask-based SNMP monitoring web application, showcasing how SNMP can be leveraged programmatically to build scalable and interactive network monitoring solutions.

By completing this lab, participants gain not only technical proficiency in SNMP configuration and monitoring but also a deeper awareness of its security posture. The best practices and mitigation strategies outlined throughout this documentation serve as critical guidelines for deploying SNMP responsibly in production environments.
