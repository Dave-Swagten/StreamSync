// Establish a connection to the server
var socket = io();

// Initialize the Video.js player
var player = videojs("my-video", {}, function () {
  // The player is ready
  console.log("The player is ready");

  // Emit a 'ready' message to the server
  socket.emit("ready");
});

// These functions will be called when the video is played, paused, or time is updated
function emitPlayEventToServer() {
  console.log("Video is now playing!");
  // Send a 'play' message to the server with the current video time
  socket.emit("play", { time: player.currentTime() });
}

function emitPauseEventToServer() {
  console.log("Video is now paused!");
  // Send a 'pause' message to the server with the current video time
  socket.emit("pause", { time: player.currentTime() });
}

var lastTimeUpdate = 0;

function emitTimeUpdateEventToServer() {
  var currentTime = player.currentTime();

  // Check if the current time has changed significantly
  if (Math.abs(currentTime - lastTimeUpdate) > 2) {
    console.log("Video time has been updated!");
    // Send a 'timeupdate' message to the server with the current video time
    socket.emit("timeupdate", { time: currentTime });

    // Update the last time update
    lastTimeUpdate = currentTime;
  }
}

// Add event listeners for the play, pause, and timeupdate events
player.on("play", emitPlayEventToServer);
player.on("pause", emitPauseEventToServer);
player.on("timeupdate", emitTimeUpdateEventToServer);

// Listen for messages from the server and update the video player accordingly
socket.on("play", function (data) {
  console.log('Received "play" message');
  player.currentTime(data.time);
  player.play();
});

socket.on("pause", function (data) {
  console.log('Received "pause" message');
  player.currentTime(data.time);
  player.pause();
});

socket.on("timeupdate", function (data) {
  console.log('Received "timeupdate" message');
  var serverTime = data.time;
  var clientTime = player.currentTime();
  var timeDifference = Math.abs(serverTime - clientTime);

  // Only seek the video if the time difference is more than the threshold
  var threshold = 0.5; // Adjust this value as needed
  if (timeDifference > threshold) {
    player.currentTime(serverTime);
  }
});

// Listen for 'currentStatus' messages from the server
socket.on("currentStatus", function (data) {
  console.log('Received "currentStatus" message');
  // Wait until the video is ready before seeking and setting the state
  player.ready(function () {
    player.currentTime(data.time);
    if (data.isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  });
});
