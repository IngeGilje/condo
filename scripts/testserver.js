import { Server } from "socket.io";
import http from "http";

// create a basic http server
const server = http.createServer();

// attach socket.io to it
const io = new Server(server, {
  cors: {
    origin: "*",   // allow all origins (adjust if needed)
  },
});

// handle socket connections
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (data) => {
    console.log("got message:", data);
    socket.emit("message", "Server received: " + data);
  });
});

// start server
server.listen(7000, () => {
  console.log("Socket.IO server listening on port 7000");
});
