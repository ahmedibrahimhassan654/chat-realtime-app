const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const app = require("./app");

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://your-react-app.vercel.app", // Production URL
];

const io = new Server(server, {
  cors: {
    origin: [
      //   "https://chat-realtime-frontend.vercel.app",
      "http://localhost:3000",
    ], // Adjust with your frontend's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Set to true if you need credentials like cookies
  },
  transports: ["websocket", "polling"], // Ensure WebSocket and Polling are both allowed
});

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
