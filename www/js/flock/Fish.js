/**
 * Based on THREE example: https://github.com/mrdoob/three.js/blob/master/examples/canvas_geometry_birds.html
 * Which is based on http://www.openprocessing.org/visuals/?visualID=6910
 * Author: Thanh Tran - trongthanh@gmail.com
 */
var Fish = function () {
  THREE.PlaneGeometry.call( this, 30, 5, 2, 1 );
};

Fish.prototype = new THREE.PlaneGeometry();
Fish.prototype.constructor = Fish;

var FishMesh = function () {
  THREE.Mesh.call(this,
    new Fish(),
    new THREE.MeshBasicMaterial({
      map         : THREE.ImageUtils.loadTexture( 'textures/fish-texture4.png' ),
      side        : THREE.DoubleSide,
      transparent : true
    })
  );

  this.phase = Math.floor( Math.random() * 62.83 );
};

FishMesh.prototype = new THREE.Mesh();
FishMesh.prototype.constructor = FishMesh;

FishMesh.prototype.updateCourse = function (boid) {
  var phase = this.phase;
  var rotation = this.rotation;
  var geometry = this.geometry;
  var boidVelocity = boid.velocity;

  rotation.y = Math.atan2( - boidVelocity.z, boidVelocity.x );
  rotation.z = Math.asin( boidVelocity.y / boidVelocity.length() ) * 0.3; //reduce fish's vertical rotation

  phase = ( phase + ( Math.max( 0, rotation.z ) + 0.1 )  ) % 62.83;
  geometry.vertices[3].z = geometry.vertices[ 0 ].z = Math.sin( phase ) * 5

  this.position.x = boid.position.x;
  this.position.y = boid.position.y;
  this.position.z = boid.position.z;

  this.phase = phase;
};
