#! /usr/bin/env node

var express = require('express')
  , humanizeDuration = require('humanize-duration');

var app = express()
  , currentProgress = 0
  , currentBar = '';

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
  bar += '\n[ ' + humanizeDuration(1000 * Math.floor(current / 1000)) + '  ]';
  currentProgress = progress;
  currentBar = bar;
  res.send(bar);
  updateDisplay();
});

app.listen(3000);
console.log('express is listening on 3000');

function updateDisplay() {
  console.log('\033[2J');
  console.log(currentBar);
}
