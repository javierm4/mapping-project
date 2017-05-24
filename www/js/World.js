(function (global) {
  'use strict';

  var PI = Math.PI;
  var HALF_PI = PI * 0.5;

  var WorldView = function (config, near, far) {
    this.side     = config.side;
    this.width    = config.width;
    this.height   = config.height;
    this.aspect   = config.width / config.height;
    this.rotation = 0.0;
    this.fov      = 20;

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, near, far);
    this.helper = new THREE.CameraHelper(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(this.width, this.height);
  };

  WorldView.prototype.update = function () {
    this.camera.rotation.y = this.rotation;
    this.camera.fov = this.fov;

    this.camera.updateProjectionMatrix();
    this.helper.update();
  };

  var World = function (config, debug) {
    this.debug = debug;

    this.scene = new THREE.Scene();

    this.cameraZ = config.cameraZ;
    this.front   = config.front;

    // Think of the virtual camera as a post with 5 cameras on it (even though those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras together.
    this.virtualCamera = new THREE.Camera();
    this.virtualCamera.position.z = this.cameraZ;
    this.scene.add(this.virtualCamera);

    // Views
    this.views = {};

    var near = config.near;
    var far  = config.far;

    for (var i = 0; i < config.views.length; i++) {
      var configView = config.views[i];
      var view = new WorldView(configView, near, far);

      this.views[view.side] = view;
      this.virtualCamera.add(view.camera);

      if (this.debug) {
        this.scene.add(view.helper);
      }
    }

    this.fixPlacement();
  };

  World.prototype.fixPlacement = function () {

    var background = this.views.background;
    var left       = this.views.left;
    var right      = this.views.right;

    // Find rotation and position
    var adjacent = (this.front - background.width) * 0.5;
    var alpha    = Math.acos(adjacent / left.width);

    this.distanceBack = Math.sin(alpha) * this.views.left.width;

    this.views.left.rotation  = (PI + alpha);
    this.views.right.rotation = -(PI + alpha);

    var fudge = 0.069;
    this.views.background.fov = radToDeg(alpha) - radToDeg(fudge);
    this.views.left.fov = radToDeg(alpha) - radToDeg(fudge);
    this.views.right.fov = radToDeg(alpha) - radToDeg(fudge);

    this.views.background.update();
    this.views.left.update();
    this.views.right.update();
  };

  World.prototype.render = function () {
    var keys = Object.keys(this.views);

    for (var i = 0; i < keys.length; i++) {
      var view = this.views[keys[i]];
      view.renderer.render(this.scene, view.camera);
    }
  };

  function radToDeg (r) {
    return r * (180.0 / Math.PI);
  }

  global.World = World;
})(window);
