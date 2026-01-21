Disaster Relief SOS (Frontend Only)

A simple Expo React Native app demonstrating the UI and navigation flow for a Disaster Relief SOS system.

Features
- Login screen with dummy login navigation
- Dashboard with actions: Send SOS, View Relief Centers
- Send SOS: shows mocked location and optional message; alert on send
- Relief Centers: static list with name, type, capacity

Getting Started

Prerequisites
- Node.js LTS
- Expo Go app on your Android/iOS device (recommended for quick testing)

Install
```
npm install
```

Run
- Android: `npm run android`
- iOS (Mac required): `npm run ios`
- Web: `npm run web`
- Or start the dev server: `npm start`

Scan the QR code with Expo Go to run on a real device.

Project Structure
- `App.js`: Stack navigator and routes
- `screens/`
  - `LoginScreen.js`
  - `DashboardScreen.js`
  - `SendSOSScreen.js`
  - `ReliefCentersScreen.js`

Notes
- No backend, GPS, or authentication. All data is static/mocked.
- Admin module is out of scope for this demo.


