(function (global) {
  'use strict';

  /*********
   * UTILS *
   *********/

  var PI = Math.PI;
  var HALF_PI = Math.PI * 0.5;

  function calculateVerticalFOV (aspect, hFOV) {
    return 2.0 * Math.atan(Math.tan(hFOV / 2.0) / aspect);
  }

  function radToDeg (r) {
    return r * (180.0 / Math.PI);
  }

  function degToRad (d) {
    return d * (Math.PI / 180.0);
  }

  /************************
   * WORLD VIEW PROTOTYPE *
   ************************/

  var WorldView = function (width, height, near, far) {
    this.width  = width;
    this.height = height;
    this.aspect = this.width / this.height;

    this.rotation = new THREE.Vector3(0, 0, 0);
    this.origin   = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, 0, 0);

    this.planeRotation = new THREE.Vector3(0, 0, 0);

    this.camera = new THREE.PerspectiveCamera(50.0, this.aspect, near, far);
    this.cameraGroup = new THREE.Object3D();
    this.cameraGroup.add(this.camera);

    this.helper = new THREE.CameraHelper(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
  };

  WorldView.prototype.render = function (world) {
    this.renderer.render(world.scene, this.camera);
  };

  WorldView.prototype.update = function (world) {
    this.camera.fov = radToDeg(this.fovV);
    this.camera.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.camera.position.set(this.position.x, this.position.y, this.position.z);

    this.camera.updateProjectionMatrix();
    this.helper.update();
  };

  /*******************
   * WORLD PROTOTYPE *
   *******************/

  var BACK_FOV_CORRECTION = 7;
  var SIDE_ROTY_CORRECTION = 2;

  var World = function (config, debug) {
    this.debug   = debug;
    this.front   = config.front;
    this.cameraZ = config.cameraZ;
    this.near    = config.near;
    this.far     = config.far;
    this.height  = config.height;
    this.adjustZ = config.adjustZ;

    this.scene = new THREE.Scene();

    // Think of the virtual camera as a post with 5 cameras on it (even though those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras together.
    this.virtualCamera = new THREE.Camera();
    this.virtualCamera.position.z = this.cameraZ;
    this.scene.add(this.virtualCamera);

    // Views
    this.backView  = new WorldView(config.back, this.height, this.near, this.far);
    this.leftView  = new WorldView(config.left, this.height, this.near, this.far);
    this.rightView = new WorldView(config.right, this.height, this.near, this.far);

    this.virtualCamera.add(this.backView.cameraGroup);
    this.virtualCamera.add(this.leftView.cameraGroup);
    this.virtualCamera.add(this.rightView.cameraGroup);

    if (this.debug) {
      this.scene.add(this.backView.helper);
      this.scene.add(this.leftView.helper);
      this.scene.add(this.rightView.helper);
    }

    this.fixViews();
  };

  World.prototype.fixViews = function () {

    // Find angles and depth
    var adjacent = (this.front - this.backView.width) * 0.5;
    this.alpha = Math.acos(adjacent / this.leftView.width);
    this.depth = Math.sin(this.alpha) * this.leftView.width;

    // FOV
    this.fixFOV(this.backView);
    this.fixFOV(this.leftView);
    this.fixFOV(this.rightView);
    this.backView.fovV -= degToRad(BACK_FOV_CORRECTION);

    // Rotation
    var rotY = (this.leftView.fovH * 0.5) + (this.backView.fovH * 0.5);
    this.leftView.rotation.y = rotY - degToRad(SIDE_ROTY_CORRECTION);
    this.leftView.planeRotation.y = this.alpha;

    rotY = (this.rightView.fovH * 0.5) + (this.backView.fovH * 0.5);
    this.rightView.rotation.y  = -rotY + degToRad(SIDE_ROTY_CORRECTION);
    this.rightView.planeRotation.y = -this.alpha;

    // Origin planes
    this.backView.origin.z = -this.depth;

    this.leftView.origin.x = (-this.backView.width * 0.25) + (-this.front * 0.25);
    this.leftView.origin.z = -this.depth * 0.5;

    this.rightView.origin.x = (this.backView.width * 0.25) + (this.front * 0.25);
    this.rightView.origin.z = -this.depth * 0.5;

    // Update
    this.backView.update(this);
    this.leftView.update(this);
    this.rightView.update(this);
  };

  World.prototype.fixFOV = function (view) {
    var depth = this.depth * this.adjustZ;

    view.fovH = Math.atan((view.width * 0.5) / depth) * 2.0;
    view.fovV = calculateVerticalFOV(view.aspect, view.fovH);
  };

  World.prototype.render = function () {
    var keys = [ 'backView', 'leftView', 'rightView' ];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var view = this[key];

      view.render(this);
      if (view.material) {
        view.material.map.needsUpdate = true;
      }
    }
  };

  global.World = World;
})(window);
