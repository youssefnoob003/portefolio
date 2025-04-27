---
title: "random puzzle"
eventName: "Friendly CTF 2024"
category: "Forensics"
difficulty: "Medium"
points: 433
---

#   random puzzle  433

## Challenge Descritption


Someone hacked into our servers and stole a critical piece of information. we got the script he used to get the data but we still cant find what he stole.

Hints:
- the shuffling is reversible. You just need to find the seed in the packets file.

---

## Provided Files

[capture file](/assets/random_puzzle/cap.pcapng)
[shuffling script](/assets/random_puzzle/send.py)

---

## TL;DR

You just need to extract the packets sent to the port specified in the shuffling script. The seed is the epoch arrival time of the first packet. Here's a [python solver](/assets/friendly/random_puzzle/solver.py).

**Flag: Securinets{W0w_Tcp_1S_crazy}**

---

## Initial Analysis

For this task, the player is given a capture file and the script used to transmit the packets. Opening the capture file with wireshark wont reveal much except a long tcp stream.

![Capture on wireshark](/assets/friendly/random_puzzle/capture.png)

Let's start by analysing the python code.

```py
from scapy.all import *
import time
from math import floor

# Define the target IP and port
target_ip = "127.0.0.1"
target_port = 12345

# Path to the image file
image_path = "flag.png"

# Create the TCP connection (just send the data without handshaking)
src_port = 25000
```

Reading the first few lines reveal that this script is sending a png over TCP to the localhost address from port 25000 to port 12345.

```py
# Use the current time as a random seed
random.seed(floor(time.time()))


# Read the image file and split it into chunks
chunk_size = 1024  # Fixed chunk size
chunks = []

with open(image_path, "rb") as img_file:
    while True:
        data_chunk = img_file.read(chunk_size)
        if not data_chunk:
            break
        chunks.append(data_chunk)

# Randomize the order of the chunks
random.shuffle(chunks)
```

It then sets the seed as the return value of time.time() floored using the math.floor() function. This function returns the local time in linux epoch format.

> Unix time is a date and time representation widely used in computing. It measures time by the number of non-leap seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch. In modern computing, values are sometimes stored with higher granularity, such as microseconds or nanoseconds. 

Let's get the seed for now. Logically, the time captured when the script was executed will approximatly be the arrival time of the first packet sent. so let's filter out the packets sent from port 25000 to port 12345 and analyse the first one.

![first frame](/assets/friendly/random_puzzle/first.png)
