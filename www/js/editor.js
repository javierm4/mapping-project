(function (global) {
  'use strict';

  var world, mappingApp;
  var editor3D;

  var stageScale = 0.01;
  var stage3D;

  function setup () {
    setupEditor();
    if ($('#stage-view').length > 0) {
      setupStage();
    }

    mappingApp.setup();
  }

  function setupGUI () {
    var gui = new dat.GUI();
    var HALF_PI = Math.PI * 0.5;

    function setupViewGUI (view, viewGUI) {
      var rotation = view.rotation;
      var position = view.position;

      var camera     = view.camera;
      var plane      = view.plane;
      var planeGroup = view.planeGroup;

      function updateCamera () {
        camera.rotation.set(rotation.x, rotation.y, rotation.z);
        planeGroup.rotation.set(rotation.x, rotation.y, rotation.z);
        plane.position.set(position.x, position.y, position.z);
      }

      var rotGUI = viewGUI.addFolder('Rotation');
      rotGUI.add(rotation, 'x', -HALF_PI, HALF_PI).step(0.001).onChange(updateCamera);
      rotGUI.add(rotation, 'y', -HALF_PI, HALF_PI).step(0.001).onChange(updateCamera);
      rotGUI.add(rotation, 'z', -HALF_PI, HALF_PI).step(0.001).onChange(updateCamera);

      var posGUI = viewGUI.addFolder('Position');
      posGUI.add(position, 'x', -10, 10).step(0.0001).onChange(updateCamera);
      posGUI.add(position, 'y', -10, 10).step(0.0001).onChange(updateCamera);
      posGUI.add(position, 'z', -10, 10).step(0.0001).onChange(updateCamera);
    }

    for (var i = 0; i < world.views.length; i++) {
      var view = world.views[i];
      var viewGUI = gui.addFolder('View ' + i);

      setupViewGUI(view, viewGUI);
    }

    gui.add(world, 'cameraZ', -200, 200).onChange(function (value) {
      world.virtualCamera.position.z = value;
    });
  }

  function setupEditor () {
    editor3D = {};
    var container = document.getElementById('editor-view');
    var aspect = container.clientWidth / container.clientHeight;

    // Camera
    editor3D.camera = new THREE.PerspectiveCamera(65, aspect, 1, 20000);
    editor3D.camera.position.set(0, 0, 75);
    editor3D.camera.lookAt(new THREE.Vector3(0, 0, 0));
    world.scene.add(editor3D.camera);

    // Controls
    editor3D.controls = new THREE.TrackballControls(editor3D.camera, container);
    editor3D.controls.rotateSpeed = 2.0;
    editor3D.controls.zoomSpeed = 1.2;
    editor3D.controls.panSpeed = 0.8;

    // Renderer
    editor3D.renderer = new THREE.WebGLRenderer({ antialias: true });
    editor3D.renderer.setClearColor(0xffffff);
    editor3D.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(editor3D.renderer.domElement);

    // Helpers
    editor3D.gridHelper = new THREE.GridHelper(100, 100);
    world.scene.add(editor3D.gridHelper);

    editor3D.axisHelper = new THREE.AxisHelper();
    world.scene.add(editor3D.axisHelper);

    editor3D.cameraHelpers = [];
    for (var i = 0; i < world.views.length; i++) {
      var view = world.views[i];
      var cameraHelper = new THREE.CameraHelper(view.camera);

      editor3D.cameraHelpers.push(cameraHelper);
      world.scene.add(cameraHelper);
    }
  }

  function setupStage () {
    stage3D = {};

    var container = document.getElementById('stage-view');
    var aspect = container.clientWidth / container.clientHeight;

    stage3D.scene = new THREE.Scene();

    // Camera
    stage3D.camera = new THREE.PerspectiveCamera(20, aspect, 1, 1000);
    stage3D.camera.position.set(0, 4, 25);
    stage3D.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    stage3D.controls = new THREE.TrackballControls(stage3D.camera, container);
    stage3D.controls.rotateSpeed = 2.0;
    stage3D.controls.zoomSpeed = 1.2;
    stage3D.controls.panSpeed = 0.8;

    // Renderer
    stage3D.renderer = new THREE.WebGLRenderer({ antialias: true });
    stage3D.renderer.setClearColor(0x000000);
    stage3D.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(stage3D.renderer.domElement);

    // Helpers
    var gridHelper = new THREE.GridHelper(10, 10);
    stage3D.scene.add(gridHelper);

    var axisHelper = new THREE.AxisHelper();
    stage3D.scene.add(axisHelper);

    // Planes
    for (var i = 0; i < world.views.length; i++) {
      var view = world.views[i];

      var geometry = new THREE.PlaneGeometry(view.width * stageScale, view.height * stageScale);
      var material = new THREE.MeshBasicMaterial();
      material.map = new THREE.Texture(view.renderer.domElement);
			material.map.needsUpdate = true;

      view.plane = new THREE.Mesh(geometry, material);

      view.planeGroup = new THREE.Object3D();
      view.planeGroup.add(view.plane);
      stage3D.scene.add(view.planeGroup);

      view.planeGroup.rotation.set(
        view.rotation.x,
        view.rotation.y,
        view.rotation.z
      );

      view.plane.position.set(
        view.position.x,
        view.position.y,
        view.position.z
      );
    }
  }

  function toogleHelpers () {
    editor3D.gridHelper.visible = !editor3D.gridHelper.visible;
    editor3D.axisHelper.visible = !editor3D.axisHelper.visible;

    for (var i = 0; i < editor3D.cameraHelpers.length; i++) {
      var cameraHelper = editor3D.cameraHelpers[i];
      cameraHelper.visible = !cameraHelper.visible;
    }
  }

  function update () {
    mappingApp.update();

    for (var i = 0; i < world.views.length; i++) {
      var view = world.views[i];

      var plane = view.plane;
      if (plane) {
        plane.material.map.needsUpdate = true;
      }
    }
  }

  function animate () {
    toogleHelpers();
    world.render();
    toogleHelpers();

    update();

    editor3D.renderer.render(world.scene, editor3D.camera);
    editor3D.controls.update();

    if (stage3D) {
      stage3D.renderer.render(stage3D.scene, stage3D.camera);
      stage3D.controls.update();
    }

    requestAnimationFrame(animate);
  }

  $(document).ready(function () {
    world = new World();
    mappingApp = new MappingApp(world);

    setup();
    if ($('#stage-view').length > 0) {
      setupGUI();
    }

    animate();
  });
})(window);
