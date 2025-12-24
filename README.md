# ServeronRoadvar

Real-time cloud WebSocket server for device communication and data broadcasting.

## Features

- ✅ Accepts multiple device connections simultaneously
- ✅ Keeps connections alive automatically
- ✅ Receives JSON data packets from devices
- ✅ Broadcasts packets to all other connected devices
- ✅ Production-safe error handling
- ✅ Future-proof architecture for distance filtering and crash prediction

## Local Development

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Expected output:
```
WebSocket server running on port 10000
```

## Deployment on Render

### Step 1: GitHub Repository

1. Create a new GitHub repository named `ServeronRoadvar`
2. Push this code to the repository:
```bash
git init
git add .
git commit -m "Initial WebSocket server"
git branch -M main
git remote add origin https://github.com/<USERNAME>/ServeronRoadvar.git
git push -u origin main
```

### Step 2: Render Deployment

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Choose **GitHub** and select the `ServeronRoadvar` repository
4. Configure the service:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`
   - **Instance Type**: Free
5. Click **Create Web Service**
6. Wait until status shows **Live**

### Step 3: Verify Deployment

1. Check Render logs - should show: `WebSocket server running on port <number>`
2. Your WebSocket endpoint will be: `wss://serveronroadvar.onrender.com`

## WebSocket Connection

- **Endpoint**: `wss://serveronroadvar.onrender.com`
- **Protocol**: WebSocket (WSS for secure connection)
- **Data Format**: JSON

### Connection Rules

- Open a single WebSocket connection per device
- Keep the connection open
- Reconnect automatically if dropped
- Server keeps connections alive automatically

## Future Extensions

Planned features (server-side only):
- GPS distance filtering (5 km radius)
- Crash prediction events
- Redis for scaling
- Authentication tokens

## Project Structure

```
ServeronRoadvar/
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## License

MIT

