<template>
  <h2>Piano!</h2>
  <div id="gameDiv" style="margin: 0 auto"></div>
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser from 'phaser'
import * as Tone from 'tone'

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    extend: {
      createPiano: createPiano,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  parent: 'gameDiv',
}

function preload() {
  this.load.setPath('/assets/piano')

  this.load.atlas('piano', 'piano.png', 'piano.json')

  this.load.audio('C3', 'C3.mp3')
  this.load.audio('Db3', 'Db3.mp3')
  this.load.audio('D3', 'D3.mp3')
  this.load.audio('Eb3', 'Eb3.mp3')
  this.load.audio('E3', 'E3.mp3')
  this.load.audio('F3', 'F3.mp3')
  this.load.audio('Gb3', 'Gb3.mp3')
  this.load.audio('G3', 'G3.mp3')
  this.load.audio('Ab3', 'Ab3.mp3')
  this.load.audio('A3', 'A3.mp3')
  this.load.audio('Bb3', 'Bb3.mp3')
  this.load.audio('B3', 'B3.mp3')
}

function create() {
  if (this.sound.locked) {
    var text = this.add.text(10, 10, 'Tap to unlock audio', {
      font: '16px Courier',
      fill: '#00ff00',
    })

    this.sound.once(
      'unlocked',
      function () {
        text.destroy()
        this.createPiano()
      },
      this
    )
  } else {
    this.createPiano()
  }
}

/** @type {Tone.Synth} */
let synth

function createPiano() {
  /** @type {Phaser.Scene} */
  const scene = this

  synth = new Tone.Synth().toDestination()

  this.input.addPointer(9)

  var x = 100
  var y = 0

  this.add.image(x, y, 'piano', 'panel').setOrigin(0)

  var keys = [
    ['key1', 'C3'],
    ['key2', 'Db3'],
    ['key3', 'D3'],
    ['key4', 'Eb3'],
    ['key5', 'E3'],
    ['key6', 'F3'],
    ['key7', 'Gb3'],
    ['key8', 'G3'],
    ['key9', 'Ab3'],
    ['key10', 'A3'],
    ['key11', 'Bb3'],
    ['key12', 'B3'],
  ]

  // Play white notes on keypress
  const pianoToKeyboard = {
    C3: 'A',
    D3: 'S',
    E3: 'D',
    F3: 'F',
    G3: 'G',
    A3: 'H',
    B3: 'J',
  }
  const keyboardToPiano = Object.fromEntries(
    Object.entries(pianoToKeyboard).map(([k, v]) => [v, k])
  )
  const notes = Object.keys(pianoToKeyboard)

  const keyboardString = Object.keys(keyboardToPiano).join(',')
  const keyObjects = scene.input.keyboard.addKeys(keyboardString)

  for (const [keyboard, keyObject] of Object.entries(keyObjects)) {
    keyObject.on('down', () => {
      const note = keyboardToPiano[keyboard]
      synth.triggerAttackRelease(note, '8n')

      // Also draw a hit effect for that note
      addHitBlock(note)
    })
  }

  function addHitBlock(note) {
    const x = notes.indexOf(note) * 85 + 120
    const y = 525
    const rect = new Phaser.Geom.Rectangle(x, y, 50, 50)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x4488aa)
    graphics.fillRectShape(rect)
    setTimeout(() => graphics.destroy(), 100)
  }

  // Show falling blocks over a looping pattern
  const tune = 'ACDDDCDCACDCE G     '
  let index = 0
  function nextNote() {
    let note = tune[index]
    index = (index + 1) % tune.length
    if (note != ' ') {
      addFallingBlock(note + '3')
    }
  }

  function addFallingBlock(note) {
    const x = notes.indexOf(note) * 85 + 120 + 25
    const y = 0
    const block = scene.add.rectangle(x, y, 30, 30, 0xaa4422)
    scene.physics.add.existing(block)
    block.body.velocity.y = 600
  }

  var timer = scene.time.addEvent({
    delay: 330, // ms
    callback: nextNote,
    //args: [],
    callbackScope: this,
    loop: true,
  })

  // Support playing notes from mouse click/touch
  var black = ['key2', 'key4', 'key7', 'key9', 'key11']

  for (const [key, note] of keys) {
    var singleKey = this.add.image(x, y, 'piano', key)

    singleKey.setName(note)
    singleKey.setOrigin(0)

    if (black.indexOf(key) !== -1) {
      singleKey.setDepth(1)
    }

    var frame = singleKey.frame

    var hitArea = new Phaser.Geom.Rectangle(
      frame.x,
      frame.y,
      frame.width,
      frame.height
    )

    singleKey.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

    var sound = this.sound.add(note)

    singleKey.on(
      'pointerdown',
      function (sound) {
        sound.play()
      }.bind(this, sound)
    )

    singleKey.on(
      'pointerover',
      function (sound, pointer) {
        if (pointer.isDown) {
          sound.play()
        }
      }.bind(this, sound)
    )
  }

  Object.keys(pianoToKeyboard).map(addTargetBlock)
  function addTargetBlock(note) {
    const x = notes.indexOf(note) * 85 + 120 + 25
    const y = 525 + 25
    scene.add.rectangle(x, y, 55, 55, 0x66aaee, 0.5)
    scene.add.text(x - 10, y - 15, pianoToKeyboard[note], { font: '32px' })
  }
}

export default {
  mounted() {
    var game = new Phaser.Game(config)
  },
}
</script>
