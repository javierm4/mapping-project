(function () {
  'use strict';

  // WebSocket
  var wsURL = 'ws://172.20.10.7:1881';
  var connection;

  /**********************
   * Device orientation *
   **********************/

  function onDeviceOrientation (event) {
    if (connection && connection.readyState === connection.OPEN) {
      var message = {
        type : 'angles',
        data : {
          alpha : event.alpha,
          beta  : event.beta,
          gamma : event.gamma
        }
      };

      connection.send(JSON.stringify(message));
    }
  }

  /*******************
   * WebSocket logic *
   *******************/

  function setupWebSocket () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    connection = new WebSocket (wsURL);

    connection.onopen  = onConnectionOpen;
    connection.onerror = onConnectionError;
  }

  function onConnectionOpen () {
    console.log('Connected with server!');

    var message = {
      type : 'register',
      data : 'input'
    };
    connection.send(JSON.stringify(message));
  }

  function onConnectionError () {
    console.log('Error in connection :(!');
  }

  $(document).ready(function() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }

    setupWebSocket();
  });
})();