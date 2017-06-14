/* global THREE */
(function (global) {
  'use strict';

  var world;
  var flock;

  var sharks = {};

  /*******************
   * WebSocket logic *
   *******************/

  // WebSocket
  var wsURL = 'ws://172.20.10.7:1881';
  var connection;

  function setupWebSocket () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    connection = new WebSocket (wsURL);

    connection.onopen    = onConnectionOpen;
    connection.onerror   = onConnectionError;
    connection.onmessage = onConnectionMessage;
  }

  function onConnectionOpen () {
    console.log('Connected with server!');

    var message = {
      type : 'register',
      data : 'output'
    };
    connection.send(JSON.stringify(message));
  }

  function onConnectionError () {
    console.log('Error in connection :(!');
  }

  function onConnectionMessage (event) {
    var payload = event.data;
    var message = JSON.parse(payload);
    console.log(message);

    var type = message.type;
    var data = message.data;

    if (type === 'newInput') {
      createNewMesh(data);
    }
    else if (type === 'angles'){
      onAngleRecieved(data.from, data.angles)
    }
    else if (type === 'disconnected') {
      onClientDisctonnected(data);
    }
  }

  function createNewMesh (idConnection) {
    var geom = new THREE.BoxGeometry(3, 3, 3);
    var material = new THREE.MeshNormalMaterial();

    var mesh = new THREE.Mesh(geom, material);
    mesh.position.z = -5;
    mesh.position.x = (Math.random() * 10) - 5;
    mesh.position.y = (Math.random() * 10) - 5;

    world.scene.add(mesh);
    sharks[idConnection] = mesh;
  }

  function onAngleRecieved (from, angles) {
    var mesh = sharks[from];
    if (mesh) {
      mesh.rotation.x = angles.alpha * (Math.PI / 180) * -1;
      mesh.rotation.y = angles.beta * (Math.PI / 180) * -1;
      mesh.rotation.z = angles.gamma * (Math.PI / 180) * -1;
    }
  }

  function onClientDisctonnected (from) {
    var mesh = sharks[from];
    if (mesh) {
      world.scene.remove(mesh);
      delete sharks[data];
    }
  }

  /********************
   * MappingApp logic *
   ********************/

  var MappingApp = function (_world) {
    world = _world;
  };

  MappingApp.prototype.setup = function () {
    flock = new Flock(world);
    setupWebSocket();
  };

  MappingApp.prototype.update = function () {
    flock.update();
  };

  global.MappingApp = MappingApp;
})(window);
