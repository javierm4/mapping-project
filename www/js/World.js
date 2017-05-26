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
    this.position = new THREE.Vector3(0, 0, 0);
    this.origin   = new THREE.Vector3(0, 0, 0);

    this.camera = new THREE.PerspectiveCamera(50.0, this.aspect, near, far);
    this.cameraGroup = new THREE.Object3D();
    this.cameraGroup.add(this.camera);

    this.helper = new THREE.CameraHelper(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(this.width, this.height);
  };

  WorldView.prototype.render = function (world) {
    this.renderer.render(world.scene, this.camera);
  };

  WorldView.prototype.update = function (world) {
    var scale = world.near / world.depth;

    this.camera.fov = radToDeg(this.fovV);
    this.camera.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.cameraGroup.position.set(
      this.position.x * scale,
      this.position.y * scale,
      this.position.z * scale
    );

    this.camera.updateProjectionMatrix();
    this.helper.update();
  };

  /*******************
   * WORLD PROTOTYPE *
   *******************/

  var World = function (config, debug) {
    this.debug = debug;

    this.cameraZ = config.cameraZ;

    this.scene = new THREE.Scene();
    this.front = config.front;

    // Think of the virtual camera as a post with 5 cameras on it (even though those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras together.
    this.virtualCamera = new THREE.Camera();
    this.virtualCamera.position.z = this.cameraZ;
    this.scene.add(this.virtualCamera);

    // Views
    this.near   = config.near;
    this.far    = config.far;
    this.height = config.height;

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
    var adjacent;
    var x, z;
    var dirX, dirZ;

    // Find angles and depth
    adjacent = (this.front - this.backView.width) * 0.5;
    this.alpha = Math.acos(adjacent / this.leftView.width);
    this.depth = Math.sin(this.alpha) * this.leftView.width;

    // FOV
    this.fixFOV(this.backView);
    this.fixFOV(this.leftView);
    this.fixFOV(this.rightView);

    // Rotation
    this.leftView.rotation.y  = this.alpha;
    this.rightView.rotation.y = -this.alpha;

    // Position
    this.backView.origin = new THREE.Vector3(0, 0, -this.depth);

    x = (-this.backView.width * 0.25) + (-this.front * 0.25);
    z = -this.depth * 0.5;
    dirX = Math.sin(this.alpha) * this.depth;
    dirZ = Math.cos(this.alpha) * this.depth;

    this.leftView.origin   = new THREE.Vector3(x, 0, z);
    this.leftView.position = new THREE.Vector3(x + dirX, 0, z + dirZ);

    x = (this.backView.width * 0.25) + (this.front * 0.25);
    z = -this.depth * 0.5;
    dirX = Math.sin(-this.alpha) * this.depth;
    dirZ = Math.cos(-this.alpha) * this.depth;

    this.rightView.origin   = new THREE.Vector3(x, 0, z);
    this.rightView.position = new THREE.Vector3(x + dirX, 0, z + dirZ);

    // Update
    this.backView.update(this);
    this.leftView.update(this);
    this.rightView.update(this);
  };

  World.prototype.fixFOV = function (view) {
    view.fovH = Math.atan((view.width * 0.5) / this.depth) * 2.0;
    view.fovV = calculateVerticalFOV(view.aspect, view.fovH);
  };

  World.prototype.render = function () {
    this.backView.render(this);
    this.leftView.render(this);
    this.rightView.render(this);
  };

  global.World = World;
})(window);
