const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const app = require("./app"); // Reuse app logic

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);

// Configure CORS to allow the frontend origin
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", // For local development
      "https://your-react-app.vercel.app", // For production (Replace with actual URL)
    ], // Allow both local and production origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false, // Allow credentials (cookies, session, etc.)
  },
});

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

// Start server locally
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
