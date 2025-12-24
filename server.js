const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.add(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Broadcast received packet to all other clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Invalid JSON received:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
    clients.delete(ws);
  });
});

