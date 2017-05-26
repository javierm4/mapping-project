(function (global) {
  'use strict';

  /***************
   * MAIN SCRIPT *
   ***************/

   var world;
   var app;

  function createWorld (onCreate) {
    $.ajax({
      url      : 'data/config.json',
      method   : 'GET',
      dataType : 'JSON',
      success  : function (config) {
        var world = new World(config, false);
        onCreate(world);
      }
    });
  }

  function setup () {
    var keys = [ 'backView', 'leftView', 'rightView' ];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var view = world[key];

      $('#' + key + '-container').css({
        width  : view.width,
        height : view.height
      });
      $('#' + key + '-container').append(view.renderer.domElement);
    }
  }

  function animate () {
    app.update();
    world.render();

    requestAnimationFrame(animate);
  }

  $(document).ready(function () {
    createWorld(function (_world) {
      world = _world;

      setup();
      app = new MappingApp(world);
      app.setup();

      animate();
    });
  });

})(window);
