---
title: "Wi-Fi Cracking"
eventName: "Darkest Hour CTF 2025"
category: "Network"
difficulty: "Easy"
points: 400
---

# Challenge 1: Wi-Fi Cracking

For the first challenge, players were tasked with gaining access to a Wi-Fi network by cracking its password. They were given only the SSID: **“love”** (quirky, I know — but the CTF’s theme was Valentine’s Day, so it fits).

A bit of research on Wi-Fi security should quickly lead you to countless resources on WPA2 cracking, particularly on brute-forcing the **WPA2 4-way handshake**. But what exactly is a WPA2 handshake, and why is it important?

# Understanding the WPA2 Handshake

When a client (such as your phone or laptop) connects to a Wi-Fi access point (AP), they don’t just exchange the password in plaintext. Instead, they go through a **4-way handshake** where the AP challenges the client to prove it knows the password — without actually revealing it. This is done by encrypting a challenge phrase using the Wi-Fi passkey.

![WPA2 Handshake](/assets/darkest/handshake.webp)

[WPA and WPA2 4-Way Handshake](https://networklessons.com/wireless/wpa-and-wpa2-4-way-handshake)

This method prevents direct password exposure, but it has a weakness: **if the password is weak, it can still be cracked through brute-force attacks**. This forms the basis of our challenge. Our goal is to **capture the handshake and brute-force the password until we find the correct one**.

Well, how can we capture the handshake? As mentioned earlier, a handshake is only transmitted when a client attempts to connect to the access point. For this challenge, we can assume that at least one client is already connected. But what if we could force them to disconnect and reconnect, triggering the handshake in the process?

![Wi-Fi Deauth Attack](/assets/darkest/deauth.webp)

[**Wi-Fi Deauthentication Attack**](https://en.wikipedia.org/wiki/Wi-Fi_deauthentication_attack)

Fortunately, we can! A **Deauthentication Attack** is a technique that sends specially crafted **deauth packets** to an access point, instructing it to disconnect all connected clients. Since most devices automatically attempt to reconnect, this effectively forces the handshake to be resent — allowing us to capture it.

# Capturing the WPA2 Handshake

For this task, we’ll be using the [Aircrack-ng](https://www.aircrack-ng.org/) suite to perform the attack.

## Step 1: Enable Monitor Mode

First, we need to put our Wi-Fi interface into **monitor mode**, allowing us to capture packets:

```bash
airmon-ng check kill  # Kill interfering processes  
airmon-ng start wlan0  # Enable monitor mode

PHY     Interface       Driver          Chipset  
phy0    wlan0           mt7601u         Ralink Technology, Corp. MT7601U  
                (monitor mode enabled)
```

## Step 2: Scan for Wi-Fi Networks

Now, we scan for nearby Wi-Fi networks:

```bash
airodump-ng wlan0
```

![Airodump output](/assets/darkest/airo.webp)

This will list all detected access points. Our target is the Wi-Fi named **“love”**, with the following details:

```bash
BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID  
56:1A:16:F8:8F:89  -62        4        0    0  11  180   WPA2 CCMP   PSK  love
```

From this output, we note:

- **BSSID:** 56:1A:16:F8:8F:89 (the AP’s unique identifier)
- **Channel:** 11

## Step 3: Capture the Handshake

To capture the handshake, we specify the target BSSID and channel while saving the capture file:

```bash
airodump-ng --bssid 56:1A:16:F8:8F:89 -c 11 -w capture wlan0
```

This will start listening for any authentication traffic from clients connecting to the AP.

## Step 4: Force Client Reconnection (Deauth Attack)

If no client is currently connecting, we can **force a reconnection** by sending deauthentication packets:

```bash
aireplay-ng --deauth 5 -a 56:1A:16:F8:8F:89 wlan0
```

This command sends **five deauthentication frames** to disconnect clients from the AP, causing them to reconnect.

After running this, we should see a message in our capture terminal indicating success:

![Handshake captured](/assets/darkest/deauthtool.webp)

WPA handshake: 56:1A:16:F8:8F:89

# Analyzing the Capture File

Before cracking, let’s take a quick look inside the **.cap** file using Wireshark. The key points of interest:

- **Deauthentication Packets** (Type/Subtype: 0xc000): Sent to the broadcast address, confirming clients were forced to disconnect.

![Wireshark deauth packet](/assets/darkest/capture.webp)

- **4-Way Handshake (EAPOL Packets)**: This is where the client and AP exchange authentication data. While the actual password isn’t stored here, the handshake can be used for offline brute-force attacks.

![Wireshark EAPOL packet](/assets/darkest/eapol.webp)

# Cracking the WPA2 Password

Now comes the cracking part. We use aircrack-ng, providing it with the **capture file** and a **wordlist** (e.g., rockyou.txt):

```bash
aircrack-ng capture-01.cap -w /usr/share/wordlists/rockyou.txt
```

If the password is in the wordlist, aircrack-ng will find it:

![Aircrack-ng success](/assets/darkest/aircrack.webp)

And there you have it — **“butterfly”** was the Wi-Fi passkey!
