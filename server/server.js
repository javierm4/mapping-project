'use strict';

// Globals
var WebSocket = require('ws');
var WS_PORT = 1881;

var inputClients = [];
var outputClients = [];

var id = 0;

/*****************************
 * WebSocketServer Callbacks *
 *****************************/

function onListening () {
  console.log((new Date()) + ' Server is listening on port ' + WS_PORT);
}

function onConnection (connection, request) {
  var ip = request.connection.remoteAddress;
  console.log((new Date()) + ' Connection from ' + ip + '.');

  connection.on('message', function (message) { onMessage(connection, message); });
  connection.on('close', function () { onClose(connection); });
}

function onMessage (connection, messageStr) {
  console.log((new Date()) + ' Received Message: ' + messageStr);

  var message = JSON.parse(messageStr);

  if (message.type === 'register') {
    onRegisterMessage(connection, message);
  }

  else if (message.type === 'angles') {
    onAngleMessage(connection, message);
  }
}

function onRegisterMessage (connection, message) {
  if (message.data === 'input') {
    inputClients.push(connection);
    connection.id = id;
    id++;

    broadcast({
      type: 'newInput',
      data : connection.id
    });

  } else {
    outputClients.push(connection);
  }
}

function onAngleMessage (connection, message) {
  broadcast({
    type : 'angles',
    data : {
      from   : connection.id,
      angles : message.data
    }
  });
}

function onClose (connection) {
  console.log((new Date()) + ' Peer disconnected.');

  var index = inputClients.indexOf(connection);

  if (index != -1){
    broadcast({
      type  : 'disconnected',
      data  : connection.id
    });
    inputClients.splice(index , 1);
    return;
  }

  index = outputClients.indexOf(connection);
  if (index != -1) {
    outputClients.splice(index, 1);
    return
  }
}

function broadcast (messageToSend) {
  for (var i = 0; i < outputClients.length; i++) {
    var client = outputClients[i];
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messageToSend));
    }
  }
}

/***************
 * Main script *
 ***************/

var wsServer = new WebSocket.Server({
  port: WS_PORT
});

wsServer.on('listening', onListening);
wsServer.on('connection', onConnection);
