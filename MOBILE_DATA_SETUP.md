# Connecting App with Mobile Data (No Wi-Fi)

When your phone and computer are both on mobile data, local IP addresses (like `192.168.0.102`) won't work because they require devices to be on the same local network.

## Solution 1: Use Wi-Fi Hotspot (Easiest & Recommended) ✅

This is the simplest solution and works immediately:

### Steps:

1. **Turn on Wi-Fi Hotspot on your phone:**
   - Android: Settings → Network & Internet → Hotspot & Tethering → Wi-Fi Hotspot
   - iPhone: Settings → Personal Hotspot → Turn it On
   - Note the hotspot name and password

2. **Connect your computer to the phone's hotspot:**
   - On Windows: Click Wi-Fi icon → Select your phone's hotspot → Enter password

3. **Find your computer's IP address:**
   - Open PowerShell/Command Prompt
   - Run: `ipconfig`
   - Look for "IPv4 Address" under "Wireless LAN adapter" (should be something like `192.168.43.x` or `192.168.137.x`)

4. **Update app.json:**
   ```json
   "extra": {
     "apiUrl": "http://YOUR_COMPUTER_IP:4000"
   }
   ```
   Example: `"apiUrl": "http://192.168.43.100:4000"`

5. **Restart Expo and test:**
   - Stop Expo (Ctrl+C)
   - Run: `npm start`
   - Test connection in app

**✅ Pros:** Free, no setup, works immediately  
**❌ Cons:** Uses your phone's mobile data

---

## Solution 2: Use ngrok (Public URL) 🌐

ngrok creates a public URL that tunnels to your local server. This works even if devices are on different networks.

### Steps:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```
   Or download from: https://ngrok.com/download

2. **Start your backend server:**
   ```bash
   cd server
   npm start
   ```
   Make sure it's running on port 4000

3. **Start ngrok in a new terminal:**
   ```bash
   ngrok http 4000
   ```

4. **Copy the HTTPS URL:**
   You'll see something like:
   ```
   Forwarding   https://abc123-def456.ngrok-free.app -> http://localhost:4000
   ```
   Copy the `https://abc123-def456.ngrok-free.app` URL

5. **Update app.json:**
   ```json
   "extra": {
     "apiUrl": "https://abc123-def456.ngrok-free.app"
   }
   ```

6. **Restart Expo and test:**
   - Stop Expo (Ctrl+C)
   - Run: `npm start`
   - Test connection in app

**⚠️ Important Notes:**
- The ngrok URL changes every time you restart ngrok (unless you have a paid plan)
- Keep ngrok running while testing
- Free ngrok has rate limits

**✅ Pros:** Works from anywhere, devices can be on different networks  
**❌ Cons:** URL changes on free plan, requires internet

---

## Solution 3: Use localtunnel (Alternative to ngrok) 🚇

Similar to ngrok but simpler:

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel:**
   ```bash
   lt --port 4000
   ```

3. **Use the provided URL in app.json**

---

## Solution 4: Connect Both to Wi-Fi 📶

If you have access to Wi-Fi:
- Connect both your phone and computer to the same Wi-Fi network
- Find computer's IP: `ipconfig`
- Update app.json with that IP

---

## Quick Comparison

| Solution | Setup Time | Cost | Reliability | Best For |
|----------|-----------|------|-------------|----------|
| Wi-Fi Hotspot | ⚡ 2 min | Free | ✅ High | Quick testing |
| ngrok | ⚡ 5 min | Free/Paid | ✅ High | Remote access |
| Wi-Fi Network | ⚡ 1 min | Free | ✅✅ High | Same location |
| localtunnel | ⚡ 3 min | Free | ⚠️ Medium | Alternative to ngrok |

---

## Troubleshooting

### "Connection timeout" after setting up hotspot
- Make sure computer is connected to phone's hotspot (not mobile data)
- Check firewall isn't blocking port 4000
- Verify IP with `ipconfig` again
- Restart Expo after changing app.json

### ngrok URL not working
- Make sure ngrok is still running
- Check if backend server is running on port 4000
- Try accessing the ngrok URL in browser first
- Make sure you're using HTTPS (not HTTP) in app.json

### Still not working?
1. Test backend in browser: `http://localhost:4000/health`
2. Check server logs for errors
3. Verify app.json syntax is correct
4. Restart both Expo and the backend server

---

## Recommended: Wi-Fi Hotspot

For quick testing, **Wi-Fi Hotspot (Solution 1)** is the easiest and most reliable option. It requires no additional software and works immediately.







