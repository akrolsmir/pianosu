class LockScene extends Phaser.Scene {
  preload() {
    this.load.image('bggg', '/assets/piano/summertime.jpg')
    console.log('preload')
  }
  create(data) {
    console.log('done')
    const bg = this.add.image(0, 0, 'bggg').setOrigin(0)
    bg.scale = 0.5
    const rect = this.add.rectangle(0, 0, config.width, 40, 0x000000)
    rect.scale = 2
    var text = this.add.text(560, 10, 'Press any key to start', {
      font: '16px Courier',
      color: '#00ff00',
    })

    this.input.keyboard.once('keydown-SPACE', () => {
      // fade to black
      this.cameras.main.fadeOut(1000, 40, 40, 40)
    })

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      (cam, effect) => {
        this.scene.start('main-scene')
      }
    )
  }
}

// transitionCb should take in a fraction from 0 to 1
function transition(scene, durationMs, transitionCb, doneCb) {
  let i = 1
  scene.time.addEvent({
    delay: 10,
    repeat: durationMs / 10 - 1,
    callback: () => {
      transitionCb(i / (durationMs / 10))
      i++
    },
  })
  scene.time.addEvent({
    delay: durationMs,
    callback: doneCb,
  })
}

// Needs to be moved to the render() function, somehow
const p = (progress) => {
  rect.setX(200 * progress)
  // darken.setAlpha(0.8 * progress)
  // darken.alpha = 0.8 * progress
  console.log('a', rect.x)
}
