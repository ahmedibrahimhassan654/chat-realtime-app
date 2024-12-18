require("dotenv").config();
const app = require("./app"); // Separate app logic into its own file
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const handleSocketEvents = require("./socket");
handleSocketEvents(io);

// Start server locally
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
