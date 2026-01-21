# Quick Start: Mobile Data Setup

## ⚡ Fastest Solution: Wi-Fi Hotspot (2 minutes)

### Step 1: Enable Hotspot on Phone
- **Android**: Settings → Network & Internet → Hotspot & Tethering → Wi-Fi Hotspot → ON
- **iPhone**: Settings → Personal Hotspot → Allow Others to Join → ON

### Step 2: Connect Computer to Hotspot
- On Windows: Click Wi-Fi icon → Select your phone → Enter password

### Step 3: Find Computer IP
```bash
ipconfig
```
Look for "Wireless LAN adapter" → "IPv4 Address" (e.g., `192.168.43.100`)

### Step 4: Update app.json
```json
{
  "expo": {
    "extra": {
      "apiUrl": "your private ip"
    }
  }
}
```
Replace `192.168.43.100` with your actual IP from step 3.

### Step 5: Start Backend & Test
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start Expo
npm start
```

Then test connection in the app! ✅

---

## Alternative: ngrok (If Hotspot Doesn't Work)

### Quick Setup:
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start backend (if not running)
cd server
npm start

# 3. In new terminal, start ngrok
ngrok http 4000

# 4. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)

# 5. Update app.json
# "apiUrl": "https://abc123.ngrok-free.app"

# 6. Restart Expo
npm start
```

**Note**: Keep ngrok running while testing. The URL changes each time you restart ngrok (free plan).

---

## Still Having Issues?

1. **Check backend is running**: Open `http://localhost:4000/health` in browser
2. **Check firewall**: Allow Node.js through Windows Firewall
3. **Verify IP**: Run `ipconfig` again after connecting to hotspot
4. **Restart everything**: Backend, Expo, and ngrok (if using)

See `MOBILE_DATA_SETUP.md` for detailed troubleshooting.







