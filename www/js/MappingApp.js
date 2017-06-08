(function (global) {
  'use strict';

  var world;

  var noofBalls = 15;
  var balls;

  function setupBalls () {
    var faceIndices = [ 'a', 'b', 'c' ];
    var color, f1, p, vertexIndex,

    radius = 5,
    geometry1 = new THREE.IcosahedronGeometry( radius, 1 );

    for (var i = 0; i < geometry1.faces.length; i++) {
      f1 = geometry1.faces[ i ];

      for (var j = 0; j < 3; j++) {
        vertexIndex = f1[ faceIndices[ j ] ];

        p = geometry1.vertices[ vertexIndex ];

        color = new THREE.Color( 0xffffff );
        color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );

        f1.vertexColors[ j ] = color;

        color = new THREE.Color( 0xffffff );
        color.setHSL( 0.0, ( p.y / radius + 1 ) / 2, 0.5 );
      }
    }

    var materials = [
      new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true } )
    ];

    balls = new THREE.Object3D();
    for ( var i = 0; i < noofBalls; i ++ ) { // create balls
      var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry1, materials );

      mesh.position.x = - ( noofBalls - 1 ) / 2 *7 + i *7;
      mesh.rotation.x = i * 0.5;
      balls.add(mesh);
    }

    //balls.position.x = 100;
    balls.position.z = -50;
    world.scene.add(balls);
  }

  function setupBoxes () {
    var geometry = new THREE.BoxGeometry(90, 6, 6);
    var material = new THREE.MeshNormalMaterial();

    var box1 = new THREE.Mesh(geometry, material);
    box1.position.z = -50;

    var box2 = new THREE.Mesh(geometry, material);
    box2.position.z = -50;
    box2.rotation.z = Math.PI * 0.25;

    var box3 = new THREE.Mesh(geometry, material);
    box3.position.z = -50;
    box3.rotation.z = Math.PI * -0.25;

    world.scene.add(box1);
    //world.scene.add(box2);
    //world.scene.add(box3);
  }

  var MappingApp = function (_world) {
    world = _world;
  };

  MappingApp.prototype.setup = function () {
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();
    world.scene.add(light);

    //setupBalls();
    setupBoxes();
  };

  MappingApp.prototype.update = function () {
  };

  global.MappingApp = MappingApp;
})(window);
