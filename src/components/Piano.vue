<template>
  <h2>Pianosu!</h2>
  Press "P" to start the game~
  <div id="gameDiv" style="margin: 0 auto"></div>
  Song:
  <a href="https://www.youtube.com/watch?v=ymwtuzIdhfY"
    >Summertime by Maggie & Nyan</a
  >
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser from 'phaser'
import * as Tone from 'tone'
import { summertimeVoice, transposeCtoD } from '../s15v-notes'

const SUMMERTIME_BPM = 123

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

  // Draw the piano keys background. TODO: Could be static image
  const x = 100
  const y = 0
  scene.add.image(x, y, 'piano', 'panel').setOrigin(0)
  for (let i = 1; i <= 12; i++) {
    const singleKey = scene.add.image(x, y, 'piano', `key${i}`)
    singleKey.setOrigin(0)
  }

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

  synth = new Tone.PolySynth(Tone.Synth).toDestination()
  for (const [keyCode, keyObject] of Object.entries(keyObjects)) {
    keyObject.on('down', () => {
      const keyboard = reverseKeyCode(keyCode)
      const note = keyboardToPiano[keyboard]
      const transposed = transposeCtoD(note)
      synth.triggerAttackRelease(transposed, '8n')

      // Also draw a hit effect for that note
      addHitBlock(note)
    })
  }

  // Play controls
  const moreKeys = scene.input.keyboard.addKey('P')
  const music = scene.sound.add('summertime', { volume: 0.3 })
  moreKeys.on('down', () => {
    if (!music.isPlaying) {
      music.play()
      scene.time.paused = false

      // Start showing the beatmap
      scene.time.addEvent({
        delay: 0, //ms
        callback: startBeatmap,
      })
    } else {
      music.resume()
      scene.time.paused = true
      scene.time.timeScale
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
  const tune = summertimeVoice

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

  // ms per eigth = (60 s/min) * (1000 ms/s) / BPM / (2 eigths/beat)
  const eigthNoteMs = (60 * 1000) / SUMMERTIME_BPM / 2
  const startBeatmap = () =>
    scene.time.addEvent({
      delay: eigthNoteMs,
      callback: nextNote,
      callbackScope: scene,
      loop: true,
    })

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
    const game = new Phaser.Game(config)
  },
}
</script>
