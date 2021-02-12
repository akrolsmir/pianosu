<template>
  <h2>Pianosu!</h2>
  <div id="gameDiv" style="margin: 0 auto"></div>
</template>

<script>
import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      // See: http://phaser.io/examples/v3/view/physics/arcade/custom-debug-colors
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  parent: "gameDiv",
};

function preload() {
  this.load.setBaseURL("https://labs.phaser.io");

  this.load.image("sky", "assets/skies/space3.png");
  this.load.image("logo", "assets/sprites/phaser3-logo.png");
  this.load.image("red", "assets/particles/red.png");
}

let logo;
function create() {
  this.add.image(400, 300, "sky");

  var particles = this.add.particles("red");

  var emitter = particles.createEmitter({
    speed: 1,
    scale: { start: 1, end: 0 },
    blendMode: "ADD",
  });

  logo = this.physics.add.image(400, 100, "logo");

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}

function update() {
  const cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    logo.setVelocityX(s0);
  }

  if (cursors.right.isDown) {
    logo.setVelocityX(200);
  }
}

export default {
  mounted() {
    var game = new Phaser.Game(config);
  },
};
</script>
