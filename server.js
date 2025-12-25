const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers for browser access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/devices") {
    const devicesList = Array.from(devices.entries()).map(([deviceId, device]) => {
      const lastSeenSecondsAgo = Math.floor((Date.now() - device.lastSeen) / 1000);
      return {
        deviceId,
        deviceName: device.deviceName,
        lastSeenSecondsAgo
      };
    });

    res.writeHead(200);
    res.end(JSON.stringify(devicesList, null, 2));
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocket.Server({ server });

console.log(`Server running on port ${PORT}`);
console.log(`WebSocket: ws://localhost:${PORT}`);
console.log(`HTTP GET /devices: http://localhost:${PORT}/devices`);

// deviceId → { socket, deviceName, lastSeen }
const devices = new Map();

wss.on("connection", (ws) => {
  console.log("[CONNECTION] New WebSocket connection established");

  // Track if device has sent HELLO
  let isAuthenticated = false;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 1️⃣ Device handshake - REQUIRED FIRST
      if (data.type === "HELLO") {
        const { deviceId, deviceName } = data;

        if (!deviceId || !deviceName) {
          console.error("[HELLO] Missing deviceId or deviceName");
          ws.close(1008, "Missing deviceId or deviceName");
          return;
        }

        // If device already exists, remove old connection
        if (devices.has(deviceId)) {
          console.log(`[HELLO] Device ${deviceId} reconnecting, closing old connection`);
          const oldDevice = devices.get(deviceId);
          if (oldDevice.socket && oldDevice.socket.readyState === WebSocket.OPEN) {
            oldDevice.socket.close();
          }
        }

        devices.set(deviceId, {
          socket: ws,
          deviceName,
          lastSeen: Date.now()
        });

        ws.deviceId = deviceId;
        isAuthenticated = true;

        console.log(`[DEVICE CONNECTED] ID: ${deviceId}, Name: ${deviceName}`);
        console.log(`[STATUS] Total devices: ${devices.size}`);
        return;
      }

      // Reject messages if HELLO not sent first
      if (!isAuthenticated) {
        console.warn("[MESSAGE] Received message before HELLO, closing connection");
        ws.close(1008, "HELLO packet required first");
        return;
      }

      // 2️⃣ Heartbeat
      if (data.type === "PING") {
        if (ws.deviceId && devices.has(ws.deviceId)) {
          devices.get(ws.deviceId).lastSeen = Date.now();
          console.log(`[HEARTBEAT] Received from ${ws.deviceId}`);
        }
        return;
      }

      // Other message types can be handled here if needed
      console.log(`[MESSAGE] Received ${data.type} from ${ws.deviceId}`);

    } catch (err) {
      console.error("[ERROR] Invalid JSON:", err.message);
    }
  });

  ws.on("close", (code, reason) => {
    if (ws.deviceId && devices.has(ws.deviceId)) {
      console.log(`[DEVICE DISCONNECTED] ID: ${ws.deviceId}, Code: ${code}, Reason: ${reason || "N/A"}`);
      devices.delete(ws.deviceId);
      console.log(`[STATUS] Total devices: ${devices.size}`);
    } else {
      console.log(`[CONNECTION CLOSED] Unauthenticated connection closed`);
    }
  });

  ws.on("error", (error) => {
    console.error(`[ERROR] WebSocket error for ${ws.deviceId || "unknown"}:`, error.message);
    if (ws.deviceId && devices.has(ws.deviceId)) {
      devices.delete(ws.deviceId);
      console.log(`[STATUS] Total devices: ${devices.size}`);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
