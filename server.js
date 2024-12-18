const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const app = require("./app"); // Reuse app logic

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);

// Explicitly allow your local React app
const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://your-react-app.vercel.app", // For production (Replace with actual URL)
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

// Start server locally
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
