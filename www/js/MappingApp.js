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
    /*var geom = new THREE.BoxGeometry(3, 3, 3);*/
    /*var material = new THREE.MeshNormalMaterial();

    var mesh = new THREE.Mesh(geom, material);
    mesh.position.z = -5;
    mesh.position.x = (Math.random() * 10) - 5;
    mesh.position.y = (Math.random() * 10) - 5;

    world.scene.add(mesh);
    */
    

    var geom2 = new THREE.PlaneGeometry(60, 30, 2, 1 );

    var material2 = new THREE.MeshBasicMaterial({
      map           :   THREE.ImageUtils.loadTexture('textures/shark-texture.png'),
      side          :   THREE.DoubleSide,
      transparent   :   true
    });

    var Smesh = new THREE.Mesh(geom2, material2)

    Smesh.position.z = -5;
    Smesh.position.x = (Math.random() * 10) - 5;
    Smesh.position.y = (Math.random() * 10) - 5;



    world.scene.add(Smesh);
    

    sharks[idConnection] = Smesh;
  }

  function onAngleRecieved (from, angles) {
    var Smesh = sharks[from];
    if (Smesh) {
      Smesh.rotation.x = angles.gamma * (Math.PI / 180) * -1;
      Smesh.rotation.y = angles.beta * (Math.PI / 180);
      Smesh.rotation.z = angles.alpha * (Math.PI / 180);
    }
  }

  function onClientDisctonnected (from) {
    var Smesh = sharks[from];
    if (Smesh) {
      world.scene.remove(Smesh);
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
