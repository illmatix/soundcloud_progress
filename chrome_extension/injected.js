// Require Soundcloud's Play Manager
var player = require('lib/play-manager');

var socket = io.connect('http://localhost:3000');

var timer = setInterval(function() {
  // If nothing has been played yet, return
  if (player.historyCursor === -1) return;

  // Load the most recent song
  var song = player.history[player.historyCursor].sound
    , controller = song.audio.controller
    , position = {};

  // If Soundcloud is not currently playing, return
  if (controller._state !== 'playing') return;

  // Aggregate some basic information about the state of the track
  position = {
      current: controller._currentPosition,
      length: controller._duration,
      progress: controller._currentPosition / controller._duration * 100,
      label: song.attributes.label_name || song.attributes.user.username,
      title: song.attributes.title,
  };

  // Push the track info over to another computer
  socket.emit('progress', position);
}, 1000);
