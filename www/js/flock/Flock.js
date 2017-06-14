(function (global) {
  'use strict';

  var fishes = [];
  var boids = [];

  var numBirds = 300;

  var Flock = function (world) {
    for (var i = 0; i < numBirds; i++) {
      var boid = new Boid(2, 0.02);
      var fish = new FishMesh();

      boid.position.x = Math.random() * 500 - 250;
      boid.position.y = Math.random() * 500 - 250;
      boid.position.z = Math.random() * 500 - 250;

      boid.velocity.x = Math.random() * 2 - 1;
      boid.velocity.y = Math.random() * 2 - 1;
      boid.velocity.z = Math.random() * 2 - 1;
      boid.velocity.normalize();

      boid.setAvoidWalls( false );
      boid.setWorldSize(200, 200, 100);

      fish.position.x = boid.position.x;
      fish.position.y = boid.position.y;
      fish.position.z = boid.position.z;

      fishes.push(fish);
      boids.push(boid);

      world.scene.add(fish);
  	}
  };

  Flock.prototype.update = function () {
    for (var i = fishes.length - 1; i >= 0; i--) {
      var boid = boids[i];
      boid.run(boids);

      var fish = fishes[i];
      fish.updateCourse(boid);
    }
  };

  global.Flock = Flock;
})(window);