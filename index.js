#! /usr/bin/env node

var express = require('express')
  , humanizeDuration = require('humanize-duration')
  //, process = require('process')
  , keypress = require('keypress');

var app = express()
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
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get('/progress', function(req, res){
  res.send(currentBar);
});

app.post('/progress', function(req, res){
  var current = req.body['current']
    , length = req.body['length']
    , progress = req.body['progress']
    , label = req.body['label']
    , title = req.body['title']
    , bar = label + ': ' + title + '\n[' + ('   ' + progress.substr(0, progress.indexOf('.') || progress.length)).slice(-3) + '%] '
    , i;
  for (i = 0; i < 100; i++) {
    bar += (i < progress) ? '|' : ' ';
  }
  bar += '[ ' + humanizeDuration(1000 * Math.floor(current / 1000)) + '  ]';
  currentProgress = progress;
  currentBar = bar;
  res.send(bar);
  updateDisplay();
});

app.listen(3000);
console.log('express is listening on 3000');

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
        notice = { message: 'Back has not been implemented.', remainder: 5 };
        break;

      case 'n':
        notice = { message: 'Next has not been implemented.', remainder: 5 };
        break;

      case 'p':
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
