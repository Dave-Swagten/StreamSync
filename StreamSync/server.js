const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const cors = require("cors");
const indexRouter = require("./routes/index.route");

// Enable All CORS Requests
//TODO: This is not secure, change this on production
app.use(cors());

// Use Pug as the view engine
app.set("view engine", "pug");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter); //Index route

// Create a new Socket.IO instance with CORS enabled
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow GET and POST
  },
});

// Global variables
let videoTime = 0;
let isPlaying = false;

io.on("connection", (socket) => {
  console.log("a user connected with the id: " + socket.id);

  // Listen for 'ready' messages from the client
  socket.on("ready", () => {
    // Send the current video time and state to the new user
    socket.emit("currentStatus", { time: videoTime, isPlaying: isPlaying });
  });

  // Listen for 'play' events from the client
  socket.on("play", (data) => {
    console.log('Received "play" event');
    videoTime = data.time;
    isPlaying = true;
    // Broadcast the 'play' event to all other clients
    socket.broadcast.emit("play", data);
  });

  // Listen for 'pause' events from the client
  socket.on("pause", (data) => {
    console.log('Received "pause" event');
    videoTime = data.time;
    isPlaying = false;
    // Broadcast the 'pause' event to all other clients
    socket.broadcast.emit("pause", data);
  });

  // Listen for 'timeupdate' events from the client
  socket.on("timeupdate", (data) => {
    console.log('Received "timeupdate" event');
    videoTime = data.time;
    // Broadcast the 'timeupdate' event to all other clients
    socket.broadcast.emit("timeupdate", data);
  });

  // Listen for Disconnection of the user
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
server.listen(3000, () => {
  console.log("listening on *:3000");
});
