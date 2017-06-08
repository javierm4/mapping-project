/* global THREE */
(function (global) {
  'use strict';

  /*********
   * UTILS *
   *********/

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

  var WorldView = function (width, height) {
    this.width  = width;
    this.height = height;
    this.aspect = this.width / this.height;

    /*this.rotation = new THREE.Vector3(0, 0, 0);
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
    this.renderer.setSize(this.width, this.height);*/
  };

  WorldView.prototype.render = function (world) {
    //this.renderer.render(world.scene, this.camera);
  };

  WorldView.prototype.update = function () {
    /*this.camera.fov = radToDeg(this.fovV);
    this.camera.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.camera.position.set(this.position.x, this.position.y, this.position.z);

    this.camera.updateProjectionMatrix();
    this.helper.update();*/
  };

  /*******************
   * WORLD PROTOTYPE *
   *******************/

  var BACK_FOV_CORRECTION = 0;
  var SIDE_ROTY_CORRECTION = 0;

  var World = function (config, debug) {
    this.debug  = debug;
    this.height = config.height;

    this.scene = new THREE.Scene();

    // Think of the virtual camera as a post with 5 cameras on it (even though
    // those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras
    // together.
    this.virtualCamera = new THREE.Camera();
    //this.virtualCamera.position.z = this.cameraZ;
    this.virtualCamera.position.z = 0;
    this.scene.add(this.virtualCamera);

    // Views
    this.createViews(config);

    //this.virtualCamera.add(this.backView.cameraGroup);
    //this.virtualCamera.add(this.leftView.cameraGroup);
    //this.virtualCamera.add(this.rightView.cameraGroup);

    if (this.debug) {
      //this.scene.add(this.backView.helper);
      //this.scene.add(this.leftView.helper);
      //this.scene.add(this.rightView.helper);
    }

    console.log(this.backView);
  };

  World.prototype.createViews = function (config) {

    // Calculate angle and depth
    var adjacent = (config.frontSize - config.backSize) * 0.5;
    this.alpha = Math.acos(adjacent / config.sideSize);
    this.depth = Math.sin(this.alpha) * config.sideSize;

    // Calculate origin
    var sideFar = (config.sideSize * 0.5) / Math.cos(this.alpha);
    console.log(sideFar);
    console.log(this.depth);

    /*this.backView  = new WorldView(config.backSize, this.height);
    this.leftView  = new WorldView(config.sideSize, this.height);
    this.rightView = new WorldView(config.sideSize, this.height);*/
  };

  World.prototype.fixViews = function () {
  };

  World.prototype.fixFOV = function (view) {
    var depth = this.depth * this.adjustZ;

    view.fovH = Math.atan((view.width * 0.5) / depth) * 2.0;
    view.fovV = calculateVerticalFOV(view.aspect, view.fovH);
  };

  World.prototype.render = function () {
    /*var keys = [ 'backView', 'leftView', 'rightView' ];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var view = this[key];

      view.render(this);
      if (view.material) {
        view.material.map.needsUpdate = true;
      }
    }*/
  };

  global.World = World;
})(window);
