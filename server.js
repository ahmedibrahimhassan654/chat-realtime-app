require("dotenv").config();
const cors = require("cors");

const app = require("./app"); // Separate app logic into its own file
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const allowedOrigins = [
  "https://your-react-app.vercel.app", // Replace with actual deployed React app URL
  "http://localhost:3000", // Local development
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

// Start server locally
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
