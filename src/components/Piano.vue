<template>
  <h2>Piano!</h2>
  Press "P" to play/stop the background music
  <div id="gameDiv" style="margin: 0 auto"></div>
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser from 'phaser'
import * as Tone from 'tone'
import { summertimeVoice } from '../s15v-notes'

function invert(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
}

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

  this.load.audio('summertime', 'Summertime45.mp3')
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

/** @type {Tone.PolySynth} */
let synth

function createPiano() {
  /** @type {Phaser.Scene} */
  const scene = this

  synth = new Tone.PolySynth(Tone.Synth).toDestination()

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
    A3: 'A',
    B3: 'S',
    C4: 'D',
    D4: 'F',
    E4: 'J',
    F4: 'K',
    G4: 'L',
    A4: ';',
    B4: "'",
  }
  const keyboardToPiano = invert(pianoToKeyboard)
  const notes = Object.keys(pianoToKeyboard)

  // Map keyboard buttons to the right keycode
  // See https://photonstorm.github.io/phaser3-docs/Phaser.Input.Keyboard.KeyCodes.html
  const keyMap = { ';': 'SEMICOLON', "'": 'QUOTES' }
  function keyCode(keyboard) {
    return keyMap[keyboard] || keyboard
  }
  function reverseKeyCode(code) {
    return invert(keyMap)[code] || code
  }
  const keyboardString = Object.keys(keyboardToPiano).map(keyCode).join(',')
  const keyObjects = scene.input.keyboard.addKeys(keyboardString)

  for (const [keyCode, keyObject] of Object.entries(keyObjects)) {
    keyObject.on('down', () => {
      const keyboard = reverseKeyCode(keyCode)
      const note = keyboardToPiano[keyboard]
      synth.triggerAttackRelease(note, '8n')

      // Also draw a hit effect for that note
      addHitBlock(note)
    })
  }

  const moreKeys = scene.input.keyboard.addKey('P')
  const music = scene.sound.add('summertime', { volume: 0.3 })
  moreKeys.on('down', () => {
    if (music.isPlaying) {
      music.pause()
    } else {
      music.play()
    }
  })

  function addHitBlock(note) {
    const x = notes.indexOf(note) * 85 + 35
    const y = 525
    const rect = new Phaser.Geom.Rectangle(x, y, 50, 50)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x4488aa)
    graphics.fillRectShape(rect)
    setTimeout(() => graphics.destroy(), 100)
  }

  // Show falling blocks over a looping pattern
  let tune = [
    'A2',
    'C3',
    'D3',
    'D3',
    'D3',
    'C3',
    'D3',
    'C3',
    'A2',
    'C3',
    'D3',
    'C3',
    ['C3', 'E3'],
    '',
    ['D3', 'G3'],
    '',
  ]
  tune = summertimeVoice

  let index = 0
  function nextNote() {
    let note = tune[index]
    index = (index + 1) % tune.length
    if (Array.isArray(note)) {
      // Group of notes to play
      note.map(addFallingBlock)
    } else if (note) {
      // Single note to play
      addFallingBlock(note)
    }
  }

  function addFallingBlock(note) {
    const x = notes.indexOf(note) * 85 + 35 + 25
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
    const x = notes.indexOf(note) * 85 + 35 + 25
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
