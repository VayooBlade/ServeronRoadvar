const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

// deviceId → { socket, deviceName, lastSeen }
const devices = new Map();

wss.on("connection", (ws) => {
  console.log("NEW CONNECTION");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 1️⃣ Device handshake
      if (data.type === "HELLO") {
        const { deviceId, deviceName } = data;

        devices.set(deviceId, {
          socket: ws,
          deviceName,
          lastSeen: Date.now()
        });

        ws.deviceId = deviceId;

        console.log("DEVICE CONNECTED");
        console.log("ID:", deviceId);
        console.log("NAME:", deviceName);
        console.log("TOTAL DEVICES:", devices.size);
        return;
      }

      // 2️⃣ Heartbeat
      if (data.type === "PING") {
        if (ws.deviceId && devices.has(ws.deviceId)) {
          devices.get(ws.deviceId).lastSeen = Date.now();
        }
        return;
      }

      // 3️⃣ Broadcast packets
      for (const [id, device] of devices) {
        if (
          device.socket !== ws &&
          device.socket.readyState === WebSocket.OPEN
        ) {
          device.socket.send(JSON.stringify(data));
        }
      }

    } catch (err) {
      console.error("Invalid JSON:", err.message);
    }
  });

  ws.on("close", () => {
    if (ws.deviceId) {
      devices.delete(ws.deviceId);
      console.log("DEVICE DISCONNECTED:", ws.deviceId);
    }
  });

  ws.on("error", () => {
    if (ws.deviceId) {
      devices.delete(ws.deviceId);
    }
  });
});
