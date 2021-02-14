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
import Phaser, { Scene } from 'phaser'
import * as Tone from 'tone'
import { summertimeVoice, transposeCtoD } from '../s15v-notes'

const SUMMERTIME_BPM = 125

const PIANO_TO_KEYBOARD = {
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
const KEYBOARD_TO_PIANO = invert(PIANO_TO_KEYBOARD)
const NOTES = Object.keys(PIANO_TO_KEYBOARD)

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
    update: update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  // TODO: input: {keyboard: {target: window}} ?
  parent: 'gameDiv',
}

const FALL_VELOCITY = 600 / 1000 // px/ms

/**
 * hitObj: {
 *   note: 'D' // or 1, or 'F#4'?
 *   hitTime: 12345 // ms, when it should be hit
 *   rect: Phaser.GameObjects.Rectangle ref
 *   render(time) => { adjust rect's position }
 *   hit(time)?? => { replace with score object }
 * }
 */
function makeHitObject(note, hitTime, /** @type {Phaser.Scene} */ scene) {
  const rect = scene.add.rectangle(-100, -100, 30, 30, 0xaa4422)
  rect.setDepth(100)
  return {
    note,
    hitTime,
    rect,
    render(time) {
      const TARGET_Y = 525 + 25
      const x = NOTES.indexOf(note) * 85 + 35 + 25
      // At hitTime, y should be 800; at hitTime - 1s; y should be 800 - FALL_VELOCITY
      const y = TARGET_Y - (hitTime - time) * FALL_VELOCITY
      rect.setPosition(x, y)
    },
  }
}

let HIT_OBJS

// Time is msecs, delta is time since last update
function update(time, delta) {
  /** @type {Phaser.Scene} */
  const scene = this

  const lastStart = scene.data.get('lastStart')
  const playTime = time - lastStart

  HIT_OBJS.forEach((hitObj) => hitObj.render(playTime))
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

  // Initialize the hit objects for this song
  const tune = summertimeVoice
  HIT_OBJS = []
  for (const [i, note] of tune.entries()) {
    const SUMMERTIME_OFFSET = 965 // If visuals hit before audio, make this bigger
    const eigthNoteMs = (60 * 1000) / SUMMERTIME_BPM / 2
    const time = SUMMERTIME_OFFSET + eigthNoteMs * i
    // TODO: maybe handle simultaneous notes
    HIT_OBJS.push(makeHitObject(note, time, this))
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

  // Map keyboard buttons to the right keycode
  // See https://photonstorm.github.io/phaser3-docs/Phaser.Input.Keyboard.KeyCodes.html
  const keyMap = { ';': 'SEMICOLON', "'": 'QUOTES' }
  function keyCode(keyboard) {
    return keyMap[keyboard] || keyboard
  }
  function reverseKeyCode(code) {
    return invert(keyMap)[code] || code
  }
  const keyboardString = Object.keys(KEYBOARD_TO_PIANO).map(keyCode).join(',')
  const keyObjects = scene.input.keyboard.addKeys(keyboardString)

  synth = new Tone.PolySynth(Tone.Synth).toDestination()
  for (const [keyCode, keyObject] of Object.entries(keyObjects)) {
    keyObject.on('down', () => {
      const keyboard = reverseKeyCode(keyCode)
      const note = KEYBOARD_TO_PIANO[keyboard]
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
      scene.data.set('lastStart', scene.time.now)
    } else {
      music.pause()
      scene.data.set('lastStart', Infinity)
    }
  })

  function addHitBlock(note) {
    const x = NOTES.indexOf(note) * 85 + 35
    const y = 525
    const rect = new Phaser.Geom.Rectangle(x, y, 50, 50)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x4488aa)
    graphics.fillRectShape(rect)
    setTimeout(() => graphics.destroy(), 100)
  }

  Object.keys(PIANO_TO_KEYBOARD).map(addTargetBlock)
  function addTargetBlock(note) {
    const x = NOTES.indexOf(note) * 85 + 35 + 25
    const y = 525 + 25
    scene.add.rectangle(x, y, 55, 55, 0x66aaee, 0.5)
    scene.add.text(x - 10, y - 15, PIANO_TO_KEYBOARD[note], { font: '32px' })
  }
}

export default {
  mounted() {
    const game = new Phaser.Game(config)
  },
}
</script>
