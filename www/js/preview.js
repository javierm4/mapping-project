(function (global) {
  'use strict';

  /*********************
   * PREVIEW PROTOTYPE *
   *********************/

  var Preview = function (world) {
    this.world = world;

    var container = document.getElementById('preview-view');
    var aspect = container.clientWidth / container.clientHeight;

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, aspect, 1, 20000);
    this.camera.position.set(0, 0, world.cameraZ + 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.world.scene.add(this.camera);

    // Controls
    this.controls = new THREE.TrackballControls(this.camera, container);
    this.controls.noPan = true;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 1.0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

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

  /*********************
   * STAGE PROTOTYPE *
   *********************/

  var STAGE_SCALE = 0.01;
  var Stage = function (world) {
    this.world = world;

    var container = document.getElementById('stage-view');
    var aspect = container.clientWidth / container.clientHeight;

    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(20, aspect, 1, 1000);
    this.camera.position.set(0, 4, 25);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    this.controls = new THREE.TrackballControls(this.camera, container);
    this.controls.noPan = true;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 1.0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

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

      console.log(view);
      this.addPlaneToView(view, this.world);
      this.stagePlanes.add(view.plane);
    }

    this.scene.add(this.stagePlanes);
  };

  Stage.prototype.addPlaneToView = function (view, world) {
    var geometry = new THREE.PlaneGeometry(view.width * STAGE_SCALE, view.height * STAGE_SCALE);
    var material = new THREE.MeshBasicMaterial();
    material.map = new THREE.Texture(view.renderer.domElement);
    material.map.needsUpdate = true;

    view.plane = new THREE.Mesh(geometry, material);
    view.plane.position.set(
      view.origin.x * STAGE_SCALE,
      view.origin.y * STAGE_SCALE,
      view.origin.z * STAGE_SCALE
    );

    view.plane.rotation.set(
      view.rotation.x,
      view.rotation.y,
      view.rotation.z
    );
  };

  Stage.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
  };

  /***************
   * MAIN SCRIPT *
   ***************/

   var world;

   var hasStage;
   var preview, stage;

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

   function update () {
   }

   function animate () {
     update();

     world.render();

     preview.render();
     preview.controls.update();
     if (hasStage) {
       stage.render();
       stage.controls.update();
     }

     requestAnimationFrame(animate);
   }

   $(document).ready(function () {
     hasStage = $('#stage-view').length > 0;

     createWorld(function (_world) {
       world = _world;

       preview = new Preview(world);
       if (hasStage) {
         stage = new Stage(world);
       }

       animate();
     });
   });

})(window);
