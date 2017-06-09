/* global THREE */
(function (global) {
  'use strict';

  /*********
   * UTILS *
   *********/

  var PI = Math.PI;
  var HALF_PI = Math.PI * 0.5;

  function calculateHorizontalFOV (view) {
    var halfSide = view.width * 0.5;
    return Math.atan(halfSide / view.near) * 2.0;
  }

  function calculateVerticalFOV (aspect, hFOV) {
    return 2.0 * Math.atan(Math.tan(hFOV / 2.0) / aspect);
  }

  function radToDeg (r) {
    return r * (180.0 / Math.PI);
  }

  /************************
   * WORLD VIEW PROTOTYPE *
   ************************/

  var WorldView = function (config) {
    this.width  = config.width;
    this.height = config.height;
    this.aspect = this.width / this.height;

    this.center = new THREE.Vector3();
    this.center.addVectors(config.init, config.end);
    this.center.multiplyScalar(0.5);

    this.origin   = config.origin;
    this.rotation = config.rotation;

    // Camera group
    this.cameraGroup = new THREE.Object3D();
    this.cameraGroup.position.x = this.origin.x * config.scale;
    this.cameraGroup.position.y = this.origin.y * config.scale;
    this.cameraGroup.position.z = this.origin.z * config.scale;

    // Camera
    this.near = this.center.distanceTo(this.origin);
    this.fovH = calculateHorizontalFOV(this);
    this.fovV = calculateVerticalFOV(this.aspect, this.fovH);

    this.camera = new THREE.PerspectiveCamera(
      radToDeg(this.fovV),
      this.aspect,
      this.near * config.scale,
      config.far
    );
    this.camera.rotation.x = this.rotation.x;
    this.camera.rotation.y = this.rotation.y;
    this.camera.rotation.z = this.rotation.z;
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

  /*******************
   * WORLD PROTOTYPE *
   *******************/

  var World = function (config, debug) {
    this.debug    = debug;
    this.height   = config.height;
    this.cameraZ  = config.cameraZ;
    this.mapScale = config.mapScale;

    this.scene = new THREE.Scene();

    // Think of the virtual camera as a post with 5 cameras on it (even though
    // those cameras happen to live in difference scenes)
    // You need to move the post (ie, the virtualCamera) to move all 5 cameras
    // together.
    this.virtualCamera = new THREE.Camera();
    this.virtualCamera.position.z = this.cameraZ;
    this.scene.add(this.virtualCamera);

    // Views
    this.createViews(config);

    this.virtualCamera.add(this.leftView.cameraGroup);
    this.virtualCamera.add(this.backView.cameraGroup);
    this.virtualCamera.add(this.rightView.cameraGroup);

    if (this.debug) {
      this.scene.add(this.leftView.helper);
      this.scene.add(this.backView.helper);
      this.scene.add(this.rightView.helper);
    }
  };

  World.prototype.createViews = function (config) {

    var halfFront = config.frontSize * 0.5;
    var halfBack  = config.backSize * 0.5;
    var halfSide  = config.sideSize * 0.5;

    // Calculate angle and depth
    this.alpha = Math.acos((halfFront - halfBack) / config.sideSize);
    this.depth = Math.sin(this.alpha) * config.sideSize;

    // Calculate origin
    var hypoFront = halfSide / Math.cos(this.alpha);
    var originZ = Math.tan(PI - this.alpha - HALF_PI) * (hypoFront - halfFront);
    var origin = new THREE.Vector3(0, 0, -originZ);

    // Calculate corners
    this.corners = [
      new THREE.Vector3(-halfBack, 0, -this.depth),
      new THREE.Vector3(halfBack, 0, -this.depth),
      new THREE.Vector3(halfFront, 0, 0),
      new THREE.Vector3(-halfFront, 0, 0)
    ];

    // Create left and right view
    this.leftView = new WorldView({
      width    : config.sideSize,
      height   : this.height,
      far      : config.far,
      scale    : config.camScale,
      init     : this.corners[0],
      end      : this.corners[3],
      origin   : origin,
      rotation : new THREE.Vector3(0, this.alpha, 0)
    });

    this.rightView = new WorldView({
      width    : config.sideSize,
      height   : this.height,
      far      : config.far,
      scale    : config.camScale,
      init     : this.corners[1],
      end      : this.corners[2],
      origin   : origin,
      rotation : new THREE.Vector3(0, -this.alpha, 0)
    });

    // Create back view
    this.backView = new WorldView({
      width    : config.backSize,
      height   : this.height,
      far      : config.far,
      scale    : config.camScale,
      init     : this.corners[0],
      end      : this.corners[1],
      origin   : origin,
      rotation : new THREE.Vector3(0, 0, 0)
    });
  };

  World.prototype.render = function () {

    var keys = [ 'backView', 'leftView', 'rightView' ];
    for (var i = 0; i < keys.length; i++) {
      var view = this[keys[i]];
      if (!view) {
        continue;
      }

      view.render(this);
      if (view.material) {
        view.material.map.needsUpdate = true;
      }
    }
  };

  global.World = World;
})(window);
