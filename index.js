#! /usr/bin/env node

// Module requirements
var express = require('express')
  , humanizeDuration = require('humanize-duration')
  , keypress = require('keypress')
  , colors = require('colors');

// Variable declarations
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , currentProgress = 0
  , currentBar = ''
  , notice = { message: '', remainder: 0 }
  , stdin = process.openStdin()
  , controlsEnabled = false;

app.configure(function () {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
});

app.get('/progress', function(req, res){
  res.send(currentBar);
});

server.listen(3000);

function updateDisplay() {
  console.log('\033[2J');
  if (notice.message && notice.remainder > 0) {
    currentBar = 'NOTICE: ' + notice.message + '\n\n' + currentBar;
    notice.remainder--;
  }
  console.log(currentBar);
  if (controlsEnabled === true) {
    console.log('<DISABLED> Controls: [b]ack [n]ext [p]lay/[p]ause: </DISABLED>');
  }
}

if (Boolean(stdin.isTTY) === true) {
  stdin.setRawMode(true);
  stdin.resume();
  controlsEnabled = true;

  keypress(stdin);
  stdin.on('keypress', function (chunk, key) {
    if (!key) return;
    if (key && key.ctrl && key.name == 'c') process.exit();

    switch (key.name) {
      case 'b':
        io.sockets.emit('control', { action: 'back' });
        notice = { message: 'Back has not been implemented.', remainder: 5 };
        break;

      case 'n':
        io.sockets.emit('control', { action: 'next' });
        notice = { message: 'Next has not been implemented.', remainder: 5 };
        break;

      case 'p':
        io.sockets.emit('control', { action: 'playpause' });
        notice = { message: 'Play/Pause has not been implemented.', remainder: 5 };
        break;

      case 'q':
        process.exit();
        break;

      default:
        //notice = { message: key.name + ' has not been implemented.', remainder: 5 };
    }

    updateDisplay();

    return;
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('progress', function (data) {
    handleProgressUpdate(data);
  });
});

function handleProgressUpdate(data) {
  console.log(data);
  var current = data['current']
    , length = data['length']
    , progress = data['progress'] + ''
    , label = data['label']
    , title = data['title']
    , bar = label.green + ': ' + title + '\n\n'
    , i;
  for (i = 0; i < 100; i++) {
    bar += (i < progress) ? '|'.cyan : ' ';
  }
  bar += '\n[' + ('   ' + progress.substr(0, progress.indexOf('.') || progress.length)).slice(-3) + '% ]'
      +  ' [ '.red.bold + humanizeDuration(1000 * Math.floor(current / 1000)).yellow.bold + '  ]'.red.bold;

  currentProgress = progress;
  currentBar = bar;
  updateDisplay();
  return bar;
}
