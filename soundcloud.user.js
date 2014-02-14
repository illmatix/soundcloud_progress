timer = setInterval(function() {
  var e = require('lib/play-manager')
  , song = e.history[e.historyCursor].sound
  , controller = song.audio.controller
  , position = {
      current: controller._currentPosition,
      length: controller._duration,
      progress: controller._currentPosition / controller._duration * 100,
      label: song.attributes.label_name,
      title: song.attributes.title,
  };
  $.post('http://dev-chad:3000/progress', position, function (data) {
    console.log(data);
  });
}, 1000);
