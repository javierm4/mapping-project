(function (global) {
  'use strict';

  function setup (config) {
    this.scene = new THREE.Scene();

    this.cameraZ = config.cameraZ;
    this.near    = config.near;
    this.far     = config.far;

    // Think of the virtual camera as a post with 5 cameras on it (even though those cameras happen to live in difference scenes)
		// You need to move the post (ie, the virtualCamera) to move all 5 cameras together.
    this.virtualCamera = new THREE.Camera();
    this.virtualCamera.position.z = this.cameraZ;
    this.scene.add(this.virtualCamera);

    this.views = [];
    for (var i = 0; i < config.views.length; i++) {
      var configView = config.views[i];
      var view = createView.call(this, configView);

      this.virtualCamera.add(view.camera);
      this.views.push(view);
    }
  }

  function createView (config, fov, near, far) {
    var view = {};

    view.width    = config.width;
    view.height   = config.height;
    view.aspect   = config.width / config.height;
    view.rotation = config.rotation;
    view.position = config.position;
    view.fov      = config.fov;

    view.camera = new THREE.PerspectiveCamera(view.fov, view.aspect, this.near, this.far);
    view.camera.rotation.set(
      view.rotation.x,
      view.rotation.y,
      view.rotation.z
    );

    view.renderer = new THREE.WebGLRenderer({ antialias: true });
    view.renderer.setClearColor(0xffffff);
    view.renderer.setSize(view.width, view.height);

    return view;
  }

  function degToRad (d) {
    return d * (Math.PI / 180);
  }

  var World = function () {
    var config = {
      cameraZ : 100,
      near    : 5,
      far     : 200,
      views   : [
        {
          width     : 680,
          height    : 400,
          fov       : 80,
          position  : { x : 0, y : 0, z     : -3 },
          //rotation  : { x : 0, y : 1.047, z : 0 }
          rotation  : { x : 0, y : degToRad(80), z : 0 }
        },
        {
          width     : 200,
          height    : 400,
          fov       : 80,
          position  : { x : 0, y : 0, z : -3 },
          rotation  : { x : 0, y : 0, z : 0 }
        },
        {
          width     : 680,
          height    : 400,
          fov       : 80,
          position  : { x : 0, y : 0, z     : -3 },
          rotation  : { x : 0, y : -degToRad(80), z : 0 }
        }
      ]
    };

    setup.call(this, config);
  };

  World.prototype.render = function () {
    for (var i = 0; i < this.views.length; i++) {
      var view = this.views[i];
      view.renderer.render(this.scene, view.camera);
    }
  };

  global.World = World;
})(window);
