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
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  },
  transports: ["websocket", "polling"], // Ensure polling is enabled as a fallback
});

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
