var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require("./gridlock.js").init();

app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/public'));

http.listen(app.get('port'), function () {
    console.log("Server listening on localhost:" + app.get('port'));
});

io.on('connection', function (socket) {
  console.log('user ' + socket.id + ' connected');
  
  socket.emit('ack', game.params());
  
  socket.on('ready', function (data) {
      game.addUser(socket.id, data.name);
      socket.emit('update', game.tiles());
      socket.emit('score', game.scores());
  });
  
  socket.on('tileClick', function (data) {
      game.update(data.x, data.y, socket.id);
      io.emit('update', game.tiles());
      io.emit('score', game.scores());
  });
  
  socket.on('name', function (data) {
      var name = data.name.replace(/\W+/g, '').substring(0,10);
      game.setName(socket.id, name);
      io.emit('score', game.scores());
  });
  
  socket.on('disconnect', function () {
      console.log('user ' + socket.id + ' disconneted');
      game.removeUser(socket.id);
      io.emit('update', game.tiles());
      io.emit('score', game.scores());
  });
});
