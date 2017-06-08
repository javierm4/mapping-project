/* global $, THREE, MappingApp, World */
(function () {
  'use strict';

  /*********************
   * PREVIEW PROTOTYPE *
   *********************/

  var Preview = function (world) {
    this.world = world;

    this.container = document.getElementById('preview-view');
    var aspect = this.container.clientWidth / this.container.clientHeight;

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 20000);
    this.camera.position.set(0, 0, world.cameraZ + 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.world.scene.add(this.camera);

    // Controls
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.noPan = true;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 1.0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Helpers
    this.gridHelper = new THREE.GridHelper(200, 200);
    this.world.scene.add(this.gridHelper);

    this.axisHelper = new THREE.AxisHelper();
    this.world.scene.add(this.axisHelper);
  };

  Preview.prototype.toggleHelpers = function () {
    this.gridHelper.visible = !this.gridHelper.visible;
    this.axisHelper.visible = !this.axisHelper.visible;
  };

  Preview.prototype.render = function () {
    this.renderer.render(this.world.scene, this.camera);
  };

  Preview.prototype.onWindowResize = function () {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  /*********************
   * STAGE PROTOTYPE *
   *********************/

  var STAGE_SCALE = 0.02;
  var Stage = function (world) {
    this.world = world;

    this.container = document.getElementById('stage-view');
    var aspect = this.container.clientWidth / this.container.clientHeight;

    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
    this.camera.position.set(0, 1, 15);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.noPan = true;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 1.0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Helpers
    var gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    var axisHelper = new THREE.AxisHelper();
    this.scene.add(axisHelper);

    // Planes
    this.stagePlanes = new THREE.Object3D();

    var keys = [ 'backView', 'leftView', 'rightView' ];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var view = this.world[key];

      this.addPlaneToView(view, this.world);
      this.stagePlanes.add(view.plane);
    }

    this.stagePlanes.position.y = this.world.height * STAGE_SCALE * 0.5;
    this.scene.add(this.stagePlanes);
  };

  Stage.prototype.addPlaneToView = function (view) {
    var geometry = new THREE.PlaneGeometry(view.width * STAGE_SCALE, view.height * STAGE_SCALE);

    view.material = new THREE.MeshBasicMaterial();
    view.material.map = new THREE.Texture(view.renderer.domElement);
    view.material.map.needsUpdate = true;

    view.plane = new THREE.Mesh(geometry, view.material);
    view.plane.position.set(
      view.origin.x * STAGE_SCALE,
      view.origin.y * STAGE_SCALE,
      view.origin.z * STAGE_SCALE
    );

    view.plane.rotation.set(
      view.planeRotation.x,
      view.planeRotation.y,
      view.planeRotation.z
    );
  };

  Stage.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
  };

  Stage.prototype.onWindowResize = function () {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  /***************
   * MAIN SCRIPT *
   ***************/

   var world;
   var app;

   var hasStage;
   var preview, stage;

   function toggleHelpers() {
     preview.toggleHelpers();
     //world.backView.helper.visible = !world.backView.helper.visible;
     //world.leftView.helper.visible = !world.leftView.helper.visible;
     //world.rightView.helper.visible = !world.rightView.helper.visible;
   }

   function createWorld (onCreate) {
     $.ajax({
       url      : 'data/config.json',
       method   : 'GET',
       dataType : 'JSON',
       success  : function (config) {
         var world = new World(config, true);
         onCreate(world);
       }
     });
   }

   function animate () {
     app.update();

     toggleHelpers();
     world.render();
     toggleHelpers();

     preview.render();
     preview.controls.update();
     if (hasStage) {
       stage.render();
       stage.controls.update();
     }

     requestAnimationFrame(animate);
   }

   function init () {
     preview = new Preview(world);
     if (hasStage) {
       stage = new Stage(world);
     }

     app = new MappingApp(world);
     app.setup();

     window.addEventListener('resize', onWindowResize, false);
   }

   function onWindowResize () {
     preview.onWindowResize();
     if (hasStage) {
       stage.onWindowResize();
     }
   }

   $(document).ready(function () {
     hasStage = $('#stage-view').length > 0;

     createWorld(function (_world) {
       world = _world;

       init();
       animate();
     });
   });

})(window);
