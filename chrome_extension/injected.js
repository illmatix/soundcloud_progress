// Require Soundcloud's Play Manager
var player = require('lib/play-manager');

var socket = io.connect('http://localhost:3000');

socket.on('control', function (data) {
  switch (data.action) {
    case 'playpause':
      var song = getCurrentTrack();
      if (isPlaying() === true) {
        return player.pauseCurrent();
      } else {
        return (song === false) ? player.playNext() : player.playCurrent();
      }
      break;

    case 'next':
      return player.playNext();
      break;

    case 'back':
      return player.playPrev();
      break;
  }
});

function getCurrentTrack() {
  // If nothing has been played yet, return
  if (player.historyCursor === -1) return false;
  return player.history[player.historyCursor].sound;
}

function isPlaying() {
  var song = getCurrentTrack();
  return (song === false) ? false : song.audio._isPlaying;
}

var timer = setInterval(function() {
  // If Soundcloud is not currently playing, return
  if (isPlaying() === false) return;

  // Load the most recent song
  var song = getCurrentTrack()
    , controller = song.audio.controller
    , position = {};

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
